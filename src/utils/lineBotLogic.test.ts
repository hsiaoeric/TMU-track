import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLineUserCommand, formatTMUAnnouncementToFlex } from './lineBotLogic';
import { INITIAL_TMU_ANNOUNCEMENTS } from './tmuParser';
import { LineSubscription } from '../types';

const mockSubscription: LineSubscription = {
  userId: 'line-user-001',
  userName: '北醫同學',
  keywords: ['選課'],
  departments: ['教務處', '學務處'],
  notifyUrgentOnly: false,
  active: true,
  createdAt: '2026-10-26',
};

test('formatTMUAnnouncementToFlex generates valid Flex Message bubble structure', () => {
  const item = INITIAL_TMU_ANNOUNCEMENTS[0];
  const flex = formatTMUAnnouncementToFlex(item);
  assert.equal(flex.type, 'bubble');
  assert.equal(flex.hero?.title, item.title);
  assert.equal(flex.hero?.department, '教務處');
  assert.ok(flex.footer?.primaryButton?.label.includes('查看北醫官網'));
  assert.equal(flex.footer?.primaryButton?.actionType, 'url');
});

test('handleLineUserCommand handles help command', () => {
  const result = handleLineUserCommand('說明', INITIAL_TMU_ANNOUNCEMENTS, mockSubscription);
  assert.ok(result.replyMessages.length > 0);
  assert.ok(result.replyMessages[0].text?.includes('北醫快訊通'));
  assert.ok(result.replyMessages[0].quickReplies?.includes('最新公告'));
});

test('handleLineUserCommand handles latest announcements query', () => {
  const result = handleLineUserCommand('最新公告', INITIAL_TMU_ANNOUNCEMENTS, mockSubscription);
  assert.ok(result.replyMessages.length >= 2);
  assert.ok(result.replyMessages[0].text?.includes('最新'));
  assert.ok(result.replyMessages[1].flexMessage !== undefined);
});

test('handleLineUserCommand handles keyword subscription', () => {
  const result = handleLineUserCommand('訂閱 獎學金', INITIAL_TMU_ANNOUNCEMENTS, mockSubscription);
  assert.ok(result.updatedSubscription !== undefined);
  assert.ok(result.updatedSubscription?.keywords.includes('獎學金'));
  assert.ok(result.replyMessages[0].text?.includes('訂閱成功'));
});

test('handleLineUserCommand handles keyword unsubscribe', () => {
  const result = handleLineUserCommand('退訂 選課', INITIAL_TMU_ANNOUNCEMENTS, mockSubscription);
  assert.ok(result.updatedSubscription !== undefined);
  assert.ok(!result.updatedSubscription?.keywords.includes('選課'));
  assert.ok(result.replyMessages[0].text?.includes('已為您移除'));
});

test('handleLineUserCommand handles drive status check', () => {
  const result = handleLineUserCommand('drive 備份', INITIAL_TMU_ANNOUNCEMENTS, mockSubscription);
  assert.ok(result.replyMessages[0].text?.includes('Google Drive'));
  assert.ok(result.replyMessages[0].text?.includes('北醫校園公告存檔'));
});
