'use client';

import { useState, useEffect } from 'react';
import { ChatContainerEN } from '@/components/chat/ChatContainerEN';
import { SpecPreviewEN, ExportButtonsEN } from '@/components/preview';
import { SettingsPanelEN, ApiKeyModalEN } from '@/components/settings';
import {
  FileCode2,
  MessageSquare,
  FileText,
  ExternalLink,
  Rocket,
  Smartphone,
  UserCircle,
  Headphones,
} from 'lucide-react';

// Promotions
const promotions = [
  {
    id: 'startpack',
    icon: Rocket,
    message: 'Launch your web service fast with Next.js',
    name: 'StartPack',
    url: 'https://startpack.shingoirie.com/',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
  },
  {
    id: 'pocketcorder',
    icon: Smartphone,
    message: 'Development in your pocket. Remote control your PC from your phone',
    name: 'PocketCorder',
    url: 'https://pc.shingoirie.com/en',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'solo',
    icon: UserCircle,
    message: 'Organize your activities. Profile creation service',
    name: 'SOLO',
    url: 'https://solo.onl/',
    gradient: 'from-orange-500 via-rose-500 to-pink-500',
  },
  {
    id: 'lofi',
    icon: Headphones,
    message: 'Turn your desk into the perfect focus space. Work app',
    name: 'Lofi Desk',
    url: 'https://lofi.shingoirie.com/en',
    gradient: 'from-fuchsia-500 via-purple-500 to-blue-500',
  },
];

export default function HomeEN() {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [promoIndex, setPromoIndex] = useState(0);

  // Switch promotion every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentPromo = promotions[promoIndex];
  const PromoIcon = currentPromo.icon;

  return (
    <div className="h-screen flex flex-col">
      {/* API Key Modal */}
      <ApiKeyModalEN />

      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <FileCode2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-base sm:text-xl font-bold font-sans">DocBuilder</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ExportButtonsEN />
            <SettingsPanelEN />
          </div>
        </div>
      </header>

      {/* Promotion Banner */}
      <div
        className={`bg-gradient-to-r ${currentPromo.gradient} text-white px-3 sm:px-6 py-2 transition-all duration-500`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <PromoIcon className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate">{currentPromo.message}</span>
            <a
              href={currentPromo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-2 py-0.5 rounded font-semibold shrink-0"
            >
              {currentPromo.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Indicator */}
            <div className="flex items-center gap-1">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromoIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === promoIndex ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Promotion ${idx + 1}`}
                />
              ))}
            </div>
            <a
              href="https://shingoirie.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <img
                src="/irie-shingo.jpg"
                alt="Shingo Irie"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30"
              />
              <span className="underline underline-offset-2">Shingo Irie</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      {/* Desktop: 2 Column Layout */}
      <main className="flex-1 hidden md:flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-1/2 border-r flex flex-col">
          <ChatContainerEN />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 flex flex-col">
          <SpecPreviewEN />
        </div>
      </main>

      {/* Mobile: Tab Layout */}
      <main className="flex-1 flex flex-col md:hidden overflow-hidden">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? <ChatContainerEN /> : <SpecPreviewEN />}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="border-t bg-background shrink-0">
          <div className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
                activeTab === 'chat'
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
                activeTab === 'preview'
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Preview</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
}

