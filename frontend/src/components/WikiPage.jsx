import React, { useState, useEffect, useRef, useMemo } from "react";
import { socket } from "./Socket";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import Watch from "./Watch";
import "./WikiPage.css";

// Non-article namespaces — links to these become plain spans (not game navigation)
const SKIP_NAMESPACES = [
  "File:", "Help:", "Wikipedia:", "Special:", "Template:",
  "Category:", "Talk:", "Portal:", "User:", "Draft:",
];

function WikiPage({ roomCode, devMode = false }) {
  const wikiRoute = devMode ? '/preview' : '/wiki';
  const [html, setHtml] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const [winner, setWinner] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const { wikiPage } = useParams();
  const navigate = useNavigate();

  // Keep timeRef in sync so endRound closure always sees current elapsed time
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // Parser options via ref so the replace fn can recurse without stale closure
  const optionsRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  optionsRef.current = useMemo(() => ({
    replace(node) {
      if (node.type !== "tag") return;

      // Internal wiki links (/wiki/Page) → React Router Link
      if (node.name === "a" && node.attribs.href?.startsWith("/wiki/")) {
        const raw = node.attribs.href.slice(6); // strip /wiki/
        const page = raw.split("#")[0];          // drop anchor fragment
        const decoded = decodeURIComponent(page);

        // Skip non-article namespaces — render as plain text
        if (SKIP_NAMESPACES.some((ns) => decoded.startsWith(ns))) {
          return <span>{domToReact(node.children, optionsRef.current)}</span>;
        }

        return (
          <Link to={`${wikiRoute}/${page}`}>
            {domToReact(node.children, optionsRef.current)}
          </Link>
        );
      }

      // All other <a> tags (external, anchors) — strip interactivity
      if (node.name === "a") {
        return <span>{domToReact(node.children, optionsRef.current)}</span>;
      }
    },
  }), [devMode]); // wikiRoute derives from devMode (stable per route)

  // Memoize parsed content — only re-runs when html string changes, NOT on every timer tick
  const parsedContent = useMemo(() => {
    if (!html) return null;
    return parse(html, optionsRef.current);
  }, [html]);

  // Fetch article + wire socket events, both keyed to wikiPage param
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setHtml("");
    setSummary(null);

    // Parallel: MediaWiki parse API (full article HTML body) + summary API (thumbnail + description)
    Promise.all([
      fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(wikiPage)}&format=json&prop=text|displaytitle&origin=*`,
        { signal }
      ).then((r) => r.json()),
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`,
        { signal }
      ).then((r) => r.json()),
    ])
      .then(([parseData, summaryData]) => {
        if (parseData.parse?.text?.["*"]) {
          setHtml(parseData.parse.text["*"]);
        }
        setSummary(summaryData);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Wiki fetch error:", err);
      });

    const onUpdatePage = (data) => setUserData(data);

    const onEndRound = (winnerData) => {
      setGameOver(true);
      setWinner(winnerData);
      socket.emit("updateTime", { roomCode, time: timeRef.current });
    };

    const onPopstate = () => navigate(1);

    if (!devMode) {
      socket.on("updatePage", onUpdatePage);
      socket.emit("updatePage", { roomCode, wikiPage });
      socket.on("endRound", onEndRound);
      window.addEventListener("popstate", onPopstate);
    }

    return () => {
      controller.abort();
      if (!devMode) {
        window.removeEventListener("popstate", onPopstate);
        socket.off("updatePage", onUpdatePage);
        socket.off("endRound", onEndRound);
      }
    };
  }, [wikiPage]); // eslint-disable-line react-hooks/exhaustive-deps

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (!devMode && roomCode === "") {
    return <Navigate to="/" />;
  }

  const displayTitle =
    summary?.titles?.normalized || wikiPage.replaceAll("_", " ");

  return (
    <div className="wiki-container">
      {gameOver && (
        <div className="winner-overlay">
          <h1 className="winner-name">&#127942; {winner["username"]} won!</h1>
          <p className="winner-time">
            <b>&#128336; Time</b>&nbsp;&nbsp;{formatTime(time)}
          </p>
          <p className="winner-clicks">
            <b>&#128433;&#65039; Clicks</b> {winner["clicks"]}
          </p>
          <Link to={`/game/${roomCode}`}>
            <button className="overlay-btn">CONTINUE</button>
          </Link>
        </div>
      )}

      {/* Game HUD — fixed top-right badges */}
      <div className="stats-container">
        <Watch time={time} setTime={setTime} gameOver={gameOver} />
        <div className="target-container">
          Target: <strong>{userData["target"] || (devMode ? "—" : "...")}</strong>
        </div>
      </div>

      {/* Wikipedia article */}
      <div className="wiki-article-wrapper">
        {loading ? (
          <div className="wiki-loading">
            <p>Loading…</p>
          </div>
        ) : (
          <div
            className="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject skin-vector action-view skin-vector-legacy"
          >
            <div className="mw-body background" role="main">
              {/* Article header */}
              <h1 id="firstHeading" className="firstHeading mw-first-heading">
                <span className="mw-page-title-main">{displayTitle}</span>
              </h1>
              {summary?.description && (
                <div className="shortdescription noprint" style={{ marginBottom: "0.5em", color: "#54595d", fontSize: "0.875em" }}>
                  {summary.description}
                </div>
              )}
              <div id="siteSub" className="noprint">From Wikipedia, the free encyclopedia</div>

              {/* Main article content from MediaWiki parse API */}
              <div id="mw-content-text" className="mw-body-content">
                <div className="mw-content-ltr mw-parser-output" lang="en" dir="ltr">
                  {parsedContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WikiPage;
