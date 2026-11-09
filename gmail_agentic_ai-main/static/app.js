/**
 * Antigravity Mail AI — Client Application
 * Autonomous Email Triage, Summarization, Categorization & Action Engine
 */

// Application State
const state = {
  emails: [],
  selectedEmailId: null,
  currentCategory: 'all',
  currentPriority: 'all',
  currentQuickFilter: 'all',
  searchQuery: '',
  systemStatus: null,
  config: null,
  originalBodyTab: 'plain',
  isSpeaking: false
};

// DOM References
const elements = {
  // Header
  unreadCount: document.getElementById('count-unread'),
  criticalCount: document.getElementById('count-critical'),
  actionsCount: document.getElementById('count-pending-actions'),
  engineStatus: document.getElementById('agent-engine-status'),
  modePill: document.getElementById('btn-toggle-mode'),
  modeText: document.getElementById('mode-text'),
  btnSync: document.getElementById('btn-sync-inbox'),
  btnBriefing: document.getElementById('btn-open-briefing'),
  btnSettings: document.getElementById('btn-open-settings'),
  btnTheme: document.getElementById('btn-theme-toggle'),

  // Sidebar
  categoryNavList: document.getElementById('category-nav-list'),
  priorityNavList: document.getElementById('priority-nav-list'),
  btnQuickBriefing: document.getElementById('btn-quick-briefing'),

  // Email List Column
  searchInput: document.getElementById('search-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  filterTabs: document.querySelectorAll('.filter-tab'),
  emailFeed: document.getElementById('email-feed-container'),
  resultsCount: document.getElementById('results-count-text'),

  // Email Detail Column
  detailEmptyState: document.getElementById('detail-empty-state'),
  detailActiveView: document.getElementById('detail-active-view'),
  btnToggleRead: document.getElementById('btn-toggle-read'),
  readToggleText: document.getElementById('read-toggle-text'),
  readToggleIcon: document.getElementById('read-toggle-icon'),
  btnReanalyze: document.getElementById('btn-reanalyze'),
  priorityScoreTag: document.getElementById('detail-score-tag'),
  priorityScoreVal: document.getElementById('detail-priority-val'),
  securityWarning: document.getElementById('detail-security-warning'),
  securityWarningMsg: document.getElementById('security-warning-message'),
  detailSubject: document.getElementById('detail-subject-text'),
  detailSenderAvatar: document.getElementById('detail-sender-avatar'),
  detailSenderName: document.getElementById('detail-sender-name'),
  detailSenderEmail: document.getElementById('detail-sender-email'),
  detailDateDisplay: document.getElementById('detail-date-display'),
  detailCategoryBadge: document.getElementById('detail-category-badge'),
  detailAttachmentsStrip: document.getElementById('detail-attachments-strip'),
  detailAttachmentsList: document.getElementById('detail-attachments-list'),

  // AI Intelligence Section
  detailEngineTag: document.getElementById('detail-engine-tag'),
  detailTldr: document.getElementById('detail-tldr-text'),
  detailTakeawaysList: document.getElementById('detail-takeaways-list'),
  detailActionsBox: document.getElementById('detail-actions-box'),
  detailActionCount: document.getElementById('detail-action-count'),
  detailActionsList: document.getElementById('detail-actions-list'),
  detailEntitiesBox: document.getElementById('detail-entities-box'),
  detailEntitiesChips: document.getElementById('detail-entities-chips'),
  detailSmartReplies: document.getElementById('detail-smart-replies'),
  replyTextarea: document.getElementById('reply-textarea'),
  btnCopyReply: document.getElementById('btn-copy-reply'),
  btnSaveDraft: document.getElementById('btn-save-draft'),
  btnSendSimulation: document.getElementById('btn-send-simulation'),
  toneButtons: document.querySelectorAll('.tone-btn'),

  // Subtext HUD
  subtextCard: document.getElementById('detail-subtext-box'),
  subtextGaugeFill: document.getElementById('detail-gauge-fill'),
  subtextGaugeVal: document.getElementById('detail-gauge-val'),
  subtextUrgency: document.getElementById('detail-subtext-urgency'),
  subtextPower: document.getElementById('detail-subtext-power'),
  subtextDecoded: document.getElementById('detail-subtext-decoded'),
  subtextAdvice: document.getElementById('detail-subtext-advice'),

  // Tools & Calendar
  btnExportTasks: document.getElementById('btn-export-tasks'),
  calendarBanner: document.getElementById('detail-calendar-banner'),
  calBannerTitle: document.getElementById('cal-banner-title'),
  calBannerSub: document.getElementById('cal-banner-sub'),
  btnAddGcal: document.getElementById('btn-add-gcal'),
  btnDownloadIcs: document.getElementById('btn-download-ics'),

  // Ask AI Multi-Turn
  askAiInput: document.getElementById('ask-ai-input'),
  btnAskAi: document.getElementById('btn-ask-ai'),
  askAiChatThread: document.getElementById('ask-ai-chat-thread'),

  // Shortcuts Modal
  modalShortcuts: document.getElementById('modal-shortcuts'),
  btnOpenShortcuts: document.getElementById('btn-open-shortcuts'),
  btnCloseShortcuts: document.getElementById('btn-close-shortcuts'),
  btnDismissShortcuts: document.getElementById('btn-dismiss-shortcuts'),

  // Morning Podcast Show
  btnPlayPodcast: document.getElementById('btn-play-podcast'),
  podcastPlayIcon: document.getElementById('podcast-play-icon'),
  podcastPlayText: document.getElementById('podcast-play-text'),
  podcastScriptBox: document.getElementById('podcast-script-box'),
  themeIndicatorIcon: document.getElementById('theme-indicator-icon'),

  // Original Body
  tabPlainText: document.getElementById('tab-plain-text'),
  tabHtmlText: document.getElementById('tab-html-text'),
  originalBodyDisplay: document.getElementById('original-body-display'),

  // Briefing Modal
  modalBriefing: document.getElementById('modal-briefing'),
  btnCloseBriefing: document.getElementById('btn-close-briefing'),
  btnDismissBriefing: document.getElementById('btn-dismiss-briefing'),
  btnSpeakBriefing: document.getElementById('btn-speak-briefing'),
  speakBtnText: document.getElementById('speak-btn-text'),
  briefingDateTitle: document.getElementById('briefing-date-title'),
  briefingStatTotal: document.getElementById('briefing-stat-total'),
  briefingStatUrgent: document.getElementById('briefing-stat-urgent'),
  briefingStatActions: document.getElementById('briefing-stat-actions'),
  briefingStatBilling: document.getElementById('briefing-stat-billing'),
  briefingNarrative: document.getElementById('briefing-narrative-text'),
  briefingUrgentList: document.getElementById('briefing-urgent-list'),
  briefingRecList: document.getElementById('briefing-rec-list'),

  // Settings Modal
  modalSettings: document.getElementById('modal-settings'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  btnCancelSettings: document.getElementById('btn-cancel-settings'),
  btnSaveSettings: document.getElementById('btn-save-settings'),
  segDemo: document.getElementById('seg-demo'),
  segSmail: document.getElementById('seg-smail'),
  segImap: document.getElementById('seg-imap'),
  smailSection: document.getElementById('smail-settings-section'),
  imapSection: document.getElementById('imap-settings-section'),
  inputSmailUrl: document.getElementById('input-smail-url'),
  inputSmailToken: document.getElementById('input-smail-token'),
  btnTestSmail: document.getElementById('btn-test-smail'),
  testSmailResult: document.getElementById('test-smail-result'),
  inputGeminiKey: document.getElementById('input-gemini-key'),
  inputImapHost: document.getElementById('input-imap-host'),
  inputImapPort: document.getElementById('input-imap-port'),
  inputImapUser: document.getElementById('input-imap-user'),
  inputImapPassword: document.getElementById('input-imap-password'),
  inputFetchCount: document.getElementById('input-fetch-count'),
  btnTestImap: document.getElementById('btn-test-imap'),
  testConnResult: document.getElementById('test-connection-result'),

  // Mobile Alert Bridge
  btnPushMobile: document.getElementById('btn-push-mobile'),
  inputEnableMobileAlerts: document.getElementById('input-enable-mobile-alerts'),
  inputTelegramToken: document.getElementById('input-telegram-token'),
  inputTelegramChat: document.getElementById('input-telegram-chat'),
  inputWhatsappWebhook: document.getElementById('input-whatsapp-webhook'),
  selectNotifyPriority: document.getElementById('select-notify-priority'),
  btnTestMobileAlert: document.getElementById('btn-test-mobile-alert'),
  testMobileResult: document.getElementById('test-mobile-result'),

  // Toast Container
  toastContainer: document.getElementById('toast-container'),

  // Autonomous Watcher
  watcherBadge: document.getElementById('watcher-badge'),
  watcherStatusText: document.getElementById('watcher-status-text'),

  // Ask Entire Inbox AI
  btnOpenAskInbox: document.getElementById('btn-open-ask-inbox'),
  modalAskInbox: document.getElementById('modal-ask-inbox'),
  btnCloseAskInbox: document.getElementById('btn-close-ask-inbox'),
  inputAskInbox: document.getElementById('input-ask-inbox'),
  btnSubmitAskInbox: document.getElementById('btn-submit-ask-inbox'),
  askInboxResultCard: document.getElementById('ask-inbox-result-card'),
  askInboxOutput: document.getElementById('ask-inbox-output'),
  askInboxTime: document.getElementById('ask-inbox-time'),

  // Live Voice Call with Nova
  btnCallNova: document.getElementById('btn-call-nova'),
  modalLiveCall: document.getElementById('modal-live-call'),
  callTimerDisplay: document.getElementById('call-timer-display'),
  callAvatarCore: document.getElementById('call-avatar-core'),
  callStatePill: document.getElementById('call-state-pill'),
  callStateText: document.getElementById('call-state-text'),
  audioWaveformBars: document.getElementById('audio-waveform-bars'),
  callUserTranscript: document.getElementById('call-user-transcript'),
  callNovaTranscript: document.getElementById('call-nova-transcript'),
  btnCallToggleMic: document.getElementById('btn-call-toggle-mic'),
  callMicIcon: document.getElementById('call-mic-icon'),
  callMicLabel: document.getElementById('call-mic-label'),
  btnEndCall: document.getElementById('btn-end-call'),

  // PWA Install Button
  btnInstallPwa: document.getElementById('btn-install-pwa'),

  // Telegram & Mobile Remote Hub
  btnOpenTelegramHub: document.getElementById('btn-open-telegram-hub'),
  modalTelegramHub: document.getElementById('modal-telegram-hub'),
  btnCloseTelegramHub: document.getElementById('btn-close-telegram-hub'),
  tgStatusText: document.getElementById('tg-status-text'),
  tgStatusDetail: document.getElementById('tg-status-detail'),
  btnTestTgDispatch: document.getElementById('btn-test-tg-dispatch'),
  tgCommandInput: document.getElementById('tg-command-input'),
  btnRunTgCommand: document.getElementById('btn-run-tg-command'),
  tgCommandOutput: document.getElementById('tg-command-output'),

  // Security Radar Hub
  btnOpenSecurityHub: document.getElementById('btn-open-security-hub'),
  modalSecurityHub: document.getElementById('modal-security-hub'),
  btnCloseSecurityHub: document.getElementById('btn-close-security-hub'),
  secStatScanned: document.getElementById('sec-stat-scanned'),
  secStatHealth: document.getElementById('sec-stat-health'),
  secStatThreats: document.getElementById('sec-stat-threats'),
  secThreatsList: document.getElementById('sec-threats-list'),

  // Automations Hub
  btnOpenAutomationsHub: document.getElementById('btn-open-automations-hub'),
  modalAutomationsHub: document.getElementById('modal-automations-hub'),
  btnCloseAutomationsHub: document.getElementById('btn-close-automations-hub'),
  btnRunAllAutomations: document.getElementById('btn-run-all-automations'),
  automationsList: document.getElementById('automations-list'),
  hubBadgeAutomations: document.getElementById('hub-badge-automations'),

  // Contacts CRM Hub
  btnOpenContactsHub: document.getElementById('btn-open-contacts-hub'),
  modalContactsHub: document.getElementById('modal-contacts-hub'),
  btnCloseContactsHub: document.getElementById('btn-close-contacts-hub'),
  contactsGrid: document.getElementById('contacts-grid'),
  btnTranslateEmail: document.getElementById('btn-translate-email'),
  btnVoiceDictateReply: document.getElementById('btn-voice-dictate-reply'),
  askInboxEngineBadge: document.getElementById('ask-inbox-engine-badge'),
  askInboxCitationsSection: document.getElementById('ask-inbox-citations-section'),
  askInboxCitationsGrid: document.getElementById('ask-inbox-citations-grid'),

  // Finance Hub
  btnOpenFinanceHub: document.getElementById('btn-open-finance-hub'),
  modalFinanceHub: document.getElementById('modal-finance-hub'),
  btnCloseFinanceHub: document.getElementById('btn-close-finance-hub'),
  hubBadgeFinance: document.getElementById('hub-badge-finance'),
  financeStatThreads: document.getElementById('finance-stat-threads'),
  financeStatAmount: document.getElementById('finance-stat-amount'),
  financeStatCurrencies: document.getElementById('finance-stat-currencies'),
  financeLedgerCount: document.getElementById('finance-ledger-count'),
  financeTableBody: document.getElementById('finance-table-body'),

  // Standalone Compose Modal
  btnOpenCompose: document.getElementById('btn-open-compose'),
  modalCompose: document.getElementById('modal-compose'),
  btnCloseCompose: document.getElementById('btn-close-compose'),
  btnCancelCompose: document.getElementById('btn-cancel-compose'),
  btnSendCompose: document.getElementById('btn-send-compose'),
  composeTo: document.getElementById('compose-to'),
  composeSubject: document.getElementById('compose-subject'),
  composeBody: document.getElementById('compose-body'),
  btnAiPolishCompose: document.getElementById('btn-ai-polish-compose'),

  // Quick Calendar & Replied Status
  btnQuickSchedule: document.getElementById('btn-quick-schedule'),
  detailRepliedBadge: document.getElementById('detail-replied-badge'),

  // Multi-Agent Council
  councilBox: document.getElementById('detail-council-box'),
  badgeSentinel: document.getElementById('badge-agent-sentinel'),
  verdictSentinel: document.getElementById('verdict-agent-sentinel'),
  badgeCareer: document.getElementById('badge-agent-career'),
  verdictCareer: document.getElementById('verdict-agent-career'),
  badgeFinops: document.getElementById('badge-agent-finops'),
  verdictFinops: document.getElementById('verdict-agent-finops'),
  badgeGhostwriter: document.getElementById('badge-agent-ghostwriter'),
  verdictGhostwriter: document.getElementById('verdict-agent-ghostwriter'),
  badgeCritic: document.getElementById('badge-agent-critic'),
  verdictCritic: document.getElementById('verdict-agent-critic'),

  // Nova AI Companion
  companionFloatingDock: document.getElementById('companion-floating-dock'),
  companionDrawer: document.getElementById('companion-drawer'),
  btnToggleCompanionFab: document.getElementById('btn-toggle-companion-fab'),
  btnHeaderCompanion: document.getElementById('btn-header-companion'),
  btnCloseCompanionDrawer: document.getElementById('btn-close-companion-drawer'),
  btnClearCompanionChat: document.getElementById('btn-clear-companion-chat'),
  btnToggleSpeech: document.getElementById('btn-toggle-speech'),
  speechIcon: document.getElementById('speech-icon'),
  companionChatStream: document.getElementById('companion-chat-stream'),
  companionInputText: document.getElementById('companion-input-text'),
  btnCompanionSend: document.getElementById('btn-companion-send'),
  btnCompanionMic: document.getElementById('btn-companion-mic'),
  micIcon: document.getElementById('mic-icon'),
  companionChips: document.querySelectorAll('.comp-chip'),

  // Multi-Account Switcher
  accountSwitcherBtn: document.getElementById('btn-toggle-account-menu'),
  accountMenuPopover: document.getElementById('account-menu-popover'),
  accountMenuList: document.getElementById('account-menu-list'),
  headerAccountAvatar: document.getElementById('header-account-avatar'),
  headerAccountName: document.getElementById('header-account-name'),
  headerAccountEmail: document.getElementById('header-account-email'),
  headerAccountBadge: document.getElementById('header-account-badge'),
  accountsCountPill: document.getElementById('accounts-count-pill'),
  btnOpenAddAccountModal: document.getElementById('btn-open-add-account-modal'),
  modalAddAccount: document.getElementById('modal-add-account'),
  btnCloseAddAccount: document.getElementById('btn-close-add-account'),
  addAccountForm: document.getElementById('add-account-form'),
  inputAddAccountName: document.getElementById('add-account-name'),
  inputAddAccountEmail: document.getElementById('add-account-email'),
  inputAddAccountPassword: document.getElementById('add-account-password'),
  checkAddAccountSwitchNow: document.getElementById('add-account-switch-now'),
  btnToggleAddPwd: document.getElementById('btn-toggle-add-pwd'),
  btnTestNewAccount: document.getElementById('btn-test-new-account'),
  btnSaveNewAccount: document.getElementById('btn-save-new-account'),
  addAccountStatusBox: document.getElementById('add-account-status-box'),
  btnCopyAskInbox: document.getElementById('btn-copy-ask-inbox'),

  // Nova Draft Queue & Workflows
  btnOpenDraftQueue: document.getElementById('btn-open-draft-queue'),
  modalDraftQueue: document.getElementById('modal-draft-queue'),
  btnCloseDraftQueue: document.getElementById('btn-close-draft-queue'),
  btnBatchApproveDrafts: document.getElementById('btn-batch-approve-drafts'),
  draftsQueueList: document.getElementById('drafts-queue-list'),
  draftsTabCount: document.getElementById('drafts-tab-count'),
  hubBadgeDrafts: document.getElementById('hub-badge-drafts'),
  tabDraftsPending: document.getElementById('tab-drafts-pending'),
  tabWorkflowsRules: document.getElementById('tab-workflows-rules'),
  viewPendingDrafts: document.getElementById('view-pending-drafts'),
  viewWorkflowRules: document.getElementById('view-workflow-rules'),
  workflowsRulesList: document.getElementById('workflows-rules-list'),

  // Executive Analytics & Health
  btnOpenAnalytics: document.getElementById('btn-open-analytics'),
  modalAnalytics: document.getElementById('modal-analytics'),
  btnCloseAnalytics: document.getElementById('btn-close-analytics'),
  hubBadgeHealth: document.getElementById('hub-badge-health'),
  analyticsHealthScoreVal: document.getElementById('analytics-health-score-val'),
  analyticsHealthGrade: document.getElementById('analytics-health-grade'),
  statThreatsDeterred: document.getElementById('stat-threats-deterred'),
  statDraftsStaged: document.getElementById('stat-drafts-staged'),
  analyticsStatTotal: document.getElementById('analytics-stat-total'),
  analyticsStatUnread: document.getElementById('analytics-stat-unread'),
  analyticsStatTasks: document.getElementById('analytics-stat-tasks'),
  analyticsStatStress: document.getElementById('analytics-stat-stress'),
  analyticsCategoryBars: document.getElementById('analytics-category-bars'),

  // Continuous Voice Call Mode
  btnStartVoiceCall: document.getElementById('btn-start-voice-call'),
  modalVoiceCall: document.getElementById('modal-voice-call'),
  btnCloseVoiceCallModal: document.getElementById('btn-close-voice-call-modal'),
  btnEndVoiceCall: document.getElementById('btn-end-voice-call'),
  btnVoiceCallMute: document.getElementById('btn-voice-call-mute'),
  callMicIcon: document.getElementById('call-mic-icon'),
  callMicText: document.getElementById('call-mic-text'),
  callStatusText: document.getElementById('call-status-text'),
  voiceCallTurnLabel: document.getElementById('voice-call-turn-label'),
  voiceTranscriptLatest: document.getElementById('voice-transcript-latest'),
  voiceCallOrb: document.getElementById('voice-call-orb'),

  // Declutter Hub
  btnOpenDeclutter: document.getElementById('btn-open-declutter'),
  modalDeclutter: document.getElementById('modal-declutter'),
  btnCloseDeclutter: document.getElementById('btn-close-declutter'),
  declutterSendersList: document.getElementById('declutter-senders-list'),
  declutterStatSenders: document.getElementById('declutter-stat-senders'),
  declutterStatEmails: document.getElementById('declutter-stat-emails'),
  declutterStatTime: document.getElementById('declutter-stat-time'),
  hubBadgeDeclutter: document.getElementById('hub-badge-declutter'),

  // Follow-up Radar (Ghost Watchdog)
  btnOpenFollowups: document.getElementById('btn-open-followups'),
  modalFollowups: document.getElementById('modal-followups'),
  btnCloseFollowups: document.getElementById('btn-close-followups'),
  followupsList: document.getElementById('followups-list'),
  hubBadgeFollowups: document.getElementById('hub-badge-followups'),

  // Attachment Intelligence Viewer
  modalAttachmentViewer: document.getElementById('modal-attachment-viewer'),
  btnCloseAttachmentViewer: document.getElementById('btn-close-attachment-viewer'),
  attFilenameText: document.getElementById('att-filename-text'),
  attMetaText: document.getElementById('att-meta-text'),
  attTakeawaysList: document.getElementById('att-takeaways-list'),
  attDatesBox: document.getElementById('att-dates-box'),
  attActionsBox: document.getElementById('att-actions-box'),

  // Style Cloning Profile
  btnOpenStyleProfile: document.getElementById('btn-open-style-profile'),
  modalStyleProfile: document.getElementById('modal-style-profile'),
  btnCloseStyleProfile: document.getElementById('btn-close-style-profile'),
  styleProfileName: document.getElementById('style-profile-name'),
  styleProfileTone: document.getElementById('style-profile-tone'),
  styleGreetingsChips: document.getElementById('style-greetings-chips'),
  styleSamplesList: document.getElementById('style-samples-list'),
  btnRetrainStyle: document.getElementById('btn-retrain-style'),

  // Calendar Conflict Alert
  calConflictNotice: document.getElementById('cal-conflict-box'),
  btnProposeAltSlot: document.getElementById('btn-propose-alt-slot'),

  // Innovation 1: Opportunity & Academic Deadline Radar
  btnOpenOpportunityRadar: document.getElementById('btn-open-opportunity-radar'),
  modalOpportunityRadar: document.getElementById('modal-opportunity-radar'),
  btnCloseOpportunityRadar: document.getElementById('btn-close-opportunity-radar'),
  hubBadgeRadar: document.getElementById('hub-badge-radar'),
  radarCardsGrid: document.getElementById('radar-cards-grid'),
  radarStatCount: document.getElementById('radar-stat-count'),
  radarStatUrgent: document.getElementById('radar-stat-urgent'),
  radarStatTopOrg: document.getElementById('radar-stat-top-org'),
  radarAccountTag: document.getElementById('radar-account-tag'),
  radarSearchInput: document.getElementById('radar-search-input'),
  btnRefreshRadar: document.getElementById('btn-refresh-radar'),

  // Innovation 2: Bilateral Commitment Ledger
  btnOpenCommitmentLedger: document.getElementById('btn-open-commitment-ledger'),
  modalCommitmentLedger: document.getElementById('modal-commitment-ledger'),
  btnCloseCommitmentLedger: document.getElementById('btn-close-commitment-ledger'),
  hubBadgeCommitments: document.getElementById('hub-badge-commitments'),
  ledgerCountYou: document.getElementById('ledger-count-you'),
  ledgerCountThey: document.getElementById('ledger-count-they'),
  ledgerListYou: document.getElementById('ledger-list-you'),
  ledgerListThey: document.getElementById('ledger-list-they'),

  // Innovation 3: Dual-Host Morning Show (AI Podcast)
  btnOpenMorningShow: document.getElementById('btn-open-morning-show'),
  modalMorningShow: document.getElementById('modal-morning-show'),
  btnCloseMorningShow: document.getElementById('btn-close-morning-show'),
  btnPodcastPlay: document.getElementById('btn-podcast-play'),
  btnPodcastRestart: document.getElementById('btn-podcast-restart'),
  podcastPlayIcon: document.getElementById('podcast-play-icon'),
  podcastHostAlex: document.getElementById('podcast-host-alex'),
  podcastHostNova: document.getElementById('podcast-host-nova'),
  podcastOnAirLabel: document.getElementById('podcast-on-air-label'),
  podcastWaveformBars: document.getElementById('audio-waveform-bars'),
  podcastTimeCounter: document.getElementById('podcast-time-counter'),
  podcastTranscriptStream: document.getElementById('podcast-transcript-stream'),

  // Innovation 4: Recipient Reaction Simulator
  btnToggleReplySimulator: document.getElementById('btn-toggle-reply-simulator'),
  replySimulatorWrapper: document.getElementById('reply-simulator-wrapper'),
  btnToggleComposeSimulator: document.getElementById('btn-toggle-compose-simulator'),
  composeSimulatorWrapper: document.getElementById('compose-simulator-wrapper'),

  // Direct Cellular SMS Hub (+91 9392709150)
  btnOpenSmsHub: document.getElementById('btn-open-sms-hub'),
  modalSmsHub: document.getElementById('modal-sms-hub'),
  btnCloseSmsHub: document.getElementById('btn-close-sms-hub'),
  btnSmsHubTest: document.getElementById('btn-sms-hub-test'),
  btnSmsHubRefresh: document.getElementById('btn-sms-hub-refresh'),
  smsOutboxContainer: document.getElementById('sms-outbox-container'),
  smsHubCountLabel: document.getElementById('sms-hub-count-label'),
  smsHubProviderLabel: document.getElementById('sms-hub-provider-label'),
  hubBadgeSms: document.getElementById('hub-badge-sms'),
  btnSaveSmsConfig: document.getElementById('btn-save-sms-config'),
  btnTestSmsDispatch: document.getElementById('btn-test-sms-dispatch'),
  testSmsResult: document.getElementById('test-sms-result'),
  inputSmsPhone: document.getElementById('input-sms-phone'),
  selectSmsProvider: document.getElementById('select-sms-provider'),
  checkEnableSmsAlerts: document.getElementById('check-enable-sms-alerts'),
  inputSmsFast2smsKey: document.getElementById('input-sms-fast2sms-key'),
  inputSmsTwilioSid: document.getElementById('input-sms-twilio-sid'),
  inputSmsTwilioToken: document.getElementById('input-sms-twilio-token'),
  inputSmsTwilioFrom: document.getElementById('input-sms-twilio-from'),
  smsProviderFast2smsBox: document.getElementById('sms-provider-fast2sms-box'),
  smsProviderTwilioBox: document.getElementById('sms-provider-twilio-box')
};

// ============================================================================
// Initialization
// ============================================================================
async function initApp() {
  initTheme();
  bindEvents();
  initCompanion();
  initAccountSwitcher();
  initDraftQueueModal();
  initAnalyticsModal();
  initContinuousVoiceCall();
  initDeclutterModal();
  initFollowupsModal();
  initAttachmentViewer();
  initStyleProfileModal();
  initPWA();
  initTelegramHub();
  initSecurityHub();
  initAutomationsHub();
  initContactsHub();
  initOpportunityRadar();
  initCommitmentLedger();
  initMorningAudioShow();
  initReactionSimulator();
  initSmsHub();
  await loadStatus();
  await loadEmails();
  loadAccounts();
  loadDraftQueueCount();
  loadAnalyticsHealthBadge();
  loadDeclutterBadge();
  loadFollowupsBadge();
  loadRadarBadge();
  loadCommitmentsBadge();
  loadSmsBadge();
  updateWatcherTelemetry();
  setInterval(updateWatcherTelemetry, 25000);
  loadFinanceHubData();

  // If emails exist, select the first one by default
  if (state.emails.length > 0) {
    selectEmail(state.emails[0].id);
  }
}

// ============================================================================
// API Calls & Data Fetching
// ============================================================================
async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    state.systemStatus = data;

    // Update Header UI
    elements.unreadCount.textContent = data.unread_count || 0;
    elements.criticalCount.textContent = data.critical_count || 0;
    elements.actionsCount.textContent = data.pending_actions_count || 0;
    elements.engineStatus.textContent = `AI Agent: ${data.ai_engine}`;

    if (data.demo_mode) {
      elements.modeText.textContent = 'Demo Mailbox';
      elements.modePill.classList.remove('live-mode');
    } else {
      elements.modeText.textContent = 'Live IMAP';
      elements.modePill.classList.add('live-mode');
    }
  } catch (err) {
    console.error('Error fetching status:', err);
  }
}

