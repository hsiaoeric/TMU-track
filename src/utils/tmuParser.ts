import { TMUAnnouncement, TMUDepartment, TMUCategory } from '../types';

export const INITIAL_TMU_ANNOUNCEMENTS: TMUAnnouncement[] = [
  {
    id: 'tmu-2026-001',
    title: '【教務處公告】114學年度第2學期各學制學生「初選及網路選課」日程與注意事項',
    department: '教務處',
    category: '選課/學籍',
    date: '2026-10-26',
    urgency: 'high',
    originalUrl: 'https://aca.tmu.edu.tw/front/news/news.php?ID=tmu_aca&Sn=1842',
    content: `一、114學年度第2學期網路選課初選自2026年11月02日（一）上午09:00起至11月09日（一）下午17:00止。\n二、各年級選課時程如下：\n  1. 醫學院/牙醫學院/藥學院：11月02日開跑。\n  2. 護理學院/公衛學院/醫科院/人社院：11月03日開跑。\n  3. 全校各系所跨系選課：11月05日開放。\n三、通識核心課程每人上限選修兩門，超出上限者將自動篩選刪除。\n四、如有選課系統登入或密碼重置問題，請洽教務處註冊組（分機 2110-2115）。`,
    attachments: [
      { name: '114-2選課操作手冊.pdf', size: '1.4 MB', url: '#', fileType: 'pdf' },
      { name: '通識選修課表清冊.xlsx', size: '420 KB', url: '#', fileType: 'doc' },
    ],
    summary: [
      '初選時間為 2026/11/02 09:00 至 11/09 17:00，採分流選課',
      '各學院分兩梯次開放，11/05 開放全校跨系選課',
      '通識核心課程限選 2 門，選課系統問題可洽分機 2110',
    ],
    actionItems: [
      '11/02 前確認學生資訊系統 (TMU Portal) 帳號密碼可正常登入',
      '預先檢視各學院必選修課表，避免時間衝堂',
      '通識核心課程選修請優先挑選志願序',
    ],
    targetAudience: ['學士班全體學生', '研究所新生', '雙主修/輔系學生'],
  },
  {
    id: 'tmu-2026-002',
    title: '【學務處生輔組】114學年度「卓越杏林菁英獎學金」及「清寒學生助學金」申請開跑',
    department: '學務處',
    category: '獎助學金',
    date: '2026-10-25',
    urgency: 'high',
    originalUrl: 'https://osa.tmu.edu.tw/front/news/news.php?ID=tmu_osa&Sn=3921',
    content: `一、申請資格：本校在學大學部及研究所學生，前一學期學業成績平均達 82 分以上且操行達 85 分以上。\n二、獎助金額：每名新台幣 30,000 元至 50,000 元整，本學期預計錄取 60 名。\n三、申請截止日：2026年11月15日（日）23:59前完成線上填表，並於11月16日中午12:00前將紙本佐證文件送至學務處生活輔導組。\n四、應繳文件：申請書、歷年成績單正本、全戶戶籍謄本、低收或中低收入戶證明（清寒生適用）、師長推薦函一封。`,
    attachments: [
      { name: '卓越杏林獎學金申請辦法.pdf', size: '890 KB', url: '#', fileType: 'pdf' },
      { name: '清寒助學金審查表.doc', size: '210 KB', url: '#', fileType: 'doc' },
    ],
    summary: [
      '前學期學業達 82 分、操行 85 分可申請卓越杏林獎學金',
      '每名 3~5 萬元，名額 60 名，線上申請至 11/15 止',
      '紙本需於 11/16 中午前繳送學務處生輔組',
    ],
    actionItems: [
      '至自動繳費機或教務處申請前學期正式成績單正本',
      '向系主任或專任導師索取推薦函',
      '11/15 前至學務處獎助學金系統完成登記',
    ],
    targetAudience: ['大學部日間部學生', '碩博士在學生', '清寒低收入戶學生'],
  },
  {
    id: 'tmu-2026-003',
    title: '【總務處事務組】校本部綜合醫學大樓高壓電檢修及全棟停電工程通知',
    department: '總務處',
    category: '校園工程',
    date: '2026-10-24',
    urgency: 'high',
    originalUrl: 'https://ga.tmu.edu.tw/front/news/news.php?ID=tmu_ga&Sn=1109',
    content: `一、為配合台電高壓配電盤年度法定安全檢查，校本部綜合醫學大樓（含後棟研究實驗室）將實施全棟計畫性停電。\n二、停電時間：2026年11月01日（日）08:00 至 18:00（如作業提早完成將提前送電）。\n三、注意事項：\n  1. 停電期間全棟電梯暫停運行，中央空調與給水加壓馬達停止運作。\n  2. 實驗室精密儀器及超低溫冷凍櫃請提前切換至緊急備用發電機電源回路。\n  3. 各研究室重要電腦與伺服器請提前於 10/31 17:00 前妥善關機。`,
    attachments: [
      { name: '停電分區回路配置圖.pdf', size: '2.1 MB', url: '#', fileType: 'pdf' },
    ],
    summary: [
      '綜合醫學大樓將於 11/01（日）08:00 - 18:00 全棟停電檢修',
      '全棟電梯、空調停用，實驗室低溫冰箱需確認緊急回路',
      '所有電腦設備與伺服器務必於 10/31 17:00 前完成關機',
    ],
    actionItems: [
      '檢視實驗室貴重檢體與 -80°C 冰箱是否已接上緊急用電迴路',
      '10/31 下班前將實驗室與研究室工作站電腦關閉電源',
      '停電當天切勿搭乘電梯以免受困',
    ],
    targetAudience: ['醫學綜合大樓各實驗室研究人員', '全校教職員工', '駐點廠商'],
  },
  {
    id: 'tmu-2026-004',
    title: '【研發處產學組】2027年國科會生醫大健康創新技術產學合作計畫徵求公告',
    department: '研發處',
    category: '研發補助',
    date: '2026-10-23',
    urgency: 'medium',
    originalUrl: 'https://research.tmu.edu.tw/front/news/news.php?ID=tmu_rd&Sn=4410',
    content: `一、國科會推動「生醫跨領域科技創新及智慧醫療生技產業應用」，即日起受理116年度產學合作計畫申請。\n二、校內徵件收件截止日：2026年11月25日（三）17:00前於國科會學術研發平台完成線上送出。\n三、補助額度：單一計畫每年最高補助新台幣 500 萬元，合作企業配合款需達 20% 以上。\n四、研發處訂於 11月06日（五）下午14:00於杏春樓舉辦校內計畫申請輔導說明會。`,
    attachments: [
      { name: '國科會生醫產學計畫徵求說明書.pdf', size: '3.4 MB', url: '#', fileType: 'pdf' },
      { name: '產學合作意向書範本.docx', size: '540 KB', url: '#', fileType: 'doc' },
    ],
    summary: [
      '國科會生醫產學合作計畫受理申請，單一計畫年補助最高 500 萬元',
      '校內線上申請截止日為 2026/11/25 17:00',
      '研發處於 11/06 14:00 於杏春樓舉辦計畫輔導說明會',
    ],
    actionItems: [
      '與合作醫院或生技企業確認配合款意向書 (MOU)',
      '報名參加 11/06 杏春樓計畫說明會',
      '於 11/25 前至國科會系統送出並通知系所審核',
    ],
    targetAudience: ['專任教師', '臨床醫師兼任教師', '博士後研究員'],
  },
  {
    id: 'tmu-2026-005',
    title: '【國際處交流組】2026-2027 學年度秋季班赴歐美頂尖醫學院海外交換甄選簡章',
    department: '國際事務處',
    category: '國際交流',
    date: '2026-10-22',
    urgency: 'medium',
    originalUrl: 'https://oge.tmu.edu.tw/front/news/news.php?ID=tmu_oge&Sn=2219',
    content: `一、本校與美國約翰霍普金斯大學、英國帝國理工學院、日本京都大學等姊妹校推動醫學、藥學、公共衛生學生赴外交換學習。\n二、報名資格：本校大二（含）以上學生，TOEFL iBT 90分或 IELTS 6.5以上，歷年名次前 30%。\n三、甄選報名期間：自2026年11月10日至12月05日止。\n四、錄取者可申請教育部學海飛颺或校方海外研修獎學金（最高補助20萬元）。`,
    attachments: [
      { name: '2026海外交換甄選簡章.pdf', size: '1.8 MB', url: '#', fileType: 'pdf' },
      { name: '姊妹校名額與語言門檻對照表.pdf', size: '620 KB', url: '#', fileType: 'pdf' },
    ],
    summary: [
      '歐美日頂尖醫學姊妹校 2026-2027 秋季交換甄選開始',
      '大二以上、成績前 30%、托福 90 / 雅思 6.5 可報考',
      '報名至 12/05 止，可申請教育部學海飛颺最高 20 萬元獎助金',
    ],
    actionItems: [
      '檢查英文檢定成績單是否在兩年有效期限內',
      '準備英文自傳與赴外研習讀書計畫書 (SOP)',
      '請原系所指導教授或系主任簽署同意推薦書',
    ],
    targetAudience: ['醫學系、牙醫系、藥學系三~四年級學生', '全校研究生'],
  },
  {
    id: 'tmu-2026-006',
    title: '【資訊處校園通訊】校園單一簽入 (TMU Portal) 與 Eduroam Wi-Fi 安全認證升級公告',
    department: '資訊處',
    category: '緊急通報',
    date: '2026-10-21',
    urgency: 'normal',
    originalUrl: 'https://oit.tmu.edu.tw/front/news/news.php?ID=tmu_oit&Sn=882',
    content: `一、為提升校園資訊安全防護，全校單一入口網 (TMU Portal) 將於 2026年10月30日（五）22:00 至 10月31日 06:00 進行雙因子認證 (2FA) 模組升級維護。\n二、維護期間 Portal、網路選課、成績登錄及請假系統將暫停服務。\n三、校內 Eduroam 無線網路請於更新後重新安裝安全數位憑證（TMU-CA-2026.crt），以免連線中斷。`,
    attachments: [
      { name: '雙因子認證操作教學.pdf', size: '950 KB', url: '#', fileType: 'pdf' },
      { name: 'TMU-CA-2026數位憑證.crt', size: '12 KB', url: '#', fileType: 'link' },
    ],
    summary: [
      'TMU Portal 雙因子認證升級，於 10/30 22:00 ~ 10/31 06:00 暫停服務',
      '維護期間選課、成績、請假等系統無法使用',
      'Eduroam Wi-Fi 需下載最新憑證以免無法連網',
    ],
    actionItems: [
      '10/30 22:00 前完成當日各項系統表單送簽作業',
      '依照教學手冊綁定 Google Authenticator 2FA 認證',
      '下載並安裝校園新版 Wi-Fi 數位憑證',
    ],
    targetAudience: ['全校教職員工生', '各附屬醫院在校兼任臨床同仁'],
  },
  {
    id: 'tmu-2026-007',
    title: '【圖書館館藏組】醫學期刊資料庫 UpToDate & ClinicalKey 新功能線上推廣工作坊',
    department: '圖書館',
    category: '講座活動',
    date: '2026-10-20',
    urgency: 'normal',
    originalUrl: 'https://library.tmu.edu.tw/front/news/news.php?ID=tmu_lib&Sn=1567',
    content: `一、為協助本校醫事師生善用頂尖臨床決策支援系統，圖書館特邀原廠資深培訓顧問舉辦臨床實證檢索技巧工作坊。\n二、時間：2026年11月04日（三）12:10 - 13:20（提供輕食餐盒）。\n三、地點：醫學綜合大樓後棟三樓電腦教室一（同步開放 Webex 線上直播）。\n四、全程參與可認列教師教學成長點數 1 點或通識自主學習學分。`,
    attachments: [
      { name: '工作坊報名簡章與議程.pdf', size: '750 KB', url: '#', fileType: 'pdf' },
    ],
    summary: [
      'UpToDate & ClinicalKey 臨床實證檢索技巧工作坊 11/04 中午舉辦',
      '地點在醫學綜合大樓電腦教室一，同步提供線上直播',
      '可認列教師教學成長點數 1 點或通識自主學習學分',
    ],
    actionItems: [
      '11/02 前至圖書館首頁活動報名系統登記',
      '實體參加者請提早 10 分鐘報到領取資料及餐盒',
    ],
    targetAudience: ['醫學院師生', '臨床醫師', '住院醫師', '護理師', '醫事放射與檢驗人員'],
  },
];

