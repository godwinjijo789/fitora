/**
 * Transforms a standard Google Drive sharing link into a direct web-friendly image URL.
 * Example input: https://drive.google.com/file/d/1GTg3o5yyHHxI6afk73g1mBtpZ2bAjJ1v/view?usp=drive_link
 * Example output: https://drive.google.com/uc?export=view&id=1GTg3o5yyHHxI6afk73g1mBtpZ2bAjJ1v
 */
export function transformGoogleDriveUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Handing Google Drive URLs
  if (url.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern 1: /file/d/FILE_ID/view
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      // Pattern 2: ?id=FILE_ID
      const fileIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        fileId = fileIdMatch[1];
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
}
