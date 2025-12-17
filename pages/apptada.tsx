// pages/apptada.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

import { auth, db } from "../firebaseClient";

type AppDescription = {
  appName: string;
  oneLiner: string;
  valueProps: string[];
  targetUsers: string[];
  keyFeatures: string[];
  whyNow: string;
  howToUse: string[];
  risksOrNotes: string[];
};

type StoredApp = {
  id: string;
  url: string;
  description: AppDescription;
  createdAt?: any;
  createdBy?: string;
};

function parseAllowedEmails(): string[] {
  // ใส่ใน .env.local เช่น:
  // VITE_ALLOWED_EMAILS=boss@company.com,tadapong@manee-son.com
  const raw =
    import.meta.env.VITE_ALLOWED_EMAILS ||
    import.meta.env.NEXT_PUBLIC_ALLOWED_EMAILS ||
    "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

export default function AppTadaPage() {
  const allowedEmails = useMemo(() => parseAllowedEmails(), []);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [url, setUrl] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [description, setDescription] = useState<AppDescription | null>(null);

  const [saveLoading, setSaveLoading] = useState(false);

  const [apps, setApps] = useState<StoredApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);

  const email = (user?.email || "").toLowerCase();
  const isAllowed = !!email && (allowedEmails.length === 0 || allowedEmails.includes(email));

  useEffect(() => {
    document.title = "AppTada Store";
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !isAllowed) {
      setApps([]);
      setAppsLoading(false);
      return;
    }

    setAppsLoading(true);
    setAppsError(null);

    const q = query(collection(db, "apps"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: StoredApp[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            url: data.url,
            description: data.description,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
          };
        });
        setApps(rows);
        setAppsLoading(false);
      },
      (err) => {
        setAppsError(err?.message || "Failed to load apps");
        setAppsLoading(false);
      }
    );

    return () => unsub();
  }, [user, isAllowed]);

  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  async function handleGenerate() {
    setGenError(null);
    setDescription(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setGenError("กรุณาใส่ลิงก์ก่อน");
      return;
    }

    setGenLoading(true);
    try {
      const res = await fetch("/api/describe-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { description: AppDescription };
      if (!data?.description) throw new Error("Bad response from server");
      setDescription(data.description);
    } catch (e: any) {
      setGenError(e?.message || "Generate failed");
    } finally {
      setGenLoading(false);
    }
  }

  async function handleCopy() {
    if (!description) return;
    const text = formatDescription(description, url.trim());
    await navigator.clipboard.writeText(text);
  }

  async function handleSave() {
    if (!user || !isAllowed || !description) return;
    const trimmed = url.trim();
    if (!trimmed) return;

    setSaveLoading(true);
    try {
      await addDoc(collection(db, "apps"), {
        url: trimmed,
        description,
        createdAt: serverTimestamp(),
        createdBy: user.email || "unknown",
      });
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.h1}>AppTada Store</div>
              <div style={styles.sub}>
                เก็บลิงก์ webapp + สร้างคำบรรยายแบบ “ขายให้หัวหน้า” แล้วบันทึกเป็นรายการ
              </div>
            </div>

            <div style={styles.userBox}>
              {authLoading ? (
                <span style={styles.muted}>Checking login…</span>
              ) : user ? (
                <>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 700 }}>{user.displayName || "Signed in"}</div>
                    <div style={styles.muted}>{user.email}</div>
                  </div>
                  <button style={styles.btnGhost} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button style={styles.btn} onClick={handleLogin}>
                  Login with Google
                </button>
              )}
            </div>
          </div>

          {!authLoading && user && !isAllowed && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Access denied</div>
              <div style={styles.muted}>
                อีเมลนี้ไม่ได้รับสิทธิ์เข้าหน้านี้ (เช็ก allowlist / custom claims)
              </div>
              <div style={{ marginTop: 12 }}>
                <button style={styles.btnGhost} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}

          {!authLoading && !user && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Login required</div>
              <div style={styles.muted}>หน้านี้จำกัดเฉพาะคนที่คุณอนุญาต</div>
              <div style={{ marginTop: 12 }}>
                <button style={styles.btn} onClick={handleLogin}>
                  Login with Google
                </button>
              </div>
            </div>
          )}

          {!authLoading && user && isAllowed && (
            <>
              <div style={styles.card}>
                <div style={styles.cardTitle}>เพิ่มลิงก์ → ให้ AI เขียนคำบรรยาย</div>

                <div style={styles.formRow}>
                  <input
                    style={styles.input}
                    placeholder="วางลิงก์ webapp เช่น https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <button style={styles.btn} onClick={handleGenerate} disabled={genLoading}>
                    {genLoading ? "Generating…" : "Generate"}
                  </button>
                </div>

                <div style={styles.miniRow}>
                  <span style={styles.muted}>Host: {safeHost(url)}</span>
                </div>

                {genError && <div style={styles.error}>{genError}</div>}

                {description && (
                  <div style={{ marginTop: 12 }}>
                    <div style={styles.previewTitle}>Preview</div>
                    <pre style={styles.pre}>{formatDescription(description, url.trim())}</pre>

                    <div style={styles.actionsRow}>
                      <button style={styles.btnGhost} onClick={handleCopy}>
                        Copy
                      </button>
                      <button
                        style={styles.btn}
                        onClick={handleSave}
                        disabled={saveLoading}
                        title="Save to Firestore"
                      >
                        {saveLoading ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}>รายการใน Store</div>

                {appsLoading && <div style={styles.muted}>Loading…</div>}
                {appsError && <div style={styles.error}>{appsError}</div>}

                {!appsLoading && apps.length === 0 && (
                  <div style={styles.muted}>ยังไม่มีรายการ (เริ่มจาก Generate แล้ว Save)</div>
                )}

                <div style={styles.grid}>
                  {apps.map((a) => (
                    <div key={a.id} style={styles.appCard}>
                      <div style={styles.appTop}>
                        <div style={{ fontWeight: 800 }}>{a.description?.appName || "Untitled"}</div>
                        <a href={a.url} target="_blank" rel="noreferrer" style={styles.link}>
                          Open
                        </a>
                      </div>

                      <div style={styles.muted}>{a.description?.oneLiner}</div>

                      <div style={{ marginTop: 10 }}>
                        <div style={styles.smallLabel}>Key features</div>
                        <ul style={styles.ul}>
                          {(a.description?.keyFeatures || []).slice(0, 4).map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={styles.footerRow}>
                        <span style={styles.tinyMuted}>{a.createdBy || ""}</span>
                        <span style={styles.tinyMuted}>{safeHost(a.url)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={styles.footerNote}>
            Tip: ตั้งค่า <code>VITE_ALLOWED_EMAILS</code> ใน <code>.env.local</code> เพื่อจำกัดคนเข้า
            (หรือย้ายไปใช้ custom claims จะเนียนกว่า)
          </div>
        </div>
      </div>
    </>
  );
}

function formatDescription(desc: AppDescription, url: string) {
  const lines: string[] = [];
  lines.push(`${desc.appName}`);
  lines.push(`${desc.oneLiner}`);
  lines.push("");
  lines.push(`URL: ${url}`);
  lines.push("");
  lines.push("Value props:");
  for (const v of desc.valueProps || []) lines.push(`- ${v}`);
  lines.push("");
  lines.push("Target users:");
  for (const t of desc.targetUsers || []) lines.push(`- ${t}`);
  lines.push("");
  lines.push("Key features:");
  for (const k of desc.keyFeatures || []) lines.push(`- ${k}`);
  lines.push("");
  lines.push(`Why now: ${desc.whyNow}`);
  lines.push("");
  lines.push("How to use:");
  for (const s of desc.howToUse || []) lines.push(`- ${s}`);
  lines.push("");
  lines.push("Risks/Notes:");
  for (const r of desc.risksOrNotes || []) lines.push(`- ${r}`);
  return lines.join("\n");
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b0f17",
    color: "white",
    padding: 24,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  container: { maxWidth: 980, margin: "0 auto" },
  headerRow: {
    display: "flex",
    gap: 16,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  h1: { fontSize: 28, fontWeight: 900, letterSpacing: -0.4 },
  sub: { marginTop: 6, color: "rgba(255,255,255,0.75)", maxWidth: 720 },
  userBox: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "10px 12px",
    borderRadius: 14,
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: 800, marginBottom: 10, color: "rgba(255,255,255,0.92)" },
  formRow: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "12px 12px",
    color: "white",
    outline: "none",
  },
  btn: {
    background: "white",
    color: "#0b0f17",
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
    minWidth: 120,
  },
  btnGhost: {
    background: "transparent",
    color: "white",
    border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  muted: { color: "rgba(255,255,255,0.68)" },
  tinyMuted: { color: "rgba(255,255,255,0.55)", fontSize: 12 },
  error: {
    marginTop: 10,
    background: "rgba(255,0,0,0.12)",
    border: "1px solid rgba(255,0,0,0.25)",
    padding: "10px 12px",
    borderRadius: 14,
    color: "rgba(255,255,255,0.92)",
    whiteSpace: "pre-wrap",
  },
  miniRow: { marginTop: 10, display: "flex", justifyContent: "space-between" },
  previewTitle: { fontWeight: 900, marginBottom: 8 },
  pre: {
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 12,
    whiteSpace: "pre-wrap",
    lineHeight: 1.4,
    fontSize: 13,
  },
  actionsRow: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 },
  grid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  appCard: {
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  appTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  link: { color: "white", textDecoration: "underline", fontWeight: 800, fontSize: 12 },
  smallLabel: { fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.78)" },
  ul: { margin: "6px 0 0 18px", color: "rgba(255,255,255,0.85)" },
  footerRow: { marginTop: "auto", display: "flex", justifyContent: "space-between", gap: 10 },
  footerNote: { marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 12 },
};
