# smthelp-skill

Southern Machinery（南方机械）QwenWork Agent Skills 集合 — SMT/THT 外贸营销与产品页工作流。

## 技能清单

| Skill | 版本 | 说明 |
|---|---|---|
| `smt-product-landing-page` | v1.6.0 | 1688/产品链接 → Southern Machinery 品牌英文单文件产品 Landing Page（FAB 模型），覆盖爬取、base64 图片内嵌、3D 交互动画、Chatwoot 客服、Playwright 校验、WebDAV 发布 |

## 安装（到 QwenWork）

将任一 skill 目录复制到 `~/.qwenworkcn/skills/<skill-name>/`，或把仓库 zip 的后缀改为 `.skill` 直接安装。

## 维护约定

- 版本条目见各 SKILL.md「版本与迭代」；变更后 bump version 并 `zip -r smt-product-landing-page-v<version>.zip` 备份。