async function loadEmails() {
  elements.emailFeed.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <span>AI Agent triaging mailbox...</span>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (state.currentCategory !== 'all') params.append('category', state.currentCategory);
    if (state.currentPriority !== 'all') params.append('priority', state.currentPriority);
    if (state.searchQuery) params.append('search', state.searchQuery);
    if (state.currentQuickFilter === 'unread') params.append('unread_only', 'true');

    const res = await fetch(`/api/emails?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load emails');
    const data = await res.json();

    state.emails = data.emails || [];
    renderEmailFeed();
    updateSidebarBadges(data.emails || []);
    elements.resultsCount.textContent = `${data.count} of ${data.total}`;
  } catch (err) {
    elements.emailFeed.innerHTML = `
      <div class="loading-state">
        <span style="color: var(--status-critical);">Failed to load emails: ${err.message}</span>
        <button class="btn btn-sm btn-secondary" onclick="loadEmails()">Retry</button>
      </div>
    `;
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ============================================================================
// Rendering Functions
// ============================================================================
function renderEmailFeed() {
  const container = elements.emailFeed;
  container.innerHTML = '';

  let filtered = state.emails;

  // Apply Quick filter tab
  if (state.currentQuickFilter === 'actions') {
    filtered = filtered.filter(e => {
      const actions = e.ai_analysis?.action_items || [];
      return actions.some(a => !a.completed);
    });
  } else if (state.currentQuickFilter === 'urgent') {
    filtered = filtered.filter(e => {
      const prio = e.ai_analysis?.priority || '';
      return ['critical', 'high'].includes(prio.toLowerCase());
    });
  }

  if (filtered.length === 0) {
    const isSmail = (state.currentAccount?.id === 'iitm_smail') || (state.currentAccount?.email && state.currentAccount.email.includes('iitm.ac.in'));
    if (isSmail && (!state.config?.smail_script_url && !state.currentAccount?.imap_password)) {
      container.innerHTML = `
        <div class="smail-setup-card" style="margin: 16px; padding: 22px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 14px; text-align: left; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; font-size: 22px;">🎓</div>
            <div>
              <div style="font-weight: 700; font-size: 15px; color: #fbbf24;">Connect IIT Madras Smail</div>
              <div style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(state.currentAccount?.email || 'am26m001@smail.iitm.ac.in')}</div>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
            IIT Madras Workspace blocks standard Google App Passwords for student accounts. To sync college emails safely, connect your 1-time Google Apps Script Web App.
          </p>
          <div style="margin-bottom: 12px;">
            <label style="font-size: 10.5px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Paste Apps Script Web App URL</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="quick-smail-url-feed" placeholder="https://script.google.com/macros/s/.../exec" style="flex: 1; padding: 9px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: 6px; color: white; font-size: 12px; font-family: var(--font-mono);">
              <button class="btn btn-primary" id="btn-save-smail-feed" style="white-space: nowrap; padding: 9px 14px; font-size: 12px; font-weight: 600;">Save & Sync</button>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-secondary" id="btn-copy-smail-code-feed" onclick="copySmailCodeGlobal()" style="font-size: 11.5px; padding: 6px 12px;">📋 Copy Apps Script Code</button>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('btn-open-settings').click()" style="font-size: 11.5px; padding: 6px 12px;">⚙️ Open Smail Settings</button>
          </div>
        </div>
      `;
      setupSmailFeedListeners();
      return;
    }

    container.innerHTML = `
      <div class="loading-state" style="padding: 60px 20px;">
        <span style="font-size: 32px; margin-bottom: 10px;">📭</span>
        <span style="font-weight: 600; color: var(--text-primary); font-size: 15px;">No emails found</span>
        <span style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">This mailbox has no synchronized messages yet.</span>
        <button class="btn btn-secondary btn-sm" onclick="syncInbox()" style="padding: 7px 16px;">↻ Sync Mailbox Now</button>
      </div>
    `;
    return;
  }

  filtered.forEach(email => {
    const ai = email.ai_analysis || {};
    const prio = (ai.priority || 'Medium').toLowerCase();
    const score = ai.priority_score || 50;
    const isUnread = email.is_unread;
    const isSelected = email.id === state.selectedEmailId;

    // Badges calculation
    let prioBadgeClass = 'badge-medium';
    if (prio === 'critical') prioBadgeClass = 'badge-critical';
    else if (prio === 'high') prioBadgeClass = 'badge-high';

    const card = document.createElement('div');
    card.className = `email-card ${isUnread ? 'unread' : ''} ${isSelected ? 'active' : ''}`;
    card.dataset.id = email.id;

    // Avatar initials
    const initials = (email.sender_name || 'EM')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    // Check for financial amount
    const amounts = ai.key_entities?.amounts || [];
    const amountHtml = amounts.length > 0
      ? `<span class="card-badge badge-money">${amounts[0]}</span>`
      : '';

    // Check for pending action items
    const pendingActions = (ai.action_items || []).filter(a => !a.completed).length;
    const actionHtml = pendingActions > 0
      ? `<span class="card-badge badge-action">⚡ ${pendingActions} ${pendingActions === 1 ? 'task' : 'tasks'}</span>`
      : '';

    card.innerHTML = `
      <div class="card-top-row">
        <div class="card-sender-group">
          <div class="sender-avatar-sm">${initials}</div>
          <span class="card-sender-name">${escapeHtml(email.sender_name || email.sender_email)}</span>
        </div>
        <span class="card-date">${formatRelativeTime(email.date)}</span>
      </div>

      <div class="card-subject">${escapeHtml(email.subject || '(No Subject)')}</div>

      <div class="card-ai-snippet">
        ${escapeHtml(ai.summary_tldr || email.snippet || '')}
      </div>

      <div class="card-tags-row">
        <span class="card-badge ${prioBadgeClass}">${ai.priority || 'Medium'} (${score})</span>
        <span class="card-badge">${escapeHtml(ai.category || 'General')}</span>
        ${(email.has_replied || (email.sent_replies && email.sent_replies.length > 0)) ? '<span class="card-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">✓ Replied</span>' : ''}
        ${actionHtml}
        ${amountHtml}
        ${email.attachments?.length > 0 ? `<span class="card-badge">📎 ${email.attachments.length}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      selectEmail(email.id);
    });

    container.appendChild(card);
  });
}

function updateSidebarBadges(allEmails) {
  const counts = {
    all: allEmails.length,
    urgent: 0,
    action: 0,
    work: 0,
    finance: 0,
    meeting: 0,
    personal: 0,
    newsletter: 0,
    promotions: 0,
    spam: 0
  };

  allEmails.forEach(e => {
    const cat = (e.ai_analysis?.category || '').toLowerCase();
    if (cat.includes('urgent') || cat.includes('incident')) counts.urgent++;
    else if (cat.includes('action')) counts.action++;
    else if (cat.includes('work') || cat.includes('project')) counts.work++;
    else if (cat.includes('finance') || cat.includes('billing')) counts.finance++;
    else if (cat.includes('meeting') || cat.includes('schedul')) counts.meeting++;
    else if (cat.includes('personal')) counts.personal++;
    else if (cat.includes('newsletter')) counts.newsletter++;
    else if (cat.includes('promot') || cat.includes('market')) counts.promotions++;
    else if (cat.includes('spam') || cat.includes('suspicious')) counts.spam++;
  });

  const setBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  };

  setBadge('cat-badge-all', counts.all);
  setBadge('cat-badge-urgent', counts.urgent);
  setBadge('cat-badge-action', counts.action);
  setBadge('cat-badge-work', counts.work);
  setBadge('cat-badge-finance', counts.finance);
  setBadge('hub-badge-finance', counts.finance);
  setBadge('cat-badge-meeting', counts.meeting);
  setBadge('cat-badge-personal', counts.personal);
  setBadge('cat-badge-newsletter', counts.newsletter);
  setBadge('cat-badge-promotions', counts.promotions);
  setBadge('cat-badge-spam', counts.spam);
}

// ============================================================================
// Email Selection & AI Inspector
// ============================================================================
async function selectEmail(emailId) {
  state.selectedEmailId = emailId;

  // Highlight in feed
  document.querySelectorAll('.email-card').forEach(c => {
    c.classList.toggle('active', c.dataset.id === emailId);
  });

  const email = state.emails.find(e => e.id === emailId);
  if (!email) return;

  elements.detailEmptyState.style.display = 'none';
  elements.detailActiveView.style.display = 'flex';

  // Mark as read automatically in UI
  if (email.is_unread) {
    email.is_unread = false;
    updateReadStatus(emailId, false);
  }

  // Update Toolbar
  elements.readToggleText.textContent = email.is_unread ? 'Mark Read' : 'Mark Unread';
  elements.readToggleIcon.textContent = email.is_unread ? '✉️' : '📩';

  // Replied status badge
  if (elements.detailRepliedBadge) {
    if (email.has_replied || (email.sent_replies && email.sent_replies.length > 0)) {
      elements.detailRepliedBadge.style.display = 'inline-flex';
      elements.detailRepliedBadge.textContent = `✓ Replied (${email.last_reply_at || 'Sent'})`;
    } else {
      elements.detailRepliedBadge.style.display = 'none';
    }
  }

  const ai = email.ai_analysis || {};

  // Quick Calendar Scheduler Link
  if (elements.btnQuickSchedule) {
    const cal = ai.calendar_event || {};
    if (cal.google_calendar_url) {
      elements.btnQuickSchedule.href = cal.google_calendar_url;
    } else {
      const gcalSubject = encodeURIComponent(`Discussion: ${email.subject || 'Email'}`);
      const gcalDetails = encodeURIComponent(`Discussion with ${email.sender_name || 'Sender'} (${email.sender_email || ''})\n\nAI Summary:\n${ai.summary_tldr || ''}`);
      elements.btnQuickSchedule.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalSubject}&details=${gcalDetails}`;
    }
  }

  const prio = ai.priority || 'Medium';
  const score = ai.priority_score || 50;

  elements.priorityScoreVal.textContent = `${prio} (${score}/100)`;
  if (['critical', 'high'].includes(prio.toLowerCase())) {
    elements.priorityScoreVal.style.color = 'var(--status-critical)';
  } else if (prio.toLowerCase() === 'medium') {
    elements.priorityScoreVal.style.color = 'var(--status-medium)';
  } else {
    elements.priorityScoreVal.style.color = 'var(--status-low)';
  }

  // Security / Phishing Banner
  if (ai.phishing_warning) {
    elements.securityWarning.style.display = 'flex';
    elements.securityWarningMsg.textContent = ai.phishing_warning;
  } else {
    elements.securityWarning.style.display = 'none';
  }

  // Subject and Sender Details
  elements.detailSubject.textContent = email.subject || '(No Subject)';
  elements.detailSenderName.textContent = email.sender_name || email.sender_email;
  elements.detailSenderEmail.textContent = email.sender_email;
  elements.detailDateDisplay.textContent = email.date_display || email.date;
  elements.detailCategoryBadge.textContent = ai.category || 'General';

  const initials = (email.sender_name || 'EM')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  elements.detailSenderAvatar.textContent = initials;

  // Attachments
  if (email.attachments && email.attachments.length > 0) {
    elements.detailAttachmentsStrip.style.display = 'flex';
    elements.detailAttachmentsList.innerHTML = email.attachments.map((att, idx) => `
      <div class="attachment-pill">
        <span>📎</span>
        <span>${escapeHtml(att.name)}</span>
        <span style="color: var(--text-muted); font-size: 10px;">(${att.size})</span>
        <button class="att-insight-btn" onclick="openAttachmentViewer('${email.id}', ${idx})">✦ AI Insight</button>
      </div>
    `).join('');
  } else {
    elements.detailAttachmentsStrip.style.display = 'none';
  }

  // AI Intelligence Panel
  elements.detailEngineTag.textContent = ai.engine === 'gemini-ai' ? '✦ Gemini AI Analysis' : '✦ NLP Heuristic Engine';
  elements.detailTldr.textContent = ai.summary_tldr || 'No summary available.';

  // Multi-Agent Deliberation Council (5 Domain Experts)
  const council = ai.agent_council;
  if (council && elements.councilBox) {
    elements.councilBox.style.display = 'block';

    if (council.sentinel && elements.badgeSentinel && elements.verdictSentinel) {
      elements.badgeSentinel.textContent = council.sentinel.status || 'Verified';
      elements.badgeSentinel.className = 'council-badge ' + (council.sentinel.badge_class || 'badge-green');
      elements.verdictSentinel.textContent = council.sentinel.verdict || '';
    }

    if (council.career && elements.badgeCareer && elements.verdictCareer) {
      elements.badgeCareer.textContent = council.career.status || 'Standard';
      elements.badgeCareer.className = 'council-badge ' + (council.career.badge_class || 'badge-purple');
      elements.verdictCareer.textContent = council.career.verdict || '';
    }

    if (council.finops && elements.badgeFinops && elements.verdictFinops) {
      elements.badgeFinops.textContent = council.finops.status || 'Clear';
      elements.badgeFinops.className = 'council-badge ' + (council.finops.badge_class || 'badge-gray');
      elements.verdictFinops.textContent = council.finops.verdict || '';
    }

    if (council.ghostwriter && elements.badgeGhostwriter && elements.verdictGhostwriter) {
      elements.badgeGhostwriter.textContent = council.ghostwriter.status || 'Ready';
      elements.badgeGhostwriter.className = 'council-badge ' + (council.ghostwriter.badge_class || 'badge-cyan');
      elements.verdictGhostwriter.textContent = council.ghostwriter.verdict || '';
    }

    if (council.critic && elements.badgeCritic && elements.verdictCritic) {
      elements.badgeCritic.textContent = council.critic.status || 'Verified';
      elements.badgeCritic.className = 'council-badge ' + (council.critic.badge_class || 'badge-blue');
      elements.verdictCritic.textContent = council.critic.verdict || '';
    }
  } else if (elements.councilBox) {
    elements.councilBox.style.display = 'none';
  }

  // Cognitive Subtext & Intent HUD
  const subtext = ai.subtext_analysis || {};
  if (elements.subtextCard) {
    const score = subtext.passive_aggression_score !== undefined ? subtext.passive_aggression_score : 15;
    elements.subtextGaugeFill.style.width = `${score}%`;
    elements.subtextGaugeVal.textContent = `${score}%`;
    elements.subtextUrgency.textContent = subtext.hidden_urgency || 'Normal';
    elements.subtextPower.textContent = subtext.power_dynamic || 'Collaborative';
    elements.subtextDecoded.textContent = subtext.decoded_intent || 'Direct communication with no hidden agenda.';
    elements.subtextAdvice.textContent = subtext.strategic_advice || 'A standard response is sufficient.';

    if (score >= 70) {
      elements.subtextGaugeFill.style.background = 'var(--status-critical)';
      elements.subtextUrgency.className = 'subtext-pill pill-urgency';
    } else if (score >= 40) {
      elements.subtextGaugeFill.style.background = 'var(--status-high)';
      elements.subtextUrgency.className = 'subtext-pill pill-power';
    } else {
      elements.subtextGaugeFill.style.background = 'var(--status-success)';
      elements.subtextUrgency.className = 'subtext-pill';
    }
  }

  // Key Takeaways
  elements.detailTakeawaysList.innerHTML = (ai.key_points || []).map(kp => `
    <li>${escapeHtml(kp)}</li>
  `).join('');

  // Action Items Checklist
  const actions = ai.action_items || [];
  elements.detailActionCount.textContent = `${actions.length} ${actions.length === 1 ? 'task' : 'tasks'}`;

  if (actions.length > 0) {
    elements.detailActionsBox.style.display = 'block';
    elements.detailActionsList.innerHTML = actions.map((act, idx) => `
      <div class="action-item-row ${act.completed ? 'completed' : ''}" data-idx="${idx}">
        <input type="checkbox" class="action-checkbox" ${act.completed ? 'checked' : ''} data-idx="${idx}">
        <div class="action-content">
          <div class="action-task-title">${escapeHtml(act.task)}</div>
          <div class="action-meta-row">
            <span class="action-deadline">Deadline: ${escapeHtml(act.deadline || 'None')}</span>
            <span class="action-deadline" style="color: var(--text-muted);">Urgency: ${act.urgency || 'Normal'}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind checkboxes
    elements.detailActionsList.querySelectorAll('.action-checkbox').forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const taskIdx = parseInt(e.target.dataset.idx, 10);
        const isChecked = e.target.checked;
        await toggleActionItem(emailId, taskIdx, isChecked);
      });
    });
  } else {
    elements.detailActionsBox.style.display = 'none';
  }

  // Entities Chips
  const entities = ai.key_entities || {};
  const chips = [];

  (entities.amounts || []).forEach(amt => {
    chips.push(`<span class="entity-pill pill-money">💰 ${escapeHtml(amt)}</span>`);
  });
  (entities.dates_and_times || []).forEach(dt => {
    chips.push(`<span class="entity-pill pill-date">📅 ${escapeHtml(dt)}</span>`);
  });
  if (entities.sender_organization && entities.sender_organization !== 'External') {
    chips.push(`<span class="entity-pill">🏢 ${escapeHtml(entities.sender_organization)}</span>`);
  }
  (entities.links_or_resources || []).forEach(link => {
    chips.push(`<span class="entity-pill">🔗 <a href="${escapeHtml(link)}" target="_blank" style="color: inherit; text-decoration: underline;">${escapeHtml(link.substring(0, 30))}...</a></span>`);
  });

  if (chips.length > 0) {
    elements.detailEntitiesBox.style.display = 'block';
    elements.detailEntitiesChips.innerHTML = chips.join('');
  } else {
    elements.detailEntitiesBox.style.display = 'none';
  }

  // 1-Click Calendar Scheduling Banner
  const cal = ai.calendar_event || {};
  if (cal.has_event && elements.calendarBanner) {
    elements.calendarBanner.style.display = 'flex';
    elements.calBannerTitle.textContent = cal.title || 'Meeting Detected';
    elements.calBannerSub.textContent = `Proposed slot: ${cal.time_snippet || 'Found in thread'}`;
    elements.btnAddGcal.href = cal.google_calendar_url || '#';

    elements.btnDownloadIcs.onclick = () => {
      const blob = new Blob([cal.ics_content || 'BEGIN:VCALENDAR\nEND:VCALENDAR'], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(email.subject || 'meeting').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ .ics calendar file downloaded', 'success');
    };
  } else if (elements.calendarBanner) {
    elements.calendarBanner.style.display = 'none';
  }

  // Smart Suggested Replies
  const replies = ai.smart_replies || [];
  if (replies.length > 0) {
    elements.detailSmartReplies.innerHTML = replies.map((r, i) => `
      <button class="smart-reply-btn" data-index="${i}">
        <span>${escapeHtml(r.label)}</span>
      </button>
    `).join('');

    // Set first reply into composer
    elements.replyTextarea.value = replies[0].body || '';

    elements.detailSmartReplies.querySelectorAll('.smart-reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        elements.replyTextarea.value = replies[idx].body || '';
        showToast(`Loaded draft: "${replies[idx].label}"`, 'info');
      });
    });
  }

  // Reset and render Ask AI Chat Thread
  elements.askAiInput.value = '';
  renderChatThread(email);

  // Original Body Display
  updateOriginalBodyDisplay(email);
}

function renderChatThread(email) {
  if (!elements.askAiChatThread) return;
  const history = email.chat_history || [];
  if (history.length === 0) {
    elements.askAiChatThread.style.display = 'none';
    elements.askAiChatThread.innerHTML = '';
    return;
  }

  elements.askAiChatThread.style.display = 'flex';
  elements.askAiChatThread.innerHTML = history.map(msg => `
    <div class="chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}">
      <div style="font-size: 10px; font-weight: 700; margin-bottom: 2px; opacity: 0.8;">${msg.role === 'user' ? 'You' : '✦ AI Assistant'}</div>
      <div>${escapeHtml(msg.content)}</div>
    </div>
  `).join('');
  elements.askAiChatThread.scrollTop = elements.askAiChatThread.scrollHeight;
}

function updateOriginalBodyDisplay(email) {
  if (state.originalBodyTab === 'html' && email.body_html) {
    elements.originalBodyDisplay.innerHTML = sanitizeHtmlContent(email.body_html);
  } else {
    elements.originalBodyDisplay.textContent = email.body_plain || '(Empty body)';
  }
}

function sanitizeHtmlContent(html) {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, meta, base, form').forEach(el => el.remove());
    doc.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.toLowerCase().startsWith('on') || attr.value.toLowerCase().includes('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  } catch (e) {
    return escapeHtml(html);
  }
}

function exportTasksToClipboard() {
  const email = state.emails.find(e => e.id === state.selectedEmailId);
  if (!email || !email.ai_analysis?.action_items?.length) {
    showToast('No action items in this email', 'info');
    return;
  }
  const lines = [`# Action Items from: ${email.subject || 'Email'}`];
  email.ai_analysis.action_items.forEach(act => {
    const check = act.completed ? '[x]' : '[ ]';
    const deadline = act.deadline && act.deadline !== 'None' ? ` (Due: ${act.deadline})` : '';
    lines.push(`- ${check} ${act.task}${deadline}`);
  });
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    showToast('✓ Action items checklist copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Checklist ready to copy', 'info');
  });
}

