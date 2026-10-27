import React, { useState, useMemo } from 'react';
import { TMUAnnouncement, TMUDepartment, TMUCategory } from '../types';
import { filterAnnouncements } from '../utils/tmuParser';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementModal } from './AnnouncementModal';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  Building2, 
  FolderPlus, 
  Sparkles,
  Download,
  Check
} from 'lucide-react';

interface Props {
  announcements: TMUAnnouncement[];
  onArchiveToDrive: (announcement: TMUAnnouncement) => Promise<void>;
  onArchiveAllToDrive: () => Promise<void>;
  onPushToLine: (announcement: TMUAnnouncement) => void;
  onSummarizeWithAI: (announcement: TMUAnnouncement) => Promise<void>;
  isArchivingAll: boolean;
  isDriveConnected: boolean;
}

const DEPARTMENTS: (TMUDepartment | '全部')[] = [
  '全部',
  '教務處',
  '學務處',
  '總務處',
  '研發處',
  '國際事務處',
  '資訊處',
  '醫學院',
  '圖書館',
];

const CATEGORIES: (TMUCategory | '全部')[] = [
  '全部',
  '選課/學籍',
  '獎助學金',
  '校園工程',
  '研發補助',
  '國際交流',
  '緊急通報',
  '講座活動',
];

export const AnnouncementDashboard: React.FC<Props> = ({
  announcements,
  onArchiveToDrive,
  onArchiveAllToDrive,
  onPushToLine,
  onSummarizeWithAI,
  isArchivingAll,
  isDriveConnected,
}) => {
  const [selectedDept, setSelectedDept] = useState<TMUDepartment | '全部'>('全部');
  const [selectedCat, setSelectedCat] = useState<TMUCategory | '全部'>('全部');
  const [keyword, setKeyword] = useState('');
  const [urgencyOnly, setUrgencyOnly] = useState(false);
  const [activeModalAnnouncement, setActiveModalAnnouncement] = useState<TMUAnnouncement | null>(null);
  const [isSummarizingModal, setIsSummarizingModal] = useState(false);
  const [isArchivingModal, setIsArchivingModal] = useState(false);

  // Filtered list
  const filteredList = useMemo(() => {
    return filterAnnouncements(announcements, {
      department: selectedDept,
      category: selectedCat,
      keyword,
      urgencyOnly,
    });
  }, [announcements, selectedDept, selectedCat, keyword, urgencyOnly]);

  const urgentCount = announcements.filter((a) => a.urgency === 'high').length;
  const unarchivedCount = announcements.filter((a) => !a.isArchivedToDrive).length;

  const handleModalSummarize = async (ann: TMUAnnouncement) => {
    setIsSummarizingModal(true);
    try {
      await onSummarizeWithAI(ann);
      // Update local modal view if it matches
      const updated = announcements.find((a) => a.id === ann.id);
      if (updated) setActiveModalAnnouncement(updated);
    } finally {
      setIsSummarizingModal(false);
    }
  };

  const handleModalArchive = async (ann: TMUAnnouncement) => {
    setIsArchivingModal(true);
    try {
      await onArchiveToDrive(ann);
      const updated = announcements.find((a) => a.id === ann.id);
      if (updated) setActiveModalAnnouncement(updated);
    } finally {
      setIsArchivingModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋北醫公告關鍵字（例如：選課、獎學金、停電、國科會）..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>

          {/* Quick Filters & Batch Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setUrgencyOnly(!urgencyOnly)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                urgencyOnly
                  ? 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className={`w-3.5 h-3.5 ${urgencyOnly ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>僅看緊急重要 ({urgentCount})</span>
            </button>

            <button
              onClick={onArchiveAllToDrive}
              disabled={isArchivingAll || !isDriveConnected || unarchivedCount === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              title={isDriveConnected ? '批次將未存檔之公告備份至 Google Drive' : '請先在右上角登入 Google Drive'}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isArchivingAll ? '備份中...' : `批次存至 Drive (${unarchivedCount})`}</span>
            </button>
          </div>
        </div>

        {/* Department Filters Pills */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">處室：</span>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">分類：</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          顯示 <strong className="text-slate-900 dark:text-white font-bold">{filteredList.length}</strong> 則北醫公告
          {selectedDept !== '全部' && ` · 篩選：${selectedDept}`}
          {selectedCat !== '全部' && ` · 類別：${selectedCat}`}
          {keyword && ` · 關鍵字：「${keyword}」`}
        </span>
        <span className="text-[11px]">資料來源：臺北醫學大學全球資訊網官方公告</span>
      </div>

      {/* Announcement Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            查無符合條件的公告
          </h4>
          <p className="text-xs text-slate-400">
            請嘗試變更搜尋關鍵字或清除篩選條件。
          </p>
          <button
            onClick={() => {
              setSelectedDept('全部');
              setSelectedCat('全部');
              setKeyword('');
              setUrgencyOnly(false);
            }}
            className="text-xs text-teal-600 font-semibold hover:underline"
          >
            重設所有篩選
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              onSelect={(item) => setActiveModalAnnouncement(item)}
              onArchiveToDrive={onArchiveToDrive}
              onPushToLine={onPushToLine}
              onSummarize={onSummarizeWithAI}
              isDriveConnected={isDriveConnected}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnnouncementModal
        announcement={activeModalAnnouncement}
        onClose={() => setActiveModalAnnouncement(null)}
        onArchiveToDrive={handleModalArchive}
        onPushToLine={onPushToLine}
        onSummarizeWithAI={handleModalSummarize}
        isArchiving={isArchivingModal}
        isSummarizing={isSummarizingModal}
        isDriveConnected={isDriveConnected}
      />
    </div>
  );
};
