import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseClient';
import BackgroundCanvas from '../components/apptada/BackgroundCanvas';
import Navbar from '../components/apptada/Navbar';
import HeroSection from '../components/apptada/HeroSection';
import AppGrid from '../components/apptada/AppGrid';
import AddAppModal from '../components/apptada/AddAppModal';
import type { WebApp } from '../components/apptada/types';

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

function parseAllowedEmails(): string[] {
  const raw =
    import.meta.env.VITE_ALLOWED_EMAILS ||
    import.meta.env.NEXT_PUBLIC_ALLOWED_EMAILS ||
    '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function normalizeCreatedAt(value: any): number {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return Date.now();
}

function buildIconUrl(url: string, name: string) {
  const host = safeHost(url);
  if (host) {
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  }
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || 'App')}`;
}

function buildDescriptionText(desc: AppDescription) {
  if (Array.isArray(desc.keyFeatures) && desc.keyFeatures.length > 0) {
    return desc.keyFeatures.slice(0, 3).join(' • ');
  }
  return desc.whyNow || desc.oneLiner;
}

function mapDescriptionToWebApp(url: string, desc: AppDescription, id?: string, createdAt?: any): WebApp {
  const name = desc.appName || 'Untitled';
  const tagline = desc.oneLiner || 'Web application';
  const category = desc.targetUsers?.[0] || 'Web App';
  return {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    url,
    name,
    tagline,
    description: buildDescriptionText(desc),
    category,
    iconUrl: buildIconUrl(url, name),
    createdAt: normalizeCreatedAt(createdAt),
  };
}

export default function AppTadaPage() {
  const { user } = useAuth();
  const allowedEmails = useMemo(() => parseAllowedEmails(), []);
  const [apps, setApps] = useState<WebApp[]>([]);
  const [guestApps, setGuestApps] = useState<WebApp[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const email = (user?.email || '').toLowerCase();
  const isAllowed = !!email && (allowedEmails.length === 0 || allowedEmails.includes(email));
  const canAccessApps = !!user && isAllowed;

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
          .map((d) => {
            const data = d.data() as DocumentData;
            if (!data?.description || !data?.url) return null;
            return mapDescriptionToWebApp(
              data.url,
              data.description as AppDescription,
              d.id,
              data.createdAt
            );
          })
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

    const res = await fetch('/api/describe-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmed }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = (await res.json()) as { description: AppDescription };
    if (!data?.description) throw new Error('Bad response from server');

    if (canAccessApps) {
      await addDoc(collection(db, 'apps'), {
        url: trimmed,
        description: data.description,
        createdAt: serverTimestamp(),
        createdBy: user?.email || 'unknown',
      });
    }

    return mapDescriptionToWebApp(trimmed, data.description);
  };

  const handleAddApp = (app: WebApp) => {
    if (canAccessApps) return;
    setGuestApps((prev) => [app, ...prev]);
  };

  const displayApps = canAccessApps ? apps : guestApps;
  const isGridLoading = canAccessApps && appsLoading;

  return (
    <div className="min-h-screen relative text-white">
      <BackgroundCanvas />

      <div className="relative z-10">
        <Navbar onOpenModal={() => setIsModalOpen(true)} userAvatar={user?.avatar} />
        <HeroSection onOpenModal={() => setIsModalOpen(true)} />

        <main id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-20 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_#00F0FF]"></span>
              Trending Apps
            </h2>
            <div className="text-sm text-cyan-400 cursor-pointer hover:text-cyan-300 font-medium tracking-wide transition-colors">
              VIEW ALL
            </div>
          </div>

          {appsError && canAccessApps && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {appsError}
            </div>
          )}

          <AppGrid apps={displayApps} loading={isGridLoading} />

          {!canAccessApps && (
            <div className="mt-10 text-center text-sm text-gray-400">
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