// 5-Second Undo Send & Real Dispatch Manager
let pendingSendTimeout = null;
let pendingSendToast = null;
let countdownInterval = null;

function handleSendReply(mode = 'send') {
  const bodyText = elements.replyTextarea.value.trim();
  if (!bodyText) {
    showToast('Please type or select a reply draft first.', 'error');
    return;
  }
  if (!state.selectedEmailId) return;

  if (mode === 'draft') {
    executeSendOrDraft(state.selectedEmailId, bodyText, 'draft');
    return;
  }

  // Clear any existing active send timer
  if (pendingSendTimeout) {
    clearTimeout(pendingSendTimeout);
    clearInterval(countdownInterval);
    if (pendingSendToast) pendingSendToast.remove();
  }

  const emailId = state.selectedEmailId;
  let remainingSeconds = 5;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderColor = 'var(--accent-primary)';

  const updateToastHtml = () => {
    toast.innerHTML = `
      <span>⏳</span>
      <span>Sending reply in <b>${remainingSeconds}s</b>...</span>
      <button class="undo-countdown-btn" id="btn-undo-send">Undo</button>
    `;
    const undoBtn = toast.querySelector('#btn-undo-send');
    if (undoBtn) {
      undoBtn.onclick = () => {
        clearInterval(countdownInterval);
        clearTimeout(pendingSendTimeout);
        pendingSendTimeout = null;
        toast.remove();
        showToast('Sending cancelled.', 'info');
      };
    }
  };

  updateToastHtml();
  elements.toastContainer.appendChild(toast);
  pendingSendToast = toast;

  countdownInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds > 0) {
      updateToastHtml();
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);

  pendingSendTimeout = setTimeout(() => {
    clearInterval(countdownInterval);
    if (toast) toast.remove();
    executeSendOrDraft(emailId, bodyText, 'send');
    pendingSendTimeout = null;
  }, 5000);
}

async function executeSendOrDraft(emailId, bodyText, mode) {
  try {
    const res = await fetch(`/api/emails/${emailId}/send-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: bodyText, mode: mode })
    });
    const data = await res.json();
    if (data.success) {
      showToast(mode === 'draft' ? '✓ Draft saved to mailbox' : (data.simulated ? '✓ Simulated reply sent to recipient' : '✓ Reply sent successfully via SMTP!'), 'success');
    } else {
      showToast(`Send failed: ${data.message || 'Server error'}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// ============================================================================
// Actions & Handlers
// ============================================================================
async function toggleActionItem(emailId, taskIndex, completed) {
  try {
    const res = await fetch(`/api/emails/${emailId}/toggle-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_index: taskIndex, completed })
    });
    if (!res.ok) throw new Error('Failed to update task');
    const updated = await res.json();

    // Update in memory state
    const idx = state.emails.findIndex(e => e.id === emailId);
    if (idx !== -1) state.emails[idx] = updated;

    // Update card visually
    const row = elements.detailActionsList.querySelector(`[data-idx="${taskIndex}"]`);
    if (row) row.classList.toggle('completed', completed);

    await loadStatus();
    showToast(completed ? '✓ Task marked completed' : 'Task reopened', 'success');
  } catch (err) {
    showToast(`Error updating task: ${err.message}`, 'error');
  }
}

async function updateReadStatus(emailId, isUnread) {
  try {
    await fetch(`/api/emails/${emailId}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_unread: isUnread })
    });
    await loadStatus();
  } catch (err) {
    console.error('Error toggling read status:', err);
  }
}

async function syncInbox() {
  const syncBtn = elements.btnSync;
  const icon = syncBtn.querySelector('svg');
  const text = document.getElementById('sync-button-text');

  if (icon) icon.classList.add('spinning');
  text.textContent = 'Syncing...';
  syncBtn.disabled = true;

  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Sync failed');
    }
    const data = await res.json();
    if (data.message && data.count === 0) {
      showToast(data.message, 'info');
    } else {
      showToast(`✓ Synced ${data.count} emails from ${data.source}`, 'success');
    }
    if (data.dispatched_alerts && data.dispatched_alerts.length > 0) {
      showToast(`📱 ${data.dispatched_alerts.length} urgent alert(s) pushed to mobile!`, 'info');
    }
    await loadStatus();
    await loadEmails();

    if (state.emails.length > 0) {
      selectEmail(state.emails[0].id);
    }
  } catch (err) {
    showToast(`Sync Failed: ${err.message}`, 'error');
  } finally {
    if (icon) icon.classList.remove('spinning');
    text.textContent = 'Sync Inbox';
    syncBtn.disabled = false;
  }
}

