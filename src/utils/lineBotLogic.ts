import { TMUAnnouncement, LineChatMessage, LineFlexBubble, LineSubscription, TMUDepartment } from '../types';
import { filterAnnouncements, matchKeywords } from './tmuParser';

export interface ProcessMessageResult {
  replyMessages: LineChatMessage[];
  updatedSubscription?: LineSubscription;
  toastNotification?: string;
}

/**
 * Converts a TMU announcement into an authentic LINE Flex Message bubble object
 */
export function formatTMUAnnouncementToFlex(announcement: TMUAnnouncement): LineFlexBubble {
  const urgencyLabel = announcement.urgency === 'high' ? '🚨 緊急重要' : announcement.urgency === 'medium' ? '⚡ 截止注意' : '📌 校園快訊';
  const tagColor = announcement.urgency === 'high' ? '#e11d48' : announcement.urgency === 'medium' ? '#d97706' : '#0284c7';

  return {
    type: 'bubble',
    hero: {
      tag: announcement.category,
      tagColor,
      title: announcement.title,
      date: announcement.date,
      department: announcement.department,
    },
    body: {
      content: announcement.content.slice(0, 160) + (announcement.content.length > 160 ? '...' : ''),
      bullets: announcement.summary?.slice(0, 3),
      urgencyText: urgencyLabel,
    },
    footer: {
      primaryButton: {
        label: '🌐 查看北醫官網公告',
        actionType: 'url',
        payload: announcement.originalUrl,
      },
      secondaryButton: {
        label: announcement.isArchivedToDrive ? '✅ 已存至 Google Drive' : '📁 存檔至 Google Drive',
        actionType: 'drive',
        payload: announcement.id,
      },
    },
  };
}

/**
 * Handles incoming LINE user commands and produces appropriate bot replies
 */
