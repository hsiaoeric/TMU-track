import React, { useState } from 'react';
import { TMUAnnouncement } from '../types';
import { 
  X, 
  ExternalLink, 
  HardDrive, 
  Sparkles, 
  Send, 
  FileText, 
  Calendar, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  ListChecks,
  Users
} from 'lucide-react';

interface Props {
  announcement: TMUAnnouncement | null;
  onClose: () => void;
  onArchiveToDrive: (announcement: TMUAnnouncement) => Promise<void>;
  onPushToLine: (announcement: TMUAnnouncement) => void;
  onSummarizeWithAI: (announcement: TMUAnnouncement) => Promise<void>;
  isArchiving: boolean;
  isSummarizing: boolean;
  isDriveConnected: boolean;
}

export const AnnouncementModal: React.FC<Props> = ({
  announcement,
  onClose,
  onArchiveToDrive,
  onPushToLine,
  onSummarizeWithAI,
  isArchiving,
  isSummarizing,
  isDriveConnected,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!announcement) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(announcement.originalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                announcement.urgency === 'high' 
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  : announcement.urgency === 'medium'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  : 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
              }`}>
                {announcement.urgency === 'high' && <AlertCircle className="w-3.5 h-3.5" />}
                {announcement.urgency === 'high' ? '緊急重要' : announcement.urgency === 'medium' ? '截止注意' : '校園快訊'}
              </span>

              <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full">
                {announcement.category}
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                {announcement.department}
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {announcement.date}
              </span>
            </div>

            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {announcement.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="關閉公告詳細視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* AI Summary Box */}
          <div className="bg-gradient-to-br from-teal-50 to-sky-50 dark:from-teal-950/40 dark:to-sky-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Gemini AI 智能重點摘要</span>
              </div>
              <button
                onClick={() => onSummarizeWithAI(announcement)}
                disabled={isSummarizing}
                className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isSummarizing ? '分析中...' : '重新分析'}
              </button>
            </div>

            {announcement.summary && announcement.summary.length > 0 ? (
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {announcement.summary.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                點擊「重新分析」以由 Gemini 模型自動萃取 3 點重點精要及代辦事項。
              </p>
            )}

            {/* Action Items */}
            {announcement.actionItems && announcement.actionItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-teal-200/60 dark:border-teal-800/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 mb-2">
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>建議行動事項 (To-Do)</span>
                </div>
                <div className="grid gap-1.5">
                  {announcement.actionItems.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-teal-100 dark:border-teal-900/60">
                      <span className="w-4 h-4 rounded border border-teal-400 text-teal-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target Audience */}
            {announcement.targetAudience && announcement.targetAudience.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">適用對象：</span>
                {announcement.targetAudience.map((aud, i) => (
                  <span key={i} className="text-[11px] bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {aud}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Full Announcement Text */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              公告官方完整內文
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
              {announcement.content}
            </div>
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                檢附附件檔案 ({announcement.attachments.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {announcement.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{att.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">{att.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Drive Status Banner */}
          {announcement.isArchivedToDrive && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>此公告已成功備份至 Google 雲端硬碟「北醫校園公告存檔」資料夾</span>
              </div>
              {announcement.driveFileUrl && (
                <a
                  href={announcement.driveFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  前往查看 <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={announcement.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span>開啟北醫官網原文</span>
            </a>
            <button
              onClick={handleShare}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-2 cursor-pointer"
            >
              {copiedLink ? '已複製連結！' : '複製連結'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPushToLine(announcement)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              title="推播至 LINE 機器人模擬對話視窗"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>發送 LINE 推播</span>
            </button>

            <button
              onClick={() => onArchiveToDrive(announcement)}
              disabled={isArchiving || !isDriveConnected}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer ${
                announcement.isArchivedToDrive
                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300'
                  : 'bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-50'
              }`}
              title={isDriveConnected ? '備份存檔至 Google Drive' : '請先登入 Google 帳號以啟用雲端存檔'}
            >
              <HardDrive className={`w-3.5 h-3.5 ${isArchiving ? 'animate-bounce' : ''}`} />
              <span>
                {isArchiving
                  ? '存檔中...'
                  : announcement.isArchivedToDrive
                  ? '已存入 Google Drive'
                  : '存檔至 Google Drive'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
