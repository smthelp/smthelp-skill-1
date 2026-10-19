# smthelp-skill

Southern Machinery（南方机械）QwenWork Agent Skills 集合 — SMT/THT 外贸营销与产品页工作流。

## 技能清单

| Skill | 版本 | 说明 |
|---|---|---|
| `smt-product-landing-page` | v1.6.0 | 1688/产品链接 → Southern Machinery 品牌英文单文件产品 Landing Page（FAB 模型），覆盖爬取、base64 图片内嵌、3D 交互动画、Chatwoot 客服、Playwright 校验、WebDAV 发布 |
| `smt-source-to-landing-page` | v1.0.0 | 产品源素材（PDF/1688/淘宝/URL/图片）+ 主题 → 参数化单文件 Landing Page：FAB、8 篇六步法博客、7 语言（含阿拉伯语 RTL）、暗黑/明亮、SEO+GEO、Chatwoot；`build.py` 只读 product.json + i18n + blogs，`verify.py` 34 项 Playwright 验收，`publish.py` 推送 smthelping/smt-product-landing-html。示例：`examples/radial-splice-tape/` |

## 安装（到 QwenWork）

将任一 skill 目录复制到 `~/.qwenworkcn/skills/<skill-name>/`，或把仓库 zip 的后缀改为 `.skill` 直接安装。

## 维护约定

- 版本条目见各 SKILL.md「版本与迭代」；变更后 bump version 并 `zip -r smt-product-landing-page-v<version>.zip` 备份。
- `smt-source-to-landing-page` 另有 `CHANGELOG.md`；改 scripts/ 或 templates/ 后先跑 `bash smt-source-to-landing-page/scripts/regress.sh` 再 bump version。
