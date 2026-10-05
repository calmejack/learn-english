import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily English · 每日英语",
    short_name: "Daily English",
    description:
      "每日短课、连续打卡与经验值、间隔复习（SRS）和个人词库，专为中文学习者打造。Daily English lessons with streaks & XP, spaced-repetition review, and a word bank for Chinese learners.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0d9488",
    lang: "zh-CN",
    dir: "ltr",
    categories: ["education"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
