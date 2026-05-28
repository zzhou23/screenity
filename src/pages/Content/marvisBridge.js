const ALLOWED_ORIGINS = new Set([
  "http://localhost:8036",
  "http://127.0.0.1:8036",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "https://10.239.131.171",
  "http://10.239.131.171",
]);

const installMarvisBridge = () => {
  console.log("[Marvis][Bridge] installed on", window.location.origin);
  window.addEventListener("message", (event) => {
    if (event.data?.source !== "marvis-skill") return;
    console.log("[Marvis][Bridge] received marvis-skill message", {
      origin: event.origin,
      data: event.data,
    });
    if (!ALLOWED_ORIGINS.has(event.origin)) {
      console.warn(
        "[Marvis][Bridge] rejected: origin not in allowlist",
        event.origin
      );
      return;
    }
    if (event.data?.action === "record-youtube") {
      console.log("[Marvis][Bridge] forwarding to background");
      chrome.runtime.sendMessage({ type: "marvis-record-youtube" })
        .then((resp) => {
          console.log("[Marvis][Bridge] background response:", resp);
        })
        .catch((err) => {
          console.warn("[Marvis][Bridge] sendMessage error:", err.message || err);
        });
    }
  });
};

export default installMarvisBridge;
