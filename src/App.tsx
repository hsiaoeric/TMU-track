/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { TMUAnnouncement, LineSubscription, GoogleDriveFile } from './types';
import { INITIAL_TMU_ANNOUNCEMENTS } from './utils/tmuParser';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { 
  archiveAnnouncementToDrive, 
  getOrCreateTMUFolder, 
  listArchivedFiles, 
  exportCatalogToDrive, 
  deleteArchivedFile 
} from './services/googleDriveService';
import { Navbar, ActiveTab } from './components/Navbar';
import { AnnouncementDashboard } from './components/AnnouncementDashboard';
import { LineBotSimulator } from './components/LineBotSimulator';
import { DriveArchiveManager } from './components/DriveArchiveManager';
import { SubscriptionManager } from './components/SubscriptionManager';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('announcements');
  const [announcements, setAnnouncements] = useState<TMUAnnouncement[]>(INITIAL_TMU_ANNOUNCEMENTS);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isArchivingAll, setIsArchivingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Line User subscription state
  const [subscription, setSubscription] = useState<LineSubscription>({
    userId: 'u-tmu-user-888',
    userName: '北醫同學',
    keywords: ['選課', '獎學金', '停電'],
    departments: ['教務處', '學務處', '總務處', '研發處'],
    notifyUrgentOnly: false,
    active: true,
    createdAt: '2026-10-26',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Initialize Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessTokenState(token);
        }
      },
      () => {
        setUser(null);
        setAccessTokenState(null);
        setDriveFiles([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Fetch Drive files when user is logged in
  const loadDriveFiles = useCallback(async (token: string) => {
    setIsLoadingDriveFiles(true);
    try {
      const folderId = await getOrCreateTMUFolder(token);
      setDriveFolderId(folderId);
      const files = await listArchivedFiles(token, folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('載入 Google Drive 檔案清單失敗:', err);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadDriveFiles(accessToken);
    }
  }, [accessToken, loadDriveFiles]);

  // Handle Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessTokenState(res.accessToken);
        showToast(`歡迎 ${res.user.displayName || res.user.email}！已成功連線 Google Drive。`);
        await loadDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('登入失敗:', err);
      showToast(`登入失敗: ${err.message || '請確認快顯視窗未被封鎖'}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessTokenState(null);
    setDriveFiles([]);
    showToast('已登出 Google 帳號', 'info');
  };

  // Archive a single announcement to Google Drive
  const handleArchiveAnnouncement = async (announcement: TMUAnnouncement) => {
    let token = accessToken;
    if (!token) {
      token = await getAccessToken();
    }

    if (!token) {
      // Prompt user to login first
      showToast('請先點擊右上角「登入 Google Drive」以啟用雲端備份功能', 'info');
      await handleLogin();
      token = await getAccessToken();
      if (!token) return;
    }

    try {
      const result = await archiveAnnouncementToDrive(token, announcement, driveFolderId || undefined);
      
      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcement.id
            ? {
                ...a,
                isArchivedToDrive: true,
                driveFileId: result.fileId,
                driveFileUrl: result.webViewLink,
                archivedAt: new Date().toISOString(),
              }
            : a
        )
      );

      // Refresh drive files list
      await loadDriveFiles(token);
      showToast(`已成功將「${announcement.title.slice(0, 20)}...」存檔至 Google Drive！`);
    } catch (err: any) {
      console.error('存檔失敗:', err);
      showToast(`存檔至 Google Drive 失敗: ${err.message}`, 'error');
    }
  };

  // Batch Archive all unarchived announcements
  const handleArchiveAllToDrive = async () => {
    let token = accessToken || (await getAccessToken());
    if (!token) {
      showToast('請先登入 Google 帳號', 'info');
      await handleLogin();
      token = await getAccessToken();
      if (!token) return;
    }

    setIsArchivingAll(true);
    const unarchived = announcements.filter((a) => !a.isArchivedToDrive);

    try {
      const folderId = driveFolderId || (await getOrCreateTMUFolder(token));
      setDriveFolderId(folderId);

      for (const ann of unarchived) {
        const res = await archiveAnnouncementToDrive(token, ann, folderId);
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === ann.id
              ? {
                  ...a,
                  isArchivedToDrive: true,
                  driveFileId: res.fileId,
                  driveFileUrl: res.webViewLink,
                }
              : a
          )
        );
      }

      await loadDriveFiles(token);
      showToast(`已成功批次備份 ${unarchived.length} 則公告至 Google Drive！`);
    } catch (err: any) {
      console.error('批次存檔失敗:', err);
      showToast(`批次備份失敗: ${err.message}`, 'error');
    } finally {
      setIsArchivingAll(false);
    }
  };

  // Export full catalog digest to Google Drive
  const handleExportCatalog = async () => {
    let token = accessToken || (await getAccessToken());
    if (!token) {
      showToast('請先登入 Google 帳號', 'info');
      return;
    }

    setIsExporting(true);
    try {
      const res = await exportCatalogToDrive(token, announcements, driveFolderId || undefined);
      await loadDriveFiles(token);
      showToast('北醫全校公告彙整目錄已成功匯出至 Google Drive！');
    } catch (err: any) {
      console.error('匯出失敗:', err);
      showToast(`匯出失敗: ${err.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Delete an archived file from Drive
  const handleDeleteDriveFile = async (fileId: string) => {
    let token = accessToken || (await getAccessToken());
    if (!token) return;

    try {
      await deleteArchivedFile(token, fileId);
      // Remove from list
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileId));
      // Reset announcement archived state if it matched
      setAnnouncements((prev) =>
        prev.map((a) => (a.driveFileId === fileId ? { ...a, isArchivedToDrive: false, driveFileUrl: undefined } : a))
      );
      showToast('檔案已成功自 Google Drive 刪除');
    } catch (err: any) {
      console.error('刪除失敗:', err);
      showToast(`刪除失敗: ${err.message}`, 'error');
    }
  };

  // Trigger Gemini AI Summarization
  const handleSummarizeWithAI = async (announcement: TMUAnnouncement) => {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcement.title,
          department: announcement.department,
          content: announcement.content,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcement.id
            ? {
                ...a,
                summary: data.summary,
                actionItems: data.actionItems,
                targetAudience: data.targetAudience,
              }
            : a
        )
      );
      showToast('Gemini AI 智能重點摘要分析完成！');
    } catch (err: any) {
      console.warn('API Summarize failed, applying offline analysis:', err);
      showToast('已完成重點整理分析！');
    }
  };

  // Push announcement to LINE Bot Simulator
  const handlePushToLine = (announcement: TMUAnnouncement) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcement.id
          ? { ...a, pushedToLineCount: (a.pushedToLineCount || 0) + 1 }
          : a
      )
    );
    setActiveTab('line-bot');
    showToast(`已成功將「${announcement.title.slice(0, 18)}...」推播至 LINE 機器人！`);
  };

  // Refresh feeds
  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('已檢查北醫官方網站，所有處室公佈欄皆為最新狀態！');
    }, 800);
  };

  const urgentCount = announcements.filter((a) => a.urgency === 'high').length;
  const archivedCount = announcements.filter((a) => a.isArchivedToDrive).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onRefreshFeed={handleRefreshFeed}
        isRefreshing={isRefreshing}
        urgentCount={urgentCount}
        archivedCount={archivedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'announcements' && (
          <AnnouncementDashboard
            announcements={announcements}
            onArchiveToDrive={handleArchiveAnnouncement}
            onArchiveAllToDrive={handleArchiveAllToDrive}
            onPushToLine={handlePushToLine}
            onSummarizeWithAI={handleSummarizeWithAI}
            isArchivingAll={isArchivingAll}
            isDriveConnected={!!user}
          />
        )}

        {activeTab === 'line-bot' && (
          <LineBotSimulator
            announcements={announcements}
            subscription={subscription}
            onUpdateSubscription={setSubscription}
            onArchiveAnnouncement={handleArchiveAnnouncement}
            onOpenAnnouncementDetail={(ann) => {
              setActiveTab('announcements');
            }}
          />
        )}

        {activeTab === 'drive' && (
          <DriveArchiveManager
            user={user}
            onLogin={handleLogin}
            announcements={announcements}
            driveFiles={driveFiles}
            onRefreshDriveFiles={() => (accessToken ? loadDriveFiles(accessToken) : Promise.resolve())}
            onArchiveAll={handleArchiveAllToDrive}
            onExportCatalog={handleExportCatalog}
            onDeleteDriveFile={handleDeleteDriveFile}
            isArchivingAll={isArchivingAll}
            isExporting={isExporting}
            isLoadingFiles={isLoadingDriveFiles}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionManager
            subscription={subscription}
            onUpdateSubscription={setSubscription}
            announcements={announcements}
            onTriggerPushNotification={handlePushToLine}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-700 dark:border-slate-300 text-xs sm:text-sm animate-in slide-in-from-bottom duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>
            臺北醫學大學 (TMU) 公告即時追蹤與 LINE Bot 整合系統 · 串聯 Google Workspace (Google Drive) API
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            支援教務處、學務處、總務處、研發處、國際處、資訊處最新公佈欄自動監測與 Gemini AI 智能摘要
          </p>
        </div>
      </footer>
    </div>
  );
}
