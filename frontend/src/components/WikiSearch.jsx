import React, { useState, useEffect, useRef } from "react";
import "./WikiSearch.css";

const SEARCH_URL =
  "https://en.wikipedia.org/w/api.php?action=query&list=search&utf8=&format=json&origin=*&srlimit=7&srsearch=";

function WikiSearch({ value, onSelect, disabled, placeholder }) {
  // Display text — underscores replaced with spaces
  const [query, setQuery] = useState(value?.replaceAll("_", " ") ?? "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  // Sync display when parent value changes (e.g. after RANDOMIZE)
  useEffect(() => {
    setQuery(value?.replaceAll("_", " ") ?? "");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);

    clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(SEARCH_URL + encodeURIComponent(q.trim()), { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          setResults(data.query?.search ?? []);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") setLoading(false);
        });
    }, 280);
  }

  function handleSelect(result) {
    // Store as underscore_title (canonical Wikipedia format), display as spaces
    const canonical = result.title.replaceAll(" ", "_");
    setQuery(result.title);
    setOpen(false);
    setResults([]);
    onSelect(canonical);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="wiki-search" ref={containerRef}>
      <div className="wiki-search-input-wrap">
        <input
          type="text"
          className="wiki-search-input"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder ?? "Search Wikipedia…"}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <span className="wiki-search-spinner" aria-hidden>⟳</span>}
      </div>

      {open && results.length > 0 && (
        <ul className="wiki-search-dropdown" role="listbox">
          {results.map((r) => (
            <li
              key={r.pageid}
              className="wiki-search-result"
              role="option"
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focused until selection
                handleSelect(r);
              }}
            >
              <span className="wiki-search-result-title">{r.title}</span>
              <span
                className="wiki-search-result-snippet"
                // Wikipedia returns safe HTML snippets with <span class="searchmatch">
                dangerouslySetInnerHTML={{ __html: r.snippet }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WikiSearch;