async function reanalyzeEmail() {
  if (!state.selectedEmailId) return;
  const btn = elements.btnReanalyze;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Analyzing...`;
  btn.disabled = true;

  try {
    const res = await fetch(`/api/emails/${state.selectedEmailId}/analyze`, { method: 'POST' });
    if (!res.ok) throw new Error('Analysis failed');
    const updated = await res.json();

    const idx = state.emails.findIndex(e => e.id === state.selectedEmailId);
    if (idx !== -1) state.emails[idx] = updated;

    selectEmail(state.selectedEmailId);
    renderEmailFeed();
    showToast('✓ AI Re-analysis completed', 'success');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

async function pushEmailToPhone() {
  if (!state.selectedEmailId) return;
  const btn = elements.btnPushMobile;
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Pushing...`;
  btn.disabled = true;

  try {
    const res = await fetch(`/api/emails/${state.selectedEmailId}/notify-mobile`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to dispatch alert');
    const result = await res.json();

    const tg = result.channels && result.channels.telegram;
    const wh = result.channels && result.channels.webhook;
    const sms = result.channels && result.channels.sms;

    if (sms && sms.success) {
      if (sms.status === 'SENT_VIA_FAST2SMS') {
        showToast('💬 SMS alert sent via Fast2SMS to +91 9392709150!', 'success');
      } else if (sms.status === 'SENT_VIA_TWILIO') {
        showToast('💬 SMS alert sent via Twilio to +91 9392709150!', 'success');
      } else {
        showToast('💬 SMS alert queued in outbox for +91 9392709150!', 'success');
      }
    } else if (tg && tg.success) {
      showToast('📱 Dispatched live alert to Telegram!', 'success');
    } else if (wh && wh.success) {
      showToast('📱 Dispatched mobile alert to WhatsApp / Webhook!', 'success');
    } else if (result.simulated) {
      showToast('💬 Alert dispatched to Cellular Outbox (+91 9392709150)', 'info');
    } else {
      showToast(result.reason || 'Mobile alert processed', 'info');
    }
  } catch (err) {
    showToast(`Error sending mobile alert: ${err.message}`, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

async function askAiQuestion() {
  const q = elements.askAiInput.value.trim();
  if (!q || !state.selectedEmailId) return;

  const btn = elements.btnAskAi;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span>`;

  const email = state.emails.find(e => e.id === state.selectedEmailId);
  if (email) {
    if (!email.chat_history) email.chat_history = [];
    email.chat_history.push({ role: 'user', content: q });
    renderChatThread(email);
  }

  elements.askAiInput.value = '';

  try {
    const res = await fetch(`/api/emails/${state.selectedEmailId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q })
    });
    if (!res.ok) throw new Error('AI query failed');
    const data = await res.json();

    if (email) {
      email.chat_history = data.chat_history || email.chat_history;
      renderChatThread(email);
    }
  } catch (err) {
    showToast(`AI Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Ask AI</span>';
  }
}

// ============================================================================
// Executive Daily Briefing Modal
// ============================================================================
async function openBriefingModal() {
  elements.modalBriefing.style.display = 'flex';
  elements.briefingNarrative.textContent = 'Synthesizing executive intelligence...';

  try {
    const res = await fetch('/api/briefing');
    if (!res.ok) throw new Error('Failed to generate briefing');
    const b = await res.json();

    elements.briefingDateTitle.textContent = `Executive Daily Briefing (${b.generated_at})`;
    elements.briefingStatTotal.textContent = b.total_emails;
    elements.briefingStatUrgent.textContent = b.urgent_count;
    elements.briefingStatActions.textContent = b.pending_actions_count;
    elements.briefingStatBilling.textContent = b.total_invoices_usd;
    elements.briefingNarrative.textContent = b.executive_summary;

    // Urgent items
    elements.briefingUrgentList.innerHTML = (b.urgent_items || []).map(item => `
      <div class="urgent-item-row">
        <div class="urgent-item-title">[${item.priority.toUpperCase()}] ${escapeHtml(item.subject)}</div>
        <div class="urgent-item-desc">${escapeHtml(item.summary)}</div>
      </div>
    `).join('');

    // Strategic Recommendations
    elements.briefingRecList.innerHTML = (b.recommendations || []).map(r => `
      <li>${escapeHtml(r)}</li>
    `).join('');

    // Pre-load Morning Podcast Show
    loadPodcastPreview();
  } catch (err) {
    elements.briefingNarrative.textContent = `Error loading briefing: ${err.message}`;
  }
}

// Two-Host Conversational Morning Podcast Show Manager
let isPlayingPodcast = false;
let podcastScript = [];

async function loadPodcastPreview() {
  if (!elements.podcastScriptBox) return;
  try {
    const res = await fetch('/api/briefing/podcast');
    if (res.ok) {
      const data = await res.json();
      podcastScript = data.script || [];
      elements.podcastScriptBox.innerHTML = podcastScript.map((line, idx) => `
        <div class="podcast-line" id="podcast-line-${idx}">
          <span class="host-tag ${line.speaker.toLowerCase()}">${line.speaker}:</span>
          <span>"${escapeHtml(line.text)}"</span>
        </div>
      `).join('');
    }
  } catch (e) {
    console.warn('Failed to load podcast script:', e);
  }
}

async function togglePodcast() {
  if (isPlayingPodcast) {
    window.speechSynthesis.cancel();
    isPlayingPodcast = false;
    if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '▶';
    if (elements.podcastPlayText) elements.podcastPlayText.textContent = 'Play Morning Show';
    return;
  }

  if (!podcastScript || podcastScript.length === 0) {
    await loadPodcastPreview();
  }

  if (podcastScript.length === 0) {
    showToast('Podcast script is being generated...', 'info');
    return;
  }

  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported on this browser.', 'info');
    return;
  }

  window.speechSynthesis.cancel();
  isPlayingPodcast = true;
  if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '⏸';
  if (elements.podcastPlayText) elements.podcastPlayText.textContent = 'Pause Show';

  playPodcastLine(0);
}

function playPodcastLine(index) {
  if (!isPlayingPodcast || index >= podcastScript.length) {
    isPlayingPodcast = false;
    if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '▶';
    if (elements.podcastPlayText) elements.podcastPlayText.textContent = 'Replay Show';
    document.querySelectorAll('.podcast-line').forEach(l => l.style.opacity = '1');
    return;
  }

  document.querySelectorAll('.podcast-line').forEach(l => l.style.opacity = '0.45');
  const activeLineEl = document.getElementById(`podcast-line-${index}`);
  if (activeLineEl) {
    activeLineEl.style.opacity = '1';
    activeLineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const line = podcastScript[index];
  const utterance = new SpeechSynthesisUtterance(line.text);
  if (line.speaker.toLowerCase() === 'alex') {
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
  } else {
    utterance.pitch = 1.25;
    utterance.rate = 1.05;
  }

  utterance.onend = () => {
    if (isPlayingPodcast) playPodcastLine(index + 1);
  };
  utterance.onerror = () => {
    if (isPlayingPodcast) playPodcastLine(index + 1);
  };

  window.speechSynthesis.speak(utterance);
}

// Theme Engine (Dark Glass, Minimal Light, Pure OLED Black)
function initTheme() {
  const saved = localStorage.getItem('antigravity_theme') || 'theme-dark';
  applyTheme(saved);
}

function cycleTheme() {
  const current = document.body.classList.contains('theme-light') ? 'theme-light' :
                  (document.body.classList.contains('theme-oled') ? 'theme-oled' : 'theme-dark');
  let next = 'theme-dark';
  if (current === 'theme-dark') next = 'theme-light';
  else if (current === 'theme-light') next = 'theme-oled';
  else next = 'theme-dark';

  applyTheme(next);
  showToast(`Theme switched to ${next.replace('theme-', '').toUpperCase()}`, 'info');
}

function applyTheme(themeName) {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-oled');
  document.body.classList.add(themeName);
  localStorage.setItem('antigravity_theme', themeName);

  if (elements.themeIndicatorIcon) {
    if (themeName === 'theme-light') elements.themeIndicatorIcon.textContent = '☀️';
    else if (themeName === 'theme-oled') elements.themeIndicatorIcon.textContent = '⚡';
    else elements.themeIndicatorIcon.textContent = '🌙';
  }
}

function speakBriefing() {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech is not supported in this browser.', 'error');
    return;
  }

  if (state.isSpeaking) {
    window.speechSynthesis.cancel();
    state.isSpeaking = false;
    elements.speakBtnText.textContent = 'Read Aloud (Voice)';
    return;
  }

  const textToRead = `${elements.briefingNarrative.textContent}. Immediate recommendations: ${Array.from(elements.briefingRecList.querySelectorAll('li')).map(l => l.textContent).join('. ')}`;
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    state.isSpeaking = false;
    elements.speakBtnText.textContent = 'Read Aloud (Voice)';
  };
  utterance.onerror = () => {
    state.isSpeaking = false;
    elements.speakBtnText.textContent = 'Read Aloud (Voice)';
  };

  window.speechSynthesis.speak(utterance);
  state.isSpeaking = true;
  elements.speakBtnText.textContent = 'Stop Speaking';
}

// ============================================================================
// Settings & Configuration Modal
// ============================================================================
async function openSettingsModal() {
  elements.modalSettings.style.display = 'flex';
  elements.testConnResult.style.display = 'none';
  elements.testSmailResult.style.display = 'none';

  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to load settings');
    const cfg = await res.json();
    state.config = cfg;

    if (cfg.mailbox_type === 'smail') {
      elements.segSmail.classList.add('active');
      elements.segDemo.classList.remove('active');
      elements.segImap.classList.remove('active');
      elements.smailSection.style.display = 'flex';
      elements.imapSection.style.display = 'none';
    } else if (cfg.mailbox_type === 'imap') {
      elements.segImap.classList.add('active');
      elements.segDemo.classList.remove('active');
      elements.segSmail.classList.remove('active');
      elements.smailSection.style.display = 'none';
      elements.imapSection.style.display = 'flex';
    } else {
      elements.segDemo.classList.add('active');
      elements.segSmail.classList.remove('active');
      elements.segImap.classList.remove('active');
      elements.smailSection.style.display = 'none';
      elements.imapSection.style.display = 'none';
    }

    elements.inputSmailUrl.value = cfg.smail_script_url || '';
    elements.inputSmailToken.value = cfg.smail_token || 'iitm_smail_secret_2026';
    elements.inputGeminiKey.value = cfg.gemini_api_key || '';
    elements.inputImapHost.value = cfg.imap_host || 'imap.gmail.com';
    elements.inputImapPort.value = cfg.imap_port || 993;
    elements.inputImapUser.value = cfg.imap_user || '';
    elements.inputImapPassword.value = cfg.has_imap_password ? '' : '';
    elements.inputFetchCount.value = cfg.fetch_count || 15;

    // Mobile Alerts configuration
    if (elements.inputEnableMobileAlerts) {
      elements.inputEnableMobileAlerts.checked = cfg.enable_mobile_alerts !== false;
    }
    if (elements.inputTelegramToken) {
      elements.inputTelegramToken.value = '';
      if (cfg.has_telegram_bot_token) {
        elements.inputTelegramToken.placeholder = cfg.telegram_bot_token;
      } else {
        elements.inputTelegramToken.placeholder = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ';
      }
    }
    if (elements.inputTelegramChat) {
      elements.inputTelegramChat.value = cfg.telegram_chat_id || '';
    }
    if (elements.inputWhatsappWebhook) {
      elements.inputWhatsappWebhook.value = cfg.whatsapp_webhook_url || '';
    }
    if (elements.selectNotifyPriority && cfg.notify_min_priority) {
      elements.selectNotifyPriority.value = cfg.notify_min_priority;
    }

    // Direct Cellular SMS Alerts (+91 9392709150)
    if (elements.checkEnableSmsAlerts) {
      elements.checkEnableSmsAlerts.checked = cfg.sms_alerts_enabled !== false;
    }
    if (elements.inputSmsPhone) {
      elements.inputSmsPhone.value = cfg.sms_recipient_phone || '+919392709150';
    }
    if (elements.selectSmsProvider && cfg.sms_provider) {
      elements.selectSmsProvider.value = cfg.sms_provider;
      if (elements.smsProviderFast2smsBox) {
        elements.smsProviderFast2smsBox.style.display = (cfg.sms_provider === 'fast2sms') ? 'block' : 'none';
      }
      if (elements.smsProviderTwilioBox) {
        elements.smsProviderTwilioBox.style.display = (cfg.sms_provider === 'twilio') ? 'block' : 'none';
      }
    }
  } catch (err) {
    showToast(`Error loading settings: ${err.message}`, 'error');
  }
}

async function saveSettings() {
  const isSmail = elements.segSmail.classList.contains('active');
  const isImap = elements.segImap.classList.contains('active');
  const isDemo = elements.segDemo.classList.contains('active');

  const smailUrl = elements.inputSmailUrl.value.trim();
  const smailToken = elements.inputSmailToken.value.trim();

  let finalDemo = isDemo;
  let mailboxType = 'demo';
  if (isSmail && smailUrl) {
    finalDemo = false;
    mailboxType = 'smail';
  } else if (isImap && elements.inputImapUser.value.trim()) {
    finalDemo = false;
    mailboxType = 'imap';
  }

  const payload = {
    mailbox_type: mailboxType,
    demo_mode: finalDemo,
    smail_script_url: smailUrl,
    smail_token: smailToken || 'iitm_smail_secret_2026',
    imap_host: elements.inputImapHost.value.trim(),
    imap_port: parseInt(elements.inputImapPort.value, 10) || 993,
    imap_user: elements.inputImapUser.value.trim(),
    fetch_count: parseInt(elements.inputFetchCount.value, 10) || 15,
    enable_mobile_alerts: elements.inputEnableMobileAlerts ? elements.inputEnableMobileAlerts.checked : true,
    telegram_chat_id: elements.inputTelegramChat ? elements.inputTelegramChat.value.trim() : '',
    whatsapp_webhook_url: elements.inputWhatsappWebhook ? elements.inputWhatsappWebhook.value.trim() : '',
    notify_min_priority: elements.selectNotifyPriority ? elements.selectNotifyPriority.value : 'High',
    sms_alerts_enabled: elements.checkEnableSmsAlerts ? elements.checkEnableSmsAlerts.checked : true,
    sms_recipient_phone: elements.inputSmsPhone ? elements.inputSmsPhone.value.trim() : '+919392709150',
    sms_provider: elements.selectSmsProvider ? elements.selectSmsProvider.value : 'fast2sms'
  };

  const smsKey = elements.inputSmsFast2smsKey ? elements.inputSmsFast2smsKey.value.trim() : '';
  if (smsKey && !smsKey.includes('••••')) {
    payload.sms_api_key = smsKey;
  }
  if (elements.inputSmsTwilioSid && elements.inputSmsTwilioSid.value.trim()) {
    payload.sms_twilio_account_sid = elements.inputSmsTwilioSid.value.trim();
  }
  if (elements.inputSmsTwilioToken && elements.inputSmsTwilioToken.value.trim() && !elements.inputSmsTwilioToken.value.includes('••••')) {
    payload.sms_twilio_auth_token = elements.inputSmsTwilioToken.value.trim();
  }
  if (elements.inputSmsTwilioFrom && elements.inputSmsTwilioFrom.value.trim()) {
    payload.sms_twilio_from = elements.inputSmsTwilioFrom.value.trim();
  }

  const tgToken = elements.inputTelegramToken ? elements.inputTelegramToken.value.trim() : '';
  if (tgToken && !tgToken.includes('••••')) {
    payload.telegram_bot_token = tgToken;
  }

  const pwd = elements.inputImapPassword.value.trim();
  if (pwd) payload.imap_password = pwd;

  const key = elements.inputGeminiKey.value.trim();
  if (key && !key.includes('••••')) payload.gemini_api_key = key;

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save settings');

    elements.modalSettings.style.display = 'none';
    showToast('✓ Settings updated successfully', 'success');
    await loadStatus();

    // Automatically trigger sync if Smail or Live IMAP was configured
    if (!finalDemo && (smailUrl || payload.imap_user)) {
      showToast(isSmail ? 'Syncing your IITM Smail...' : 'Syncing inbox...', 'info');
      await syncInbox();
    }
  } catch (err) {
    showToast(`Error saving settings: ${err.message}`, 'error');
  }
}

async function testSmail() {
  const btn = elements.btnTestSmail;
  const resBox = elements.testSmailResult;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Connecting to Smail Gateway...`;
  resBox.style.display = 'none';

  const payload = {
    smail_script_url: elements.inputSmailUrl.value.trim(),
    smail_token: elements.inputSmailToken.value.trim()
  };

  try {
    const res = await fetch('/api/config/test-smail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    resBox.style.display = 'block';

    if (result.success) {
      resBox.className = 'connection-status-box success';
      resBox.textContent = `✓ ${result.message}`;
    } else {
      resBox.className = 'connection-status-box error';
      resBox.textContent = `✕ ${result.message || result.detail || 'Connection failed'}`;
    }
  } catch (err) {
    resBox.style.display = 'block';
    resBox.className = 'connection-status-box error';
    resBox.textContent = `✕ Connection test error: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Test Smail Gateway</span>';
  }
}

async function testImap() {
  const btn = elements.btnTestImap;
  const resBox = elements.testConnResult;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Connecting to IMAP...`;
  resBox.style.display = 'none';

  const payload = {
    imap_host: elements.inputImapHost.value.trim(),
    imap_port: parseInt(elements.inputImapPort.value, 10) || 993,
    imap_user: elements.inputImapUser.value.trim(),
    imap_password: elements.inputImapPassword.value.trim()
  };

  try {
    const res = await fetch('/api/config/test-imap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    resBox.style.display = 'block';

    if (result.success) {
      resBox.className = 'connection-status-box success';
      resBox.textContent = `✓ ${result.message}`;
      // Auto switch to Live IMAP tab on successful test
      elements.segImap.classList.add('active');
      elements.segDemo.classList.remove('active');
    } else {
      resBox.className = 'connection-status-box error';
      resBox.textContent = `✕ ${result.message}`;
    }
  } catch (err) {
    resBox.style.display = 'block';
    resBox.className = 'connection-status-box error';
    resBox.textContent = `✕ Connection test error: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Test IMAP Connection</span>';
  }
}

async function testMobileAlert() {
  const btn = elements.btnTestMobileAlert;
  const resBox = elements.testMobileResult;
  if (!btn || !resBox) return;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Pinging Mobile Bridge...`;
  resBox.style.display = 'none';

  const tgTok = elements.inputTelegramToken ? elements.inputTelegramToken.value.trim() : '';
  const payload = {
    telegram_chat_id: elements.inputTelegramChat ? elements.inputTelegramChat.value.trim() : '',
    whatsapp_webhook_url: elements.inputWhatsappWebhook ? elements.inputWhatsappWebhook.value.trim() : ''
  };
  if (tgTok && !tgTok.includes('••••')) {
    payload.telegram_bot_token = tgTok;
  }

  try {
    const res = await fetch('/api/config/test-mobile-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    resBox.style.display = 'block';

    const tg = result.channels && result.channels.telegram;
    const wh = result.channels && result.channels.webhook;

    if (tg && tg.success) {
      resBox.className = 'connection-status-box success';
      resBox.innerHTML = `<b>✓ Live Telegram Alert Delivered!</b> (Msg ID: ${tg.message_id}) Check your phone!`;
      showToast('📱 Telegram ping received successfully!', 'success');
    } else if (wh && wh.success) {
      resBox.className = 'connection-status-box success';
      resBox.innerHTML = `<b>✓ Webhook / WhatsApp Push Successful!</b> Status: ${wh.status_code}`;
      showToast('📱 Mobile webhook alert sent successfully!', 'success');
    } else if (result.simulated) {
      resBox.className = 'connection-status-box info';
      resBox.innerHTML = `<b>⚡ Simulated Mobile Push Verified:</b><br><small style="color:var(--text-secondary);">${result.simulation_message}</small><br><span style="color:#a5b4fc;font-size:11px;">Tip: Add your Telegram Bot Token & Chat ID above to receive real alerts on your smartphone.</span>`;
      showToast('📱 Test alert simulated successfully', 'info');
    } else {
      resBox.className = 'connection-status-box error';
      resBox.textContent = `✕ Failed to dispatch test alert`;
    }
  } catch (err) {
    resBox.style.display = 'block';
    resBox.className = 'connection-status-box error';
    resBox.textContent = `✕ Error testing mobile alert: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>📱 Send Test Mobile Ping</span>';
  }
}

// ============================================================================
// Feature Upgrades: Ask Inbox AI, Finance Hub, Compose & Autonomous Watcher
// ============================================================================

// 1. Ask Entire Inbox AI
function openAskInboxModal(initialPrompt = '') {
  if (!elements.modalAskInbox) return;
  elements.modalAskInbox.style.display = 'flex';
  if (initialPrompt) {
    if (elements.inputAskInbox) elements.inputAskInbox.value = initialPrompt;
    submitAskInboxQuery(initialPrompt);
  } else {
    setTimeout(() => { if (elements.inputAskInbox) elements.inputAskInbox.focus(); }, 50);
  }
}

function formatMarkdownToCards(rawText) {
  if (!rawText) return 'No analysis returned.';
  let html = escapeHtml(rawText);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let result = [];
  let inCard = false;
  let cardContent = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inCard) {
        result.push(`<div class="result-item-card">${cardContent.join('<br>')}</div>`);
        cardContent = [];
        inCard = false;
      }
      continue;
    }

    if (trimmed.match(/^(?:<strong>)?\d+\./)) {
      if (inCard) {
        result.push(`<div class="result-item-card">${cardContent.join('<br>')}</div>`);
        cardContent = [];
      }
      inCard = true;
      cardContent.push(trimmed);
    } else if (inCard) {
      cardContent.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  if (inCard && cardContent.length > 0) {
    result.push(`<div class="result-item-card">${cardContent.join('<br>')}</div>`);
  }

  return result.join('');
}

function closeAskInboxModal() {
  if (elements.modalAskInbox) elements.modalAskInbox.style.display = 'none';
}

async function submitAskInboxQuery(queryOverride = null) {
  const query = (queryOverride || elements.inputAskInbox.value || '').trim();
  if (!query) {
    showToast('Please type a question to ask across your inbox', 'info');
    return;
  }

  const btn = elements.btnSubmitAskInbox;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Thinking...`;

  elements.askInboxResultCard.style.display = 'block';
  elements.askInboxOutput.innerHTML = `<span style="color: var(--text-muted);">✦ AI Chief of Staff analyzing your mailbox...</span>`;
  elements.askInboxCitationsSection.style.display = 'none';

  try {
    const res = await fetch('/api/inbox/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query })
    });
    if (!res.ok) throw new Error('Cross-email analysis failed');
    const data = await res.json();

    elements.askInboxEngineBadge.textContent = data.engine || 'AI Synthesis';
    elements.askInboxTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    elements.askInboxOutput.innerHTML = formatMarkdownToCards(data.answer);

    if (elements.btnCopyAskInbox) {
      elements.btnCopyAskInbox.onclick = () => {
        const text = data.answer || elements.askInboxOutput.innerText;
        navigator.clipboard.writeText(text).then(() => {
          showToast('✓ Copied AI analysis to clipboard!', 'success');
        });
      };
    }

    if (data.citations && data.citations.length > 0) {
      elements.askInboxCitationsSection.style.display = 'block';
      elements.askInboxCitationsGrid.innerHTML = data.citations.map(c => `
        <div class="citation-card" data-id="${c.id}">
          <div class="citation-subject">📌 ${escapeHtml(c.subject || 'Thread')}</div>
          <div class="citation-meta">
            <span>${escapeHtml(c.sender || 'Sender')}</span>
            <span class="card-badge" style="font-size: 9px; padding: 1px 4px;">${c.priority || 'Medium'}</span>
          </div>
        </div>
      `).join('');

      elements.askInboxCitationsGrid.querySelectorAll('.citation-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          closeAskInboxModal();
          selectEmail(id);
          const cardEl = document.querySelector(`.email-card[data-id="${id}"]`);
          if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
    }
  } catch (err) {
    elements.askInboxOutput.innerHTML = `<span style="color: var(--status-critical);">Failed: ${escapeHtml(err.message)}</span>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Ask AI';
  }
}

// 2. Finance Hub Modal
async function openFinanceHubModal() {
  if (!elements.modalFinanceHub) return;
  elements.modalFinanceHub.style.display = 'flex';
  await loadFinanceHubData();
}

function closeFinanceHubModal() {
  if (elements.modalFinanceHub) elements.modalFinanceHub.style.display = 'none';
}

async function loadFinanceHubData() {
  try {
    const res = await fetch('/api/finance/overview');
    if (!res.ok) throw new Error('Failed to load finance data');
    const data = await res.json();

    if (elements.financeStatThreads) elements.financeStatThreads.textContent = data.total_items || 0;
    if (elements.financeStatAmount) elements.financeStatAmount.textContent = `$${(data.total_amount_estimate || 0).toLocaleString()}`;
    if (elements.financeStatCurrencies) elements.financeStatCurrencies.textContent = (data.currencies || ['USD / INR']).join(', ');
    if (elements.financeLedgerCount) elements.financeLedgerCount.textContent = `${data.total_items} financial items detected`;
    if (elements.hubBadgeFinance) elements.hubBadgeFinance.textContent = data.total_items || 0;

    const tbody = elements.financeTableBody;
    if (!tbody) return;

    if (!data.items || data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No financial statements or invoices detected in current mailbox.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.items.map(it => `
      <tr>
        <td style="color: var(--text-muted); white-space: nowrap;">${escapeHtml(it.date_display || '')}</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(it.sender_name || 'Institution')}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(it.sender_email || '')}</div>
        </td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(it.subject || 'Financial Notice')}</div>
          <div style="font-size: 11px; color: var(--text-muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(it.summary || '')}</div>
        </td>
        <td>
          <span class="finance-amount-tag">${escapeHtml((it.amounts || ['Notice'])[0])}</span>
        </td>
        <td>
          <button class="btn btn-xs btn-outline btn-open-ledger-email" data-id="${it.email_id}">View Email</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-open-ledger-email').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        closeFinanceHubModal();
        selectEmail(id);
        const cardEl = document.querySelector(`.email-card[data-id="${id}"]`);
        if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  } catch (err) {
    showToast(`Finance Hub Error: ${err.message}`, 'error');
  }
}

// 3. Compose Email Modal (Gmail SMTP)
function openComposeModal() {
  if (!elements.modalCompose) return;
  elements.modalCompose.style.display = 'flex';
  if (state.config && state.config.imap_user) {
    const fromInput = document.getElementById('compose-from-display');
    if (fromInput) fromInput.value = state.config.imap_user;
  }
  setTimeout(() => { if (elements.composeTo) elements.composeTo.focus(); }, 50);
}

function closeComposeModal() {
  if (elements.modalCompose) elements.modalCompose.style.display = 'none';
}

function polishComposeText() {
  const current = elements.composeBody.value.trim();
  if (!current) {
    showToast('Type a draft message first to polish', 'info');
    return;
  }
  const userGreeting = state.config?.imap_user ? state.config.imap_user.split('@')[0] : 'Santhosh';
  const cleanName = userGreeting.charAt(0).toUpperCase() + userGreeting.slice(1);
  const polished = `Hi,\n\nI hope this email finds you well.\n\n${current}\n\nPlease let me know if you have any questions or if you need any further details.\n\nBest regards,\n${cleanName}`;
  elements.composeBody.value = polished;
  showToast('✓ AI polished into executive professional tone', 'success');
}

let pendingComposeTimeout = null;
let pendingComposeToast = null;
let composeCountdownInterval = null;

function sendComposeEmail() {
  const to = elements.composeTo.value.trim();
  const subject = elements.composeSubject.value.trim();
  const body = elements.composeBody.value.trim();

  if (!to || !subject || !body) {
    showToast('Please fill in Recipient, Subject, and Body', 'error');
    return;
  }

  closeComposeModal();

  // 5-Second Undo send
  if (pendingComposeTimeout) {
    clearTimeout(pendingComposeTimeout);
    clearInterval(composeCountdownInterval);
    if (pendingComposeToast) pendingComposeToast.remove();
  }

  let remaining = 5;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderColor = 'var(--accent-primary)';

  const updateToast = () => {
    toast.innerHTML = `
      <span>⏳</span>
      <span>Dispatching to <b>${escapeHtml(to)}</b> in <b>${remaining}s</b>...</span>
      <button class="undo-countdown-btn" id="btn-undo-compose">Undo</button>
    `;
    const undoBtn = toast.querySelector('#btn-undo-compose');
    if (undoBtn) {
      undoBtn.onclick = () => {
        clearInterval(composeCountdownInterval);
        clearTimeout(pendingComposeTimeout);
        pendingComposeTimeout = null;
        toast.remove();
        showToast('Email dispatch cancelled.', 'info');
      };
    }
  };

  updateToast();
  elements.toastContainer.appendChild(toast);
  pendingComposeToast = toast;

  composeCountdownInterval = setInterval(() => {
    remaining--;
    if (remaining > 0) updateToast();
    else clearInterval(composeCountdownInterval);
  }, 1000);

  pendingComposeTimeout = setTimeout(async () => {
    clearInterval(composeCountdownInterval);
    if (toast) toast.remove();
    pendingComposeTimeout = null;

    try {
      const res = await fetch('/api/emails/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_email: to, subject: subject, body: body })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Dispatch failed');
      showToast(data.message || `✓ Sent to ${to} via Gmail SMTP`, 'success');
      elements.composeTo.value = '';
      elements.composeSubject.value = '';
      elements.composeBody.value = '';
    } catch (e) {
      showToast(`Send Error: ${e.message}`, 'error');
    }
  }, 5000);
}

// 4. Autonomous Watcher Status Polling
async function updateWatcherTelemetry() {
  try {
    const res = await fetch('/api/watcher/status');
    if (res.ok) {
      const w = await res.json();
      if (elements.watcherStatusText) {
        if (w.enabled) {
          elements.watcherStatusText.textContent = `Live Watcher (${w.last_sync || 'Active'})`;
          if (elements.watcherBadge) elements.watcherBadge.classList.add('active');
        } else {
          elements.watcherStatusText.textContent = `Watcher Paused`;
          if (elements.watcherBadge) elements.watcherBadge.classList.remove('active');
        }
      }
    }
  } catch (e) {
    // silent
  }
}

// ============================================================================
// Event Bindings
// ============================================================================
function bindEvents() {
  // Sync Button
  elements.btnSync.addEventListener('click', syncInbox);

  // Ask Entire Inbox AI Modal
  if (elements.btnOpenAskInbox) elements.btnOpenAskInbox.addEventListener('click', () => openAskInboxModal());
  if (elements.btnCloseAskInbox) elements.btnCloseAskInbox.addEventListener('click', closeAskInboxModal);
  if (elements.btnSubmitAskInbox) elements.btnSubmitAskInbox.addEventListener('click', () => submitAskInboxQuery());
  if (elements.inputAskInbox) {
    elements.inputAskInbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAskInboxQuery();
    });
  }
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = chip.dataset.prompt;
      if (elements.inputAskInbox) elements.inputAskInbox.value = p;
      submitAskInboxQuery(p);
    });
  });

  // Finance Hub Modal
  if (elements.btnOpenFinanceHub) elements.btnOpenFinanceHub.addEventListener('click', openFinanceHubModal);
  if (elements.btnCloseFinanceHub) elements.btnCloseFinanceHub.addEventListener('click', closeFinanceHubModal);

  // Standalone Compose Modal
  if (elements.btnOpenCompose) elements.btnOpenCompose.addEventListener('click', openComposeModal);
  if (elements.btnCloseCompose) elements.btnCloseCompose.addEventListener('click', closeComposeModal);
  if (elements.btnCancelCompose) elements.btnCancelCompose.addEventListener('click', closeComposeModal);
  if (elements.btnSendCompose) elements.btnSendCompose.addEventListener('click', sendComposeEmail);
  if (elements.btnAiPolishCompose) elements.btnAiPolishCompose.addEventListener('click', polishComposeText);

  // Executive Briefing Modal
  elements.btnBriefing.addEventListener('click', openBriefingModal);
  elements.btnQuickBriefing.addEventListener('click', openBriefingModal);
  elements.btnCloseBriefing.addEventListener('click', () => {
    elements.modalBriefing.style.display = 'none';
    if (state.isSpeaking) window.speechSynthesis.cancel();
  });
  elements.btnDismissBriefing.addEventListener('click', () => {
    elements.modalBriefing.style.display = 'none';
    if (state.isSpeaking) window.speechSynthesis.cancel();
  });
  elements.btnSpeakBriefing.addEventListener('click', speakBriefing);

  // Settings Modal
  elements.btnSettings.addEventListener('click', openSettingsModal);
  elements.modePill.addEventListener('click', openSettingsModal);
  elements.btnCloseSettings.addEventListener('click', () => elements.modalSettings.style.display = 'none');
  elements.btnCancelSettings.addEventListener('click', () => elements.modalSettings.style.display = 'none');
  elements.btnSaveSettings.addEventListener('click', saveSettings);
  elements.btnTestImap.addEventListener('click', testImap);
  elements.btnTestSmail.addEventListener('click', testSmail);
  if (elements.btnTestMobileAlert) {
    elements.btnTestMobileAlert.addEventListener('click', testMobileAlert);
  }

  // Form submit handler (prevents page reload on Enter)
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettings();
    });
  }

  // Segment buttons
  elements.segDemo.addEventListener('click', () => {
    elements.segDemo.classList.add('active');
    elements.segSmail.classList.remove('active');
    elements.segImap.classList.remove('active');
    elements.smailSection.style.display = 'none';
    elements.imapSection.style.display = 'none';
  });
  elements.segSmail.addEventListener('click', () => {
    elements.segSmail.classList.add('active');
    elements.segDemo.classList.remove('active');
    elements.segImap.classList.remove('active');
    elements.smailSection.style.display = 'flex';
    elements.imapSection.style.display = 'none';
  });
  elements.segImap.addEventListener('click', () => {
    elements.segImap.classList.add('active');
    elements.segDemo.classList.remove('active');
    elements.segSmail.classList.remove('active');
    elements.smailSection.style.display = 'none';
    elements.imapSection.style.display = 'flex';
  });

  // Password visibility toggles
  document.querySelectorAll('.toggle-pwd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.type = target.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // Theme Toggle
  if (elements.btnTheme) elements.btnTheme.addEventListener('click', cycleTheme);

  // Category Nav items
  elements.categoryNavList.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.categoryNavList.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCategory = btn.dataset.category;
      loadEmails();
    });
  });

  // Priority Nav items
  elements.priorityNavList.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.priorityNavList.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentPriority = btn.dataset.priority;
      loadEmails();
    });
  });

  // Filter Tabs
  elements.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentQuickFilter = tab.dataset.filter;
      renderEmailFeed();
    });
  });

  // Search Bar with Debounce
  let searchTimeout = null;
  elements.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    elements.btnClearSearch.style.display = val ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = val;
      loadEmails();
    }, 250);
  });
  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    state.searchQuery = '';
    loadEmails();
  });

  // Email Detail Action buttons
  elements.btnToggleRead.addEventListener('click', () => {
    if (!state.selectedEmailId) return;
    const email = state.emails.find(e => e.id === state.selectedEmailId);
    if (email) {
      email.is_unread = !email.is_unread;
      updateReadStatus(email.id, email.is_unread);
      elements.readToggleText.textContent = email.is_unread ? 'Mark Read' : 'Mark Unread';
      renderEmailFeed();
    }
  });

  elements.btnReanalyze.addEventListener('click', reanalyzeEmail);
  if (elements.btnPushMobile) {
    elements.btnPushMobile.addEventListener('click', pushEmailToPhone);
  }

  // Multi-Language Translation
  if (elements.btnTranslateEmail) {
    elements.btnTranslateEmail.addEventListener('click', async () => {
      if (!state.selectedEmailId) return;
      const btn = elements.btnTranslateEmail;
      btn.disabled = true;
      btn.textContent = 'Translating...';
      try {
        const res = await fetch(`/api/translate/email/${state.selectedEmailId}?target_lang=English`);
        const data = await res.json();
        if (elements.detailSubject) elements.detailSubject.textContent = data.translated_subject || elements.detailSubject.textContent;
        if (elements.detailTldr) elements.detailTldr.innerHTML = `<b>[Translated from ${data.source_lang}]:</b> ${escapeHtml(data.translated_body.slice(0, 300))}...`;
        showToast(`✓ Translated from ${data.source_lang} to English!`, 'success');
      } catch (err) {
        showToast(`Translation error: ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🌐 Translate</span>';
      }
    });
  }

  // Voice Dictation Ghostwriter
  if (elements.btnVoiceDictateReply) {
    elements.btnVoiceDictateReply.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast('Voice dictation unsupported in this browser', 'error');
        return;
      }
      const btn = elements.btnVoiceDictateReply;
      btn.innerHTML = '<span>🎙️ Listening... Speak!</span>';
      btn.style.borderColor = '#ef4444';

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = async (ev) => {
        const spokenText = ev.results[0][0].transcript;
        btn.innerHTML = '<span>✨ Ghostwriting draft...</span>';
        try {
          const res = await fetch('/api/ghostwriter/polish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_transcript: spokenText, tone: 'Executive Professional' })
          });
          const data = await res.json();
          if (elements.replyTextarea) elements.replyTextarea.value = data.polished_body || spokenText;
          showToast('✓ Polished dictated voice note into Santhosh voice!', 'success');
        } catch (e) {
          if (elements.replyTextarea) elements.replyTextarea.value = spokenText;
        } finally {
          btn.innerHTML = '<span>🎙️ Voice Dictate</span>';
          btn.style.borderColor = 'rgba(56,189,248,0.3)';
        }
      };
      rec.onerror = () => {
        btn.innerHTML = '<span>🎙️ Voice Dictate</span>';
        btn.style.borderColor = 'rgba(56,189,248,0.3)';
      };
      rec.start();
    });
  }

  // Ask AI
  elements.btnAskAi.addEventListener('click', askAiQuestion);
  elements.askAiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') askAiQuestion();
  });

  // Tone Buttons
  elements.toneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.toneButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tone = btn.dataset.tone;
      const email = state.emails.find(e => e.id === state.selectedEmailId);
      if (email && email.ai_analysis?.smart_replies) {
        const matching = email.ai_analysis.smart_replies.find(r => r.tone?.toLowerCase().includes(tone)) || email.ai_analysis.smart_replies[0];
        if (matching) elements.replyTextarea.value = matching.body;
      }
    });
  });

  // Copy Reply Draft
  elements.btnCopyReply.addEventListener('click', () => {
    const txt = elements.replyTextarea.value;
    if (!txt) return;
    navigator.clipboard.writeText(txt).then(() => {
      showToast('✓ Reply draft copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Draft ready in box', 'info');
    });
  });

  // Export Tasks as formatted checklist
  if (elements.btnExportTasks) {
    elements.btnExportTasks.addEventListener('click', exportTasksToClipboard);
  }

  // Save Draft to Mailbox
  if (elements.btnSaveDraft) {
    elements.btnSaveDraft.addEventListener('click', () => handleSendReply('draft'));
  }

  // Send Reply with 5-Second Undo Grace Period
  elements.btnSendSimulation.addEventListener('click', () => handleSendReply('send'));

  // Morning Podcast Show
  if (elements.btnPlayPodcast) {
    elements.btnPlayPodcast.addEventListener('click', togglePodcast);
  }

  // Keyboard Shortcuts Modal Controls
  if (elements.btnOpenShortcuts) {
    elements.btnOpenShortcuts.addEventListener('click', () => {
      if (elements.modalShortcuts) elements.modalShortcuts.style.display = 'flex';
    });
  }
  if (elements.btnCloseShortcuts) {
    elements.btnCloseShortcuts.addEventListener('click', () => {
      if (elements.modalShortcuts) elements.modalShortcuts.style.display = 'none';
    });
  }
  if (elements.btnDismissShortcuts) {
    elements.btnDismissShortcuts.addEventListener('click', () => {
      if (elements.modalShortcuts) elements.modalShortcuts.style.display = 'none';
    });
  }

  // Original Body Tabs
  elements.tabPlainText.addEventListener('click', () => {
    state.originalBodyTab = 'plain';
    elements.tabPlainText.classList.add('active');
    elements.tabHtmlText.classList.remove('active');
    const email = state.emails.find(e => e.id === state.selectedEmailId);
    if (email) updateOriginalBodyDisplay(email);
  });
  elements.tabHtmlText.addEventListener('click', () => {
    state.originalBodyTab = 'html';
    elements.tabHtmlText.classList.add('active');
    elements.tabPlainText.classList.remove('active');
    const email = state.emails.find(e => e.id === state.selectedEmailId);
    if (email) updateOriginalBodyDisplay(email);
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K: Open Ask Entire Inbox AI
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openAskInboxModal();
      return;
    }

    if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'j') {
      navigateEmail(1);
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      navigateEmail(-1);
    } else if (e.key === 'e' || e.key === 'E') {
      openBriefingModal();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      openComposeModal();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      elements.replyTextarea.focus();
    } else if (e.key === 't' || e.key === 'T') {
      cycleTheme();
    } else if (e.key === '?') {
      if (elements.modalShortcuts) elements.modalShortcuts.style.display = 'flex';
    } else if (e.key === 'Escape') {
      if (elements.modalBriefing) elements.modalBriefing.style.display = 'none';
      if (elements.modalSettings) elements.modalSettings.style.display = 'none';
      if (elements.modalShortcuts) elements.modalShortcuts.style.display = 'none';
      if (elements.modalAskInbox) elements.modalAskInbox.style.display = 'none';
      if (elements.modalFinanceHub) elements.modalFinanceHub.style.display = 'none';
      if (elements.modalCompose) elements.modalCompose.style.display = 'none';
      if (state.isSpeaking) window.speechSynthesis.cancel();
      if (isPlayingPodcast) window.speechSynthesis.cancel();
    } else if (e.key === '/') {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });
}

function navigateEmail(delta) {
  if (state.emails.length === 0) return;
  const currentIdx = state.emails.findIndex(e => e.id === state.selectedEmailId);
  const nextIdx = Math.max(0, Math.min(state.emails.length - 1, currentIdx + delta));
  if (nextIdx !== currentIdx) {
    selectEmail(state.emails[nextIdx].id);
    // Scroll active card into view
    const card = document.querySelector(`.email-card[data-id="${state.emails[nextIdx].id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================================================
// Utility Helpers
// ============================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  else if (type === 'error') icon = '✕';

  toast.innerHTML = `<span style="font-weight:bold;">${icon}</span><span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// Conversational AI Companion ("Nova") - Friend Persona & Command Center
// ============================================================================
state.companionSpeechEnabled = false;
state.isListeningVoice = false;
let speechRecognitionInstance = null;

function initCompanion() {
  if (!elements.companionDrawer || !elements.btnToggleCompanionFab) return;

  // 1. Toggle Drawer button listeners
  elements.btnToggleCompanionFab.addEventListener('click', toggleCompanionDrawer);
  if (elements.btnHeaderCompanion) {
    elements.btnHeaderCompanion.addEventListener('click', toggleCompanionDrawer);
  }
  if (elements.btnCloseCompanionDrawer) {
    elements.btnCloseCompanionDrawer.addEventListener('click', closeCompanionDrawer);
  }

  // 2. Global Hotkey: Ctrl+J / Cmd+J
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      toggleCompanionDrawer();
    } else if (e.key === 'Escape' && elements.companionDrawer.style.display !== 'none') {
      closeCompanionDrawer();
    }
  });

  // 3. Clear Chat history
  if (elements.btnClearCompanionChat) {
    elements.btnClearCompanionChat.addEventListener('click', async () => {
      if (confirm("Clear your conversation history with Nova?")) {
        try {
          await fetch('/api/companion/clear', { method: 'POST' });
          elements.companionChatStream.innerHTML = `
            <div class="comp-msg comp-msg-assistant">
              <div class="msg-avatar">🤖</div>
              <div class="msg-bubble">
                <div class="msg-sender-name">Nova</div>
                <div class="msg-text">Chat cleared, Santhosh! Ready for whatever you want to tackle next, bro! 🚀</div>
                <span class="msg-timestamp">Just now</span>
              </div>
            </div>
          `;
          showToast('Companion chat history cleared', 'info');
        } catch (err) {
          showToast('Failed to clear chat', 'error');
        }
      }
    });
  }

  // 4. Voice Speech Synthesis Toggle (Text-to-speech)
  if (elements.btnToggleSpeech) {
    elements.btnToggleSpeech.addEventListener('click', () => {
      state.companionSpeechEnabled = !state.companionSpeechEnabled;
      elements.speechIcon.textContent = state.companionSpeechEnabled ? '🔊' : '🔇';
      showToast(state.companionSpeechEnabled ? 'Nova voice audio enabled' : 'Nova voice muted', 'info');
      if (state.companionSpeechEnabled) {
        speakText("Hey Santhosh, audio readout is on! What's good?");
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    });
  }

  // 5. Send message on Enter or click
  if (elements.btnCompanionSend && elements.companionInputText) {
    elements.btnCompanionSend.addEventListener('click', () => {
      const msg = elements.companionInputText.value.trim();
      if (msg) {
        sendCompanionMessage(msg);
        elements.companionInputText.value = '';
      }
    });

    elements.companionInputText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const msg = elements.companionInputText.value.trim();
        if (msg) {
          sendCompanionMessage(msg);
          elements.companionInputText.value = '';
        }
      }
    });
  }

  // 6. Quick Command Chips
  if (elements.companionChips) {
    elements.companionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd;
        if (cmd) {
          sendCompanionMessage(cmd);
        }
      });
    });
  }

  // 7. Voice Input (Microphone Speech Recognition)
  initCompanionVoiceInput();

  // 8. Load past conversation history on startup
  loadCompanionHistoryFromAPI();
}

function toggleCompanionDrawer() {
  const isHidden = elements.companionDrawer.style.display === 'none' || !elements.companionDrawer.style.display;
  if (isHidden) {
    elements.companionDrawer.style.display = 'block';
    setTimeout(() => {
      if (elements.companionInputText) elements.companionInputText.focus();
    }, 100);
  } else {
    elements.companionDrawer.style.display = 'none';
  }
}

function closeCompanionDrawer() {
  elements.companionDrawer.style.display = 'none';
}

function initCompanionVoiceInput() {
  if (!elements.btnCompanionMic) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.btnCompanionMic.title = 'Voice input not supported in this browser';
    elements.btnCompanionMic.style.opacity = '0.4';
    return;
  }

  speechRecognitionInstance = new SpeechRecognition();
  speechRecognitionInstance.continuous = false;
  speechRecognitionInstance.interimResults = false;
  speechRecognitionInstance.lang = 'en-US';

  speechRecognitionInstance.onstart = () => {
    state.isListeningVoice = true;
    elements.btnCompanionMic.classList.add('listening');
    elements.micIcon.textContent = '🔴';
    showToast('Listening... Speak your command to Nova', 'info');
  };

  speechRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) {
      elements.companionInputText.value = transcript;
      sendCompanionMessage(transcript);
      elements.companionInputText.value = '';
    }
  };

  speechRecognitionInstance.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopCompanionVoiceInput();
  };

  speechRecognitionInstance.onend = () => {
    stopCompanionVoiceInput();
  };

  elements.btnCompanionMic.addEventListener('click', () => {
    if (state.isListeningVoice) {
      speechRecognitionInstance.stop();
    } else {
      try {
        speechRecognitionInstance.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  });
}

function stopCompanionVoiceInput() {
  state.isListeningVoice = false;
  if (elements.btnCompanionMic) {
    elements.btnCompanionMic.classList.remove('listening');
    elements.micIcon.textContent = '🎙️';
  }
}

async function sendCompanionMessage(messageText) {
  if (!messageText || !elements.companionChatStream) return;

  // Append user bubble
  appendChatBubble('user', messageText, 'Just now');

  // Append typing bubble
  const typingId = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'comp-msg comp-msg-assistant';
  typingDiv.id = typingId;
  typingDiv.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <div class="msg-sender-name">Nova</div>
      <div class="msg-text" style="color: #94a3b8; font-style: italic;">
        On it bro, executing...
      </div>
    </div>
  `;
  elements.companionChatStream.appendChild(typingDiv);
  elements.companionChatStream.scrollTop = elements.companionChatStream.scrollHeight;

  try {
    const res = await fetch('/api/companion/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText })
    });

    if (!res.ok) throw new Error('Companion service error');
    const data = await res.json();

    // Remove typing indicator
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    // Append Nova's response bubble
    appendChatBubble('assistant', data.reply, 'Just now', data.actions_taken, data.citations);

    // If actions were executed, reload emails and status so UI updates live!
    if (data.actions_taken && data.actions_taken.length > 0) {
      await loadStatus();
      await loadEmails();
      const firstAction = data.actions_taken[0];
      const summaryMsg = firstAction.summary || firstAction.status_note || 'Action executed successfully';
      showToast(`⚡ Nova: ${summaryMsg}`, 'success');
    }

    // Voice Readout if enabled
    if (state.companionSpeechEnabled && data.speech_text) {
      speakText(data.speech_text);
    }
  } catch (err) {
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    appendChatBubble('assistant', `Sorry bro, ran into an issue executing that: ${err.message}. Want to try again?`, 'Just now');
    showToast('Companion communication error', 'error');
  }
}

function appendChatBubble(role, text, timeStr = 'Just now', actionsTaken = [], citations = []) {
  if (!elements.companionChatStream) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `comp-msg comp-msg-${role}`;

  const avatarEmoji = role === 'user' ? '👤' : '🤖';
  const senderName = role === 'user' ? 'You' : 'Nova';

  let formattedText = escapeHtml(text).replace(/\n/g, '<br>');
  // Format bold markdown
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Format markdown links [text](url)
  formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #67e8f9; text-decoration: underline;">$1</a>');

  let actionsHtml = '';
  if (actionsTaken && actionsTaken.length > 0) {
    actionsHtml = actionsTaken.map(act => `
      <div class="comp-action-card">
        <span class="action-card-icon">⚡</span>
        <span class="action-card-text">${escapeHtml(act.summary || act.status_note || 'Command Executed')}</span>
      </div>
    `).join('');
  }

  let citationsHtml = '';
  if (citations && citations.length > 0) {
    citationsHtml = `
      <div class="comp-citations-row">
        ${citations.map(c => `
          <button class="comp-citation-pill" onclick="selectEmail('${c.id}')" title="Click to view email thread">
            ✉️ ${escapeHtml(c.subject ? (c.subject.length > 28 ? c.subject.slice(0, 28) + '...' : c.subject) : (c.sender || 'Thread'))}
          </button>
        `).join('')}
      </div>
    `;
  }

  msgDiv.innerHTML = `
    <div class="msg-avatar">${avatarEmoji}</div>
    <div class="msg-bubble">
      <div class="msg-sender-name">${senderName}</div>
      <div class="msg-text">${formattedText}</div>
      ${actionsHtml}
      ${citationsHtml}
      <span class="msg-timestamp">${timeStr}</span>
    </div>
  `;

  elements.companionChatStream.appendChild(msgDiv);
  elements.companionChatStream.scrollTop = elements.companionChatStream.scrollHeight;
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

async function loadCompanionHistoryFromAPI() {
  try {
    const res = await fetch('/api/companion/history');
    if (!res.ok) return;
    const history = await res.json();
    if (history && history.length > 0 && elements.companionChatStream) {
      elements.companionChatStream.innerHTML = '';
      history.forEach(item => {
        appendChatBubble(
          item.role,
          item.content,
          item.time_display || 'Earlier',
          item.actions_taken || [],
          item.citations || []
        );
      });
    }
  } catch (err) {
    console.warn('Failed to load past companion history:', err);
  }
}

// ============================================================================
// Multi-Account Switcher & Gmail Connection Manager
// ============================================================================
function initAccountSwitcher() {
  if (!elements.accountSwitcherBtn || !elements.accountMenuPopover) return;

  // 1. Toggle popover
  elements.accountSwitcherBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = elements.accountSwitcherBtn.closest('.account-switcher-dropdown');
    const isVisible = elements.accountMenuPopover.style.display === 'block';
    elements.accountMenuPopover.style.display = isVisible ? 'none' : 'block';
    if (dropdown) {
      if (isVisible) dropdown.classList.remove('open');
      else dropdown.classList.add('open');
    }
  });

  // 2. Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (elements.accountMenuPopover && !elements.accountMenuPopover.contains(e.target) && !elements.accountSwitcherBtn.contains(e.target)) {
      elements.accountMenuPopover.style.display = 'none';
      const dropdown = elements.accountSwitcherBtn.closest('.account-switcher-dropdown');
      if (dropdown) dropdown.classList.remove('open');
    }
  });

  // 3. Open "Connect Another Gmail Account" Modal
  if (elements.btnOpenAddAccountModal) {
    elements.btnOpenAddAccountModal.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.accountMenuPopover.style.display = 'none';
      const dropdown = elements.accountSwitcherBtn.closest('.account-switcher-dropdown');
      if (dropdown) dropdown.classList.remove('open');
      if (elements.modalAddAccount) {
        elements.modalAddAccount.style.display = 'flex';
        if (elements.addAccountStatusBox) elements.addAccountStatusBox.style.display = 'none';
        if (elements.inputAddAccountName) elements.inputAddAccountName.value = '';
        if (elements.inputAddAccountEmail) elements.inputAddAccountEmail.value = '';
        if (elements.inputAddAccountPassword) elements.inputAddAccountPassword.value = '';
      }
    });
  }

  // 4. Close "Connect Another Gmail Account" Modal
  if (elements.btnCloseAddAccount) {
    elements.btnCloseAddAccount.addEventListener('click', () => {
      if (elements.modalAddAccount) elements.modalAddAccount.style.display = 'none';
    });
  }

  // 5. Toggle password visibility
  if (elements.btnToggleAddPwd && elements.inputAddAccountPassword) {
    elements.btnToggleAddPwd.addEventListener('click', () => {
      const isPwd = elements.inputAddAccountPassword.type === 'password';
      elements.inputAddAccountPassword.type = isPwd ? 'text' : 'password';
      elements.btnToggleAddPwd.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // 6. Test Credentials Button
  if (elements.btnTestNewAccount) {
    elements.btnTestNewAccount.addEventListener('click', async () => {
      const email = elements.inputAddAccountEmail ? elements.inputAddAccountEmail.value.trim() : '';
      const password = elements.inputAddAccountPassword ? elements.inputAddAccountPassword.value.trim() : '';
      const statusBox = elements.addAccountStatusBox;

      if (!email || !password) {
        showToast('Please enter both your Gmail address and 16-character App Password', 'error');
        return;
      }

      const btn = elements.btnTestNewAccount;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Validating Google IMAP...`;
      if (statusBox) statusBox.style.display = 'none';

      try {
        const res = await fetch('/api/accounts/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, app_password: password })
        });
        const data = await res.json();
        if (statusBox) {
          statusBox.style.display = 'block';
          if (data.success) {
            statusBox.className = 'connection-status-box success';
            statusBox.innerHTML = `<b>✓ Google IMAP Connected!</b> ${escapeHtml(data.message)}`;
          } else {
            statusBox.className = 'connection-status-box error';
            statusBox.innerHTML = `<b>✕ Authentication Failed:</b> ${escapeHtml(data.message)}`;
          }
        }
      } catch (err) {
        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.className = 'connection-status-box error';
          statusBox.textContent = `✕ Connection test error: ${err.message}`;
        }
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Test Connection</span>';
      }
    });
  }

  // 7. Save & Connect Gmail Account Form Submit
  if (elements.addAccountForm) {
    elements.addAccountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = elements.inputAddAccountName ? elements.inputAddAccountName.value.trim() : '';
      const email = elements.inputAddAccountEmail ? elements.inputAddAccountEmail.value.trim() : '';
      const password = elements.inputAddAccountPassword ? elements.inputAddAccountPassword.value.trim() : '';
      const switchNow = elements.checkAddAccountSwitchNow ? elements.checkAddAccountSwitchNow.checked : true;
      const statusBox = elements.addAccountStatusBox;

      if (!email || !password) {
        showToast('Please fill out Gmail address and App Password', 'error');
        return;
      }

      const btn = elements.btnSaveNewAccount;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Connecting Gmail...`;

      try {
        const res = await fetch('/api/accounts/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || email.split('@')[0],
            email: email,
            app_password: password,
            switch_now: switchNow
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to connect Gmail account');

        showToast(`✓ Added & Connected: ${data.account?.name || email}!`, 'success');
        if (elements.modalAddAccount) elements.modalAddAccount.style.display = 'none';

        await loadAccounts();
        await loadStatus();
        await loadEmails();
      } catch (err) {
        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.className = 'connection-status-box error';
          statusBox.innerHTML = `<b>✕ Failed:</b> ${escapeHtml(err.message)}`;
        }
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>✓ Save & Connect Gmail</span>';
      }
    });
  }
}

async function loadAccounts() {
  try {
    const res = await fetch('/api/accounts');
    if (!res.ok) return;
    const data = await res.json();
    const currentId = data.current_account_id;
    const currentAcc = (data.accounts || []).find(a => a.id === currentId) || data.accounts[0];
    state.currentAccount = currentAcc;
    state.currentAccountId = currentId;

    if (currentAcc) {
      if (elements.headerAccountAvatar) {
        elements.headerAccountAvatar.textContent = currentAcc.avatar || 'SD';
        if (currentAcc.color) {
          elements.headerAccountAvatar.style.background = currentAcc.color.startsWith('#')
            ? `linear-gradient(135deg, ${currentAcc.color}, #0f172a)`
            : currentAcc.color;
        }
      }
      if (elements.headerAccountName) elements.headerAccountName.textContent = currentAcc.name || 'Account';
      if (elements.headerAccountEmail) elements.headerAccountEmail.textContent = currentAcc.email || '';
      if (elements.headerAccountBadge) elements.headerAccountBadge.textContent = (currentAcc.badge || 'GMAIL').toUpperCase();

      // Update compose from input
      const composeFrom = document.getElementById('compose-from-display');
      if (composeFrom) composeFrom.value = currentAcc.email || '';
    }

    if (elements.accountsCountPill && data.accounts) {
      elements.accountsCountPill.textContent = `${data.accounts.length} Account${data.accounts.length === 1 ? '' : 's'}`;
    }

    if (elements.accountMenuList && data.accounts) {
      elements.accountMenuList.innerHTML = data.accounts.map(acc => {
        const isActive = (acc.id === currentId);
        const avatarBg = acc.color ? `background: linear-gradient(135deg, ${acc.color}, #1e293b);` : '';
        const emailCountText = (acc.email_count !== undefined && acc.email_count !== null) ? `${acc.email_count} emails` : '';

        return `
          <div class="account-item ${isActive ? 'active' : ''}" data-id="${acc.id}">
            <div class="account-item-avatar" style="${avatarBg}">${escapeHtml(acc.avatar || '👤')}</div>
            <div class="account-item-info">
              <div class="account-item-name">${escapeHtml(acc.name)}</div>
              <div class="account-item-email">${escapeHtml(acc.email)}</div>
              <div class="account-item-meta">
                <span class="account-item-type">${escapeHtml(acc.badge || acc.type)}</span>
                ${emailCountText ? `<span class="account-item-count">• ${emailCountText}</span>` : ''}
              </div>
            </div>
            <div class="account-item-actions">
              ${isActive ? '<span class="account-active-badge">✓ Active</span>' : `<button class="account-switch-btn" data-switch-id="${acc.id}">Switch</button>`}
              ${acc.removable ? `<button class="account-delete-btn" data-delete-id="${acc.id}" title="Remove this account">✕</button>` : ''}
            </div>
          </div>
        `;
      }).join('');

      // Click to switch
      elements.accountMenuList.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', async (e) => {
          if (e.target.closest('.account-delete-btn')) return;

          const accId = item.dataset.id;
          if (accId === currentId) {
            elements.accountMenuPopover.style.display = 'none';
            const dropdown = elements.accountSwitcherBtn.closest('.account-switcher-dropdown');
            if (dropdown) dropdown.classList.remove('open');
            return;
          }

          try {
            showToast('Switching active mailbox...', 'info');
            const swRes = await fetch('/api/accounts/switch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ account_id: accId })
            });
            const swData = await swRes.json();
            if (swData.success) {
              const targetName = swData.active_account?.name || accId;
              showToast(`✓ Switched to: ${targetName}`, 'success');
              elements.accountMenuPopover.style.display = 'none';
              const dropdown = elements.accountSwitcherBtn.closest('.account-switcher-dropdown');
              if (dropdown) dropdown.classList.remove('open');

              await loadAccounts();
              await loadStatus();
              await loadEmails();

              if (state.emails.length > 0) {
                selectEmail(state.emails[0].id);
              } else {
                state.selectedEmailId = null;
                const isSmail = (accId === 'iitm_smail');
                if (isSmail && (!state.config?.smail_script_url && !state.currentAccount?.imap_password)) {
                  if (elements.detailSubject) elements.detailSubject.textContent = "Connect IIT Madras Smail (@smail.iitm.ac.in)";
                  if (elements.detailSenderName) elements.detailSenderName.textContent = "🎓 Google Apps Script Gateway";
                  if (elements.detailSenderEmail) elements.detailSenderEmail.textContent = "am26m001@smail.iitm.ac.in";
                  if (elements.detailDate) elements.detailDate.textContent = "Action Required";
                  if (elements.detailBody) {
                    elements.detailBody.innerHTML = `
                      <div style="padding: 24px; max-width: 650px; margin: 0 auto; line-height: 1.6; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
                          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">🎓</div>
                          <div>
                            <h3 style="margin: 0; font-size: 17px; color: #fbbf24;">Why aren't college emails syncing?</h3>
                            <p style="margin: 3px 0 0; font-size: 12.5px; color: var(--text-secondary);">IIT Madras student accounts disable standard Google App Passwords by administrative policy.</p>
                          </div>
                        </div>

                        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px;">
                          <div style="font-weight: 600; color: #a5b4fc; font-size: 13.5px; margin-bottom: 4px;">⚡ Solution: 1-Minute Google Apps Script Gateway</div>
                          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">We run a lightweight Google Apps Script directly inside your college account that securely serves your college inbox to the agent.</p>
                        </div>

                        <h4 style="font-size: 13.5px; margin: 0 0 10px; color: var(--text-primary);">Quick 3-Step Setup:</h4>
                        <ol style="font-size: 12.5px; color: var(--text-secondary); padding-left: 18px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                          <li>Open <a href="https://script.google.com" target="_blank" style="color: #60a5fa; text-decoration: underline; font-weight: 600;">script.google.com</a> signed into <strong>am26m001@smail.iitm.ac.in</strong>.</li>
                          <li>Click <strong>+ New project</strong>, delete existing code, and paste our script template:
                            <div style="margin-top: 6px;">
                              <button class="btn btn-sm btn-primary" onclick="copySmailCodeGlobal()">📋 Click to Copy Apps Script Code</button>
                            </div>
                          </li>
                          <li>Click the blue <strong>Deploy</strong> button (top right) &rarr; <strong>New deployment</strong>:
                            <ul style="margin-top: 4px; padding-left: 16px; list-style-type: disc;">
                              <li>Select type (gear icon): <strong>Web app</strong></li>
                              <li>Execute as: <strong>Me (am26m001@smail.iitm.ac.in)</strong></li>
                              <li>Who has access: <strong>Anyone</strong></li>
                            </ul>
                            Click <strong>Deploy</strong> &rarr; <strong>Authorize access</strong> &rarr; Allow.
                          </li>
                          <li>Copy the <strong>Web app URL</strong> (ends in <code>/exec</code>) and paste it below:</li>
                        </ol>

                        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: 10px; padding: 16px;">
                          <label style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Paste Web App URL</label>
                          <div style="display: flex; gap: 8px;">
                            <input type="text" id="quick-smail-url-detail" placeholder="https://script.google.com/macros/s/.../exec" style="flex: 1; padding: 10px 12px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 6px; color: white; font-size: 12px; font-family: var(--font-mono);">
                            <button class="btn btn-primary" onclick="saveSmailUrlFromDetail()" style="white-space: nowrap; padding: 10px 16px; font-size: 12.5px; font-weight: 600;">Save & Sync</button>
                          </div>
                        </div>
                      </div>
                    `;
                  }
                  if (elements.detailSummary) elements.detailSummary.textContent = "Google Apps Script Web App URL required to sync college emails.";
                  if (elements.detailActionItems) elements.detailActionItems.innerHTML = '<span class="badge badge-warning">Action Required: Connect Gateway</span>';
                  if (elements.detailSmartReplies) elements.detailSmartReplies.innerHTML = '';
                  if (elements.detailSubtext) elements.detailSubtext.innerHTML = '<span class="text-muted text-sm">Waiting for connection</span>';
                } else {
                  if (elements.detailSubject) elements.detailSubject.textContent = "No emails in this mailbox";
                  if (elements.detailSenderName) elements.detailSenderName.textContent = "";
                  if (elements.detailSenderEmail) elements.detailSenderEmail.textContent = "";
                  if (elements.detailDate) elements.detailDate.textContent = "";
                  if (elements.detailBody) {
                    elements.detailBody.innerHTML = `
                      <div style="text-align:center; padding: 48px 20px; color: var(--text-muted);">
                        <div style="font-size: 36px; margin-bottom: 12px;">📭</div>
                        <p style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Mailbox is isolated & empty</p>
                        <p style="font-size: 13px;">This account has no synced emails yet. Click <strong>Sync Mail</strong> beside the account selector above.</p>
                      </div>
                    `;
                  }
                  if (elements.detailSummary) elements.detailSummary.textContent = "Mailbox isolated.";
                  if (elements.detailActionItems) elements.detailActionItems.innerHTML = '<span class="text-muted text-sm">No action items</span>';
                  if (elements.detailSmartReplies) elements.detailSmartReplies.innerHTML = '';
                  if (elements.detailSubtext) elements.detailSubtext.innerHTML = '<span class="text-muted text-sm">No subtext analysis</span>';
                }
              }
            } else {
              showToast(swData.detail || 'Failed to switch account', 'error');
            }
          } catch (err) {
            showToast(`Error switching account: ${err.message}`, 'error');
          }
        });
      });

      // Click to delete
      elements.accountMenuList.querySelectorAll('.account-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const accId = btn.dataset.deleteId;
          if (!confirm("Remove this account from Antigravity Mail AI?")) return;

          try {
            const delRes = await fetch(`/api/accounts/${accId}`, { method: 'DELETE' });
            const delData = await delRes.json();
            if (delRes.ok && delData.success) {
              showToast('Account removed', 'info');
              await loadAccounts();
              await loadStatus();
              await loadEmails();
            } else {
              showToast(delData.detail || 'Failed to remove account', 'error');
            }
          } catch (err) {
            showToast(`Error removing account: ${err.message}`, 'error');
          }
        });
      });
    }
  } catch (err) {
    console.warn('Failed to load accounts:', err);
  }
}

