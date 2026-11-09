/**
 * ==============================================================================
 * IIT MADRAS SMAIL GATEWAY FOR AI MAIL AGENT
 * ==============================================================================
 * 
 * Why this is needed:
 * IIT Madras Google Workspace (@smail.iitm.ac.in) disables "App Passwords"
 * for student accounts. This Google Apps Script runs natively inside your college
 * Google account, giving the AI Mail Agent secure read-access to your inbox.
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com while signed in to your am26m001@smail.iitm.ac.in account.
 * 2. Click "+ New project".
 * 3. Delete any default code in Code.gs and replace it with this entire script.
 * 4. Click the blue "Deploy" button (top right) -> "New deployment".
 * 5. Click the Gear icon next to "Select type" -> choose "Web app".
 * 6. Set:
 *    - Description: "AI Mail Agent Gateway"
 *    - Execute as: "Me (am26m001@smail.iitm.ac.in)"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy". Click "Authorize access" -> choose your Smail account ->
 *    click "Advanced" -> "Go to Untitled project (unsafe)" -> click "Allow".
 * 8. Copy the "Web app URL" (ends in /exec).
 * 9. In Antigravity Mail AI dashboard:
 *    Open ⚙️ Settings -> select "🎓 IITM Smail (Apps Script)" tab ->
 *    paste the Web App URL -> click "Save Settings".
 * 10. Switch to IIT Madras Smail from the header switcher!
 * ==============================================================================
 */

const SECURITY_TOKEN = "iitm_smail_secret_2026";

function doGet(e) {
  try {
    const token = (e && e.parameter && e.parameter.token) || "";
    if (token !== SECURITY_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "Unauthorized: Invalid security token."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const limit = parseInt((e && e.parameter && e.parameter.limit) || "15", 10);
    const threads = GmailApp.getInboxThreads(0, Math.min(limit, 30));
    const emails = [];

    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const messages = thread.getMessages();
      if (!messages || messages.length === 0) continue;

      const lastMsg = messages[messages.length - 1];
      const fromRaw = lastMsg.getFrom();
      let senderName = fromRaw;
      let senderEmail = fromRaw;

      const match = fromRaw.match(/(.*?)\s*<(.+?)>/);
      if (match) {
        senderName = match[1].replace(/["']/g, "").trim() || match[2];
        senderEmail = match[2].trim();
      }

      const attachments = lastMsg.getAttachments().map(function(att) {
        return {
          name: att.getName(),
          type: att.getContentType(),
          size: Math.round(att.getSize() / 1024) + " KB"
        };
      });

      emails.push({
        id: "smail_" + lastMsg.getId(),
        subject: lastMsg.getSubject() || "(No Subject)",
        sender_name: senderName,
        sender_email: senderEmail,
        date: lastMsg.getDate().toISOString(),
        date_display: Utilities.formatDate(lastMsg.getDate(), "Asia/Kolkata", "MMM dd, yyyy hh:mm a"),
        body_plain: lastMsg.getPlainBody() || "",
        body_html: lastMsg.getBody() || "",
        snippet: (lastMsg.getPlainBody() || "").slice(0, 160) + "...",
        attachments: attachments,
        is_unread: lastMsg.isUnread(),
        is_demo: false
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: emails.length,
      emails: emails
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
