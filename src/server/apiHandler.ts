import { GoogleGenAI } from '@google/genai';
import { TMUAnnouncement } from '../types';
import { handleLineUserCommand } from '../utils/lineBotLogic';
import { INITIAL_TMU_ANNOUNCEMENTS } from '../utils/tmuParser';

const ai = new GoogleGenAI();

export async function summarizeWithGemini(announcement: {
  title: string;
  department: string;
  content: string;
}): Promise<{ summary: string[]; actionItems: string[]; targetAudience: string[] }> {
  try {
    const prompt = `你是臺北醫學大學 (TMU) 專業校園秘書與學生公佈欄專員。請針對以下北醫官方公告進行繁體中文分析：
公告標題：${announcement.title}
發布單位：${announcement.department}
公告內容：
${announcement.content}

請以 JSON 格式回應，包含以下欄位：
1. "summary": 字串陣列，列出 3 點清晰精煉的重點摘要（每點 35 字以內）
2. "actionItems": 字串陣列，列出 2-4 點具體待辦或注意事項（例如截止日期、需繳交文件、系統登入）
3. "targetAudience": 字串陣列，列出此公告主要影響的對象族群（例如：大學部學生、醫學系、研究生、教職員）

請務必只輸出純 JSON，不要加額外 markdown 引號或前言。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      summary: Array.isArray(parsed.summary) ? parsed.summary : ['重點彙整中...'],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ['請詳閱官方公告內容'],
      targetAudience: Array.isArray(parsed.targetAudience) ? parsed.targetAudience : ['全校師生'],
    };
  } catch (error) {
    console.warn('Gemini API fallback to heuristic summary:', error);
    // Return high quality heuristic fallback
    return {
      summary: [
        `${announcement.department}公告：${announcement.title.slice(0, 30)}...`,
        '請注意公告內載明之辦理期程與各系所配合事項',
        '如有任何疑問可依文末分機洽承辦處室',
      ],
      actionItems: [
        '確認相關申請或作業截止時程',
        '檢查需備妥之佐證文件或線上表單填寫',
        '有問題請洽校內各承辦單位',
      ],
      targetAudience: ['全校教職員工生'],
    };
  }
}

import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.resolve(process.cwd(), '.line-bot-config.json');

function loadStoredToken(): string {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return data.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    }
  } catch (e) {
    // ignore
  }
  return process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
}

let storedChannelAccessToken = loadStoredToken();

export function setChannelAccessToken(token: string) {
  storedChannelAccessToken = token.trim();
  try {
    const existing = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) : {};
    existing.channelAccessToken = storedChannelAccessToken;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save .line-bot-config.json:', err);
  }
}

export function getChannelAccessToken(): string {
  return storedChannelAccessToken;
}

export async function testBotConnection(): Promise<any> {
  const token = storedChannelAccessToken.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { ok: false, error: '尚未設定 Channel Access Token' };
  }
  try {
    const res = await fetch('https://api.line.me/v2/bot/info', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Transforms internal LineChatMessage objects into official LINE Messaging API format
 */
export function convertToLineApiMessages(chatMessages: any[]): any[] {
  const lineMessages: any[] = [];

  for (const msg of chatMessages.slice(0, 5)) {
    if (msg.flexMessage) {
      const hero = msg.flexMessage.hero;
      const body = msg.flexMessage.body;
      const footer = msg.flexMessage.footer;

      lineMessages.push({
        type: 'flex',
        altText: `【北醫公告】${hero?.title || '最新快訊'}`,
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#0f766e',
            paddingAll: '15px',
            contents: [
              {
                type: 'text',
                text: `臺北醫學大學 · ${hero?.department || '校園公告'}`,
                color: '#ccfbf1',
                size: 'xs',
                weight: 'bold',
              },
              {
                type: 'text',
                text: hero?.title || '',
                color: '#ffffff',
                weight: 'bold',
                wrap: true,
                size: 'md',
                margin: 'sm',
              },
              {
                type: 'text',
                text: `發布日期：${hero?.date || ''} · ${body?.urgencyText || ''}`,
                color: '#99f6e4',
                size: 'xxs',
                margin: 'xs',
              },
            ],
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '15px',
            contents: [
              {
                type: 'text',
                text: body?.bullets?.[0] ? `💡 ${body.bullets[0]}` : (body?.content || ''),
                wrap: true,
                size: 'xs',
                color: '#334155',
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#0f766e',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: '🌐 開啟官方公告',
                  uri: footer?.primaryButton?.payload || 'https://www.tmu.edu.tw',
                },
              },
            ],
          },
        },
      });
    } else if (msg.text) {
      const lineMsg: any = {
        type: 'text',
        text: msg.text,
      };

      if (msg.quickReplies && msg.quickReplies.length > 0) {
        lineMsg.quickReply = {
          items: msg.quickReplies.slice(0, 10).map((qr: string) => ({
            type: 'action',
            action: {
              type: 'message',
              label: qr.slice(0, 20),
              text: qr,
            },
          })),
        };
      }

      lineMessages.push(lineMsg);
    }
  }

  return lineMessages;
}

/**
 * Dispatches a reply to the LINE Messaging API endpoint
 */
export async function sendLineReply(replyToken: string, messages: any[], accessToken = storedChannelAccessToken) {
  if (!accessToken || !replyToken || replyToken === 'test-token' || replyToken.startsWith('reply-')) {
    return { skipped: true, reason: 'No real token or simulated test replyToken' };
  }

  const cleanToken = accessToken.replace(/^Bearer\s+/i, '').trim();
  const payload = {
    replyToken,
    messages: convertToLineApiMessages(messages),
  };

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    console.error('Error replying to LINE Messaging API:', err);
    return { ok: false, error: err.message };
  }
}

export async function processLineWebhook(body: any, announcements = INITIAL_TMU_ANNOUNCEMENTS) {
  const events = body?.events || [];
  const results: any[] = [];

  for (const event of events) {
    if (event.type === 'message' && event.message?.type === 'text') {
      const userText = event.message.text;
      const defaultSub = {
        userId: event.source?.userId || 'u-demo-user',
        userName: '北醫 LINE 好友',
        keywords: ['選課', '獎學金'],
        departments: ['教務處' as const, '學務處' as const],
        notifyUrgentOnly: false,
        active: true,
        createdAt: new Date().toISOString(),
      };

      const outcome = handleLineUserCommand(userText, announcements, defaultSub);

      // Attempt to dispatch real reply to LINE API if replyToken exists
      let lineApiResult = null;
      if (event.replyToken) {
        lineApiResult = await sendLineReply(event.replyToken, outcome.replyMessages);
      }

      results.push({
        replyToken: event.replyToken,
        replyMessages: outcome.replyMessages,
        updatedSubscription: outcome.updatedSubscription,
        lineApiResult,
      });
    }
  }

  return {
    status: 'ok',
    processedCount: results.length,
    results,
  };
}
