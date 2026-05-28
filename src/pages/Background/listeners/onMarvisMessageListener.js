export const onMarvisMessageListener = () => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== "marvis-record-youtube") return false;

    (async () => {
      try {
        const tabs = await chrome.tabs.query({
          url: [
            "*://*.youtube.com/*",
            "*://youtube.com/*",
            "*://m.youtube.com/*",
          ],
        });

        if (!tabs || tabs.length === 0) {
          try {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "assets/img/icon-128.png",
              title: "Marvis: Web Recorder",
              message:
                "请先打开 YouTube 视频后再试 / Open a YouTube video first",
            });
          } catch (e) {
            console.warn("[Marvis][YTRec] notifications unavailable:", e.message);
          }
          sendResponse({ ok: false, reason: "no-youtube-tab" });
          return;
        }

        const sorted = tabs.slice().sort((a, b) => {
          const aTime = a.lastAccessed ?? 0;
          const bTime = b.lastAccessed ?? 0;
          return bTime - aTime;
        });

        const targetTab = sorted[0];

        // Only focus the YouTube tab — do NOT touch Screenity internal
        // storage or send any Screenity messages. The user needs to click
        // the Screenity extension icon (toolbar button) to start recording.
        // That click provides the user gesture Chrome requires for tabCapture.
        await chrome.tabs.update(targetTab.id, { active: true });
        await chrome.windows.update(targetTab.windowId, { focused: true });

        sendResponse({
          ok: true,
          tabId: targetTab.id,
          action: "focused",
          hint: "Click the Screenity extension icon to start recording this tab",
        });
      } catch (err) {
        console.error("[Marvis][YTRec] Error handling record-youtube:", err);
        sendResponse({ ok: false, reason: err.message });
      }
    })();

    return true;
  });
};
