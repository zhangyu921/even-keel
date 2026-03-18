# EvenKeel — AI 协作上下文

## 项目简介

EvenKeel 是一个家庭财富追踪工具，让夫妻双方共同管理、随时更新账户余额，查看家庭财务趋势。
命名来自航海术语 "on an even keel"（平稳航行），暗示双方平等共管。

这个项目同时也是面向欧洲远程 Full Stack Engineer 岗位的 portfolio 展示项目。

## 技术栈

- Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- PostgreSQL 16 (Docker, port 5433) + Prisma 7 + @prisma/adapter-pg
- NextAuth v5 (credentials provider, JWT session)
- Recharts (图表), Zod (校验), react-hook-form (表单)

## 数据模型

- **User** — 用户，可选属于一个 Family，有 ADMIN/MEMBER 角色
- **Family** — 家庭（可选），通过 inviteCode 邀请成员加入，作为聚合视图让成员看到彼此资产
- **Account** — 账户（银行/信用卡/电子钱包/投资/房产/负债/其他），**属于 User（个人）**
- **BalanceRecord** — 余额记录，某个用户在某时间点记录的某账户余额

核心设计：
- 账户归属个人，反映现实中资产落在个人名下
- Family 是可选的聚合视图，让家庭成员看到彼此的资产
- 账户有 visibility（FAMILY/PRIVATE），默认 FAMILY 可见
- Dashboard 支持家庭视图和个人视图切换

## 关键设计决策

- 不是逐笔记账，只关注各账户当前余额和趋势
- 多用户家庭协作模型，夫妻平等共管
- 余额更新 UX：Update Round 引导 + 账户状态视觉提示（双模式结合）
- 新建项目而非基于旧项目 /Users/yuzhang/own/base 重构，但可复用其中代码

## 项目结构

```
src/
├── app/
│   ├── (auth)/             # 认证相关页面（共用居中布局）
│   │   ├── layout.tsx      # 居中卡片布局
│   │   ├── actions.ts      # register/login Server Actions
│   │   ├── register/       # 注册页
│   │   └── login/          # 登录页
│   ├── api/auth/           # NextAuth API 路由
│   ├── dashboard/          # 主面板（双视图：家庭/个人）
│   ├── accounts/           # 账户管理
│   │   ├── page.tsx        # 账户列表
│   │   ├── actions.ts      # CRUD actions
│   │   ├── new/            # 创建账户
│   │   └── [id]/           # 账户详情 + 余额更新
│   ├── analysis/           # (待实现) 分析页
│   ├── settings/           # 设置页
│   │   └── family/         # 家庭设置
│   │       ├── layout.tsx  # 居中卡片布局
│   │       ├── page.tsx    # 家庭管理/创建选择
│   │       ├── actions.ts  # createFamily/joinFamily
│   │       ├── create/     # 创建家庭页
│   │       └── join/       # 加入家庭页
├── components/
│   └── ui/                 # shadcn/ui 组件 (button, input, label, card)
├── lib/
│   ├── auth.ts             # NextAuth v5 配置（session 包含 familyId/role）
│   ├── prisma.ts           # Prisma Client 单例 (adapter 模式)
│   └── validations.ts      # Zod 表单校验
├── proxy.ts                # 路由保护 (Next.js 16 新规范，替代 middleware.ts)
└── generated/prisma/       # Prisma 7 生成的 Client (gitignored)
```

## 当前进度

- [x] 项目初始化 + 依赖安装
- [x] 数据模型设计 + 数据库就绪
- [x] NextAuth v5 认证配置
- [x] 路由保护 (proxy.ts)
- [x] 注册/登录页面 ✅ 2026-03-18
- [x] 家庭设置功能（/settings/family）✅ 2026-03-18
- [x] Dashboard 空状态引导 ✅ 2026-03-18
- [x] 账户管理 CRUD ✅ 2026-03-18
- [x] 余额更新功能（核心）✅ 2026-03-18
- [x] Dashboard 双视图（家庭/个人）✅ 2026-03-18
- [x] 部署上线 ✅ 2026-03-18
- [ ] 数据分析图表
- [ ] AI 分析功能

## 部署信息

- **线上地址**: https://even-keel.vercel.app
- **托管平台**: Vercel
- **数据库**: Neon PostgreSQL (serverless)
- **环境变量**: `DATABASE_URL`, `AUTH_SECRET`（仅在 Vercel 配置）

## 常用命令

```bash
docker compose up -d          # 启动 PostgreSQL (port 5433)
npx prisma generate           # 重新生成 Prisma Client
npx prisma db push            # 同步 schema 到数据库
npx prisma studio             # 可视化数据库管理
npm run dev                   # 启动开发服务器
```

## 完整 Spec

详见求职项目中的规格文档：/Users/yuzhang/eu-remote-job-hunting/portfolio/PROJECT-SPEC.md