// ============================================================================
// Nova Autonomous Draft Queue & Workflows
// ============================================================================
function initDraftQueueModal() {
  if (elements.btnOpenDraftQueue) {
    elements.btnOpenDraftQueue.addEventListener('click', () => {
      if (elements.modalDraftQueue) elements.modalDraftQueue.style.display = 'flex';
      loadDraftQueue();
      loadWorkflowRules();
    });
  }

  if (elements.btnCloseDraftQueue) {
    elements.btnCloseDraftQueue.addEventListener('click', () => {
      if (elements.modalDraftQueue) elements.modalDraftQueue.style.display = 'none';
    });
  }

  if (elements.tabDraftsPending && elements.tabWorkflowsRules) {
    elements.tabDraftsPending.addEventListener('click', () => {
      elements.tabDraftsPending.classList.add('active');
      elements.tabWorkflowsRules.classList.remove('active');
      if (elements.viewPendingDrafts) elements.viewPendingDrafts.style.display = 'block';
      if (elements.viewWorkflowRules) elements.viewWorkflowRules.style.display = 'none';
    });

    elements.tabWorkflowsRules.addEventListener('click', () => {
      elements.tabWorkflowsRules.classList.add('active');
      elements.tabDraftsPending.classList.remove('active');
      if (elements.viewPendingDrafts) elements.viewPendingDrafts.style.display = 'none';
      if (elements.viewWorkflowRules) elements.viewWorkflowRules.style.display = 'block';
    });
  }

  if (elements.btnBatchApproveDrafts) {
    elements.btnBatchApproveDrafts.addEventListener('click', batchApproveDrafts);
  }
}