/**
 * Filter announcements by department, category, keyword, and urgency
 */
export function filterAnnouncements(
  announcements: TMUAnnouncement[],
  filters: {
    department?: TMUDepartment | '全部';
    category?: TMUCategory | '全部';
    keyword?: string;
    urgencyOnly?: boolean;
  }
): TMUAnnouncement[] {
  return announcements.filter((item) => {
    if (filters.department && filters.department !== '全部') {
      if (item.department !== filters.department) return false;
    }

    if (filters.category && filters.category !== '全部') {
      if (item.category !== filters.category) return false;
    }

    if (filters.urgencyOnly) {
      if (item.urgency !== 'high') return false;
    }

    if (filters.keyword && filters.keyword.trim() !== '') {
      const q = filters.keyword.trim().toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inContent = item.content.toLowerCase().includes(q);
      const inDept = item.department.toLowerCase().includes(q);
      const inCat = item.category.toLowerCase().includes(q);
      if (!inTitle && !inContent && !inDept && !inCat) return false;
    }

    return true;
  });
}

/**
 * Check if an announcement matches subscribed keywords
 */
export function matchKeywords(
  announcement: TMUAnnouncement,
  keywords: string[]
): string[] {
  if (!keywords || keywords.length === 0) return [];
  const text = `${announcement.title} ${announcement.content} ${announcement.department} ${announcement.category}`.toLowerCase();
  return keywords.filter((kw) => {
    const k = kw.trim().toLowerCase();
    return k.length > 0 && text.includes(k);
  });
}

