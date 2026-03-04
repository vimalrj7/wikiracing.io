import React, { useState, useEffect, useRef, useMemo } from "react";
import { socket } from "./Socket";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import "./WikiPage.css";

// Build TOC HTML to inject into article before first <h2
function buildTocHtml(sections) {
  const items = sections
    .filter((s) => s.toclevel <= 2)
    .map(
      (s) =>
        `<li class="wiki-toc-item wiki-toc-l${s.toclevel}">` +
        `<a href="#${s.anchor}">` +
        `<span class="wiki-toc-num">${s.number}</span>` +
        `<span>${s.line}</span>` +
        `</a></li>`
    )
    .join("");
  return (
    `<div class="wiki-toc">` +
    `<div class="wiki-toc-title">Contents</div>` +
    `<ol class="wiki-toc-list">${items}</ol>` +
    `</div>`
  );
}

// Non-article namespaces — links to these become plain spans (not game navigation)
const SKIP_NAMESPACES = [
  "File:", "Help:", "Wikipedia:", "Special:", "Template:",
  "Category:", "Talk:", "Portal:", "User:", "Draft:",
];

function WikiPage({ roomCode, devMode = false }) {
  const wikiRoute = devMode ? "/preview" : "/wiki";
  const [html, setHtml] = useState("");
  const [summary, setSummary] = useState(null);
  const [sections, setSections] = useState([]); // TOC entries from parse API
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [raceData, setRaceData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [time, setTime] = useState(0);
  const [winner, setWinner] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const { wikiPage } = useParams();
  const navigate = useNavigate();

  // ── Timer interval (replaces Watch component) ───────────────────────────
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  // ── Parser options via ref so replace() can recurse without stale closure ─
  const optionsRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  optionsRef.current = useMemo(() => ({
    replace(node) {
      if (node.type !== "tag") return;

      if (node.name === "a" && node.attribs.href?.startsWith("/wiki/")) {
        const raw = node.attribs.href.slice(6);
        const page = raw.split("#")[0];
        const decoded = decodeURIComponent(page);

        if (SKIP_NAMESPACES.some((ns) => decoded.startsWith(ns))) {
          return <span>{domToReact(node.children, optionsRef.current)}</span>;
        }
        return (
          <Link to={`${wikiRoute}/${page}`}>
            {domToReact(node.children, optionsRef.current)}
          </Link>
        );
      }

      // Allow in-page anchor links (TOC, footnote refs) — keep as <a>
      if (node.name === "a" && node.attribs.href?.startsWith("#")) {
        return;
      }

      // Strip all other <a> (external links)
      if (node.name === "a") {
        return <span>{domToReact(node.children, optionsRef.current)}</span>;
      }
    },
  }), [devMode]);

  // Memoize parsed content — only re-runs when html changes, not every timer tick
  const parsedContent = useMemo(() => {
    if (!html) return null;
    return parse(html, optionsRef.current);
  }, [html]);

  // ── Fetch article + wire socket events ───────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setHtml("");
    setSummary(null);
    setSections([]);

    Promise.all([
      fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(wikiPage)}&format=json&prop=text|displaytitle|sections&origin=*`,
        { signal }
      ).then((r) => r.json()),
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`,
        { signal }
      ).then((r) => r.json()),
    ])
      .then(([parseData, summaryData]) => {
        const sects = parseData.parse?.sections ?? [];
        let htmlText = parseData.parse?.text?.["*"] ?? "";
        // Inject TOC into the HTML before the first <h2 (after intro + infobox)
        if (sects.length >= 3 && htmlText) {
          const h2Idx = htmlText.indexOf("<h2");
          if (h2Idx !== -1) {
            htmlText = htmlText.slice(0, h2Idx) + buildTocHtml(sects) + htmlText.slice(h2Idx);
          }
        }
        if (htmlText) setHtml(htmlText);
        setSections(sects);
        setSummary(summaryData);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Wiki fetch error:", err);
      });

    const onUpdatePage = (data) => setUserData(data);
    const onUpdateRoom = (data) => setRaceData(data);
    const onEndRound = (winnerData) => {
      setGameOver(true);
      setWinner(winnerData);
      setCountdown(10);
      setGaveUp(false);
    };
    const onPopstate = () => navigate(1);

    if (!devMode) {
      socket.on("updatePage", onUpdatePage);
      socket.on("updateRoom", onUpdateRoom);
      socket.emit("updatePage", { roomCode, wikiPage });
      socket.on("endRound", onEndRound);
      window.addEventListener("popstate", onPopstate);
    }

    return () => {
      controller.abort();
      if (!devMode) {
        window.removeEventListener("popstate", onPopstate);
        socket.off("updatePage", onUpdatePage);
        socket.off("updateRoom", onUpdateRoom);
        socket.off("endRound", onEndRound);
      }
    };
  }, [wikiPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-return countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { navigate(`/game/${roomCode}`); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleGiveUp() {
    if (devMode || gaveUp) return;
    setGaveUp(true);
    socket.emit("giveUp", { roomCode });
  }

  if (!devMode && roomCode === "") return <Navigate to="/" />;

  const displayTitle =
    summary?.titles?.normalized || wikiPage.replaceAll("_", " ");

  // Sorted player list for the race bar (most clicks first)
  const racePlayers = raceData?.users
    ? Object.values(raceData.users).sort((a, b) => b.clicks - a.clicks)
    : null;

  const targetDisplay = userData["target"]?.replaceAll("_", " ") || (devMode ? "—" : "…");

  return (
    <div className="wiki-page">

      {/* ── Sticky game bar ─────────────────────────────────────────────── */}
      <div className={`game-bar${devMode ? " game-bar--dev" : ""}`}>
        {/* Left: give-up (game) or dev badge */}
        <div className="game-bar-left">
          {devMode ? (
            <span className="wiki-dev-badge">DEV PREVIEW</span>
          ) : (
            <button
              className={`game-bar-give-up${gaveUp ? " game-bar-give-up--done" : ""}`}
              onClick={handleGiveUp}
              disabled={gaveUp || gameOver}
            >
              {gaveUp ? "✓ gave up" : "Give up"}
            </button>
          )}
        </div>

        {/* Center: target page */}
        <div className="game-bar-center">
          <span className="game-bar-label">TARGET</span>
          <span className="game-bar-target">{targetDisplay}</span>
        </div>

        {/* Right: compact player chips + timer */}
        <div className="game-bar-right">
          {racePlayers && racePlayers.map((u) => (
            <span key={u.user_id} className="game-bar-player" title={u.username}>
              <span className="game-bar-player-emoji">{u.emoji}</span>
              <span className="game-bar-player-clicks">{Math.max(0, u.clicks ?? 0)}</span>
            </span>
          ))}
          <span className="game-bar-timer">{formatTime(time)}</span>
        </div>
      </div>

      {/* ── Winner overlay ───────────────────────────────────────────────── */}
      {gameOver && (
        <div className="winner-overlay">
          {winner.allGaveUp ? (
            <h1 className="winner-name">Everyone gave up!</h1>
          ) : (
            <>
              <h1 className="winner-name">🏆 {winner["username"]} won!</h1>
              <p className="winner-time">
                <b>🕐 Time</b>&nbsp;&nbsp;{formatTime(winner["time"] ?? time)}
                &nbsp;&nbsp;<b>🖱️ Clicks</b>&nbsp;{winner["clicks"]}
              </p>
            </>
          )}

          {raceData?.users && (
            <div className="overlay-leaderboard">
              {Object.values(raceData.users)
                .sort((a, b) => {
                  if (a.user_id === winner.user_id) return -1;
                  if (b.user_id === winner.user_id) return 1;
                  return (a.clicks ?? 0) - (b.clicks ?? 0);
                })
                .map((u) => (
                  <div
                    key={u.user_id}
                    className={`overlay-row${u.user_id === winner.user_id ? " overlay-row--winner" : ""}`}
                  >
                    <span className="overlay-emoji">{u.emoji}</span>
                    <span className="overlay-name">{u.username}</span>
                    <span className="overlay-stat">{Math.max(0, u.clicks ?? 0)} clicks</span>
                  </div>
                ))}
            </div>
          )}

          <Link to={`/game/${roomCode}`}>
            <button className="overlay-btn">
              CONTINUE {countdown !== null ? `(${countdown})` : ""}
            </button>
          </Link>
        </div>
      )}

      {/* ── Wikipedia article ────────────────────────────────────────────── */}
      <div className="wiki-article-wrapper">
        {loading ? (
          <div className="wiki-loading">Loading…</div>
        ) : (
          <div className="wiki-article-body">
            <h1 className="wiki-article-title">{displayTitle}</h1>
            {summary?.description && (
              <div className="wiki-description">{summary.description}</div>
            )}
            {/* mw-parser-output keeps article styles; mw-content-ltr sets ltr direction */}
            <div className="mw-content-ltr mw-parser-output" lang="en" dir="ltr">
              {parsedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WikiPage;
