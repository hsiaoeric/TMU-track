import React from 'react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { MessageSquare, Bell, HardDrive, RefreshCw, Layers } from 'lucide-react';

export type ActiveTab = 'announcements' | 'line-bot' | 'drive' | 'subscriptions';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  urgentCount: number;
  archivedCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onRefreshFeed,
  isRefreshing,
  urgentCount,
  archivedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-sky-900 flex items-center justify-center text-white shadow-md shadow-teal-900/20">
              <span className="font-black text-lg tracking-tight">北醫</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  北醫公告 LINE Bot 追蹤器
                </h1>
                <span className="text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                  TMU Alert Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                臺北醫學大學全處室公告 · LINE 智慧推播 · Google Drive 自動備份
              </p>
            </div>
          </div>

          {/* Action & Auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              title="檢查北醫官方網站最新公告"
              aria-label="刷新公告"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span>{isRefreshing ? '更新中...' : '檢查新公告'}</span>
            </button>

            <GoogleSignInButton
              user={user}
              onLogin={onLogin}
              onLogout={onLogout}
              isLoading={isLoggingIn}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-100 dark:border-slate-800/80 -mb-px overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>公佈欄儀表板</span>
            {urgentCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {urgentCount} 緊急
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('line-bot')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'line-bot'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>LINE Bot 模擬器 & 串接</span>
            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full">
              Messaging API
            </span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'drive'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive 存檔</span>
            {archivedCount > 0 && (
              <span className="bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {archivedCount} 篇
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>關鍵字推播訂閱</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
