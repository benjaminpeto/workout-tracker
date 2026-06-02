import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesProjectSite = Boolean(
  process.env.GITHUB_ACTIONS && repoName,
);

export default defineConfig({
  // GitHub Pages project sites are served from /<repo-name>/.
  // Locally, keep the app at / so `npm run dev` behaves normally.
  base: isGitHubPagesProjectSite ? `/${repoName}/` : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
