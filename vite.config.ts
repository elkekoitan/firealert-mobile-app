import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

const config = {
  mode: "development",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssMinify: false,
    terserOptions: { compress: false, mangle: false },
  },
  define: {
    "process.env.NODE_ENV": "'development'",
    "global": "globalThis",
    "React": "react",
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "./assets/*", dest: "assets" },
        {
          src: "./public/assets/{*,}",
          dest: path.join("dist", "public/assets"),
        },
        { src: "./assets/*", dest: path.join("dist", "assets") },
      ],
      silent: true,
    }),
  ],
  resolve: {
    alias: {
      "react-native": "react-native-web",
      "react-native-maps": "react-native-web-maps",
    },
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  optimizeDeps: {
    exclude: ["react-native", "react-native-maps"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
};

config.plugins.push(tsconfigPaths());
export default defineConfig(config);
