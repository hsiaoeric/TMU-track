import React, { useState } from 'react';
import { LineSubscription, TMUDepartment, TMUAnnouncement } from '../types';
import { 
  Bell, 
  Plus, 
  X, 
  Building2, 
  AlertTriangle, 
  Send, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Props {
  subscription: LineSubscription;
  onUpdateSubscription: (sub: LineSubscription) => void;
  announcements: TMUAnnouncement[];
  onTriggerPushNotification: (announcement: TMUAnnouncement) => void;
}

const ALL_DEPARTMENTS: TMUDepartment[] = [
  '教務處',
  '學務處',
  '總務處',
  '研發處',
  '國際事務處',
  '資訊處',
  '醫學院',
  '圖書館',
];

const SUGGESTED_KEYWORDS = [
  '選課',
  '獎助學金',
  '停電工程',
  '國科會計畫',
  '海外交換',
  '實習見習',
  '畢業審查',
  '校園徵才',
  '雙主修',
];

export const SubscriptionManager: React.FC<Props> = ({
  subscription,
  onUpdateSubscription,
  announcements,
  onTriggerPushNotification,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleAddKeyword = (kwToAdd?: string) => {
    const kw = (kwToAdd || newKeyword).trim();
    if (!kw || subscription.keywords.includes(kw)) return;

    const updated = {
      ...subscription,
      keywords: [...subscription.keywords, kw],
    };
    onUpdateSubscription(updated);
    if (!kwToAdd) setNewKeyword('');
    triggerToast();
  };

  const handleRemoveKeyword = (kw: string) => {
    const updated = {
      ...subscription,
      keywords: subscription.keywords.filter((k) => k !== kw),
    };
    onUpdateSubscription(updated);
    triggerToast();
  };

  const handleToggleDepartment = (dept: TMUDepartment) => {
    const exists = subscription.departments.includes(dept);
    const updatedDepts = exists
      ? subscription.departments.filter((d) => d !== dept)
      : [...subscription.departments, dept];

    onUpdateSubscription({
      ...subscription,
      departments: updatedDepts,
    });
    triggerToast();
  };

  const handleToggleUrgentOnly = () => {
    onUpdateSubscription({
      ...subscription,
      notifyUrgentOnly: !subscription.notifyUrgentOnly,
    });
    triggerToast();
  };

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg sm:text-xl font-bold">LINE 關鍵字與處室推播訂閱</h2>
          </div>
          <p className="text-xs text-teal-100 mt-1">
            設定您關注的北醫重要主題，每當官方公佈欄有新公告符合條件，LINE 機器人將自動推送 Flex 卡片通知。
          </p>
        </div>

        {showSavedToast && (
          <div className="bg-white/20 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-300" />
            <span>設定已儲存</span>
          </div>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Keywords Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>追蹤關鍵字清單 ({subscription.keywords.length})</span>
            </h3>
          </div>

          {/* Add Keyword Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="輸入關鍵字，如：獎學金、選課..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              onClick={() => handleAddKeyword()}
              className="bg-teal-700 hover:bg-teal-800 text-white p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增</span>
            </button>
          </div>

          {/* Current Keywords Tags */}
          <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            {subscription.keywords.length === 0 ? (
              <span className="text-xs text-slate-400">目前尚未設定關鍵字，可從下方快速添加。</span>
            ) : (
              subscription.keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800 shadow-2xs"
                >
                  <span>{kw}</span>
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-red-600 dark:hover:text-red-400 p-0.5"
                    aria-label={`移除關鍵字 ${kw}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Suggested Keywords */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-2">熱門推薦關鍵字：</span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_KEYWORDS.map((sug) => {
                const isSelected = subscription.keywords.includes(sug);
                return (
                  <button
                    key={sug}
                    onClick={() => !isSelected && handleAddKeyword(sug)}
                    disabled={isSelected}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                    }`}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Departments & Urgency Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>監控單位與處室過濾</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL_DEPARTMENTS.map((dept) => {
              const isChecked = subscription.departments.includes(dept);
              return (
                <button
                  key={dept}
                  onClick={() => handleToggleDepartment(dept)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{dept}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {/* Urgent Switch */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>僅接收緊急/重要通知</span>
              </span>
              <p className="text-[11px] text-slate-500">
                開啟後，將自動過濾掉例行一般公告，只推播停電、最後截止日等重要訊息。
              </p>
            </div>
            <button
              onClick={handleToggleUrgentOnly}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                subscription.notifyUrgentOnly ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  subscription.notifyUrgentOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Test Push Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              推播模擬測試 (發送範例公告至 LINE 對話框)
            </h3>
          </div>
          <span className="text-xs text-slate-400">點選下方公告測試推播</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {announcements.slice(0, 4).map((ann) => (
            <div
              key={ann.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {ann.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {ann.department} · {ann.date}
                </span>
              </div>
              <button
                onClick={() => onTriggerPushNotification(ann)}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>發送測試</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