async function loadDraftQueueCount() {
  try {
    const res = await fetch('/api/drafts/queue');
    if (!res.ok) return;
    const data = await res.json();
    const count = data.count || 0;
    if (elements.draftsTabCount) elements.draftsTabCount.textContent = count;
    if (elements.hubBadgeDrafts) elements.hubBadgeDrafts.textContent = count;
  } catch (e) {
    console.warn('Failed to fetch draft count:', e);
  }
}

async function loadDraftQueue() {
  if (!elements.draftsQueueList) return;
  elements.draftsQueueList.innerHTML = `<div class="loading-state" style="padding: 40px;"><span>Loading staged drafts...</span></div>`;

  try {
    const res = await fetch('/api/drafts/queue');
    if (!res.ok) throw new Error('Failed to load queue');
    const data = await res.json();
    const drafts = data.drafts || [];

    if (elements.draftsTabCount) elements.draftsTabCount.textContent = drafts.length;
    if (elements.hubBadgeDrafts) elements.hubBadgeDrafts.textContent = drafts.length;

    if (drafts.length === 0) {
      elements.draftsQueueList.innerHTML = `
        <div class="empty-drafts-notice">
          <span style="font-size: 32px; display: block; margin-bottom: 10px;">✨</span>
          <div style="font-weight: 600; color: #ffffff; font-size: 15px;">Queue is Clear!</div>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Nova autonomously drafts replies when high-priority messages or workflow triggers arrive.</div>
        </div>
      `;
      return;
    }

    elements.draftsQueueList.innerHTML = drafts.map(d => `
      <div class="draft-card" id="draft-card-${d.id}">
        <div class="draft-card-header">
          <div class="draft-card-meta">
            <span class="draft-tag-reason">${escapeHtml(d.reason || 'Autonomous Trigger')}</span>
            <span class="draft-recipient-badge">To: ${escapeHtml(d.recipient)}</span>
          </div>
          <span class="draft-time">${escapeHtml(d.created_at || 'Staged')}</span>
        </div>
        <div class="draft-subject-line">Re: ${escapeHtml(d.subject)}</div>
        <textarea class="draft-textarea-edit" id="draft-text-${d.id}" rows="4">${escapeHtml(d.body)}</textarea>
        <div class="draft-card-footer">
          <div class="draft-meta-info">Triggered by ${escapeHtml(d.origin_agent || 'Ghostwriter')} Agent</div>
          <div class="draft-action-btns">
            <button class="btn btn-sm btn-outline btn-dismiss-draft" data-id="${d.id}">Dismiss</button>
            <button class="btn btn-sm btn-primary btn-approve-draft" data-id="${d.id}">
              <span>Approve & Send</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Approve & Dismiss handlers
    elements.draftsQueueList.querySelectorAll('.btn-approve-draft').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const textarea = document.getElementById(`draft-text-${id}`);
        const text = textarea ? textarea.value : '';
        approveDraft(id, text);
      });
    });

    elements.draftsQueueList.querySelectorAll('.btn-dismiss-draft').forEach(btn => {
      btn.addEventListener('click', () => {
        dismissDraft(btn.dataset.id);
      });
    });
  } catch (err) {
    elements.draftsQueueList.innerHTML = `<div class="empty-drafts-notice"><span style="color: #ef4444;">Error loading drafts: ${escapeHtml(err.message)}</span></div>`;
  }
}

async function approveDraft(id, editedBody) {
  try {
    const res = await fetch(`/api/drafts/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edited_body: editedBody })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✓ Draft approved and sent via SMTP!', 'success');
      await loadDraftQueue();
      await loadDraftQueueCount();
      await loadStatus();
      await loadEmails();
    } else {
      showToast(`Approval failed: ${data.message || 'Server error'}`, 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function dismissDraft(id) {
  try {
    const res = await fetch(`/api/drafts/${id}/dismiss`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('Draft dismissed', 'info');
      await loadDraftQueue();
      await loadDraftQueueCount();
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function batchApproveDrafts() {
  const btn = elements.btnBatchApproveDrafts;
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/drafts/approve-all', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ Approved & sent all ${data.count} staged drafts!`, 'success');
      await loadDraftQueue();
      await loadDraftQueueCount();
      await loadStatus();
      await loadEmails();
    } else {
      showToast('No pending drafts to approve', 'info');
    }
  } catch (err) {
    showToast(`Batch error: ${err.message}`, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function loadWorkflowRules() {
  if (!elements.workflowsRulesList) return;
  try {
    const res = await fetch('/api/workflows/rules');
    if (!res.ok) return;
    const data = await res.json();
    const rules = data.rules || [];

    elements.workflowsRulesList.innerHTML = rules.map(r => `
      <div class="rule-card">
        <div class="rule-header">
          <div class="rule-name-wrap">
            <span class="rule-icon">⚡</span>
            <span class="rule-name">${escapeHtml(r.name)}</span>
          </div>
          <span class="rule-status-badge ${r.enabled ? 'active' : ''}">${r.enabled ? 'ACTIVE' : 'PAUSED'}</span>
        </div>
        <div class="rule-body">
          <div class="rule-detail-row">
            <span class="rule-label">WHEN:</span>
            <span class="rule-val">${escapeHtml(r.condition_desc || 'Matching email arrives')}</span>
          </div>
          <div class="rule-detail-row">
            <span class="rule-label">THEN:</span>
            <span class="rule-val">${escapeHtml(r.action_desc || 'Execute autonomous workflow')}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Failed to load rules:', err);
  }
}

// ============================================================================
// Executive Analytics & Inbox Health
// ============================================================================
function initAnalyticsModal() {
  if (elements.btnOpenAnalytics) {
    elements.btnOpenAnalytics.addEventListener('click', () => {
      if (elements.modalAnalytics) elements.modalAnalytics.style.display = 'flex';
      loadAnalyticsData();
    });
  }

  if (elements.btnCloseAnalytics) {
    elements.btnCloseAnalytics.addEventListener('click', () => {
      if (elements.modalAnalytics) elements.modalAnalytics.style.display = 'none';
    });
  }
}

async function loadAnalyticsHealthBadge() {
  try {
    const res = await fetch('/api/analytics/overview');
    if (!res.ok) return;
    const data = await res.json();
    if (elements.hubBadgeHealth && data.health_score !== undefined) {
      elements.hubBadgeHealth.textContent = `${data.health_score}%`;
    }
  } catch (e) {
    console.warn('Failed to load health badge:', e);
  }
}

async function loadAnalyticsData() {
  try {
    const res = await fetch('/api/analytics/overview');
    if (!res.ok) throw new Error('Analytics failed');
    const data = await res.json();

    if (elements.analyticsHealthScoreVal) elements.analyticsHealthScoreVal.textContent = data.health_score || 92;
    if (elements.analyticsHealthGrade) {
      elements.analyticsHealthGrade.textContent = `${data.health_grade || 'A+'} (${data.health_desc || 'Optimal'})`;
      elements.analyticsHealthGrade.style.color = (data.health_score >= 80) ? '#10b981' : (data.health_score >= 60 ? '#f59e0b' : '#ef4444');
    }
    if (elements.statThreatsDeterred) elements.statThreatsDeterred.textContent = `🛡️ ${data.threats_deterred || 0} Threats Deterred`;
    if (elements.statDraftsStaged) elements.statDraftsStaged.textContent = `⚡ ${data.drafts_staged || 0} Auto-Drafts Ready`;
    if (elements.analyticsStatTotal) elements.analyticsStatTotal.textContent = data.total_emails || 0;
    if (elements.analyticsStatUnread) elements.analyticsStatUnread.textContent = data.unread_count || 0;
    if (elements.analyticsStatTasks) elements.analyticsStatTasks.textContent = data.pending_actions || 0;
    if (elements.analyticsStatStress) elements.analyticsStatStress.textContent = `${data.stress_percent || 15}%`;

    // Render Category Breakdown Bars
    if (elements.analyticsCategoryBars && data.categories) {
      elements.analyticsCategoryBars.innerHTML = data.categories.map(cat => `
        <div class="category-bar-row">
          <div class="bar-meta-left">
            <span class="bar-cat-name">${escapeHtml(cat.name)}</span>
            <span class="bar-cat-count">${cat.count} email${cat.count === 1 ? '' : 's'}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${cat.percent}%; background: ${cat.color || 'var(--accent-primary)'};"></div>
          </div>
          <span class="bar-pct-val">${cat.percent}%</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Failed to load analytics details:', err);
  }
}

// ============================================================================
// Continuous Hands-Free Voice Call Overlay ("Call Nova 📞")
// ============================================================================
let voiceCallActive = false;
let voiceCallMuted = false;
let voiceCallRecognition = null;
let voiceCallTimerInterval = null;
let voiceCallSeconds = 0;

function initContinuousVoiceCall() {
  const triggerBtn = elements.btnCallNova || elements.btnStartVoiceCall;
  if (triggerBtn) {
    triggerBtn.addEventListener('click', startVoiceCall);
  }

  const endBtn = elements.btnEndCall || elements.btnEndVoiceCall;
  if (endBtn) {
    endBtn.addEventListener('click', endVoiceCall);
  }

  const muteBtn = elements.btnCallToggleMic || elements.btnVoiceCallMute;
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      voiceCallMuted = !voiceCallMuted;
      if (elements.callMicIcon) elements.callMicIcon.textContent = voiceCallMuted ? '🔇' : '🎙️';
      if (elements.callMicLabel) elements.callMicLabel.textContent = voiceCallMuted ? 'Unmute' : 'Mute';
      showToast(voiceCallMuted ? 'Call muted' : 'Call unmuted', 'info');
      if (!voiceCallMuted && voiceCallActive) {
        listenVoiceCallTurn();
      }
    });
  }
}

function startVoiceCall() {
  // Close chat drawer if open
  closeCompanionDrawer();

  const modal = elements.modalLiveCall || elements.modalVoiceCall;
  if (modal) modal.style.display = 'flex';
  voiceCallActive = true;
  voiceCallMuted = false;
  voiceCallSeconds = 0;

  // Start timer
  if (voiceCallTimerInterval) clearInterval(voiceCallTimerInterval);
  voiceCallTimerInterval = setInterval(() => {
    voiceCallSeconds++;
    const mins = String(Math.floor(voiceCallSeconds / 60)).padStart(2, '0');
    const secs = String(voiceCallSeconds % 60).padStart(2, '0');
    if (elements.callTimerDisplay) elements.callTimerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);

  if (elements.audioWaveformBars) elements.audioWaveformBars.classList.add('active');
  if (elements.callStateText) elements.callStateText.textContent = 'Nova connecting...';
  if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
  if (elements.callUserTranscript) elements.callUserTranscript.textContent = '"Connecting..."';
  if (elements.callNovaTranscript) {
    elements.callNovaTranscript.textContent = '"Hey Santhosh! I\'m on the line with full mailbox access. What do you want me to do today, bro?"';
  }

  // Greeting
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const greeting = new SpeechSynthesisUtterance("Hey Santhosh! I'm on the line with full access to your inbox. What do you want me to do today, bro?");
    greeting.rate = 1.05;
    greeting.pitch = 1.0;
    if (elements.callAvatarCore) elements.callAvatarCore.classList.add('speaking');
    if (elements.callStateText) elements.callStateText.textContent = 'Nova speaking...';

    greeting.onend = () => {
      if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
      if (voiceCallActive && !voiceCallMuted) {
        listenVoiceCallTurn();
      }
    };
    greeting.onerror = () => {
      if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
      if (voiceCallActive && !voiceCallMuted) {
        listenVoiceCallTurn();
      }
    };
    window.speechSynthesis.speak(greeting);
  } else {
    listenVoiceCallTurn();
  }
}

function listenVoiceCallTurn() {
  if (!voiceCallActive || voiceCallMuted) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (elements.callStateText) elements.callStateText.textContent = 'SpeechRecognition unsupported in this browser';
    return;
  }

  if (elements.callStateText) elements.callStateText.textContent = 'Listening to Santhosh... 🎙️';
  if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
  if (elements.audioWaveformBars) elements.audioWaveformBars.classList.add('active');

  try {
    voiceCallRecognition = new SpeechRecognition();
    voiceCallRecognition.continuous = false;
    voiceCallRecognition.interimResults = false;
    voiceCallRecognition.lang = 'en-US';

    voiceCallRecognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript || !voiceCallActive) return;

      if (elements.callUserTranscript) {
        elements.callUserTranscript.innerHTML = `<b>You:</b> "${escapeHtml(transcript)}"`;
      }
      if (elements.callStateText) elements.callStateText.textContent = 'Nova thinking & executing...';

      try {
        const res = await fetch('/api/companion/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript })
        });
        const data = await res.json();

        // Refresh feeds if actions were performed
        if (data.actions_taken && data.actions_taken.length > 0) {
          await loadStatus();
          await loadEmails();
          await loadDraftQueueCount();
        }

        const replyText = data.speech_text || data.reply || 'All done bro!';
        if (elements.callNovaTranscript) {
          elements.callNovaTranscript.innerHTML = `<b>Nova:</b> "${escapeHtml(data.reply || replyText)}"`;
        }
        if (elements.callStateText) elements.callStateText.textContent = 'Nova speaking...';
        if (elements.callAvatarCore) elements.callAvatarCore.classList.add('speaking');

        // Play voice response
        if ('speechSynthesis' in window && voiceCallActive) {
          window.speechSynthesis.cancel();
          const ut = new SpeechSynthesisUtterance(replyText.replace(/[*#_`]/g, ''));
          ut.rate = 1.05;
          ut.pitch = 1.0;
          ut.onend = () => {
            if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
            if (voiceCallActive && !voiceCallMuted) {
              listenVoiceCallTurn();
            }
          };
          ut.onerror = () => {
            if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
            if (voiceCallActive && !voiceCallMuted) {
              listenVoiceCallTurn();
            }
          };
          window.speechSynthesis.speak(ut);
        } else if (voiceCallActive && !voiceCallMuted) {
          setTimeout(listenVoiceCallTurn, 1500);
        }
      } catch (err) {
        if (elements.callNovaTranscript) {
          elements.callNovaTranscript.textContent = `Error: ${err.message}`;
        }
        if (voiceCallActive && !voiceCallMuted) {
          setTimeout(listenVoiceCallTurn, 2000);
        }
      }
    };

    voiceCallRecognition.onerror = (e) => {
      console.warn('Call voice error:', e.error);
      if (voiceCallActive && !voiceCallMuted && e.error !== 'aborted') {
        setTimeout(listenVoiceCallTurn, 1000);
      }
    };

    voiceCallRecognition.start();
  } catch (err) {
    console.warn('Voice start exception:', err);
  }
}

function endVoiceCall() {
  voiceCallActive = false;
  if (voiceCallTimerInterval) {
    clearInterval(voiceCallTimerInterval);
    voiceCallTimerInterval = null;
  }
  if (voiceCallRecognition) {
    try { voiceCallRecognition.abort(); } catch (e) {}
    voiceCallRecognition = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const modal = elements.modalLiveCall || elements.modalVoiceCall;
  if (modal) modal.style.display = 'none';
  if (elements.audioWaveformBars) elements.audioWaveformBars.classList.remove('active');
  if (elements.callAvatarCore) elements.callAvatarCore.classList.remove('speaking');
}

// ============================================================================
// PWA & Service Worker Manager
// ============================================================================
let deferredInstallPrompt = null;

function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('PWA ServiceWorker registered successfully:', reg.scope);
      }).catch((err) => {
        console.warn('PWA ServiceWorker registration failed:', err);
      });
    });
  }

  // Capture install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (elements.btnInstallPwa) {
      elements.btnInstallPwa.style.display = 'inline-flex';
    }
  });

  if (elements.btnInstallPwa) {
    elements.btnInstallPwa.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          elements.btnInstallPwa.style.display = 'none';
          showToast('✓ Antigravity Mail AI installed successfully!', 'success');
        }
        deferredInstallPrompt = null;
      } else {
        showToast('App ready! Click browser menu -> "Install Antigravity Mail AI"', 'info');
      }
    });
  }
}

// ============================================================================
// Telegram & Mobile Remote Hub
// ============================================================================
function initTelegramHub() {
  if (elements.btnOpenTelegramHub) {
    elements.btnOpenTelegramHub.addEventListener('click', () => {
      if (elements.modalTelegramHub) elements.modalTelegramHub.style.display = 'flex';
      loadTelegramStatus();
    });
  }

  if (elements.btnCloseTelegramHub) {
    elements.btnCloseTelegramHub.addEventListener('click', () => {
      if (elements.modalTelegramHub) elements.modalTelegramHub.style.display = 'none';
    });
  }

  if (elements.btnTestTgDispatch) {
    elements.btnTestTgDispatch.addEventListener('click', async () => {
      const btn = elements.btnTestTgDispatch;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await fetch('/api/telegram/test', { method: 'POST' });
        const data = await res.json();
        showToast(data.message, data.success ? 'success' : 'error');
      } catch (err) {
        showToast(`Test error: ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🔔 Send Test Alert</span>';
      }
    });
  }

  if (elements.btnRunTgCommand) {
    elements.btnRunTgCommand.addEventListener('click', executeTgSimulatorCommand);
  }
  if (elements.tgCommandInput) {
    elements.tgCommandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeTgSimulatorCommand();
    });
  }
}

async function loadTelegramStatus() {
  try {
    const res = await fetch('/api/telegram/status');
    if (!res.ok) return;
    const data = await res.json();
    if (elements.tgStatusText) {
      elements.tgStatusText.textContent = data.configured ? 'Bridge: Active & Connected' : 'Bridge: Not configured yet';
      elements.tgStatusText.style.color = data.configured ? '#34d399' : '#f59e0b';
    }
    if (elements.tgStatusDetail) {
      elements.tgStatusDetail.textContent = data.configured ? 'Ready to receive commands from your phone' : 'Enter TELEGRAM_BOT_TOKEN and CHAT_ID in Settings';
    }
  } catch (e) {
    console.warn('Telegram status error:', e);
  }
}

async function executeTgSimulatorCommand() {
  if (!elements.tgCommandInput || !elements.tgCommandOutput) return;
  const cmd = elements.tgCommandInput.value.trim();
  if (!cmd) return;

  elements.tgCommandOutput.textContent = `Executing command: ${cmd}...`;
  try {
    const res = await fetch('/api/telegram/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    const data = await res.json();
    elements.tgCommandOutput.innerHTML = data.response;
  } catch (err) {
    elements.tgCommandOutput.textContent = `Execution failed: ${err.message}`;
  }
}
// ============================================================================
// 1. Inbox Declutter & Newsletter Sweeper
// ============================================================================
function initDeclutterModal() {
  if (elements.btnOpenDeclutter) {
    elements.btnOpenDeclutter.addEventListener('click', () => {
      if (elements.modalDeclutter) elements.modalDeclutter.style.display = 'flex';
      loadDeclutterData();
    });
  }

  if (elements.btnCloseDeclutter) {
    elements.btnCloseDeclutter.addEventListener('click', () => {
      if (elements.modalDeclutter) elements.modalDeclutter.style.display = 'none';
    });
  }
}

async function loadDeclutterBadge() {
  try {
    const res = await fetch('/api/inbox/declutter');
    if (!res.ok) return;
    const data = await res.json();
    if (elements.hubBadgeDeclutter) {
      elements.hubBadgeDeclutter.textContent = data.total_clutter_emails || 0;
    }
  } catch (e) {
    console.warn('Declutter badge error:', e);
  }
}

async function loadDeclutterData() {
  if (!elements.declutterSendersList) return;
  elements.declutterSendersList.innerHTML = `<div class="loading-state" style="padding: 30px;"><span>Scanning automated mailing lists...</span></div>`;

  try {
    const res = await fetch('/api/inbox/declutter');
    if (!res.ok) throw new Error('Declutter analysis failed');
    const data = await res.json();

    if (elements.declutterStatSenders) elements.declutterStatSenders.textContent = data.total_senders || 0;
    if (elements.declutterStatEmails) elements.declutterStatEmails.textContent = data.total_clutter_emails || 0;
    if (elements.declutterStatTime) elements.declutterStatTime.textContent = `${data.estimated_time_saved_minutes || 0}m`;
    if (elements.hubBadgeDeclutter) elements.hubBadgeDeclutter.textContent = data.total_clutter_emails || 0;

    const senders = data.senders || [];
    if (senders.length === 0) {
      elements.declutterSendersList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 30px;">
          ✨ No clutter or excessive newsletter senders detected! Inbox is pristine.
        </div>
      `;
      return;
    }

    elements.declutterSendersList.innerHTML = senders.map(s => `
      <div class="declutter-sender-card">
        <div class="sender-meta-col">
          <div class="sender-title-row">
            <span class="sender-name-text">${escapeHtml(s.sender_name)}</span>
            <span class="sender-vol-pill">${s.count} email${s.count === 1 ? '' : 's'} (${s.unread_count} unread)</span>
          </div>
          <div class="sender-email-text">${escapeHtml(s.sender_email)}</div>
          <div class="sender-sample-sub">Latest: "${escapeHtml(s.sample_subject)}"</div>
        </div>
        <div class="sender-actions-row">
          <button class="btn btn-xs btn-outline btn-sweep-sender" data-email="${s.sender_email}">
            🧹 Sweep Read
          </button>
          <a href="${s.unsubscribe_url}" target="_blank" class="btn btn-xs btn-outline" style="color: #f472b6; border-color: rgba(236,72,153,0.35);">
            Unsubscribe ↗
          </a>
        </div>
      </div>
    `).join('');

    elements.declutterSendersList.querySelectorAll('.btn-sweep-sender').forEach(btn => {
      btn.addEventListener('click', async () => {
        const email = btn.dataset.email;
        btn.disabled = true;
        btn.textContent = 'Sweeping...';
        await sweepSender(email);
      });
    });
  } catch (err) {
    elements.declutterSendersList.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error: ${escapeHtml(err.message)}</div>`;
  }
}

async function sweepSender(senderEmail) {
  try {
    const res = await fetch('/api/inbox/declutter/sweep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_email: senderEmail })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ Cleaned ${data.swept_count} emails from ${senderEmail}`, 'success');
      await loadDeclutterData();
      await loadEmails();
      await loadStatus();
    }
  } catch (err) {
    showToast(`Sweep error: ${err.message}`, 'error');
  }
}

