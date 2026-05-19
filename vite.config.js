import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT:
// If your GitHub repository name is not "dental-recovery",
// change the base value below to "/YOUR-REPO-NAME/".
export default defineConfig({
  plugins: [react()],
  base: "/recovery/",
});
