'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Settings,
  MessageSquare,
  ExternalLink,
  Heart,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const desktopNavItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Daftar Tamu & Invite', href: '/admin/guests', icon: Users },
    { label: 'Scanner QR Kehadiran', href: '/admin/scan', icon: QrCode },
    { label: 'Pengaturan Undangan', href: '/admin/settings', icon: Settings },
    { label: 'Buku Tamu / Ucapan', href: '/admin/wishes', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#2b3951] text-white flex-shrink-0 shadow-xl">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#d7ac64]" />
            <span className="font-serif text-lg font-bold tracking-wider text-white">
              WEDDING ADMIN
            </span>
          </div>
          <p className="text-xs text-blue-300 font-medium tracking-wide">
            Tika &amp; Ridho Digital Invitation
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#d7ac64] text-[#2b3951] shadow-md font-bold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-[#d7ac64]" />
              <span>Lihat Undangan</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <p className="text-[10px] text-center text-slate-400 pt-2">
            Punakawan Digital System v2.0
          </p>
        </div>
      </aside>

      {/* Mobile Top Compact Header */}
      <header className="md:hidden bg-[#2b3951] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#d7ac64]/20 text-[#d7ac64] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-wider block text-white leading-tight">
              WEDDING ADMIN
            </span>
            <span className="text-[10px] text-blue-200/90 block leading-tight">
              Tika &amp; Ridho Digital System
            </span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20 text-xs text-[#d7ac64] font-semibold transition shadow-sm"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Lihat Undangan</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto pb-28 md:pb-8">
        {children}
      </main>

      {/* Native Mobile Bottom Navigation Bar (Low Bar) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#1e293b]/96 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_28px_rgba(0,0,0,0.35)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 items-end max-w-md mx-auto">
          {/* Tab 1: Overview */}
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              pathname === '/admin' ? 'text-[#d7ac64]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                pathname === '/admin' ? 'bg-[#d7ac64]/15 shadow-sm' : ''
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/admin' ? 'font-bold text-[#d7ac64]' : 'font-medium'
              }`}
            >
              Overview
            </span>
          </Link>

          {/* Tab 2: Tamu */}
          <Link
            href="/admin/guests"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              pathname === '/admin/guests' ? 'text-[#d7ac64]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                pathname === '/admin/guests' ? 'bg-[#d7ac64]/15 shadow-sm' : ''
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/admin/guests' ? 'font-bold text-[#d7ac64]' : 'font-medium'
              }`}
            >
              Tamu
            </span>
          </Link>

          {/* Tab 3: Center Elevated Scan Button */}
          <Link
            href="/admin/scan"
            className="flex flex-col items-center justify-center -top-3 relative group active:scale-95 transition-transform"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                pathname === '/admin/scan'
                  ? 'bg-gradient-to-tr from-[#d7ac64] to-[#f6dfa5] text-[#1e293b] border-white ring-4 ring-[#d7ac64]/30'
                  : 'bg-gradient-to-tr from-[#40506b] to-[#243147] text-[#d7ac64] border-white/20 hover:border-white/40'
              }`}
            >
              <QrCode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight ${
                pathname === '/admin/scan' ? 'text-[#d7ac64]' : 'text-slate-300'
              }`}
            >
              Scan QR
            </span>
          </Link>

          {/* Tab 4: Ucapan */}
          <Link
            href="/admin/wishes"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              pathname === '/admin/wishes' ? 'text-[#d7ac64]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                pathname === '/admin/wishes' ? 'bg-[#d7ac64]/15 shadow-sm' : ''
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/admin/wishes' ? 'font-bold text-[#d7ac64]' : 'font-medium'
              }`}
            >
              Ucapan
            </span>
          </Link>

          {/* Tab 5: Setting */}
          <Link
            href="/admin/settings"
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              pathname === '/admin/settings' ? 'text-[#d7ac64]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                pathname === '/admin/settings' ? 'bg-[#d7ac64]/15 shadow-sm' : ''
              }`}
            >
              <Settings className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/admin/settings' ? 'font-bold text-[#d7ac64]' : 'font-medium'
              }`}
            >
              Setting
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
