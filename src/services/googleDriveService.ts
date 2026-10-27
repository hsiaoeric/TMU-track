import { TMUAnnouncement, GoogleDriveFile } from '../types';

const FOLDER_NAME = '北醫校園公告存檔 (TMU Announcements)';

/**
 * Searches for or creates the dedicated TMU archive folder in Google Drive
 */
export async function getOrCreateTMUFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`);
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`Google Drive 搜尋資料夾失敗: ${err}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Folder doesn't exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: '由北醫公告 LINE Bot 追蹤器自動封存之臺北醫學大學重要校園公告及附件記錄。',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`建立 Google Drive 資料夾失敗: ${err}`);
  }

  const createdData = await createRes.json();
  return createdData.id;
}

/**
 * Archives a single announcement to Google Drive as a structured text/markdown document
 */
export async function archiveAnnouncementToDrive(
  accessToken: string,
  announcement: TMUAnnouncement,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const targetFolderId = folderId || (await getOrCreateTMUFolder(accessToken));
  const filename = `[北醫-${announcement.department}] ${announcement.date} ${announcement.title.replace(/[\\/:*?"<>|]/g, '_')}.txt`;

  const summarySection = announcement.summary && announcement.summary.length > 0
    ? `\n【AI 智能重點摘要】\n${announcement.summary.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}\n`
    : '';

  const actionSection = announcement.actionItems && announcement.actionItems.length > 0
    ? `\n【重要待辦與行動清單】\n${announcement.actionItems.map((a, i) => `  [ ] ${a}`).join('\n')}\n`
    : '';

  const attachmentsSection = announcement.attachments && announcement.attachments.length > 0
    ? `\n【官方檢附附件】\n${announcement.attachments.map((att) => `  • ${att.name} (${att.size})`).join('\n')}\n`
    : '';

  const fileContent = `================================================================================
臺北醫學大學 (TMU) 校園官方公告存檔備份
備份時間: ${new Date().toLocaleString('zh-TW')}
================================================================================

【公告標題】${announcement.title}
【發布單位】${announcement.department}
【公告類別】${announcement.category}
【發布日期】${announcement.date}
【急迫程度】${announcement.urgency === 'high' ? '🚨 緊急重要' : announcement.urgency === 'medium' ? '⚡ 截止注意' : '📌 一般快訊'}
【官方連結】${announcement.originalUrl}
${summarySection}${actionSection}
【公告全文內容】
--------------------------------------------------------------------------------
${announcement.content}
--------------------------------------------------------------------------------
${attachmentsSection}
================================================================================
本存檔由「北醫公告 LINE Bot 追蹤器」自動備份至您的 Google 雲端硬碟。
================================================================================
`;

  // Use multipart upload to include metadata and content
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: 'text/plain',
    parents: [targetFolderId],
    description: `臺北醫學大學公告存檔 - ${announcement.department}`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`上傳檔案至 Google Drive 失敗: ${err}`);
  }

  const result = await uploadRes.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}

/**
 * Lists all archived announcement files in the TMU Google Drive folder
 */
export async function listArchivedFiles(accessToken: string, folderId: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name, mimeType, webViewLink, createdTime, size)&orderBy=createdTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`讀取 Google Drive 存檔清單失敗: ${err}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    createdTime: f.createdTime,
    size: f.size ? `${(parseInt(f.size, 10) / 1024).toFixed(1)} KB` : '4.2 KB',
  }));
}

/**
 * Permanently or softly deletes a file from Google Drive
 * NOTE: MUST only be called after explicit user confirmation in the UI!
 */
export async function deleteArchivedFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`刪除 Google Drive 檔案失敗: ${err}`);
  }
}

/**
 * Generates and uploads a Master Catalog Digest of all announcements to Drive
 */
export async function exportCatalogToDrive(
  accessToken: string,
  announcements: TMUAnnouncement[],
  folderId?: string
): Promise<{ fileId: string; webViewLink: string }> {
  const targetFolderId = folderId || (await getOrCreateTMUFolder(accessToken));
  const filename = `【北醫公告總覽】TMU_Announcements_Digest_${new Date().toISOString().slice(0, 10)}.md`;

  const mdContent = `# 臺北醫學大學 (TMU) 校園公告彙整目錄
> 產生時間：${new Date().toLocaleString('zh-TW')}  
> 總收錄公告數：${announcements.length} 則  
> 系統：北醫公告 LINE Bot 追蹤器  

---

## 📌 最新公告目錄

${announcements
  .map(
    (a, i) => `### ${i + 1}. [${a.department}] ${a.title}
- **發布日期**：${a.date}
- **類別**：${a.category} | **重要性**：${a.urgency}
- **官方原始網址**：${a.originalUrl}
- **AI 重點整理**：
${(a.summary || ['無額外重點']).map((s) => `  - ${s}`).join('\n')}
- **行動清單**：
${(a.actionItems || ['暫無待辦']).map((act) => `  - [ ] ${act}`).join('\n')}
`
  )
  .join('\n---\n\n')}
`;

  const boundary = '-------catalog3141592653589';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: 'text/markdown',
    parents: [targetFolderId],
    description: '臺北醫學大學校園公告完整彙整目錄',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    mdContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`匯出目錄至 Google Drive 失敗: ${err}`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}