export function handleLineUserCommand(
  rawInput: string,
  announcements: TMUAnnouncement[],
  currentSubscription: LineSubscription
): ProcessMessageResult {
  const input = rawInput.trim();
  const lower = input.toLowerCase();
  const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

  // 1. Help command
  if (lower === 'help' || lower === '/help' || input === '幫助' || input === '說明' || input === '指令') {
    const text = `🏥 歡迎使用【北醫快訊通 TMU Alert Bot】！
您可以直接點選下方功能選單，或輸入指令：
━━━━━━━━━━━━━━
🔹「最新公告」: 檢視最新公佈欄資訊
🔹「選課」/「獎學金」: 快速過濾主題
🔹「教務處」/「學務處」/「總務處」: 查閱處室公佈欄
🔹「訂閱 [關鍵字]」: 例如「訂閱 獎助學金」
🔹「我的訂閱」: 查看目前已訂閱關鍵字
🔹「退訂 [關鍵字]」: 移除特定訂閱
🔹「drive 備份」: 檢視 Google Drive 存檔進度
━━━━━━━━━━━━━━
即時掌握北醫大小事，重要日程不漏接！`;

    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text,
          quickReplies: ['最新公告', '選課重要日程', '獎助學金申請', '我的訂閱', 'drive 備份'],
        },
      ],
    };
  }

  // 2. Latest announcements
  if (input === '最新公告' || lower === 'latest' || lower === '/latest') {
    const latestItems = announcements.slice(0, 3);
    const replies: LineChatMessage[] = [
      {
        id: `bot-intro-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `📢 為您送達臺北醫學大學最新 ${latestItems.length} 則重要校園公告：`,
      },
      ...latestItems.map((item, idx) => ({
        id: `bot-card-${Date.now()}-${idx}`,
        sender: 'bot' as const,
        timestamp: now,
        flexMessage: formatTMUAnnouncementToFlex(item),
      })),
    ];

    return {
      replyMessages: replies,
    };
  }

  // 3. Department query
  const departments: TMUDepartment[] = ['教務處', '學務處', '總務處', '研發處', '國際事務處', '資訊處', '醫學院', '圖書館'];
  const matchedDept = departments.find((d) => input.includes(d) || input.includes(d.replace('事務', '')));
  if (matchedDept) {
    const deptItems = announcements.filter((a) => a.department === matchedDept);
    if (deptItems.length === 0) {
      return {
        replyMessages: [
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            timestamp: now,
            text: `目前【${matchedDept}】尚無新發布之即時公告，系統會持續監控官方網站！`,
            quickReplies: ['最新公告', '選課重要日程', '獎助學金申請'],
          },
        ],
      };
    }

    const replies: LineChatMessage[] = [
      {
        id: `bot-dept-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🏛️ 為您查詢【${matchedDept}】最新公告 (共 ${deptItems.length} 則)：`,
      },
      ...deptItems.slice(0, 2).map((item, idx) => ({
        id: `bot-card-${Date.now()}-${idx}`,
        sender: 'bot' as const,
        timestamp: now,
        flexMessage: formatTMUAnnouncementToFlex(item),
      })),
    ];

    return { replyMessages: replies };
  }

  // 4. Subscription management (must be before topic keywords)
  if (input.startsWith('訂閱') || lower.startsWith('subscribe')) {
    const keyword = input.replace(/^訂閱\s*/, '').replace(/^subscribe\s*/i, '').trim();
    if (!keyword) {
      return {
        replyMessages: [
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            timestamp: now,
            text: `⚠️ 請在「訂閱」後面加上想要追蹤的關鍵字，例如：\n「訂閱 獎學金」\n「訂閱 選課」\n「訂閱 停電」`,
            quickReplies: ['訂閱 獎學金', '訂閱 選課', '訂閱 國科會'],
          },
        ],
      };
    }

    if (currentSubscription.keywords.includes(keyword)) {
      return {
        replyMessages: [
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            timestamp: now,
            text: `ℹ️ 您已經訂閱過「${keyword}」關鍵字囉！每當北醫網站有新消息時，機器人會立即推播給您。`,
            quickReplies: ['我的訂閱', '最新公告'],
          },
        ],
      };
    }

    const updatedSubscription: LineSubscription = {
      ...currentSubscription,
      keywords: [...currentSubscription.keywords, keyword],
    };

    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `✅ 訂閱成功！已為您將「${keyword}」加入自動推播名單。\n目前您已追蹤：${updatedSubscription.keywords.join('、')}`,
          quickReplies: ['我的訂閱', '最新公告', '說明'],
        },
      ],
      updatedSubscription,
      toastNotification: `已成功訂閱關鍵字：「${keyword}」`,
    };
  }

  if (input === '我的訂閱' || input === '訂閱列表') {
    const kws = currentSubscription.keywords;
    const kwText = kws.length > 0 ? kws.map((k) => `• ${k}`).join('\n') : '目前尚未設定關鍵字訂閱';
    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `📋 【您的北醫公告追蹤清單】\n━━━━━━━━━━━━━━\n${kwText}\n\n若想新增關鍵字可輸入：「訂閱 [關鍵字]」\n若想取消訂閱可輸入：「退訂 [關鍵字]」`,
          quickReplies: ['最新公告', '訂閱 獎學金', '訂閱 選課'],
        },
      ],
    };
  }

  if (input.startsWith('退訂') || lower.startsWith('unsubscribe')) {
    const keyword = input.replace(/^退訂\s*/, '').replace(/^unsubscribe\s*/i, '').trim();
    if (!currentSubscription.keywords.includes(keyword)) {
      return {
        replyMessages: [
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            timestamp: now,
            text: `⚠️ 您的訂閱清單中沒有「${keyword}」。目前訂閱項目為：${currentSubscription.keywords.join('、') || '無'}`,
            quickReplies: ['我的訂閱', '最新公告'],
          },
        ],
      };
    }

    const updatedSubscription: LineSubscription = {
      ...currentSubscription,
      keywords: currentSubscription.keywords.filter((k) => k !== keyword),
    };

    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `🗑️ 已為您移除關鍵字「${keyword}」的推播通知。\n剩餘追蹤項目：${updatedSubscription.keywords.join('、') || '無'}`,
          quickReplies: ['我的訂閱', '最新公告'],
        },
      ],
      updatedSubscription,
      toastNotification: `已退訂關鍵字：「${keyword}」`,
    };
  }

  // 5. Topic keyword query (選課, 獎學金, 停電, 國科會)
  if (/選課|學分|課表/.test(input)) {
    const items = filterAnnouncements(announcements, { category: '選課/學籍' });
    return {
      replyMessages: [
        {
          id: `bot-topic-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `📚 為您找到【選課與學籍】相關公告：`,
        },
        ...items.slice(0, 2).map((item, idx) => ({
          id: `bot-topic-card-${Date.now()}-${idx}`,
          sender: 'bot' as const,
          timestamp: now,
          flexMessage: formatTMUAnnouncementToFlex(item),
        })),
      ],
    };
  }

  if (/獎學金|助學金|清寒/.test(input)) {
    const items = filterAnnouncements(announcements, { category: '獎助學金' });
    return {
      replyMessages: [
        {
          id: `bot-scholarship-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `💰 為您找到【獎助學金】相關公告：`,
        },
        ...items.slice(0, 2).map((item, idx) => ({
          id: `bot-scholarship-card-${Date.now()}-${idx}`,
          sender: 'bot' as const,
          timestamp: now,
          flexMessage: formatTMUAnnouncementToFlex(item),
        })),
      ],
    };
  }

  // 6. Google Drive status
  if (/drive|雲端|備份|硬碟/.test(lower)) {
    const archivedCount = announcements.filter((a) => a.isArchivedToDrive).length;
    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `☁️ 【Google Drive 雲端存檔狀態】\n━━━━━━━━━━━━━━\n📁 目標資料夾：北醫校園公告存檔 (TMU Announcements)\n📄 已備份公告：${archivedCount} 篇\n\n您可以在網頁儀表板一鍵將任何北醫公告及附件備份至您的 Google 雲端硬碟！`,
          quickReplies: ['最新公告', '幫助'],
        },
      ],
    };
  }

  // 7. General search fallback
  const matching = announcements.filter(
    (a) => a.title.includes(input) || a.content.includes(input)
  );

  if (matching.length > 0) {
    return {
      replyMessages: [
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `🔍 依「${input}」為您搜尋到 ${matching.length} 則北醫公告：`,
        },
        ...matching.slice(0, 2).map((item, idx) => ({
          id: `bot-search-card-${Date.now()}-${idx}`,
          sender: 'bot' as const,
          timestamp: now,
          flexMessage: formatTMUAnnouncementToFlex(item),
        })),
      ],
    };
  }

  // Default fallback
  return {
    replyMessages: [
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🤖 收到您的訊息：「${input}」。\n您可以點擊下方選單快速查詢最新公告、處室公佈欄或設定訂閱通知。`,
        quickReplies: ['最新公告', '選課重要日程', '獎助學金申請', '我的訂閱', '說明'],
      },
    ],
  };
}
