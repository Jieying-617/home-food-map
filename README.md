# 家里还有啥

家庭位置地图与食物到期提醒试用版网页。当前目标是先做网页 MVP，后续可以复用业务接口迁移到微信小程序，不做原生 App。

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
