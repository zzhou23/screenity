const ALLOWED_ORIGINS = new Set([
  "http://localhost:8036",
  "http://127.0.0.1:8036",
]);

const installMarvisBridge = () => {
  window.addEventListener("message", (event) => {
    if (!ALLOWED_ORIGINS.has(event.origin)) return;
    if (event.data?.source !== "marvis-skill") return;
    if (event.data?.action === "record-youtube") {
      chrome.runtime.sendMessage({ type: "marvis-record-youtube" });
    }
  });
};

export default installMarvisBridge;
