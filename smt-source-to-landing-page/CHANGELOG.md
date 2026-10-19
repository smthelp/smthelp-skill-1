# Changelog — smt-source-to-landing-page

格式：`## 版本 — 日期`，下面写改了什么、为什么、来自哪个项目。版本规则见 SKILL.md「升级维护方式」。

## 1.0.0 — 2026-10-19

首版。来源项目：AI Radial Splicing Tape 落地页（2026-10-13，Jason 的 9 条需求：logo、页脚 CTA、图床图片、视频墙视频、目录墙目录、8 篇六步法博客、Chatwoot、SEO/GEO 文件名、暗黑/明亮 + 7 语言）。

- 参数化构建 `scripts/build.py`：product.json + i18n/*.json + blogs.json → 单 HTML，19 种 section 可选可排序，JSON-LD 自动生成，`asset:` 图片 base64 内嵌，计算器公式写在 config
- `scripts/verify.py`：34 项 Playwright 检查（7 语言持久化、RTL、全语言标题禁用词、JSON-LD 类型、坏图、390 px 横滚 en+ar、主题持久化、交互、Chatwoot 位置、无 CDN），截图 30 张
- `scripts/publish.py`：GitHub 推送到 smthelping/smt-product-landing-html 并更新 README 表格与页数；WebDAV 上传（密码每次现问）
- `scripts/extract_sources.py`、`scripts/scaffold.py`、`scripts/regress.sh`
- `templates/`：base.css（S-300B 设计系统）、components.css、runtime.js（主题 + i18n 引擎 + 组件，新增博客多语言切换、通用表单与计算器）、brand-southern-machinery.json
- `examples/radial-splice-tape/`：重建结果与 2026-10-13 发布页逐段一致（head/JSON-LD 完全相同，body 仅文章容器多 `data-blang` 属性）
- 行为变化：英文版不再显示「文章保持英文」提示（只在非英文且无译文时显示）
