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

const renderStars = () => (
  <div className="flex text-amber-400 text-sm gap-0.5 my-1">
    {'★★★★★'.split('').map((star, i) => (
      <span key={i}>{star}</span>
    ))}
  </div>
);

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

const buildIconUrl = (url: string, name: string): string => {
  const host = safeHost(url);
  if (host) {
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  }
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'App')}`;
};

const buildDescriptionText = (desc?: Partial<AppDescription> & { description?: string }) => {
  if (!desc) return 'Web application';
  if (typeof desc.description === 'string') return desc.description;
  if (Array.isArray(desc.keyFeatures) && desc.keyFeatures.length > 0) {
    return desc.keyFeatures.slice(0, 3).join(' • ');
  }
  return desc.whyNow || desc.oneLiner || 'Web application';
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
    return mapDescriptionToWebApp(url, data.description as AppDescription, id, data.createdAt);
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
    iconUrl: data?.iconUrl || buildIconUrl(url, name),
    createdAt: normalizeCreatedAt(data?.createdAt),
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

  const email = (user?.email || '').toLowerCase();
  const canAccessApps = !!user && (allowedEmails.size === 0 || allowedEmails.has(email));
  const displayApps = canAccessApps ? apps : guestApps;
  const featuredApp = displayApps[0] || null;
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

    const newApp: WebApp = {
      ...buildFallbackApp(trimmed),
      iconUrl: buildIconUrl(trimmed, safeHost(trimmed) || 'Web Application'),
    };

    if (!canAccessApps) return newApp;

    const { id: _id, createdAt: _createdAt, ...payload } = newApp;
    try {
      const ref = await addDoc(collection(db, 'apps'), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: (user?.email || 'unknown').toLowerCase(),
        createdByUid: user?.id || null,
      });
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen relative bg-gray-50 text-slate-900 font-sans pb-24">
      <div className="relative z-10 max-w-md mx-auto md:max-w-7xl">
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
              Trending Apps
            </h2>
            <div className="text-sm text-amber-600 cursor-pointer hover:text-amber-700 font-medium tracking-wide transition-colors">
              VIEW ALL
            </div>
          </div>

          {featuredApp ? (
            <div className="mb-10 relative">
              <a
                href={featuredApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative overflow-hidden rounded-[2rem] h-56 p-8 flex flex-col justify-center text-white shadow-lg shadow-amber-500/10 transition-transform hover:scale-[1.01]"
                style={{ background: FEATURED_BG }}
              >
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-90 hidden md:block">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 15L85 85H15L50 15Z" stroke="#FDE68A" strokeWidth="8" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="relative z-10 max-w-[70%]">
                  <h3 className="text-3xl font-extrabold mb-3 tracking-tight">{featuredApp.name}</h3>
                  <p className="text-white/90 text-base font-medium leading-relaxed line-clamp-3">
                    {featuredApp.tagline || featuredApp.description}
                  </p>
                </div>
              </a>
              <div className="flex justify-center gap-2 mt-6">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              </div>
            </div>
          ) : appsLoading ? (
            <div className="mb-10 h-56 rounded-[2rem] bg-gray-200 animate-pulse"></div>
          ) : null}

          <div className="space-y-5 mb-12">
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
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-50"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = buildIconUrl('', app.name);
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-slate-900 truncate pr-4">{app.name}</h3>
                        <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                          </svg>
                          <span>{(Math.random() * 10).toFixed(1)}k Reads</span>
                        </div>
                      </div>

                      {renderStars()}

                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2">
                        {app.tagline || app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 sm:ml-24">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 font-extrabold text-sm py-2.5 px-8 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-amber-200 hover:shadow-md hover:from-amber-400 hover:to-amber-600 transition-all active:scale-95"
                    >
                      Install
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-80">
                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                      </svg>
                    </a>

                    <div className="hidden sm:flex items-center gap-3 ml-4">
                      <div className="w-6 h-6 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                          <path
                            fillRule="evenodd"
                            d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="w-6 h-6 rounded bg-gray-100 text-gray-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path
                            fillRule="evenodd"
                            d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1v12h12V4H4zm2 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V6zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V6zM6 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

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

        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 pt-2 pb-1 z-50 md:hidden">
          <div className="flex justify-between items-end text-[10px] font-bold text-gray-400">
            <div className="flex flex-col items-center gap-1 text-amber-500 relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Home</span>
              <span className="w-4 h-1 bg-amber-500 rounded-t-full mt-1"></span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Search</span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Explore</span>
            </div>
            <div className="flex flex-col items-center gap-1 hover:text-slate-900 transition-colors pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Account</span>
            </div>
          </div>
        </div>

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
