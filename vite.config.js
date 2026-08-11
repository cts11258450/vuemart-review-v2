import {
  defineConfig,
} from "vite"

import vue from "@vitejs/plugin-vue"

// 根據目前執行環境，設定不同的基礎路徑。
export default defineConfig(
  ({ command, isPreview }) => {
    // 以下兩種情況都使用 GitHub Pages 子路徑：
    //
    // 1. npm.cmd run build
    // 2. npm.cmd run preview
    //
    // 只有 npm.cmd run dev 使用根路徑 /。
    const useGitHubPagesBase =
      command === "build" ||
      isPreview

    const base =
      useGitHubPagesBase
        ? "/vuemart-review-v2/"
        : "/"

    return {
      base,

      plugins: [
        vue(),
      ],
    }
  },
)