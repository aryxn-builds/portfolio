"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, X, RefreshCw, ExternalLink } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */
interface GitHubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: {
    ref?: string;
    commits?: { sha: string; message: string }[];
    head?: string;
    size?: number; // total number of commits in the push (always accurate)
  };
  created_at: string;
}

/* ─── commit message cache (SHA → message) ─── */
const commitMsgCache = new Map<string, string>();

async function fetchCommitMessage(repoName: string, sha: string): Promise<string | null> {
  const key = `${repoName}@${sha}`;
  if (commitMsgCache.has(key)) return commitMsgCache.get(key)!;
  try {
    const res = await fetch(`https://api.github.com/repos/${repoName}/commits/${sha}`);
    if (!res.ok) return null;
    const data = await res.json();
    const msg: string = data.commit?.message?.split('\n')[0] ?? '';
    if (msg) commitMsgCache.set(key, msg);
    return msg || null;
  } catch {
    return null;
  }
}

interface CommitRow {
  id: string;
  repo: string;
  branch: string;
  message: string;
  sha: string;
  time: string;
  isNew?: boolean;
}

interface DayBar {
  date: string;
  count: number;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */
const GH_USER = "aryxn-builds";
const AVATAR_URL = "https://avatars.githubusercontent.com/u/165578262?v=4";

const REPO_COLORS: Record<string, string> = {
  "aryxn-builds/portfolio": "#FF4500",
  "aryxn-builds/aryxn-builds": "#00BFFF",
};
const EXTRA_COLORS = ["#CC44FF", "#44CC44", "#FF8C00", "#00FF88"];

function getRepoColor(repoFull: string): string {
  if (REPO_COLORS[repoFull]) return REPO_COLORS[repoFull];
  const idx = Object.keys(REPO_COLORS).length % EXTRA_COLORS.length;
  return EXTRA_COLORS[idx];
}

function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDateLabel(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function barHeight(count: number): number {
  if (count === 0) return 4;
  if (count <= 2) return 20;
  if (count <= 5) return 50;
  if (count <= 10) return 80;
  return 100;
}

function barColor(count: number): string {
  if (count === 0) return "rgba(255,255,255,0.08)";
  if (count <= 2) return "rgba(255,69,0,0.3)";
  if (count <= 5) return "rgba(255,69,0,0.6)";
  return "#FF4500";
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function GitHubActivityFeed() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [stars, setStars] = useState(0);
  const [commitCount, setCommitCount] = useState(0);
  const [commits, setCommits] = useState<CommitRow[]>([]);
  const [graph, setGraph] = useState<DayBar[]>([]);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("just now");
  const [refreshSpinning, setRefreshSpinning] = useState(false);
  const [tooltipBar, setTooltipBar] = useState<{ index: number; label: string; count: number } | null>(null);

  // Count-up display values
  const [displayStars, setDisplayStars] = useState(0);
  const [displayCommits, setDisplayCommits] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCommitIds = useRef<Set<string>>(new Set());

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "g" || e.key === "G") setOpen((v) => !v);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ─── Last-updated label (updates every minute) ─── */
  useEffect(() => {
    const id = setInterval(() => {
      if (lastFetched === null) return;
      const mins = Math.floor((Date.now() - lastFetched) / 60000);
      setLastUpdatedLabel(mins === 0 ? "just now" : `${mins} min ago`);
    }, 60000);
    return () => clearInterval(id);
  }, [lastFetched]);

  /* ─── COUNT-UP animation ─── */
  function animateCount(target: number, setter: (n: number) => void) {
    const duration = 1000;
    const start = Date.now();
    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setter(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ─── BUILD N-DAY GRAPH from events ─── */
  function buildGraph(events: GitHubEvent[], days: number): DayBar[] {
    const counts: Record<string, number> = {};
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      counts[key] = 0;
    }
    events.forEach((ev) => {
      if (ev.type !== "PushEvent") return;
      const key = ev.created_at.slice(0, 10);
      if (key in counts) {
        // payload.size is always the true commit count, even when commits array is empty
        counts[key] += ev.payload.size ?? ev.payload.commits?.length ?? 1;
      }
    });
    return Object.entries(counts).map(([date, count]) => ({
      date,
      count,
      label: formatDateLabel(date),
    }));
  }

  /* ─── BUILD COMMIT ROWS from events (initial pass — messages filled in later) ─── */
  function buildCommitsInitial(events: GitHubEvent[]): CommitRow[] {
    const rows: CommitRow[] = [];
    const existing = prevCommitIds.current;

    events
      .filter((ev) => ev.type === "PushEvent")
      .slice(0, 10)
      .forEach((ev) => {
        const cs = ev.payload.commits;
        const sha = (cs && cs.length > 0 ? cs[0].sha : null) ?? ev.payload.head ?? "0000000";
        const inlineMsg = cs && cs.length > 0 ? (cs[0].message?.split('\n')[0] ?? '') : '';
        rows.push({
          id: `${ev.id}-${sha}`,
          repo: ev.repo.name,
          branch: (ev.payload.ref ?? "refs/heads/main").replace("refs/heads/", ""),
          // Start with inline message if available; API fetch will overwrite if needed
          message: inlineMsg || `Commit · ${sha.slice(0, 7)}`,
          sha,
          time: ev.created_at,
          isNew: !existing.has(`${ev.id}-${sha}`),
        });
      });

    prevCommitIds.current = new Set(rows.map((r) => r.id));
    return rows.slice(0, 10);
  }

  /* ─── FETCH ─── */
  const fetchData = useCallback(async (force = false) => {
    if (!force && lastFetched !== null && Date.now() - lastFetched < 5 * 60 * 1000) return;
    setLoading(true);
    setError(false);
    try {
      // Bug 1 fix: fetch 3 pages (up to 300 events) so the 30-day graph has
      // enough history even when many pushes happen on a single day.
      const [p1Res, p2Res, p3Res, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=100&page=1`),
        fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=100&page=2`),
        fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=100&page=3`),
        fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`),
      ]);
      if (!p1Res.ok || !reposRes.ok) throw new Error("API error");

      const p1: GitHubEvent[] = await p1Res.json();
      const p2: GitHubEvent[] = p2Res.ok ? await p2Res.json() : [];
      const p3: GitHubEvent[] = p3Res.ok ? await p3Res.json() : [];
      const repos: { stargazers_count: number }[] = await reposRes.json();

      // Deduplicate by event id across pages
      const seenIds = new Set<string>();
      const events: GitHubEvent[] = [...p1, ...p2, ...p3].filter((ev) => {
        if (seenIds.has(ev.id)) return false;
        seenIds.add(ev.id);
        return true;
      });

      const totalStars = repos.reduce((s, r) => s + (r.stargazers_count ?? 0), 0);

      // Bonus fix: use payload.size (always accurate) instead of commits array length
      const pushCount = events
        .filter((e) => e.type === "PushEvent")
        .reduce((n, e) => n + (e.payload.size ?? e.payload.commits?.length ?? 1), 0);

      const days = window.innerWidth < 768 ? 14 : 30;
      setGraph(buildGraph(events, days));

      // Build initial rows (may have placeholder messages for force-pushes)
      const initialRows = buildCommitsInitial(events);
      setCommits(initialRows);
      setStars(totalStars);
      setCommitCount(pushCount);
      setLastFetched(Date.now());
      setLastUpdatedLabel("just now");

      // Bug 2 fix: for rows that still have placeholder messages ("Commit · SHA")
      // fetch real commit details from the per-commit API asynchronously.
      const needsFetch = initialRows.filter((r) =>
        r.message.startsWith("Commit · ") && r.sha.length >= 7
      );
      if (needsFetch.length > 0) {
        const resolved = await Promise.all(
          needsFetch.map(async (r) => ({
            id: r.id,
            msg: await fetchCommitMessage(r.repo, r.sha),
          }))
        );
        setCommits((prev) =>
          prev.map((row) => {
            const found = resolved.find((x) => x.id === row.id);
            if (found && found.msg) return { ...row, message: found.msg };
            return row;
          })
        );
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFetched]);

  /* ─── On open: fetch + animate counts ─── */
  useEffect(() => {
    if (open) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (stars > 0) animateCount(stars, setDisplayStars);
  }, [stars]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (commitCount > 0) animateCount(commitCount, setDisplayCommits);
  }, [commitCount]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Polling every 60s while open ─── */
  useEffect(() => {
    if (open) {
      pollRef.current = setInterval(() => fetchData(true), 60000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRefresh = () => {
    setRefreshSpinning(true);
    fetchData(true);
    setTimeout(() => setRefreshSpinning(false), 1000);
  };

  /* ═══════════════════════════════════════════════════════════════
     Z-INDEX HIERARCHY (mobile)
     9993  GitHub trigger button
     9994  GitHub backdrop     ← hides trigger when GH panel open
     9995  GitHub panel
     9996  Recruiter backdrop  ← hides trigger when RecruiterMode open
     9997  Recruiter sheet
     ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ─── TRIGGER BUTTON ─── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="gh-trigger"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              position: "fixed",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              zIndex: 9993,
              height: isMobile ? 100 : 120,
              width: isMobile ? 28 : 32,
              background: "rgba(5,5,8,0.95)",
              border: "1px solid rgba(255,69,0,0.4)",
              borderRadius: "0 8px 8px 0",
              backdropFilter: "blur(12px)",
              padding: "12px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              touchAction: "manipulation",
              transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              outline: "none",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,69,0,0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF4500";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 0 20px rgba(255,69,0,0.2)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(5,5,8,0.95)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,69,0,0.4)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <Github size={16} style={{ color: "#FF4500", flexShrink: 0 }} />

            <span
              style={{
                writingMode: "vertical-rl",
                fontFamily: "monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.6)",
                userSelect: "none",
                textTransform: "uppercase",
              }}
            >
              LIVE ACTIVITY
            </span>

            <span className="gh-pulse-dot" />

            {/* Tooltip — desktop only */}
            <AnimatePresence>
              {showTooltip && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  style={{
                    position: "absolute",
                    left: "calc(100% + 8px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(5,5,8,0.95)",
                    border: "1px solid rgba(255,69,0,0.3)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.6)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 9994,
                  }}
                >
                  Press G to toggle
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── PANEL ─── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop — covers trigger (9993) */}
            {isMobile && (
              <motion.div
                key="gh-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  zIndex: 9994,
                }}
              />
            )}

            {/* Panel: desktop = left side | mobile = bottom sheet */}
            <motion.div
              key="gh-panel"
              initial={isMobile ? { y: "100%" } : { x: "-100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag={isMobile ? "y" : false}
              dragConstraints={isMobile ? { top: 0, bottom: 0 } : undefined}
              dragElastic={isMobile ? 0.2 : undefined}
              onDragEnd={
                isMobile
                  ? (_e: never, info: { offset: { y: number } }) => {
                      if (info.offset.y > 100) setOpen(false);
                    }
                  : undefined
              }
              style={
                isMobile
                  ? {
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "75vh",
                      width: "100%",
                      background: "rgba(5,5,8,0.97)",
                      borderTop: "1px solid rgba(255,69,0,0.3)",
                      backdropFilter: "blur(24px)",
                      zIndex: 9995,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      borderRadius: "20px 20px 0 0",
                    }
                  : {
                      position: "fixed",
                      left: 0,
                      top: 0,
                      width: 340,
                      height: "100vh",
                      background: "rgba(5,5,8,0.97)",
                      borderRight: "1px solid rgba(255,69,0,0.3)",
                      backdropFilter: "blur(24px)",
                      boxShadow: "4px 0 40px rgba(0,0,0,0.6)",
                      zIndex: 9995,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }
              }
            >
              {/* Mobile drag handle */}
              {isMobile && (
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
                </div>
              )}

              <PanelHeader
                onRefresh={handleRefresh}
                onClose={() => setOpen(false)}
                refreshSpinning={refreshSpinning}
              />

              <ProfileStrip stars={displayStars} commitCount={displayCommits} />

              {/* Scrollable body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,69,0,0.3) transparent",
                  ...({"WebkitOverflowScrolling": "touch"} as React.CSSProperties),
                }}
              >
                {!loading && !error && graph.length > 0 && (
                  <ContributionGraph
                    graph={graph}
                    tooltipBar={tooltipBar}
                    onHoverBar={setTooltipBar}
                  />
                )}
                <CommitsList
                  commits={commits}
                  loading={loading}
                  error={error}
                  onRetry={() => fetchData(true)}
                />
              </div>

              <PanelFooter lastUpdatedLabel={lastUpdatedLabel} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── GLOBAL KEYFRAMES ─── */}
      <style>{`
        @keyframes ghPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.5; }
        }
        @keyframes ghScanLine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes ghShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes ghBarGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes ghSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ghNewFlash {
          0%, 100% { background: transparent; }
          30% { background: rgba(255,69,0,0.12); }
        }
        .gh-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00FF88;
          animation: ghPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .gh-shimmer-row {
          height: 52px;
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 400px 100%;
          animation: ghShimmer 1.4s ease-in-out infinite;
          margin-bottom: 8px;
        }
      `}</style>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PANEL HEADER
   ═══════════════════════════════════════════════════════════════════ */
function PanelHeader({
  onRefresh,
  onClose,
  refreshSpinning,
}: {
  onRefresh: () => void;
  onClose: () => void;
  refreshSpinning: boolean;
}) {
  return (
    <div
      style={{
        height: 64,
        background: "rgba(255,69,0,0.06)",
        borderBottom: "1px solid rgba(255,69,0,0.2)",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "60%",
          height: 1,
          background: "rgba(255,69,0,0.15)",
          animation: "ghScanLine 4s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Github size={18} style={{ color: "#FF4500", flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.75rem",
              color: "white",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ARYAN IS BUILDING
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="gh-pulse-dot" />
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
            LIVE · github.com/aryxn-builds
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onRefresh}
          title="Refresh"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#FF4500")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)")}
        >
          <RefreshCw
            size={18}
            style={{ animation: refreshSpinning ? "ghSpin 0.8s linear infinite" : "none" }}
          />
        </button>
        <button
          onClick={onClose}
          title="Close"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "white")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)")}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROFILE STRIP
   ═══════════════════════════════════════════════════════════════════ */
function ProfileStrip({ stars, commitCount }: { stars: number; commitCount: number }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <img
          src={AVATAR_URL}
          alt="Aryan yadav"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid #FF4500",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Aryan yadav
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            @aryxn-builds
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {[
          { label: "REPOS", value: 18 },
          { label: "COMMITS", value: commitCount },
          { label: "STARS", value: stars },
        ].map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && (
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
            )}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.55rem",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.05em",
                  marginTop: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CONTRIBUTION GRAPH
   ═══════════════════════════════════════════════════════════════════ */
function ContributionGraph({
  graph,
  tooltipBar,
  onHoverBar,
}: {
  graph: DayBar[];
  tooltipBar: { index: number; label: string; count: number } | null;
  onHoverBar: (v: { index: number; label: string; count: number } | null) => void;
}) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          color: "#FF4500",
          letterSpacing: "0.15em",
          marginBottom: 10,
        }}
      >
        LAST {graph.length} DAYS
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 56,
          overflowX: "auto",
          position: "relative",
          paddingBottom: 2,
        }}
      >
        {graph.map((bar, i) => {
          const isPeak = bar.count > 10;
          const h = barHeight(bar.count);
          const c = barColor(bar.count);
          return (
            <div
              key={bar.date}
              title={`${bar.label} · ${bar.count} commit${bar.count !== 1 ? "s" : ""}`}
              onMouseEnter={() => onHoverBar({ index: i, label: bar.label, count: bar.count })}
              onMouseLeave={() => onHoverBar(null)}
              style={{
                width: 6,
                height: `${h}px`,
                borderRadius: 3,
                background: c,
                flexShrink: 0,
                cursor: "default",
                boxShadow: isPeak ? "0 0 8px rgba(255,69,0,0.8)" : "none",
                transformOrigin: "bottom",
                animation: `ghBarGrow 0.4s ease forwards`,
                animationDelay: `${i * 0.02}s`,
                transform: "scaleY(0)",
                transition: "opacity 0.2s",
                opacity: tooltipBar !== null && tooltipBar.index !== i ? 0.5 : 1,
              }}
            />
          );
        })}

        {tooltipBar !== null && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: tooltipBar.index * 8,
              background: "rgba(5,5,8,0.95)",
              border: "1px solid rgba(255,69,0,0.5)",
              borderRadius: 6,
              padding: "4px 8px",
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.8)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {tooltipBar.label} · {tooltipBar.count} commit{tooltipBar.count !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMMITS LIST
   ═══════════════════════════════════════════════════════════════════ */
function CommitsList({
  commits,
  loading,
  error,
  onRetry,
}: {
  commits: CommitRow[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FF4500", letterSpacing: "0.15em", marginBottom: 12 }}>
          RECENT COMMITS
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="gh-shimmer-row" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Github size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
        <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          UNABLE TO FETCH ACTIVITY
        </p>
        <button
          onClick={onRetry}
          style={{
            background: "none",
            border: "1px solid #FF4500",
            borderRadius: 6,
            padding: "8px 20px",
            fontFamily: "monospace",
            fontSize: "0.7rem",
            color: "#FF4500",
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Retry ↻
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FF4500", letterSpacing: "0.15em", marginBottom: 8 }}>
        RECENT COMMITS
      </div>
      {commits.length === 0 && (
        <p style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
          No recent commits found.
        </p>
      )}
      {commits.map((c) => {
        const color = getRepoColor(c.repo);
        const repoShort = c.repo.replace("aryxn-builds/", "");
        const commitUrl = `https://github.com/${c.repo}/commit/${c.sha}`;

        return (
          <div
            key={c.id}
            style={{
              padding: "10px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              borderRadius: 8,
              animation: c.isNew ? "ghNewFlash 3s ease forwards" : "none",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,69,0,0.05)")}
            onMouseOut={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 6px ${color}80`,
                flexShrink: 0,
                marginTop: 5,
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color, letterSpacing: "0.05em" }}>
                  {repoShort}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>
                  on {c.branch}
                </span>
                {c.isNew && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.55rem",
                      color: "#FF4500",
                      border: "1px solid rgba(255,69,0,0.5)",
                      borderRadius: 4,
                      padding: "1px 4px",
                    }}
                  >
                    NEW ●
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.85)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {c.message}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                {timeAgo(c.time)}
              </span>
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  display: "flex",
                  padding: 4,
                  minWidth: 32,
                  minHeight: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FF4500")}
                onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)")}
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════ */
function PanelFooter({ lastUpdatedLabel }: { lastUpdatedLabel: string }) {
  return (
    <div
      style={{
        height: 52,
        borderTop: "1px solid rgba(255,69,0,0.15)",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>
        Last updated: {lastUpdatedLabel}
      </span>
      <a
        href="https://github.com/aryxn-builds"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.4)",
          textDecoration: "none",
          transition: "color 0.2s",
          padding: "4px 0",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "white";
          (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)";
          (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
        }}
      >
        VIEW FULL PROFILE ↗
      </a>
    </div>
  );
}
