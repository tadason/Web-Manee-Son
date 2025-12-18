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
import BackgroundCanvas from '../components/apptada/BackgroundCanvas';
import Navbar from '../components/apptada/Navbar';
import HeroSection from '../components/apptada/HeroSection';
import AppGrid from '../components/apptada/AppGrid';
import AddAppModal from '../components/apptada/AddAppModal';
import type { WebApp } from '../components/apptada/types';
import { analyzeWebAppUrl, generateAppIcon } from '../services/metadataService';

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
    // @ts-ignore
    import.meta.env.NEXT_PUBLIC_ALLOWED_EMAILS || '';
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

function buildDescriptionText(desc?: Partial<AppDescription> & { description?: string }) {
  if (!desc) return 'Web application';

  if (typeof desc.description === 'string') {
    return desc.description;
  }

  if (Array.isArray(desc.keyFeatures) && desc.keyFeatures.length > 0) {
    return desc.keyFeatures.slice(0, 3).join(' • ');
  }
  return desc.whyNow || desc.oneLiner || 'Web application';
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

function mapDocToWebApp(data: DocumentData, id: string): WebApp | null {
  const url = data?.url;
  if (!url) return null;

  if (data?.description && typeof data.description === 'object' && !Array.isArray(data.description)) {
    return mapDescriptionToWebApp(url, data.description as AppDescription, id, data.createdAt);
  }

  const name = data?.name || data?.description?.appName || 'Untitled';
  const descriptionText = typeof data?.description === 'string' ? data.description : undefined;
  const tagline = data?.tagline || descriptionText || 'Web application';
  const category = data?.category || 'Web App';

  return {
    id,
    url,
    name,
    tagline,
    description: descriptionText || buildDescriptionText(),
    category,
    iconUrl: data?.iconUrl || buildIconUrl(url, name),
    createdAt: normalizeCreatedAt(data?.createdAt),
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

    let appData = buildFallbackApp(trimmed);

    try {
      const aiData = await analyzeWebAppUrl(trimmed);
      appData = {
        ...appData,
        name: aiData.name,
        tagline: aiData.tagline,
        description: aiData.description,
        category: aiData.category,
      };
    } catch (err) {
      console.error('Metadata analyze failed, using fallback', err);
    }

    let iconUrl = appData.iconUrl;
    try {
      iconUrl = await generateAppIcon(appData.name, appData.description);
    } catch (err) {
      console.error('Icon generation failed, using fallback favicon', err);
      iconUrl = buildIconUrl(trimmed, appData.name);
    }

    const newApp: WebApp = {
      ...appData,
      iconUrl,
    };

    if (canAccessApps) {
      const { id: _id, createdAt: _createdAt, ...payload } = newApp;
      try {
        const ref = await addDoc(collection(db, 'apps'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.email || 'unknown',
        });
        newApp.id = ref.id;
      } catch (err: any) {
        console.error('Firestore add failed', err);
        setAppsError(err?.message || 'Failed to save to Firestore');
        throw err;
      }
    }

    return newApp;
  };

  const handleDeleteApp = async (id: string) => {
    if (!canAccessApps) return;
    try {
      setApps((prev) => prev.filter((a) => a.id !== id));
      await deleteDoc(doc(db, 'apps', id));
    } catch (err: any) {
      setAppsError(err?.message || 'Failed to delete app');
    }
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

          <AppGrid apps={displayApps} loading={isGridLoading} onDeleteApp={canAccessApps ? handleDeleteApp : undefined} />

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
