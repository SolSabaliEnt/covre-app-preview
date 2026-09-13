import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(<App />);

function configureCovreHeroVideo(): boolean {
  const video = document.querySelector<HTMLVideoElement>("section > video[autoplay]");
  if (!video) return false;
  if (video.dataset.covreHeroConfigured === "true") return true;

  video.dataset.covreHeroConfigured = "true";
  video.poster = "/covre-header-poster.jpg?v=bf932b3";
  video.src = "/covre-header-background-web.mp4?v=bf932b3";
  video.preload = "auto";
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "true");
  video.style.display = "block";
  video.style.visibility = "visible";
  video.style.opacity = "1";

  video.querySelectorAll("source").forEach(source => source.remove());
  video.load();

  const tryPlay = () => {
    video.muted = true;
    void video.play().catch(() => {
      // Poster remains visible; retry on the next media/user event.
    });
  };

  video.addEventListener("loadeddata", tryPlay);
  video.addEventListener("canplay", tryPlay);
  video.addEventListener("canplaythrough", tryPlay);

  window.setTimeout(tryPlay, 150);
  window.setTimeout(tryPlay, 700);
  window.setTimeout(tryPlay, 1800);

  const retryAfterInteraction = () => tryPlay();
  window.addEventListener("pointerdown", retryAfterInteraction, { once: true, passive: true });
  window.addEventListener("keydown", retryAfterInteraction, { once: true });
  window.addEventListener("scroll", retryAfterInteraction, { once: true, passive: true });
  window.addEventListener("mousemove", retryAfterInteraction, { once: true, passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tryPlay();
  });

  return true;
}

if (!configureCovreHeroVideo()) {
  const observer = new MutationObserver(() => {
    if (configureCovreHeroVideo()) observer.disconnect();
  });

  observer.observe(rootElement, { childList: true, subtree: true });
}
