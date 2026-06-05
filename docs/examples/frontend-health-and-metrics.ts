import api from "../../frontend/src/lib/api";

export async function loadPlatformStatus() {
  const [health, ready, metricsText] = await Promise.all([
    api.get("http://localhost:3001/health"),
    api.get("http://localhost:3001/ready"),
    api.get("http://localhost:3001/metrics", { responseType: "text" }),
  ]);

  return {
    health: health.data,
    readiness: ready.data,
    prometheusPreview: String(metricsText.data).split("\n").slice(0, 6),
  };
}
