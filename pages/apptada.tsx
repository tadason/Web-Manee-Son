import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseClient';
import Navbar from '../components/apptada/Navbar';
import AddAppModal from '../components/apptada/AddAppModal';
import type { WebApp } from '../components/apptada/types';
import { useNavigate } from 'react-router-dom';

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

const FEATURED_BG = 'linear-gradient(135deg, #1a5f72 0%, #2b8a9e 40%, #e88a4d 100%)';

const parseAllowedEmails = (): Set<string> => {
  const raw =
    import.meta.env.VITE_ALLOWED_EMAILS ||
    // @ts-ignore
    import.meta.env.NEXT_PUBLIC_ALLOWED_EMAILS ||
    '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
};

const safeHost = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};

const normalizeCreatedAt = (value: any): number => {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return Date.now();
};

const buildScreenshotUrl = (url: string): string =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200`;

const formatDate = (value: number): string => {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const buildIconUrl = (_url: string, name: string): string =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'App')}`;

const buildDescriptionText = (desc?: Partial<AppDescription> & { description?: string }) => {
  if (!desc) return 'Web application';
  if (typeof desc.description === 'string') return desc.description;
  if (Array.isArray(desc.keyFeatures) && desc.keyFeatures.length > 0) {
    return desc.keyFeatures.slice(0, 3).join(' • ');
  }
  return desc.whyNow || desc.oneLiner || 'Web application';
};

const stripUndefined = <T extends Record<string, unknown>>(value: T): T => {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
};

const mapDescriptionToWebApp = (url: string, desc: AppDescription, id?: string, createdAt?: any): WebApp => {
  const name = desc.appName || 'Untitled';
  const category = desc.targetUsers?.[0] || 'Web App';
  return {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    url,
    name,
    tagline: desc.oneLiner || 'Web application',
    description: buildDescriptionText(desc),
    category,
    iconUrl: buildIconUrl(url, name),
    createdAt: normalizeCreatedAt(createdAt),
  };
};

const mapDocToWebApp = (data: DocumentData, id: string): WebApp | null => {
  const url = data?.url;
  if (!url) return null;

  if (data?.description && typeof data.description === 'object' && !Array.isArray(data.description)) {
    const base = mapDescriptionToWebApp(url, data.description as AppDescription, id, data.createdAt);
    return {
      ...base,
      ogTitle: data?.ogTitle,
      ogDescription: data?.ogDescription,
      ogImage: data?.ogImage,
      screenshotUrl: data?.screenshotUrl,
    };
  }

  const name = data?.name || data?.description?.appName || 'Untitled';
  const descriptionText = typeof data?.description === 'string' ? data.description : undefined;

  return {
    id,
    url,
    name,
    tagline: data?.tagline || descriptionText || 'Web application',
    description: descriptionText || buildDescriptionText(),
    category: data?.category || 'Web App',
    iconUrl: buildIconUrl(url, name),
    createdAt: normalizeCreatedAt(data?.createdAt),
    ogTitle: data?.ogTitle,
    ogDescription: data?.ogDescription,
    ogImage: data?.ogImage,
    screenshotUrl: data?.screenshotUrl,
  };
};

const buildFallbackApp = (url: string): WebApp => {
  const name = safeHost(url) || 'Web Application';
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    url,
    name,
    tagline: 'แอปพลิเคชันเว็บ',
    description: 'รายละเอียดกำลังจัดทำ',
    category: 'General',
    iconUrl: buildIconUrl(url, name),
    createdAt: Date.now(),
    screenshotUrl: buildScreenshotUrl(url),
  };
};

