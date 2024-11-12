import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    port: 3005,
  },
  resolve: {
    alias: {
      "@assets": "/src/assets",
      "@features": "/src/features",
      "@pages": "/src/pages",
      "@styles": "/src/styles",
      "@utils": "/src/utils",
      "@constants": "/src/constants",
      "@context": "/src/context",
      "@middleware": "/src/middleware",
      "@hooks": "/src/hooks",
    },
  },
});
