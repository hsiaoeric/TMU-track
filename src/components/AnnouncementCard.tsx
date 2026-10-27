import React from 'react';
import { TMUAnnouncement } from '../types';
import { 
  Building2, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  HardDrive, 
  Send, 
  FileText, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface Props {
  announcement: TMUAnnouncement;
  onSelect: (announcement: TMUAnnouncement) => void;
  onArchiveToDrive: (announcement: TMUAnnouncement) => void;
  onPushToLine: (announcement: TMUAnnouncement) => void;
  onSummarize: (announcement: TMUAnnouncement) => void;
  isDriveConnected: boolean;
}

export const AnnouncementCard: React.FC<Props> = ({
  announcement,
  onSelect,
  onArchiveToDrive,
  onPushToLine,
  onSummarize,
  isDriveConnected,
}) => {
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case '教務處':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case '學務處':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case '總務處':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case '研發處':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case '國際事務處':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case '資訊處':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case '醫學院':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700/60 transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getDeptColor(announcement.department)}`}>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {announcement.department}
              </span>
            </span>

            <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
              {announcement.category}
            </span>

            {announcement.urgency === 'high' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full animate-pulse">
                <AlertCircle className="w-3 h-3" />
                緊急
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
            <Calendar className="w-3 h-3" />
            <span>{announcement.date}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(announcement)}
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 cursor-pointer transition-colors leading-snug line-clamp-2"
        >
          {announcement.title}
        </h3>

        {/* Snippet or Summary */}
        <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {announcement.summary && announcement.summary.length > 0 ? (
            <p className="text-teal-800 dark:text-teal-300 font-medium">
              💡 {announcement.summary[0]}
            </p>
          ) : (
            <p>{announcement.content}</p>
          )}
        </div>

        {/* Metadata stats */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
          {announcement.attachments && announcement.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              {announcement.attachments.length} 個附件
            </span>
          )}
          {announcement.isArchivedToDrive && (
            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              已存 Google Drive
            </span>
          )}
          {announcement.pushedToLineCount && announcement.pushedToLineCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              LINE 推播中
            </span>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSummarize(announcement)}
            className="p-1.5 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-md transition-colors"
            title="查看 AI 智能摘要"
            aria-label="查看 AI 智能摘要"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => onArchiveToDrive(announcement)}
            className={`p-1.5 rounded-md transition-colors ${
              announcement.isArchivedToDrive
                ? 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isDriveConnected ? '存檔至 Google Drive' : '請先在上方登入 Google Drive'}
            aria-label="存檔至 Google Drive"
          >
            <HardDrive className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPushToLine(announcement)}
            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md transition-colors"
            title="發送至 LINE 機器人對話框"
            aria-label="發送至 LINE 機器人對話框"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onSelect(announcement)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 cursor-pointer"
        >
          <span>查看詳情</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
