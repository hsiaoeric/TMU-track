import React, { useState, useRef, useEffect } from 'react';
import { TMUAnnouncement, LineChatMessage, LineSubscription } from '../types';
import { handleLineUserCommand } from '../utils/lineBotLogic';
import { 
  Send, 
  ExternalLink, 
  HardDrive, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  Info,
  Calendar,
  Award,
  AlertTriangle,
  BookmarkCheck
} from 'lucide-react';

interface Props {
  announcements: TMUAnnouncement[];
  subscription: LineSubscription;
  onUpdateSubscription: (sub: LineSubscription) => void;
  onArchiveAnnouncement: (announcement: TMUAnnouncement) => Promise<void>;
  onOpenAnnouncementDetail: (announcement: TMUAnnouncement) => void;
}

export const LineBotSimulator: React.FC<Props> = ({
  announcements,
  subscription,
  onUpdateSubscription,
  onArchiveAnnouncement,
  onOpenAnnouncementDetail,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'webhook'>('simulator');
  const [inputText, setInputText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  const [channelSecret, setChannelSecret] = useState('tmu_line_secret_9981');
  const [channelToken, setChannelToken] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenSavedSuccess, setTokenSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingToken, setIsTestingToken] = useState(false);

  // Fetch initial token status
  useEffect(() => {
    fetch('/api/line/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.tokenSnippet) {
          setChannelToken(data.tokenSnippet);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveToken = async () => {
    setIsSavingToken(true);
    try {
      const res = await fetch('/api/line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelAccessToken: channelToken }),
      });
      if (res.ok) {
        setTokenSavedSuccess(true);
        setTimeout(() => setTokenSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleTestTokenConnection = async () => {
    setIsTestingToken(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/line/test-connection');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ ok: false, error: err.message });
    } finally {
      setIsTestingToken(false);
    }
  };

  // Initial chat history with welcome message
  const [messages, setMessages] = useState<LineChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      timestamp: '09:00',
      text: `🏥 歡迎加入【北醫快訊通 TMU Alert Bot】！
我是您的校園公佈欄專屬小秘書。我可以為您即時追蹤臺北醫學大學教務處、學務處、總務處等各單位最新公告，並支援自動推播與 Google Drive 雲端備份！`,
      quickReplies: ['最新公告', '選課重要日程', '獎助學金申請', '我的訂閱', 'drive 備份'],
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: LineChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Process bot reply with a natural delay
    setTimeout(() => {
      const outcome = handleLineUserCommand(text, announcements, subscription);
      if (outcome.updatedSubscription) {
        onUpdateSubscription(outcome.updatedSubscription);
      }
      setMessages((prev) => [...prev, ...outcome.replyMessages]);
    }, 400);
  };

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/line/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestWebhook = async () => {
    setIsSendingWebhook(true);
    const webhookUrl = '/api/line/webhook';
    const testPayload = {
      destination: 'U_TMU_OFFICIAL_ACCOUNT',
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            id: `msg-${Date.now()}`,
            text: '最新公告',
          },
          timestamp: Date.now(),
          source: {
            type: 'user',
            userId: subscription.userId,
          },
          replyToken: `reply-${Math.random().toString(36).substring(7)}`,
          mode: 'active',
        },
      ],
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': 'simulated_hmac_sha256_sig',
        },
        body: JSON.stringify(testPayload),
      });

      const data = await res.json();
      setWebhookLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] HTTP ${res.status} OK - 成功接收 Webhook 事件，已觸發自動回覆`,
        `Payload: ${JSON.stringify(testPayload).slice(0, 80)}...`,
        ...prev.slice(0, 8),
      ]);
      handleSendMessage('最新公告');
    } catch (err: any) {
      setWebhookLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ❌ 請求失敗: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Left: Smartphone Simulator */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-[420px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-slate-900/10">
          {/* Phone Shell */}
          <div className="bg-[#8c9dae] dark:bg-slate-900 rounded-[2rem] overflow-hidden flex flex-col h-[620px] shadow-inner relative">
            {/* Phone Top Notch / Status Bar */}
            <div className="bg-[#243342] text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold">
              <span>09:41</span>
              <div className="w-20 h-4 bg-black/60 rounded-full mx-auto"></div>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span className="w-5 h-2.5 border border-white rounded-xs flex items-center p-0.5">
                  <span className="w-3 h-1.5 bg-emerald-400 rounded-2xs"></span>
                </span>
              </div>
            </div>

            {/* Chat Header */}
            <div className="bg-[#2b3c4e] text-white px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-sm shadow-xs border border-white/20">
                  北醫
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight">北醫快訊通 TMU</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-teal-200">LINE 官方認證帳號 · 12,840 位好友</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-slate-300">連線正常</span>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#788ca0] dark:bg-slate-950">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-1 text-[10px] text-white/80 ml-1 mb-1 font-medium">
                      <span>北醫快訊通</span>
                    </div>
                  )}

                  {/* Standard Text Bubble */}
                  {msg.text && (
                    <div className="flex items-end gap-1.5 max-w-[85%]">
                      {msg.sender === 'user' && (
                        <span className="text-[10px] text-white/70 font-mono self-end mb-1">{msg.timestamp}</span>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#5cd466] text-slate-900 rounded-br-xs font-medium'
                            : 'bg-white text-slate-900 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.sender === 'bot' && (
                        <span className="text-[10px] text-white/70 font-mono self-end mb-1">{msg.timestamp}</span>
                      )}
                    </div>
                  )}

                  {/* LINE Flex Message Card */}
                  {msg.flexMessage && (
                    <div className="max-w-[88%] mt-1">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/80">
                        {/* Flex Hero */}
                        <div className="bg-gradient-to-r from-teal-800 to-sky-900 p-3 text-white">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-semibold">
                              {msg.flexMessage.hero?.department}
                            </span>
                            <span className="text-teal-200">{msg.flexMessage.hero?.date}</span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">
                            {msg.flexMessage.hero?.title}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: msg.flexMessage.hero?.tagColor }}
                            >
                              {msg.flexMessage.body.urgencyText}
                            </span>
                            <span className="text-[10px] text-teal-200 font-medium">
                              類別：{msg.flexMessage.hero?.tag}
                            </span>
                          </div>
                        </div>

                        {/* Flex Body */}
                        <div className="p-3 text-xs text-slate-700 space-y-2 bg-slate-50">
                          {msg.flexMessage.body.bullets && msg.flexMessage.body.bullets.length > 0 && (
                            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200/60">
                              <span className="text-[11px] font-bold text-teal-800">💡 重點摘要：</span>
                              {msg.flexMessage.body.bullets.map((b, i) => (
                                <p key={i} className="text-[11px] text-slate-600 line-clamp-2">
                                  • {b}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="line-clamp-2 text-slate-500 text-[11px]">
                            {msg.flexMessage.body.content}
                          </p>
                        </div>

                        {/* Flex Footer Buttons */}
                        <div className="p-2.5 bg-white border-t border-slate-100 grid grid-cols-2 gap-2">
                          {msg.flexMessage.footer?.primaryButton && (
                            <a
                              href={msg.flexMessage.footer.primaryButton.payload}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold py-1.5 px-2 rounded-lg border border-teal-200 text-center transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>開啟官網</span>
                            </a>
                          )}

                          {msg.flexMessage.footer?.secondaryButton && (
                            <button
                              onClick={() => {
                                const targetAnnounce = announcements.find((a) => a.id === msg.flexMessage?.footer?.secondaryButton?.payload);
                                if (targetAnnounce) {
                                  onArchiveAnnouncement(targetAnnounce);
                                }
                              }}
                              className="flex items-center justify-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold py-1.5 px-2 rounded-lg border border-sky-200 text-center transition-colors cursor-pointer"
                            >
                              <HardDrive className="w-3 h-3" />
                              <span>{msg.flexMessage.footer.secondaryButton.label}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Replies */}
                  {msg.quickReplies && (
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1.5 scrollbar-none mt-1">
                      {msg.quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(qr)}
                          className="bg-white/90 hover:bg-white text-teal-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs shrink-0 border border-teal-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rich Menu Drawer */}
            <div className="bg-[#243342] border-t border-slate-700/80 p-2 text-white">
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-medium">
                <button
                  onClick={() => handleSendMessage('選課')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-teal-300" />
                  <span>選課日程</span>
                </button>
                <button
                  onClick={() => handleSendMessage('獎學金')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>獎學金申請</span>
                </button>
                <button
                  onClick={() => handleSendMessage('總務處')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                  <span>停電工程通報</span>
                </button>
                <button
                  onClick={() => handleSendMessage('我的訂閱')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-sky-300" />
                  <span>我的訂閱</span>
                </button>
                <button
                  onClick={() => handleSendMessage('drive 備份')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4 text-emerald-300" />
                  <span>雲端存檔狀態</span>
                </button>
                <button
                  onClick={() => handleSendMessage('說明')}
                  className="bg-slate-700/70 hover:bg-teal-700 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Info className="w-4 h-4 text-purple-300" />
                  <span>使用說明</span>
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="bg-[#1e2a36] p-2.5 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="輸入「最新公告」、「選課」或「訂閱 獎學金」..."
                className="flex-1 bg-slate-800 text-white placeholder-slate-400 text-xs px-3.5 py-2 rounded-full focus:outline-hidden focus:ring-1 focus:ring-teal-400 border border-slate-700"
              />
              <button
                onClick={() => handleSendMessage()}
                className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer"
                aria-label="發送訊息至 LINE 機器人"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Configuration & LINE Webhook Hub */}
      <div className="lg:col-span-5 space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            機器人功能速覽
          </button>
          <button
            onClick={() => setActiveSubTab('webhook')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'webhook'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            LINE Messaging API 串接
          </button>
        </div>

        {activeSubTab === 'simulator' ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>北醫快訊通 LINE 機器人亮點功能</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                模擬官方帳號實機體驗，點選左側 Rich Menu 即可即時互動。
              </p>

              <div className="mt-4 space-y-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/60">
                  <span className="font-bold text-xs text-teal-900 dark:text-teal-200 block mb-1">
                    1. 處室專屬公告過濾
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    輸入「教務處」、「學務處」、「研發處」，立刻調出專屬處室公佈欄。
                  </span>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800/60">
                  <span className="font-bold text-xs text-sky-900 dark:text-sky-200 block mb-1">
                    2. 關鍵字智慧訂閱與退訂
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    輸入「訂閱 獎學金」或「訂閱 選課」，每當有相符公告發布時精準推播。
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 block mb-1">
                    3. LINE 內一鍵 Google Drive 存檔
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    Flex 卡片下方附有存檔按鈕，點擊後自動將公告與 AI 摘要收納至 Google Drive。
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleSendMessage('最新公告')}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>立即在手機中發送「最新公告」查詢</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Webhook URL 設定</span>
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  伺服器 Webhook 端點 (貼至 LINE Developers Console)：
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/line/webhook`}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="複製 Webhook 網址"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? '已複製' : '複製'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>Channel Secret (簽名驗證金鑰)</span>
                  </label>
                  <input
                    type="password"
                    value={channelSecret}
                    onChange={(e) => setChannelSecret(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Key className="w-3 h-3 text-slate-400" />
                      <span>Channel Access Token (長期權杖)</span>
                    </label>
                    {tokenSavedSuccess && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> 已儲存
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="password"
                      value={channelToken}
                      onChange={(e) => setChannelToken(e.target.value)}
                      placeholder="貼上 LINE Developers 發行的長期權杖..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleSaveToken}
                      disabled={isSavingToken}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isSavingToken ? '儲存中' : '儲存'}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestTokenConnection}
                      disabled={isTestingToken}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isTestingToken ? '檢測中...' : '檢測權杖'}
                    </button>
                  </div>

                  {testResult && (
                    <div className={`mt-2 p-2.5 rounded-lg text-xs border ${testResult.ok ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'}`}>
                      {testResult.ok ? (
                        <div>
                          <p className="font-bold">✅ 成功連線至 LINE 官方機器人！</p>
                          <p className="mt-0.5">名稱：{testResult.data?.displayName} ({testResult.data?.basicId})</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">❌ LINE 權杖驗證失敗</p>
                          <p className="mt-0.5">{testResult.error || testResult.data?.message || '請確認權杖是否完整貼上'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTestWebhook}
                  disabled={isSendingWebhook}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWebhook ? '發送測試請求中...' : '發送模擬 LINE Webhook 測試請求'}</span>
                </button>
              </div>

              {/* Webhook Activity Logs */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  即時 Webhook 接收日誌：
                </span>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] h-32 overflow-y-auto space-y-1">
                  {webhookLogs.length === 0 ? (
                    <span className="text-slate-500">等待 Webhook 事件觸發...</span>
                  ) : (
                    webhookLogs.map((log, i) => (
                      <p key={i} className="text-emerald-400">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
