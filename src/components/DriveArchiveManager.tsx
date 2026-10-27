import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { TMUAnnouncement, GoogleDriveFile } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';
import { 
  HardDrive, 
  FolderPlus, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface Props {
  user: User | null;
  onLogin: () => void;
  announcements: TMUAnnouncement[];
  driveFiles: GoogleDriveFile[];
  onRefreshDriveFiles: () => Promise<void>;
  onArchiveAll: () => Promise<void>;
  onExportCatalog: () => Promise<void>;
  onDeleteDriveFile: (fileId: string) => Promise<void>;
  isArchivingAll: boolean;
  isExporting: boolean;
  isLoadingFiles: boolean;
}

export const DriveArchiveManager: React.FC<Props> = ({
  user,
  onLogin,
  announcements,
  driveFiles,
  onRefreshDriveFiles,
  onArchiveAll,
  onExportCatalog,
  onDeleteDriveFile,
  isArchivingAll,
  isExporting,
  isLoadingFiles,
}) => {
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);

  const unarchivedCount = announcements.filter((a) => !a.isArchivedToDrive).length;
  const archivedCount = announcements.filter((a) => a.isArchivedToDrive).length;

  const handleDeletePrompt = (file: GoogleDriveFile) => {
    setFileToDelete(file);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    const id = fileToDelete.id;
    setFileToDelete(null);
    await onDeleteDriveFile(id);
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/60 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-200 dark:border-sky-800">
          <HardDrive className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          尚未連線 Google 雲端硬碟
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          登入 Google 帳號後，北醫公告追蹤器將為您在 Google Drive 自動建立「北醫校園公告存檔 (TMU Announcements)」專屬資料夾，一鍵自動封存所有官方公文、重要選課日程及獎學金申請手冊。
        </p>
        <button
          onClick={onLogin}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>立即登入 Google 啟用雲端備份</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Drive Status */}
      <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/10 backdrop-blur-xs rounded-xl">
                <HardDrive className="w-5 h-5 text-sky-300" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold">Google Drive 雲端公告備份專區</h2>
            </div>
            <p className="text-xs text-sky-200/80">
              已連線帳號：{user.displayName || user.email} · 目標資料夾：北醫校園公告存檔 (TMU Announcements)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCatalog}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="將所有公告匯出成一份 Markdown 完整彙整目錄存進 Drive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '匯出中...' : '匯出公告彙整目錄'}</span>
            </button>

            <button
              onClick={onArchiveAll}
              disabled={isArchivingAll || unarchivedCount === 0}
              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="一鍵備份所有尚未存檔的北醫公告"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isArchivingAll ? '備份中...' : `一鍵備份最新公告 (${unarchivedCount})`}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-sky-200 block">目前追蹤總公告</span>
            <span className="text-lg font-bold">{announcements.length} 則</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-sky-200 block">已備份至雲端</span>
            <span className="text-lg font-bold text-emerald-300">{archivedCount} 篇</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-sky-200 block">待備份篇數</span>
            <span className="text-lg font-bold text-amber-300">{unarchivedCount} 篇</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-sky-200 block">Drive 存檔檔案數</span>
            <span className="text-lg font-bold">{driveFiles.length} 個</span>
          </div>
        </div>
      </div>

      {/* Files List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Google Drive 存檔文件清單
            </h3>
            <span className="text-xs text-slate-400 font-normal">
              (共 {driveFiles.length} 個檔案)
            </span>
          </div>

          <button
            onClick={onRefreshDriveFiles}
            disabled={isLoadingFiles}
            className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>

        {driveFiles.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FolderPlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              目前尚未備份任何公告至 Google Drive
            </p>
            <p className="text-xs text-slate-500">
              您可以點擊上方的「一鍵備份最新公告」或在公告清單中按「存檔至 Google Drive」。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">檔案名稱</th>
                  <th className="py-3 px-4 font-semibold hidden sm:table-cell">大小</th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">備份時間</th>
                  <th className="py-3 px-4 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {driveFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="truncate max-w-[280px] sm:max-w-md">{file.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell font-mono">
                      {file.size || '3.8 KB'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                      {file.createdTime ? new Date(file.createdTime).toLocaleString('zh-TW') : '剛剛'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                        >
                          <span>開啟</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeletePrompt(file)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                        title="從 Google Drive 刪除此備份"
                        aria-label={`刪除檔案 ${file.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog before Deletion */}
      <ConfirmationDialog
        isOpen={fileToDelete !== null}
        title="確認從 Google 雲端硬碟刪除備份？"
        message={`您確定要刪除「${fileToDelete?.name}」嗎？此操作將會永久移除該備份檔案。`}
        confirmLabel="確認刪除"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setFileToDelete(null)}
      />
    </div>
  );
};