// ============================================================================
// 2. Ghost Follow-up Autonomous Watchdog
// ============================================================================
function initFollowupsModal() {
  if (elements.btnOpenFollowups) {
    elements.btnOpenFollowups.addEventListener('click', () => {
      if (elements.modalFollowups) elements.modalFollowups.style.display = 'flex';
      loadFollowupsData();
    });
  }

  if (elements.btnCloseFollowups) {
    elements.btnCloseFollowups.addEventListener('click', () => {
      if (elements.modalFollowups) elements.modalFollowups.style.display = 'none';
    });
  }
}

async function loadFollowupsBadge() {
  try {
    const res = await fetch('/api/followups/pending');
    if (!res.ok) return;
    const items = await res.json();
    if (elements.hubBadgeFollowups && Array.isArray(items)) {
      elements.hubBadgeFollowups.textContent = items.length;
    }
  } catch (e) {
    console.warn('Followups badge error:', e);
  }
}

async function loadFollowupsData() {
  if (!elements.followupsList) return;
  elements.followupsList.innerHTML = `<div class="loading-state" style="padding: 30px;"><span>Scanning pending threads...</span></div>`;

  try {
    const res = await fetch('/api/followups/pending');
    if (!res.ok) throw new Error('Follow-up scan failed');
    const items = await res.json();

    if (elements.hubBadgeFollowups) elements.hubBadgeFollowups.textContent = items.length;

    if (!items || items.length === 0) {
      elements.followupsList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 30px;">
          ✨ All threads active! No unresolved radio-silence detected.
        </div>
      `;
      return;
    }

    elements.followupsList.innerHTML = items.map(f => `
      <div class="followup-card">
        <div class="followup-card-header">
          <div class="followup-recipient-col">
            <span class="followup-name">${escapeHtml(f.recipient_name)}</span>
            <span class="followup-email">${escapeHtml(f.recipient_email)} • Sent ${escapeHtml(f.sent_date)}</span>
          </div>
          <span class="followup-days-pill">⏳ ${f.days_waiting}d silence (${f.urgency})</span>
        </div>
        <div class="followup-subject-line">Original: "${escapeHtml(f.original_subject)}"</div>
        <div class="followup-nudge-preview">
          <div style="font-size: 10px; font-weight: 700; color: #fb923c; margin-bottom: 4px; text-transform: uppercase;">Staged Gentle Nudge (Santhosh Voice):</div>
          "${escapeHtml(f.staged_nudge)}"
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-sm btn-primary btn-stage-fup" data-id="${f.id}">
            <span>⚡ Stage Nudge in Draft Queue</span>
          </button>
        </div>
      </div>
    `).join('');

    elements.followupsList.querySelectorAll('.btn-stage-fup').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Staging...';
        await stageFollowupNudge(id);
      });
    });
  } catch (err) {
    elements.followupsList.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error: ${escapeHtml(err.message)}</div>`;
  }
}

async function stageFollowupNudge(fupId) {
  try {
    const res = await fetch(`/api/followups/${fupId}/nudge`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || '✓ Follow-up nudge staged in Draft Queue!', 'success');
      await loadDraftQueueCount();
      if (elements.modalFollowups) elements.modalFollowups.style.display = 'none';
      if (elements.modalDraftQueue) elements.modalDraftQueue.style.display = 'flex';
      await loadDraftQueue();
    }
  } catch (err) {
    showToast(`Error staging nudge: ${err.message}`, 'error');
  }
}

// ============================================================================
// 3. Multimodal Attachment & Document Intelligence Viewer
// ============================================================================
function initAttachmentViewer() {
  if (elements.btnCloseAttachmentViewer) {
    elements.btnCloseAttachmentViewer.addEventListener('click', () => {
      if (elements.modalAttachmentViewer) elements.modalAttachmentViewer.style.display = 'none';
    });
  }
}

async function openAttachmentViewer(emailId, attIdx = 0) {
  if (!elements.modalAttachmentViewer) return;
  elements.modalAttachmentViewer.style.display = 'flex';

  if (elements.attFilenameText) elements.attFilenameText.textContent = 'Analyzing document...';
  if (elements.attTakeawaysList) elements.attTakeawaysList.innerHTML = '<li>Extracting key intelligence...</li>';
  if (elements.attDatesBox) elements.attDatesBox.textContent = '';
  if (elements.attActionsBox) elements.attActionsBox.textContent = '';

  try {
    const res = await fetch(`/api/emails/${emailId}/attachments/${attIdx}/analyze`);
    if (!res.ok) throw new Error('Attachment analysis failed');
    const data = await res.json();

    if (elements.attFilenameText) elements.attFilenameText.textContent = data.filename || 'Document';
    if (elements.attMetaText) elements.attMetaText.textContent = `${data.file_type} • ${data.file_size} • ${data.security_verdict}`;
    
    if (elements.attTakeawaysList && data.key_takeaways) {
      elements.attTakeawaysList.innerHTML = data.key_takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('');
    }

    if (elements.attDatesBox && data.extracted_dates) {
      elements.attDatesBox.innerHTML = `<b>🗓️ Schedule & Dates:</b> ${data.extracted_dates.map(d => escapeHtml(d)).join('; ')}`;
    }

    if (elements.attActionsBox && data.recommended_actions) {
      elements.attActionsBox.innerHTML = `<b>⚡ Recommended Actions:</b> ${data.recommended_actions.map(a => escapeHtml(a)).join(' • ')}`;
    }
  } catch (err) {
    if (elements.attTakeawaysList) {
      elements.attTakeawaysList.innerHTML = `<li style="color: #ef4444;">Error: ${escapeHtml(err.message)}</li>`;
    }
  }
}

// ============================================================================
// 4. Style Cloning: Santhosh's Voice Profile
// ============================================================================
function initStyleProfileModal() {
  if (elements.btnOpenStyleProfile) {
    elements.btnOpenStyleProfile.addEventListener('click', () => {
      if (elements.modalStyleProfile) elements.modalStyleProfile.style.display = 'flex';
      loadStyleProfileData();
    });
  }

  if (elements.btnCloseStyleProfile) {
    elements.btnCloseStyleProfile.addEventListener('click', () => {
      if (elements.modalStyleProfile) elements.modalStyleProfile.style.display = 'none';
    });
  }

  if (elements.btnRetrainStyle) {
    elements.btnRetrainStyle.addEventListener('click', retrainStyleProfile);
  }
}

async function loadStyleProfileData() {
  try {
    const res = await fetch('/api/style/profile');
    if (!res.ok) return;
    const profile = await res.json();

    if (elements.styleProfileName) elements.styleProfileName.textContent = `${profile.user_name} (Voice Model)`;
    if (elements.styleProfileTone) elements.styleProfileTone.textContent = `Tone: ${profile.tone} (Formality: ${profile.formality_score}/100, Directness: ${profile.directness_score}/100)`;

    if (elements.styleGreetingsChips && profile.preferred_greetings) {
      elements.styleGreetingsChips.innerHTML = profile.preferred_greetings.map(g => `
        <span class="prompt-chip" style="font-size: 11px;">${escapeHtml(g)}</span>
      `).join('') + (profile.preferred_signoffs || []).map(s => `
        <span class="prompt-chip" style="font-size: 11px; background: rgba(99,102,241,0.15); color: #a5b4fc;">${escapeHtml(s.replace('\n', ' '))}</span>
      `).join('');
    }

    if (elements.styleSamplesList && profile.sample_phrases) {
      elements.styleSamplesList.innerHTML = profile.sample_phrases.map(p => `
        <div style="margin-bottom: 6px; padding-left: 10px; border-left: 2px solid #818cf8;">"${escapeHtml(p)}"</div>
      `).join('');
    }
  } catch (err) {
    console.warn('Style profile error:', err);
  }
}

async function retrainStyleProfile() {
  const btn = elements.btnRetrainStyle;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;"></span> Analyzing sent mailbox communications...`;
  }

  try {
    const res = await fetch('/api/style/train', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast('✓ Santhosh voice profile retrained successfully!', 'success');
      await loadStyleProfileData();
    }
  } catch (err) {
    showToast(`Retrain error: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🔄 Retrain Style from Sent Mail</span>`;
    }
  }
}

// ============================================================================
// 10. Zero-Day Phishing & Security Threat Radar
// ============================================================================
function initSecurityHub() {
  if (elements.btnOpenSecurityHub) {
    elements.btnOpenSecurityHub.addEventListener('click', () => {
      if (elements.modalSecurityHub) elements.modalSecurityHub.style.display = 'flex';
      loadSecurityData();
    });
  }

  if (elements.btnCloseSecurityHub) {
    elements.btnCloseSecurityHub.addEventListener('click', () => {
      if (elements.modalSecurityHub) elements.modalSecurityHub.style.display = 'none';
    });
  }
}

async function loadSecurityData() {
  try {
    const res = await fetch('/api/security/overview');
    if (!res.ok) return;
    const data = await res.json();

    if (elements.secStatScanned) elements.secStatScanned.textContent = data.total_scanned || 0;
    if (elements.secStatHealth) elements.secStatHealth.textContent = `${data.average_safety_score || 100}%`;
    if (elements.secStatThreats) elements.secStatThreats.textContent = data.threats_detected || 0;

    const threats = data.threat_items || [];
    if (!elements.secThreatsList) return;

    if (threats.length === 0) {
      elements.secThreatsList.innerHTML = `
        <div style="text-align: center; color: #34d399; padding: 24px; background: rgba(16,185,129,0.06); border-radius: 8px;">
          ✨ Zero malicious threat vectors detected. All communications pass cryptographic SPF/Domain verification.
        </div>
      `;
      return;
    }

    elements.secThreatsList.innerHTML = threats.map(t => `
      <div class="sec-threat-item">
        <div class="sec-threat-header">
          <div class="sec-threat-title">${escapeHtml(t.sender)}</div>
          <span class="sec-verdict-pill sec-verdict-${t.badge_color}">${escapeHtml(t.verdict)}</span>
        </div>
        <div style="font-size: 11px; color: #ef4444; margin-bottom: 6px;">
          ${(t.flags || []).map(f => `⚠️ ${escapeHtml(f)}`).join('<br>')}
        </div>
        <div style="font-size: 11px; color: #94a3b8; font-style: italic;">Advice: ${escapeHtml(t.tactical_advice)}</div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('Security radar error:', e);
  }
}

// ============================================================================
// 11. Autonomous Workflow Automations ("Nova Zapier")
// ============================================================================
function initAutomationsHub() {
  if (elements.btnOpenAutomationsHub) {
    elements.btnOpenAutomationsHub.addEventListener('click', () => {
      if (elements.modalAutomationsHub) elements.modalAutomationsHub.style.display = 'flex';
      loadAutomationsData();
    });
  }

  if (elements.btnCloseAutomationsHub) {
    elements.btnCloseAutomationsHub.addEventListener('click', () => {
      if (elements.modalAutomationsHub) elements.modalAutomationsHub.style.display = 'none';
    });
  }

  if (elements.btnRunAllAutomations) {
    elements.btnRunAllAutomations.addEventListener('click', async () => {
      const btn = elements.btnRunAllAutomations;
      btn.disabled = true;
      btn.textContent = 'Executing rules...';
      try {
        const res = await fetch('/api/automations/run', { method: 'POST' });
        const data = await res.json();
        showToast(`✓ Applied ${data.total_triggered} automated actions across inbox!`, 'success');
        await loadEmails();
        await loadAutomationsData();
      } catch (err) {
        showToast(`Automations run failed: ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Run All Rules Now</span>';
      }
    });
  }
}