export default function AppTadaPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allowedEmails = useMemo(() => parseAllowedEmails(), []);
  const [apps, setApps] = useState<WebApp[]>([]);
  const [guestApps, setGuestApps] = useState<WebApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{ id: string; message: string } | null>(null);

  const email = (user?.email || '').toLowerCase();
  const canAccessApps = !!user && (allowedEmails.size === 0 || allowedEmails.has(email));
  const displayApps = canAccessApps ? apps : guestApps;
  const featuredApps = displayApps.slice(0, 6);
  const listedApps = displayApps.length > 1 ? displayApps.slice(1) : [];

  useEffect(() => {
    document.title = 'AppTada Store';
  }, []);

  useEffect(() => {
    if (!canAccessApps) {
      setApps([]);
      setAppsLoading(false);
      return;
    }

    setAppsLoading(true);
    setAppsError(null);

    const q = query(collection(db, 'apps'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => mapDocToWebApp(d.data() as DocumentData, d.id))
          .filter(Boolean) as WebApp[];

        setApps(rows);
        setAppsLoading(false);
      },
      (err) => {
        setAppsError(err?.message || 'Failed to load apps');
        setAppsLoading(false);
      }
    );

    return () => unsub();
  }, [canAccessApps]);

  const handleCreateApp = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) throw new Error('URL required');

    const metadata: { title?: string; description?: string; image?: string; siteName?: string } | null = null;

    const derivedName = metadata?.title || safeHost(trimmed) || 'Web Application';
    const derivedDescription = metadata?.description || 'รายละเอียดกำลังจัดทำ';

    const newApp: WebApp = {
      ...buildFallbackApp(trimmed),
      name: derivedName,
      tagline: metadata?.siteName || 'Web application',
      description: derivedDescription,
      iconUrl: buildIconUrl(trimmed, derivedName),
      ogTitle: metadata?.title,
      ogDescription: metadata?.description,
      ogImage: metadata?.image,
      screenshotUrl: buildScreenshotUrl(trimmed),
    };

    if (!canAccessApps) return newApp;

    const { id: _id, createdAt: _createdAt, ...payload } = newApp;
    try {
      const firestorePayload = stripUndefined({
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: (user?.email || 'unknown').toLowerCase(),
        createdByUid: user?.id || null,
      });
      const ref = await addDoc(collection(db, 'apps'), firestorePayload);
      newApp.id = ref.id;
    } catch (err: any) {
      setAppsError(err?.message || 'Failed to save to Firestore');
      throw err;
    }

    return newApp;
  };

  const handleDeleteApp = async (id: string) => {
    if (!canAccessApps) return;
    try {
      await deleteDoc(doc(db, 'apps', id));
      setApps((prev) => prev.filter((a) => a.id !== id));
      setAppsError(null);
    } catch (err: any) {
      setAppsError(err?.message || 'Failed to delete app');
    }
  };

  const handleAddApp = (app: WebApp) => {
    if (canAccessApps) return;
    setGuestApps((prev) => [app, ...prev]);
  };

  const handleCopyLink = async (appId: string, url: string) => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard not available');
      }
      await navigator.clipboard.writeText(url);
      setCopyStatus({ id: appId, message: 'Link copied' });
      window.setTimeout(() => setCopyStatus(null), 1800);
    } catch {
      setCopyStatus({ id: appId, message: 'Copy failed' });
      window.setTimeout(() => setCopyStatus(null), 1800);
    }
  };

  const buildPreviewImage = (app: WebApp) =>
    app.ogImage || app.screenshotUrl || buildScreenshotUrl(app.url);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-[100svh] relative bg-gray-50 text-slate-900 font-sans pb-24">
      <div className="relative z-10 w-full max-w-none sm:max-w-7xl mx-auto">
        <Navbar
          onOpenModal={() => setIsModalOpen(true)}
          userAvatar={user?.avatar}
          onLogout={user ? handleLogout : undefined}
        />

        <main id="browse" className="px-4 sm:px-6 lg:px-8 pt-6 relative z-20">
          {appsError && canAccessApps && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-100 px-4 py-3 text-sm text-red-600">
              {appsError}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full shadow-sm"></span>
              App Store
            </h2>
            <div className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
              {displayApps.length} Apps
            </div>
          </div>

          {featuredApps.length > 0 ? (
            <div className="mb-10 relative">
              <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
                {featuredApps.map((app) => (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[68%] sm:min-w-[56%] md:min-w-[44%] lg:min-w-[36%] snap-start block group relative overflow-hidden rounded-[2rem] aspect-[4/3] p-8 flex flex-col justify-end text-white shadow-lg shadow-amber-500/10 transition-transform hover:scale-[1.01]"
                    style={{ background: FEATURED_BG }}
                  >
                    {buildPreviewImage(app) && (
                      <div className="absolute inset-0 opacity-70">
                        <img
                          src={buildPreviewImage(app)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/10 to-black/50" />
                      </div>
                    )}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-90 hidden md:block">
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 15L85 85H15L50 15Z" stroke="#FDE68A" strokeWidth="8" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="relative z-10 max-w-[70%]">
                      <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed line-clamp-3">
                        {app.ogDescription || app.tagline || app.description}
                      </p>
                      <div className="mt-4 text-xs text-white/70 font-semibold uppercase tracking-widest">
                        {safeHost(app.url)} • {app.category}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Scroll horizontally
              </div>
            </div>
          ) : appsLoading ? (
            <div className="mb-10 h-56 rounded-[2rem] bg-gray-200 animate-pulse"></div>
          ) : null}

          <div className="grid gap-5 mb-12 md:grid-cols-2">
            {appsLoading && listedApps.length === 0 ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-[2rem] bg-gray-100 animate-pulse"></div>
              ))
            ) : (
              listedApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100/50 relative group hover:shadow-md transition-all"
                >
                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <img
                        src={buildIconUrl(app.url, app.name)}
                        alt={app.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-50"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.dataset.fallback !== '1') {
                            target.dataset.fallback = '1';
                            target.src = buildIconUrl(app.url, app.name);
                            return;
                          }
                          target.onerror = null;
                          target.src = buildIconUrl('', app.name);
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-slate-900 truncate pr-4">{app.ogTitle || app.name}</h3>
                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-gray-50 px-3 py-1 rounded-full">
                          <span>{safeHost(app.url) || 'web app'}</span>
                          <span>•</span>
                          <span>{formatDate(app.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2">
                        {app.ogDescription || app.tagline || app.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="px-2 py-1 rounded-full bg-slate-100">{app.category}</span>
                        <span className="px-2 py-1 rounded-full bg-slate-100">{safeHost(app.url)}</span>
                      </div>
                    </div>
                    <div className="hidden md:block w-48 h-28 shrink-0">
                      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                        <img
                          src={buildPreviewImage(app)}
                          alt={`${app.name} preview`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.dataset.fallback !== '1') {
                              target.dataset.fallback = '1';
                              target.src = buildScreenshotUrl(app.url);
                              return;
                            }
                            target.onerror = null;
                            target.src = '';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-6 sm:ml-24">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 font-extrabold text-sm py-2.5 px-8 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-amber-200 hover:shadow-md hover:from-amber-400 hover:to-amber-600 transition-all active:scale-95"
                    >
                      Open App
                    </a>

                    <button
                      onClick={() => handleCopyLink(app.id, app.url)}
                      className="flex-1 sm:flex-none border border-slate-200 text-slate-600 text-sm font-semibold px-6 py-2.5 rounded-xl hover:border-slate-300 hover:text-slate-800 transition-colors"
                    >
                      Copy Link
                    </button>
                    {copyStatus?.id === app.id && (
                      <div className="text-xs text-slate-400 font-semibold">{copyStatus.message}</div>
                    )}

                    {canAccessApps && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Delete this app?')) handleDeleteApp(app.id);
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete App"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path
                            fillRule="evenodd"
                            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.032 41.032 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!canAccessApps && (
            <div className="mt-10 mb-20 text-center text-sm text-gray-500">
              Guest mode: login is required to save and load history.
            </div>
          )}
        </main>

        <AddAppModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateApp={handleCreateApp}
          onAddApp={handleAddApp}
        />
      </div>
    </div>
  );
}
