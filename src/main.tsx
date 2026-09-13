import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

function configureCovreHeroVideo(): boolean {
  const source = document.querySelector<HTMLSourceElement>(
    'video source[src="/covre-header-background.mp4"]',
  );
  const video = source?.parentElement as HTMLVideoElement | null;

  if (!video) return false;
  if (video.dataset.covreHeroConfigured === "true") return true;

  video.dataset.covreHeroConfigured = "true";
  video.poster = "/covre-header-poster.jpg";
  video.src = "/covre-header-background-web.mp4";
  video.preload = "auto";
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  source.remove();
  video.load();

  const startPlayback = () => {
    void video.play().catch(() => {
      // The poster remains visible when autoplay is blocked.
    });
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    startPlayback();
  } else {
    video.addEventListener("canplay", startPlayback, { once: true });
  }

  return true;
}

if (!configureCovreHeroVideo()) {
  const observer = new MutationObserver(() => {
    if (configureCovreHeroVideo()) observer.disconnect();
  });

  observer.observe(rootElement, { childList: true, subtree: true });
}
