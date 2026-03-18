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

- **User** — 用户，属于一个 Family，有 ADMIN/MEMBER 角色
- **Family** — 家庭，通过 inviteCode 邀请成员加入，所有数据隔离在家庭维度
- **Account** — 账户（银行/信用卡/电子钱包/投资/房产/负债/其他），属于 Family
- **BalanceRecord** — 余额记录，某个用户在某时间点记录的某账户余额

核心设计：没有"月度周期"概念，任何时候可以更新任意账户。每个账户的"当前余额"= 最新一条 BalanceRecord。

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
│   ├── dashboard/          # 主面板（占位）
│   ├── accounts/           # (待实现) 账户管理
│   ├── analysis/           # (待实现) 分析页
│   └── settings/           # (待实现) 设置页
├── components/
│   └── ui/                 # shadcn/ui 组件 (button, input, label, card)
├── lib/
│   ├── auth.ts             # NextAuth v5 配置
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
- [ ] 创建家庭/加入家庭流程
- [ ] Dashboard 主面板
- [ ] 账户管理 CRUD
- [ ] 余额更新功能（核心）
- [ ] 数据分析图表
- [ ] AI 分析功能
- [ ] 部署上线

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
