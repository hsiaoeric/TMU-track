export type TMUDepartment = 
  | '教務處' 
  | '學務處' 
  | '總務處' 
  | '研發處' 
  | '國際事務處' 
  | '資訊處' 
  | '醫學院' 
  | '圖書館';

export type TMUCategory = 
  | '選課/學籍' 
  | '獎助學金' 
  | '講座活動' 
  | '校園工程' 
  | '實習就業' 
  | '緊急通報' 
  | '研發補助' 
  | '國際交流';

export interface TMUAttachment {
  name: string;
  size: string;
  url: string;
  fileType: 'pdf' | 'doc' | 'zip' | 'link';
}

export interface TMUAnnouncement {
  id: string;
  title: string;
  department: TMUDepartment;
  category: TMUCategory;
  date: string; // YYYY-MM-DD
  urgency: 'high' | 'medium' | 'normal';
  originalUrl: string;
  content: string;
  attachments: TMUAttachment[];
  summary?: string[];
  actionItems?: string[];
  targetAudience?: string[];
  isArchivedToDrive?: boolean;
  driveFileId?: string;
  driveFileUrl?: string;
  archivedAt?: string;
  pushedToLineCount?: number;
}

export interface LineSubscription {
  userId: string;
  userName: string;
  keywords: string[];
  departments: TMUDepartment[];
  notifyUrgentOnly: boolean;
  active: boolean;
  createdAt: string;
}

export interface LineChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text?: string;
  flexMessage?: LineFlexBubble;
  quickReplies?: string[];
}

export interface LineFlexBubble {
  type: 'bubble';
  hero?: {
    tag: string;
    tagColor: string;
    title: string;
    date: string;
    department: string;
  };
  body: {
    content: string;
    bullets?: string[];
    urgencyText?: string;
  };
  footer?: {
    primaryButton?: {
      label: string;
      actionType: 'url' | 'message' | 'drive';
      payload: string;
    };
    secondaryButton?: {
      label: string;
      actionType: 'url' | 'message' | 'drive';
      payload: string;
    };
  };
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}
