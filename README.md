# 锦泓留学 · Brocade Education

一个可运行的 Node.js 单页应用原型，品牌理念为 “From here, to everywhere.”，包含首页、QS 1–1500 择校、院校详情、梦校收藏、背景档案、80 题八维测评、模拟申请报告、付费方案和微信咨询页。

学校详情页使用公开大学域名目录匹配学校官网图标；当前已匹配 1,018 所，未匹配院校使用锦泓品牌占位标识，避免误用其他学校校徽。

## 启动

双击 `启动网站.command`，或在终端进入本目录后运行：

```bash
PATH="$PWD/.node/bin:$PATH" npm start
```

浏览器访问 <http://localhost:4173>。

## 部署到 Vercel

项目已经同时支持本地常驻服务器和 Vercel Serverless Functions。Vercel 构建时会把 `public` 源文件生成到 `dist` 静态输出目录，并通过 `api/analyze.js` 处理 `/api/analyze`；不要把 `server.js` 本身配置为线上函数，也不要在 Vercel 中运行 `npm start`。

在 Vercel 项目的 **Settings → Environment Variables** 中分别添加以下变量，并至少勾选 Production；如需预览部署也能调用 AI，请同时勾选 Preview：

```env
OPENAI_API_KEY=你的DeepSeek密钥
OPENAI_MODEL=deepseek-v4-flash
OPENAI_BASE_URL=https://api.deepseek.com
```

保存环境变量后必须重新部署，旧部署不会自动获得新变量。部署完成后访问 `https://你的域名/api/health`，应返回 `"ok":true` 和 `"apiConfigured":true`；该诊断接口不会返回密钥。若 `apiConfigured` 为 `false`，说明环境变量未添加到当前 Production/Preview 环境。

构建命令会检查代码并把 `public` 中的静态源码复制到新生成的 `dist` 目录；`vercel.json` 已将 Output Directory 设为 `dist`，因此不会再出现构建成功却找不到输出目录的问题。`api` 目录交给 Vercel 自动识别，不在 `functions` 中重复声明，避免上传目录或 Root Directory 不一致时触发 `Unmatched function pattern`。若你的 Vercel 套餐允许的函数时长不足以完成较长的 DeepSeek 规划任务，需要在 Vercel 控制台提高 Function Max Duration、缩短 AI 输出，或改用后台任务加轮询的架构。

如果仍然提示缺少输出目录，请检查 Vercel 的 **Settings → Build and Deployment → Root Directory**：上传 `xia` 文件夹本身时应留空；连接一个包含 `xia` 子目录的 Git 仓库时应填写 `xia`。Root Directory 必须是能够直接看到 `package.json`、`vercel.json`、`public` 和 `api` 的目录。不要把 Root Directory 设置为 `public` 或 `dist`。

## 配置 AI 分析

平台通过服务端调用 DeepSeek Chat Completions API，API Key 不会发送到浏览器。项目根目录使用私密的 `.env` 文件，请在其中填写新创建的 Key：

```env
OPENAI_API_KEY=你的新Key
OPENAI_MODEL=deepseek-v4-flash
OPENAI_BASE_URL=https://api.deepseek.com
```

随后通过 `启动网站.command` 启动。`.env` 已加入 `.gitignore`，请勿提交、截图或发送给他人。AI 会结合已录入且带来源的招生要求，返回概率区间、证据置信度、关键背景、要求匹配、风险与补强动作。DeepSeek API 本身不提供实时网页搜索；没有官方证据时系统必须标注信息不足。

如果页面提示“DeepSeek API 余额不足”，说明 Key 已到达服务端但对应账户没有可用额度；充值后重启网站再试即可。此时可使用付费页中的演示预览检查完整页面样式，演示预览不会调用 API。

## 用户数据与付费演示

当前版本没有用户账号系统，梦校收藏、背景档案、80 题答案、未来规划输入和付费方案均只保存在浏览器当前标签页的 `sessionStorage` 中。刷新或在当前标签页内跳转不会丢失，但关闭该标签页或浏览器会话后再次打开网站，之前的用户信息会被清除。

点击“付费查看详细方案”会先弹出演示收款码。页面提供两条测试路径：

- “模拟支付成功并调用 DeepSeek”：模拟支付回调已成功，然后请求 DeepSeek 生成不少于 12 个节点的个人升学方案。
- “仅预览付费结果样式”：不调用 API，直接展示带有 `DEMO PREVIEW` 标识的完整标准模板，便于检查付费后的页面。

演示二维码不会真实收款。正式上线时必须接入微信支付或其他支付机构的服务端回调，只有服务端验签并确认到账后才能解锁 AI 调用；不能把前端按钮点击当作真实付款凭证。

## 更新 QS 榜单

网站数据位于 `public/qs2026.json`。收到相同列结构的新版 Excel 后，可运行：

```bash
/Users/wangbingqian/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/import-qs.py "/path/to/ranking.xlsx"
```

导入器会保留 `1001-1200`、`1401+` 等区间排名，并按 Excel 原始行顺序生成 1,500 所院校。

## 数据说明

QS 排名、学校名称、国家、大洲、分数、上一年排名与 QS 链接来自用户提供的 Excel。该文件不含逐专业录取要求；目前仅原有精选院校带有演示详情，其余院校明确引导至 QS 资料页并提示核验招生官网。正式上线前仍需接入招生数据源、人工审核、真实支付服务和企业微信二维码。
