# Home Food Map Project Context

> 给下一台电脑、下一次 Codex 会话看的交接文档。新会话开始时可以先读这个文件，再继续开发。

## 项目一句话

“家里还有啥”是一个给家庭使用的食物/囤货管理试用版网页：记录家里各个柜子、箱子、抽屉里有什么东西，什么时候到期，谁拿了要顺手标记。当前先做网页 MVP，后续可以迁移到微信小程序，不做原生 App。

## 用户需求要点

- 使用者主要是妈妈，操作要简单、字要大、流程要短。
- 家庭小组共同维护库存，谁拿走、吃完、丢弃就要标记。
- 支持常温柜、零食柜、囤货柜等位置，不只关注冰箱。
- 每个食物必须明确归属到某个位置，系统不要靠拍照自动判断“放在哪里”。
- 位置地图只用来辅助定义柜子形状/名称，可以拍照生成简笔画或卡通风格封面。
- 添加食物要支持手动、语音、拍日期识别，但识别结果必须进入可编辑确认表单，不能直接入库。
- 可以查看全部快到期食物，也可以按不同柜子筛选。

## 当前仓库

- GitHub: https://github.com/Jieying-617/home-food-map
- 本机路径: `D:\Learning\home-food-map`
- 主分支: `master`
- 最新已推送提交: `2958a31 feat: complete trial web mvp flow`

## 技术栈

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS
- Prisma 5 + SQLite 本地数据库
- Vitest 单元/组件测试
- Playwright 手机视口 E2E 测试
- `tesseract.js` 用于浏览器端 OCR 试验
- 浏览器 `SpeechRecognition` / `webkitSpeechRecognition` 用于语音录入试验

## 已完成能力

- 基础项目脚手架和移动端样式。
- Prisma 数据模型：Family、Member、Location、Food、Operation。
- demo 种子数据：`我们家`、成员 `妈妈`、位置 `妈妈零食柜`、食物 `蛋黄派`。
- 到期分组规则：过期、今天、3 天内、7 天内、30 天内、以后。
- 中文语音文本解析：能从类似“零食柜有三包蛋黄派，8月20号到期”中提取名称、数量、单位、位置、到期日。
- 包装日期解析：支持“有效期至 yyyy年m月d日”和“生产日期 + 保质期 N 个月”。
- 库存动作：拿取、吃完、丢弃。
- 快到期首页：展示 30 天内到期食物，支持按位置筛选。
- 位置地图：展示每个柜子/箱子/抽屉，进入位置详情查看库存。
- 添加食物页：语音录入、拍日期 OCR、手动录入，全部进入确认表单后保存。
- 添加位置页：用户命名位置、添加标签、上传照片，生成简笔画风格封面。
- 操作记录页和家庭成员页。
- MVP E2E 测试：从快到期页到位置、记录、家庭页的手机端主流程。

## 运行步骤

换电脑后推荐这样做：

```powershell
git clone https://github.com/Jieying-617/home-food-map.git
cd home-food-map
npm install
Copy-Item .env.example .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

打开：`http://localhost:3000`

如果某台 Windows 电脑上 Prisma migrate 报 schema engine 相关错误，可以先看 `README.md` 的数据库说明。仓库里已经保留了 `prisma/migrations/000_init/migration.sql`，必要时可以手动执行 SQL 建表，再运行：

```powershell
npx prisma generate
npm run prisma:seed
```

## 常用验证命令

```powershell
npm run test
npm run build
npm run test:e2e -- tests/e2e/mvp.spec.ts
```

当前最近一次完整验证结果：

- `npm run test`: 8 个测试文件，14 个测试通过。
- `npm run build`: 通过。
- `npm run test:e2e -- tests/e2e/mvp.spec.ts`: 1 个 Playwright 测试通过。

## 已知问题和注意事项

- `.env` 和 `prisma/dev.db` 不提交，换电脑需要重新生成本地数据库。
- 当前是本地 demo 版本，还没有真正的登录、云数据库、家庭邀请链接和权限体系。
- 语音识别依赖浏览器能力，不是所有浏览器都支持；不支持时页面会提示用手动添加。
- OCR 是试验性质，识别结果必须人工确认。
- 上传文件当前保存在 `public/uploads`，这只是本地试用方案，部署到云端时应换成对象存储或平台文件存储。
- 之前这台电脑的命令行访问 GitHub 需要显式代理：`http://127.0.0.1:7897`。浏览器能打开 GitHub 不代表 git 命令一定自动走代理。

## 建议下一步

1. 做真实登录/家庭邀请：先用最简单的邀请口令或链接，不急着做复杂权限。
2. 把 SQLite 换成部署可用的数据库，例如 Postgres。
3. 设计“提醒中心”：今天到期、3 天内到期、已过期；先做站内提醒，再考虑微信订阅消息。
4. 优化添加食物流：添加成功后清空表单、跳转到对应柜子或快到期页。
5. 做部署：先选 Vercel/类似平台跑网页版试用，再评估小程序迁移。
6. 让位置封面更像卡通/简笔画：当前是 Canvas 滤镜版，之后可以接入更好的图像生成或手绘风格处理。

## 新 Codex 会话接续口令

可以在新电脑/新会话里直接说：

```text
继续开发 https://github.com/Jieying-617/home-food-map 这个项目。先读 docs/PROJECT_CONTEXT.md 和 README.md，然后从“建议下一步”继续。当前目标仍然是先做好网页试用版，后续再迁移小程序。
```