/**
 * Automatically categorize announcement by keyword
 */
export function inferCategory(title: string, content: string): TMUCategory {
  const combined = `${title} ${content}`;
  if (/選課|學籍|停修|學分|課表|初選|加退選/.test(combined)) return '選課/學籍';
  if (/獎學金|助學金|清寒|獎助|就學貸款/.test(combined)) return '獎助學金';
  if (/停電|停水|修繕|施工|工程|電梯|空調/.test(combined)) return '校園工程';
  if (/國科會|產學|研發|科技部|專利|徵件/.test(combined)) return '研發補助';
  if (/交換|留學|出國|姊妹校|學海|外籍生/.test(combined)) return '國際交流';
  if (/實習|就業|徵才|企業參訪|醫院見習/.test(combined)) return '實習就業';
  if (/緊急|防颱|地震|資安|停班停課|防疫/.test(combined)) return '緊急通報';
  return '講座活動';
}

/**
 * Detect urgency level based on title and deadline mentions
 */
export function detectUrgency(title: string, content: string): 'high' | 'medium' | 'normal' {
  const combined = `${title} ${content}`;
  if (/緊急|停電|停水|暫停|截止日將至|最後期限|資安通報|立即/.test(combined)) {
    return 'high';
  }
  if (/甄選|申請開跑|徵件|補助|日程公告/.test(combined)) {
    return 'medium';
  }
  return 'normal';
}