async function loadAutomationsData() {
  try {
    const res = await fetch('/api/automations');
    if (!res.ok) return;
    const rules = await res.json();

    if (!elements.automationsList) return;
    if (rules.length === 0) {
      elements.automationsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No active automation rules.</div>`;
      return;
    }

    elements.automationsList.innerHTML = rules.map(r => `
      <div class="automation-card">
        <div>
          <div class="auto-title-row">
            <span class="auto-name">${escapeHtml(r.name)}</span>
            <span class="auto-badge">${r.enabled ? 'ACTIVE' : 'PAUSED'}</span>
          </div>
          <div class="auto-desc">${escapeHtml(r.description)}</div>
          <div class="auto-stats">Trigger: ${escapeHtml(r.trigger?.field)} ${escapeHtml(r.trigger?.operator)} "${escapeHtml(r.trigger?.value)}" • Fired ${r.execution_count || 0} times</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('Automations load error:', e);
  }
}

// ============================================================================
// 12. Contact & People Intelligence CRM
// ============================================================================
function initContactsHub() {
  if (elements.btnOpenContactsHub) {
    elements.btnOpenContactsHub.addEventListener('click', () => {
      if (elements.modalContactsHub) elements.modalContactsHub.style.display = 'flex';
      loadContactsData();
    });
  }

  if (elements.btnCloseContactsHub) {
    elements.btnCloseContactsHub.addEventListener('click', () => {
      if (elements.modalContactsHub) elements.modalContactsHub.style.display = 'none';
    });
  }
}

async function loadContactsData() {
  try {
    const res = await fetch('/api/contacts');
    if (!res.ok) return;
    const contacts = await res.json();

    if (!elements.contactsGrid) return;
    if (contacts.length === 0) {
      elements.contactsGrid.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No contacts detected.</div>`;
      return;
    }

    elements.contactsGrid.innerHTML = contacts.map(c => `
      <div class="contact-card">
        <div class="contact-top-row">
          <span class="contact-name">${escapeHtml(c.name)}</span>
          <span class="contact-tier-badge contact-tier-${c.badge_color}">${escapeHtml(c.relationship_tier)}</span>
        </div>
        <div class="contact-email">${escapeHtml(c.email)}</div>
        <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 8px;">
          Sentiment: <b style="color: #38bdf8;">${escapeHtml(c.sentiment_summary)}</b>
        </div>
        <div class="contact-meta-row">
          <span>${c.interaction_count} message${c.interaction_count === 1 ? '' : 's'}</span>
          <span>Last: ${escapeHtml(c.latest_interaction)}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('Contacts load error:', e);
  }
}

// ============================================================================
// IIT Madras Smail Quick Connection Helpers
// ============================================================================
window.copySmailCodeGlobal = async function() {
  try {
    const res = await fetch('/api/smail/script-code');
    const data = await res.json();
    if (data.code) {
      await navigator.clipboard.writeText(data.code);
      showToast('✓ Apps Script code copied to clipboard!', 'success');
    } else {
      showToast('Failed to load Apps Script code.', 'error');
    }
  } catch (err) {
    showToast('Failed to copy code: ' + err.message, 'error');
  }
};

window.saveSmailUrlFromDetail = async function() {
  const input = document.getElementById('quick-smail-url-detail');
  if (!input) return;
  const url = input.value.trim();
  if (!url || !url.startsWith('https://script.google.com')) {
    showToast('Please paste a valid Web App URL (starts with https://script.google.com)', 'error');
    return;
  }
  try {
    showToast('Saving IITM Smail URL...', 'info');
    const res = await fetch('/api/smail/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smail_script_url: url })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('✓ IIT Madras Smail URL saved! Syncing emails...', 'success');
      await loadConfig();
      await syncInbox();
    } else {
      showToast(data.detail || 'Failed to save Smail configuration', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
};

function setupSmailFeedListeners() {
  const saveBtn = document.getElementById('btn-save-smail-feed');
  const urlInput = document.getElementById('quick-smail-url-feed');

  if (saveBtn && urlInput) {
    saveBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url || !url.startsWith('https://script.google.com')) {
        showToast('Please paste a valid Web App URL (starts with https://script.google.com)', 'error');
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      try {
        const res = await fetch('/api/smail/configure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ smail_script_url: url })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✓ IIT Madras Smail URL saved! Syncing emails...', 'success');
          await loadConfig();
          await syncInbox();
        } else {
          showToast(data.detail || 'Failed to save Smail configuration', 'error');
        }
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Sync';
      }
    });
  }
}

// ============================================================================
// BREAKTHROUGH INNOVATION 1: OPPORTUNITY & ACADEMIC DEADLINE RADAR
// ============================================================================
let cachedOpportunities = [];

function initOpportunityRadar() {
  if (elements.btnOpenOpportunityRadar && elements.modalOpportunityRadar) {
    elements.btnOpenOpportunityRadar.addEventListener('click', () => {
      openModal(elements.modalOpportunityRadar);
      loadOpportunityRadar();
    });
  }
  if (elements.btnCloseOpportunityRadar) {
    elements.btnCloseOpportunityRadar.addEventListener('click', () => {
      closeModal(elements.modalOpportunityRadar);
    });
  }
  if (elements.btnRefreshRadar) {
    elements.btnRefreshRadar.addEventListener('click', () => {
      loadOpportunityRadar();
    });
  }
  if (elements.radarSearchInput) {
    elements.radarSearchInput.addEventListener('input', (e) => {
      filterRadarCards(e.target.value);
    });
  }
}

async function loadOpportunityRadar() {
  if (!elements.radarCardsGrid) return;
  elements.radarCardsGrid.innerHTML = `
    <div class="loading-state" style="padding: 30px; grid-column: 1 / -1;">
      <div class="spinner"></div>
      <span>Scanning emails for opportunities, internships &amp; deadlines...</span>
    </div>
  `;

  try {
    const res = await fetch('/api/radar/opportunities');
    const data = await res.json();
    cachedOpportunities = data.opportunities || [];

    if (elements.hubBadgeRadar) elements.hubBadgeRadar.textContent = cachedOpportunities.length;
    if (elements.radarStatCount) elements.radarStatCount.textContent = cachedOpportunities.length;
    if (elements.radarAccountTag) elements.radarAccountTag.textContent = data.account_name || 'Active Inbox';

    // Count urgent deadlines
    const urgentCount = cachedOpportunities.filter(o => o.urgency === 'Critical' || (o.deadline && o.deadline.includes('Urgent'))).length;
    if (elements.radarStatUrgent) elements.radarStatUrgent.textContent = urgentCount;

    // Top organization
    const topOrg = cachedOpportunities.length > 0 ? cachedOpportunities[0].organization : 'None';
    if (elements.radarStatTopOrg) elements.radarStatTopOrg.textContent = topOrg;

    renderRadarCards(cachedOpportunities);
  } catch (err) {
    elements.radarCardsGrid.innerHTML = `<div class="error-state" style="padding: 20px; grid-column: 1 / -1;">Failed to scan opportunities: ${escapeHtml(err.message)}</div>`;
  }
}

function renderRadarCards(opps) {
  if (!opps || opps.length === 0) {
    elements.radarCardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
        <p>No active campus notices or job opportunities detected in current mailbox cache.</p>
      </div>
    `;
    return;
  }

  elements.radarCardsGrid.innerHTML = opps.map(opp => `
    <div class="radar-card" data-id="${escapeHtml(opp.id)}">
      <div>
        <div class="radar-badge-row">
          <span class="radar-type-pill">${escapeHtml(opp.type)}</span>
          <span class="radar-match-score">🎯 ${opp.match_score || 90}% Match</span>
        </div>
        <div class="radar-org-title">${escapeHtml(opp.title)}</div>
        <div class="radar-entity">🏢 ${escapeHtml(opp.organization)}</div>
        <div class="radar-desc">${escapeHtml(opp.summary || '')}</div>
      </div>
      <div>
        <div class="radar-meta-chips" style="margin-bottom: 10px;">
          <span class="radar-meta-chip chip-stipend">💰 ${escapeHtml(opp.compensation)}</span>
          <span class="radar-meta-chip chip-deadline">⏰ ${escapeHtml(opp.deadline)}</span>
          <span class="radar-meta-chip">👥 ${escapeHtml(opp.eligibility)}</span>
        </div>
        <div class="radar-footer-actions">
          <button class="btn-cal-sync" onclick="addRadarToCalendar('${escapeHtml(opp.id)}')">
            📅 Add to Calendar
          </button>
          <button class="btn-view-thread" onclick="viewEmailFromRadar('${escapeHtml(opp.email_id)}')">
            View Thread →
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterRadarCards(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderRadarCards(cachedOpportunities);
    return;
  }
  const filtered = cachedOpportunities.filter(opp =>
    (opp.title && opp.title.toLowerCase().includes(q)) ||
    (opp.organization && opp.organization.toLowerCase().includes(q)) ||
    (opp.type && opp.type.toLowerCase().includes(q)) ||
    (opp.summary && opp.summary.toLowerCase().includes(q))
  );
  renderRadarCards(filtered);
}

window.addRadarToCalendar = async function(oppId) {
  const opp = cachedOpportunities.find(o => o.id === oppId);
  if (!opp) return;

  try {
    showToast(`Adding deadline for ${opp.organization} to calendar...`, 'info');
    const res = await fetch('/api/radar/add-to-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_id: opp.id,
        title: opp.title,
        deadline: opp.deadline,
        organization: opp.organization,
        details: opp.summary
      })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✓ Deadline added to your active calendar!`, 'success');
    } else {
      showToast(data.detail || 'Failed to sync to calendar', 'error');
    }
  } catch (err) {
    showToast(`Calendar sync error: ${err.message}`, 'error');
  }
};

window.viewEmailFromRadar = function(emailId) {
  closeModal(elements.modalOpportunityRadar);
  if (emailId) {
    selectEmail(emailId);
  }
};

async function loadRadarBadge() {
  try {
    const res = await fetch('/api/radar/opportunities');
    const data = await res.json();
    if (elements.hubBadgeRadar && data.opportunities) {
      elements.hubBadgeRadar.textContent = data.opportunities.length;
    }
  } catch (e) {}
}


// ============================================================================
// BREAKTHROUGH INNOVATION 2: BILATERAL COMMITMENT LEDGER
// ============================================================================
let cachedCommitments = null;

function initCommitmentLedger() {
  if (elements.btnOpenCommitmentLedger && elements.modalCommitmentLedger) {
    elements.btnOpenCommitmentLedger.addEventListener('click', () => {
      openModal(elements.modalCommitmentLedger);
      loadCommitmentLedger();
    });
  }
  if (elements.btnCloseCommitmentLedger) {
    elements.btnCloseCommitmentLedger.addEventListener('click', () => {
      closeModal(elements.modalCommitmentLedger);
    });
  }
}

async function loadCommitmentLedger() {
  try {
    const res = await fetch('/api/commitments/ledger');
    cachedCommitments = await res.json();

    const youMade = cachedCommitments.promises_you_made || [];
    const theyMade = cachedCommitments.promises_they_made || [];

    if (elements.hubBadgeCommitments) {
      elements.hubBadgeCommitments.textContent = youMade.length + theyMade.length;
    }
    if (elements.ledgerCountYou) elements.ledgerCountYou.textContent = youMade.length;
    if (elements.ledgerCountThey) elements.ledgerCountThey.textContent = theyMade.length;

    renderCommitmentLists(youMade, theyMade);
  } catch (err) {
    console.error('Failed to load commitments ledger', err);
  }
}

function renderCommitmentLists(youMade, theyMade) {
  if (elements.ledgerListYou) {
    if (!youMade.length) {
      elements.ledgerListYou.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No outstanding outbound promises found.</div>`;
    } else {
      elements.ledgerListYou.innerHTML = youMade.map(p => `
        <div class="ledger-item-card">
          <div class="ledger-item-header">
            <span class="ledger-party">To: ${escapeHtml(p.recipient || 'Recipient')}</span>
            <span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #93c5fd;">${escapeHtml(p.status || 'Active')}</span>
          </div>
          <div class="ledger-commitment-text">"${escapeHtml(p.commitment)}"</div>
          <div class="ledger-item-footer">
            <span class="ledger-deadline-pill">⏰ Due: ${escapeHtml(p.deadline || 'Upcoming')}</span>
            <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(p.made_on || '')}</span>
          </div>
        </div>
      `).join('');
    }
  }

  if (elements.ledgerListThey) {
    if (!theyMade.length) {
      elements.ledgerListThey.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No inbound promises awaiting fulfillment.</div>`;
    } else {
      elements.ledgerListThey.innerHTML = theyMade.map(p => `
        <div class="ledger-item-card">
          <div class="ledger-item-header">
            <span class="ledger-party" style="color: #34d399;">From: ${escapeHtml(p.promisor || 'Sender')}</span>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7;">${escapeHtml(p.status || 'Pending')}</span>
          </div>
          <div class="ledger-commitment-text">"${escapeHtml(p.commitment)}"</div>
          <div class="ledger-item-footer">
            <span class="ledger-deadline-pill">⏰ ${escapeHtml(p.expected_by || 'Soon')}</span>
            <button class="btn-nudge-commitment" onclick="nudgeCommitment('${escapeHtml(p.id)}')">
              ⚡ Send Polite Nudge
            </button>
          </div>
        </div>
      `).join('');
    }
  }
}

window.nudgeCommitment = async function(commitmentId) {
  try {
    showToast('Drafting diplomatic follow-up nudge...', 'info');
    const res = await fetch('/api/commitments/nudge-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commitment_id: commitmentId })
    });
    const nudge = await res.json();
    closeModal(elements.modalCommitmentLedger);

    if (elements.replyTextarea) {
      elements.replyTextarea.value = nudge.draft_body;
      elements.replyTextarea.scrollIntoView({ behavior: 'smooth' });
      elements.replyTextarea.focus();
    }
    showToast(`✓ Polite nudge loaded into reply composer!`, 'success');
  } catch (err) {
    showToast(`Failed to generate nudge: ${err.message}`, 'error');
  }
};

async function loadCommitmentsBadge() {
  try {
    const res = await fetch('/api/commitments/ledger');
    const data = await res.json();
    if (elements.hubBadgeCommitments && data.total_active_commitments !== undefined) {
      elements.hubBadgeCommitments.textContent = data.total_active_commitments;
    }
  } catch (e) {}
}


// ============================================================================
// BREAKTHROUGH INNOVATION 3: DUAL-HOST MORNING AUDIO SHOW (AI PODCAST)
// ============================================================================
let podcastScript = null;
let currentSegmentIndex = 0;
let isPodcastPlaying = false;
let podcastSpeed = 1.0;

function initMorningAudioShow() {
  if (elements.btnOpenMorningShow && elements.modalMorningShow) {
    elements.btnOpenMorningShow.addEventListener('click', () => {
      openModal(elements.modalMorningShow);
      loadMorningPodcastShow();
    });
  }
  if (elements.btnCloseMorningShow) {
    elements.btnCloseMorningShow.addEventListener('click', () => {
      stopPodcastAudio();
      closeModal(elements.modalMorningShow);
    });
  }
  if (elements.btnPodcastPlay) {
    elements.btnPodcastPlay.addEventListener('click', () => {
      togglePodcastPlayback();
    });
  }
  if (elements.btnPodcastRestart) {
    elements.btnPodcastRestart.addEventListener('click', () => {
      restartPodcastAudio();
    });
  }

  // Speed controls
  document.querySelectorAll('.podcast-speed-selector .speed-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.podcast-speed-selector .speed-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      podcastSpeed = parseFloat(e.target.getAttribute('data-speed')) || 1.0;
      if (isPodcastPlaying) {
        speakSegment(currentSegmentIndex);
      }
    });
  });
}

async function loadMorningPodcastShow() {
  if (!elements.podcastTranscriptStream) return;
  elements.podcastTranscriptStream.innerHTML = `
    <div class="loading-state" style="padding: 24px;">
      <div class="spinner"></div>
      <span>Generating dynamic morning briefing script from active emails...</span>
    </div>
  `;

  try {
    const res = await fetch('/api/podcast/morning-show');
    podcastScript = await res.json();

    if (elements.podcastTimeCounter) {
      elements.podcastTimeCounter.textContent = `0:00 / ${podcastScript.duration_display || '2:00'}`;
    }

    renderPodcastTranscript(podcastScript.segments || []);
  } catch (err) {
    elements.podcastTranscriptStream.innerHTML = `<div class="error-state" style="padding: 20px;">Error generating show: ${escapeHtml(err.message)}</div>`;
  }
}

function renderPodcastTranscript(segments) {
  elements.podcastTranscriptStream.innerHTML = segments.map((seg, idx) => `
    <div class="transcript-segment" id="transcript-seg-${idx}">
      <span class="speaker-tag ${seg.speaker.toLowerCase()}">${escapeHtml(seg.avatar || '')} ${escapeHtml(seg.speaker)}</span>
      <span class="speaker-text">${escapeHtml(seg.text)}</span>
    </div>
  `).join('');
}

function togglePodcastPlayback() {
  if (!podcastScript || !podcastScript.segments || !podcastScript.segments.length) return;
  if (isPodcastPlaying) {
    pausePodcastAudio();
  } else {
    playPodcastAudio();
  }
}

function playPodcastAudio() {
  isPodcastPlaying = true;
  if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '⏸';
  if (elements.podcastOnAirLabel) elements.podcastOnAirLabel.textContent = 'ON AIR — BROADCASTING';
  if (elements.podcastWaveformBars) elements.podcastWaveformBars.classList.add('animating');
  speakSegment(currentSegmentIndex);
}

function pausePodcastAudio() {
  isPodcastPlaying = false;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '▶';
  if (elements.podcastOnAirLabel) elements.podcastOnAirLabel.textContent = 'PAUSED';
  if (elements.podcastWaveformBars) elements.podcastWaveformBars.classList.remove('animating');
  if (elements.podcastHostAlex) elements.podcastHostAlex.classList.remove('speaking');
  if (elements.podcastHostNova) elements.podcastHostNova.classList.remove('speaking');
}

function restartPodcastAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentSegmentIndex = 0;
  playPodcastAudio();
}

function stopPodcastAudio() {
  isPodcastPlaying = false;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentSegmentIndex = 0;
  if (elements.podcastPlayIcon) elements.podcastPlayIcon.textContent = '▶';
  if (elements.podcastOnAirLabel) elements.podcastOnAirLabel.textContent = 'READY TO BROADCAST';
  if (elements.podcastWaveformBars) elements.podcastWaveformBars.classList.remove('animating');
  if (elements.podcastHostAlex) elements.podcastHostAlex.classList.remove('speaking');
  if (elements.podcastHostNova) elements.podcastHostNova.classList.remove('speaking');
}

function speakSegment(index) {
  if (!isPodcastPlaying || !podcastScript || index >= podcastScript.segments.length) {
    if (podcastScript && index >= podcastScript.segments.length) {
      stopPodcastAudio();
      showToast('📻 Morning Show completed. Have a great day!', 'success');
    }
    return;
  }

  currentSegmentIndex = index;
  const seg = podcastScript.segments[index];

  // Highlight active host
  if (elements.podcastHostAlex && elements.podcastHostNova) {
    if (seg.speaker === 'Alex') {
      elements.podcastHostAlex.classList.add('speaking');
      elements.podcastHostNova.classList.remove('speaking');
    } else {
      elements.podcastHostNova.classList.add('speaking');
      elements.podcastHostAlex.classList.remove('speaking');
    }
  }

  // Highlight transcript row
  document.querySelectorAll('.transcript-segment').forEach(el => el.classList.remove('speaking-now'));
  const activeSegEl = document.getElementById(`transcript-seg-${index}`);
  if (activeSegEl) {
    activeSegEl.classList.add('speaking-now');
    activeSegEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (!('speechSynthesis' in window)) {
    // If browser doesn't support Web Speech API, step through visually
    setTimeout(() => {
      if (isPodcastPlaying) speakSegment(index + 1);
    }, 3500);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(seg.text);
  utterance.pitch = seg.voice_pitch || (seg.speaker === 'Nova' ? 1.25 : 1.0);
  utterance.rate = (seg.voice_rate || 1.05) * podcastSpeed;

  utterance.onend = () => {
    if (isPodcastPlaying) {
      setTimeout(() => {
        speakSegment(index + 1);
      }, 350);
    }
  };

  utterance.onerror = () => {
    if (isPodcastPlaying) {
      speakSegment(index + 1);
    }
  };

  window.speechSynthesis.speak(utterance);
}


// ============================================================================
// BREAKTHROUGH INNOVATION 4: RECIPIENT REACTION SIMULATOR
// ============================================================================
function initReactionSimulator() {
  if (elements.btnToggleReplySimulator && elements.replySimulatorWrapper) {
    elements.btnToggleReplySimulator.addEventListener('click', () => {
      const isVisible = elements.replySimulatorWrapper.style.display !== 'none';
      if (isVisible) {
        elements.replySimulatorWrapper.style.display = 'none';
      } else {
        elements.replySimulatorWrapper.style.display = 'block';
        const draftText = elements.replyTextarea ? elements.replyTextarea.value : '';
        const email = getSelectedEmail();
        const recipient = email ? email.sender_email : '';
        const subj = email ? email.subject : '';
        runReactionSimulation(draftText, recipient, subj, 'reply');
      }
    });
  }

  if (elements.btnToggleComposeSimulator && elements.composeSimulatorWrapper) {
    elements.btnToggleComposeSimulator.addEventListener('click', () => {
      const isVisible = elements.composeSimulatorWrapper.style.display !== 'none';
      if (isVisible) {
        elements.composeSimulatorWrapper.style.display = 'none';
      } else {
        elements.composeSimulatorWrapper.style.display = 'block';
        const draftText = document.getElementById('compose-body') ? document.getElementById('compose-body').value : '';
        const recipient = document.getElementById('compose-to') ? document.getElementById('compose-to').value : '';
        const subj = document.getElementById('compose-subject') ? document.getElementById('compose-subject').value : '';
        runReactionSimulation(draftText, recipient, subj, 'compose');
      }
    });
  }
}

async function runReactionSimulation(draftText, recipient, subject, targetPrefix) {
  const badgeEl = document.getElementById(`${targetPrefix}-sim-badge`);
  const latencyEl = document.getElementById(`${targetPrefix}-sim-latency`);
  const scoreTextEl = document.getElementById(`${targetPrefix}-sim-score-text`);
  const barEl = document.getElementById(`${targetPrefix}-sim-bar`);
  const factorsEl = document.getElementById(`${targetPrefix}-sim-factors`);
  const rewritesEl = document.getElementById(`${targetPrefix}-sim-rewrites`);

  const textToAnalyze = draftText && draftText.trim().length > 5 ? draftText : "Hi, thank you for reaching out. Let me know when you are free to discuss.";

  try {
    if (scoreTextEl) scoreTextEl.textContent = 'Simulating recipient game-theoretic reaction...';

    const res = await fetch('/api/simulator/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draft_body: textToAnalyze,
        recipient_email: recipient || '',
        context_subject: subject || ''
      })
    });
    const sim = await res.json();

    if (badgeEl) {
      badgeEl.textContent = sim.friction_level;
      badgeEl.style.color = sim.sentiment_color;
      badgeEl.style.background = `${sim.sentiment_color}22`;
    }
    if (latencyEl) latencyEl.textContent = `Estimated Reply: ${sim.estimated_reply_probability}`;
    if (scoreTextEl) scoreTextEl.textContent = `${sim.friction_score}/100 (${sim.predicted_sentiment})`;

    if (barEl) {
      barEl.style.width = `${sim.friction_score}%`;
      barEl.style.background = sim.sentiment_color;
    }

    if (factorsEl) {
      factorsEl.innerHTML = sim.friction_factors.map(f => `
        <span class="sim-factor-chip">⚡ ${escapeHtml(f)}</span>
      `).join('');
    }

    if (rewritesEl) {
      rewritesEl.innerHTML = sim.variations.map((v, i) => `
        <div class="sim-rewrite-card">
          <div class="sim-rewrite-header">
            <span>${escapeHtml(v.name)}</span>
            <span class="sim-boost-badge">${escapeHtml(v.boost)}</span>
          </div>
          <div class="sim-rewrite-body">${escapeHtml(v.text)}</div>
          <button class="btn-apply-rewrite" onclick="applySimulatedRewrite('${targetPrefix}', ${i})">
            ✓ Apply This Draft
          </button>
        </div>
      `).join('');
      window[`last_sim_variations_${targetPrefix}`] = sim.variations;
    }
  } catch (err) {
    if (scoreTextEl) scoreTextEl.textContent = `Simulation error: ${err.message}`;
  }
}

window.applySimulatedRewrite = function(targetPrefix, variationIndex) {
  const variations = window[`last_sim_variations_${targetPrefix}`];
  if (!variations || !variations[variationIndex]) return;

  const rewriteText = variations[variationIndex].text;
  if (targetPrefix === 'reply') {
    if (elements.replyTextarea) {
      elements.replyTextarea.value = rewriteText;
      elements.replyTextarea.focus();
    }
  } else if (targetPrefix === 'compose') {
    const composeBody = document.getElementById('compose-body');
    if (composeBody) {
      composeBody.value = rewriteText;
      composeBody.focus();
    }
  }

  showToast(`✓ Applied ${variations[variationIndex].name} to draft!`, 'success');
  runReactionSimulation(rewriteText, '', '', targetPrefix);
};

// ============================================================================
// Direct Cellular SMS Alert Gateway (+91 9392709150)
// ============================================================================
function initSmsHub() {
  if (elements.btnOpenSmsHub && elements.modalSmsHub) {
    elements.btnOpenSmsHub.addEventListener('click', () => {
      elements.modalSmsHub.style.display = 'flex';
      loadSmsOutbox();
    });
  }

  if (elements.btnCloseSmsHub && elements.modalSmsHub) {
    elements.btnCloseSmsHub.addEventListener('click', () => {
      elements.modalSmsHub.style.display = 'none';
    });
  }

  if (elements.btnSmsHubTest) {
    elements.btnSmsHubTest.addEventListener('click', () => sendTestSms('hub'));
  }

  if (elements.btnSmsHubRefresh) {
    elements.btnSmsHubRefresh.addEventListener('click', () => loadSmsOutbox());
  }

  if (elements.btnSaveSmsConfig) {
    elements.btnSaveSmsConfig.addEventListener('click', saveSmsSettings);
  }

  if (elements.btnTestSmsDispatch) {
    elements.btnTestSmsDispatch.addEventListener('click', () => sendTestSms('settings'));
  }

  if (elements.selectSmsProvider) {
    elements.selectSmsProvider.addEventListener('change', () => {
      const prov = elements.selectSmsProvider.value;
      if (elements.smsProviderFast2smsBox) {
        elements.smsProviderFast2smsBox.style.display = (prov === 'fast2sms') ? 'block' : 'none';
      }
      if (elements.smsProviderTwilioBox) {
        elements.smsProviderTwilioBox.style.display = (prov === 'twilio') ? 'block' : 'none';
      }
    });
  }
}

async function loadSmsBadge() {
  try {
    const res = await fetch('/api/sms/outbox');
    if (!res.ok) return;
    const data = await res.json();
    if (elements.hubBadgeSms) {
      elements.hubBadgeSms.textContent = data.count > 0 ? `${data.count} Sent` : '+91 93927';
    }
  } catch (e) {
    // Non-critical background polling
  }
}

async function loadSmsOutbox() {
  if (!elements.smsOutboxContainer) return;
  elements.smsOutboxContainer.innerHTML = `
    <div class="loading-state" style="padding: 30px; text-align: center;">
      <span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
      <span style="margin-left: 10px;">Retrieving SMS cellular outbox records...</span>
    </div>
  `;

  try {
    const res = await fetch('/api/sms/outbox');
    if (!res.ok) throw new Error('Failed to retrieve SMS outbox');
    const data = await res.json();

    if (elements.smsHubCountLabel) {
      elements.smsHubCountLabel.textContent = data.count || 0;
    }
    if (elements.smsHubProviderLabel) {
      elements.smsHubProviderLabel.textContent = (data.provider === 'fast2sms') ? 'Fast2SMS (India Direct / +91)' :
                                                 (data.provider === 'twilio' ? 'Twilio SMS Gateway' : 'Custom Gateway');
    }
    if (elements.hubBadgeSms) {
      elements.hubBadgeSms.textContent = data.count > 0 ? `${data.count} Sent` : '+91 93927';
    }

    const outbox = data.outbox || [];
    if (outbox.length === 0) {
      elements.smsOutboxContainer.innerHTML = `
        <div style="background: var(--bg-tertiary); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 40px 20px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 10px;">💬</div>
          <h4 style="color: var(--text-primary); margin-bottom: 6px;">Cellular SMS Outbox Ready</h4>
          <p style="color: var(--text-secondary); font-size: 13px; max-width: 480px; margin: 0 auto 16px;">
            Whenever a Critical or High priority email arrives in your active inbox, an instant SMS alert is formatted and routed to <b>+91 9392709150</b>.
          </p>
          <button class="btn btn-sm btn-primary" id="btn-empty-send-test" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none;">
            <span>💬 Send First Test SMS to +91 9392709150</span>
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById('btn-empty-send-test');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', () => sendTestSms('hub'));
      }
      return;
    }

    elements.smsOutboxContainer.innerHTML = outbox.map(item => {
      const isSent = (item.status || '').includes('SENT');
      const statusClass = isSent ? 'sent' : 'outbox';
      const statusLabel = isSent ? `✓ ${item.status}` : `⚡ ${item.status || 'OUTBOX QUEUED'}`;
      const charCount = item.character_count || item.message.length;

      return `
        <div class="sms-outbox-card">
          <div class="sms-outbox-header">
            <div class="sms-meta-group">
              <span class="sms-target-pill">📱 ${escapeHtml(item.recipient || '+91 9392709150')}</span>
              <span class="sms-status-pill ${statusClass}">${statusLabel}</span>
              ${item.provider ? `<span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(item.provider)}</span>` : ''}
            </div>
            <div class="sms-timestamp">${escapeHtml(item.timestamp || 'Just now')}</div>
          </div>
          <div class="sms-bubble">${escapeHtml(item.message)}</div>
          <div class="sms-footer-row">
            <span>Payload Size: <b>${charCount}</b> / 320 chars (Optimized SMS)</span>
            <span style="color: #34d399;">✓ Direct Cellular Alert</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    elements.smsOutboxContainer.innerHTML = `
      <div class="connection-status-box error" style="display: block;">
        ✕ Error loading SMS outbox: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

async function sendTestSms(source = 'hub') {
  const btn = (source === 'settings') ? elements.btnTestSmsDispatch : elements.btnSmsHubTest;
  const resBox = elements.testSmsResult;
  let originalHtml = '';

  if (btn) {
    originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Dispatching SMS to +91 9392709150...`;
  }
  if (resBox && source === 'settings') resBox.style.display = 'none';

  try {
    const res = await fetch('/api/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: elements.inputSmsPhone ? elements.inputSmsPhone.value.trim() : '+919392709150',
        message: '🚨 [URGENT MAIL ALERT]\nFrom: DOST IIT Madras\nSubj: Critical Academic Deadline Reminder\nAction: Submit registration before 5 PM\n- Antigravity AI'
      })
    });
    const result = await res.json();

    if (result.success) {
      const provStatus = result.status || 'DELIVERED_TO_OUTBOX';
      showToast(`💬 SMS alert sent to ${result.recipient || '+91 9392709150'} (${provStatus})`, 'success');
      if (resBox && source === 'settings') {
        resBox.style.display = 'block';
        resBox.className = 'connection-status-box success';
        resBox.innerHTML = `<b>✓ Test SMS Dispatched to ${result.recipient}!</b><br><small style="color:var(--text-secondary);">Status: ${provStatus}. Logged to persistent cellular outbox queue.</small>`;
      }
    } else {
      showToast(`✕ SMS error: ${result.error || 'Dispatch failed'}`, 'error');
      if (resBox && source === 'settings') {
        resBox.style.display = 'block';
        resBox.className = 'connection-status-box error';
        resBox.textContent = `✕ SMS error: ${result.error || 'Failed to dispatch'}`;
      }
    }
    // Refresh outbox view
    loadSmsOutbox();
    loadSmsBadge();
  } catch (err) {
    showToast(`Error dispatching SMS: ${err.message}`, 'error');
    if (resBox && source === 'settings') {
      resBox.style.display = 'block';
      resBox.className = 'connection-status-box error';
      resBox.textContent = `✕ Network error: ${err.message}`;
    }
  } finally {
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
  }
}

async function saveSmsSettings() {
  const btn = elements.btnSaveSmsConfig;
  const resBox = elements.testSmsResult;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;"></span> Saving...`;
  }

  const payload = {
    sms_alerts_enabled: elements.checkEnableSmsAlerts ? elements.checkEnableSmsAlerts.checked : true,
    sms_recipient_phone: elements.inputSmsPhone ? elements.inputSmsPhone.value.trim() : '+919392709150',
    sms_provider: elements.selectSmsProvider ? elements.selectSmsProvider.value : 'fast2sms'
  };

  const key = elements.inputSmsFast2smsKey ? elements.inputSmsFast2smsKey.value.trim() : '';
  if (key && !key.includes('••••')) {
    payload.sms_api_key = key;
  }
  if (elements.inputSmsTwilioSid && elements.inputSmsTwilioSid.value.trim()) {
    payload.sms_twilio_account_sid = elements.inputSmsTwilioSid.value.trim();
  }
  if (elements.inputSmsTwilioToken && elements.inputSmsTwilioToken.value.trim() && !elements.inputSmsTwilioToken.value.includes('••••')) {
    payload.sms_twilio_auth_token = elements.inputSmsTwilioToken.value.trim();
  }
  if (elements.inputSmsTwilioFrom && elements.inputSmsTwilioFrom.value.trim()) {
    payload.sms_twilio_from = elements.inputSmsTwilioFrom.value.trim();
  }

  try {
    const res = await fetch('/api/sms/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update SMS configuration');
    showToast('✓ Direct Cellular SMS settings saved successfully!', 'success');
    if (resBox) {
      resBox.style.display = 'block';
      resBox.className = 'connection-status-box success';
      resBox.innerHTML = `<b>✓ Cellular SMS settings saved!</b> Active target: <b>${payload.sms_recipient_phone}</b>`;
    }
    loadSmsBadge();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.innerHTML = '<span>💾 Save SMS Settings</span>';
      btn.disabled = false;
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
