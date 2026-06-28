# Sher 的博客

简约 Markdown 静态博客，替代原 Hexo + Butterfly 方案。

## 目录结构

```
posts/          # 文章（Markdown）
pages/          # 静态页面（如 about.md）
assets/         # 样式等资源
build.js        # 构建脚本
dist/           # 构建输出（部署到 GitHub Pages）
```

## 写文章

在 `posts/` 下新建 Markdown 文件，front matter 示例：

```yaml
---
title: 文章标题
date: 2026-06-28
tags: [java, 笔记]
---
```

文件名建议：`YYYY-MM-DD-标题.md`

## 本地预览

```bash
npm install
npm run build
npm run serve
```

浏览器打开 http://localhost:3000

## 部署

推送到 `hexo` 分支后，GitHub Actions 会自动构建并发布到 `master` 分支（GitHub Pages）。

自定义域名：`blog.zhouxianer.com`（见 `CNAME`）
