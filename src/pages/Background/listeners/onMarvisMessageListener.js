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

        await chrome.storage.local.set({
          recordingType: "tab",
          activeTab: targetTab.id,
          recordingUiTabId: targetTab.id,
        });

        await chrome.tabs.update(targetTab.id, { active: true });
        await chrome.windows.update(targetTab.windowId, { focused: true });

        await new Promise((r) => setTimeout(r, 150));

        chrome.tabs.sendMessage(targetTab.id, { type: "start-stream" });
        sendResponse({ ok: true, tabId: targetTab.id });
      } catch (err) {
        console.error("[Marvis][YTRec] Error handling record-youtube:", err);
        sendResponse({ ok: false, reason: err.message });
      }
    })();

    return true;
  });
};
