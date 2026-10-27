import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  INITIAL_TMU_ANNOUNCEMENTS, 
  filterAnnouncements, 
  matchKeywords, 
  inferCategory, 
  detectUrgency 
} from './tmuParser';

test('INITIAL_TMU_ANNOUNCEMENTS contains comprehensive seed data across TMU departments', () => {
  assert.ok(INITIAL_TMU_ANNOUNCEMENTS.length >= 6);
  const departments = new Set(INITIAL_TMU_ANNOUNCEMENTS.map((a) => a.department));
  assert.ok(departments.has('教務處'));
  assert.ok(departments.has('學務處'));
  assert.ok(departments.has('總務處'));
  assert.ok(departments.has('研發處'));
});

test('filterAnnouncements filters correctly by department', () => {
  const result = filterAnnouncements(INITIAL_TMU_ANNOUNCEMENTS, { department: '教務處' });
  assert.ok(result.length > 0);
  assert.ok(result.every((a) => a.department === '教務處'));
});

test('filterAnnouncements filters correctly by category', () => {
  const result = filterAnnouncements(INITIAL_TMU_ANNOUNCEMENTS, { category: '獎助學金' });
  assert.ok(result.length > 0);
  assert.ok(result.every((a) => a.category === '獎助學金'));
});

test('filterAnnouncements filters correctly by urgency', () => {
  const urgent = filterAnnouncements(INITIAL_TMU_ANNOUNCEMENTS, { urgencyOnly: true });
  assert.ok(urgent.length > 0);
  assert.ok(urgent.every((a) => a.urgency === 'high'));
});

test('matchKeywords identifies matching subscribed keywords in announcements', () => {
  const item = INITIAL_TMU_ANNOUNCEMENTS.find((a) => a.id === 'tmu-2026-001')!;
  const matched = matchKeywords(item, ['選課', '獎學金', '出國']);
  assert.deepEqual(matched, ['選課']);
});

test('inferCategory accurately categorizes announcement texts', () => {
  assert.equal(inferCategory('114學年度網路選課時程', '選課初選加退選說明'), '選課/學籍');
  assert.equal(inferCategory('杏林優秀助學金公告', '清寒學生獎學金申請辦法'), '獎助學金');
  assert.equal(inferCategory('高壓電檢修工程', '綜合大樓停電通知'), '校園工程');
  assert.equal(inferCategory('國科會產學合作計畫', '生醫科技研發補助'), '研發補助');
});

test('detectUrgency flags emergency notices appropriately', () => {
  assert.equal(detectUrgency('校園高壓電檢修全棟停電通知', '緊急維護作業'), 'high');
  assert.equal(detectUrgency('國際交流甄選簡章', '報名開跑'), 'medium');
  assert.equal(detectUrgency('圖書館期刊推廣', '歡迎自由參加'), 'normal');
});
