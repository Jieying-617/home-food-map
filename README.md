# 家里还有啥

家庭位置地图与食物到期提醒试用版网页。当前目标是先做网页 MVP，后续可以复用业务接口迁移到微信小程序，不做原生 App。

## 当前试用功能

- 首页是站内提醒中心：汇总已过期、今天到期、7 天内和 30 天内到期的食物。
- 支持按柜子/位置筛选提醒，直接在食物卡片上标记拿取、吃完或丢弃。
- 添加食物支持手动、语音和拍日期识别，识别结果保存前都可以修改。

## 技术栈

- Next.js + React + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Vitest / Playwright

## 本机开发

```bash
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

打开：`http://localhost:3000`

## 大模型日期识别

拍日期添加会优先调用服务端 `/api/recognize-date` 使用大模型视觉识别；如果没有配置 `OPENAI_API_KEY` 或调用失败，会自动回退到本地 OCR。无论哪种识别方式，结果都会进入确认表单，保存前可以手动修改。

`.env` 可选配置：

```env
OPENAI_API_KEY="你的 OpenAI API Key"
OPENAI_DATE_MODEL="gpt-4.1"
# 如果本机/服务器不能直连 api.openai.com，可以配置代理
OPENAI_PROXY_URL="http://127.0.0.1:7897"
```

## 常用命令

```bash
npm run test
npm run build
npm run dev
```

## 数据库说明

`.env` 里默认使用 SQLite：

```env
DATABASE_URL="file:./dev.db"
```

本地数据库文件 `prisma/dev.db` 不提交到 Git。换电脑后运行 `npx prisma migrate dev` 和 `npm run prisma:seed` 会重新创建本地 demo 数据。

如果某台 Windows 机器上 Prisma schema engine 无法执行迁移，可以用 `prisma/migrations/000_init/migration.sql` 里的 SQL 手动创建表，再运行：

```bash
npx prisma generate
npm run prisma:seed
```

## 跨设备继续开发

下一台电脑或新 Codex 会话接续时，先读 [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md)。