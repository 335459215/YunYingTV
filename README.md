# 📱 YunYingTV - React Native 视频应用

基于 React Native + Expo 开发的跨平台视频应用，支持 Android TV、Apple TV 和移动设备。

## 🚀 技术栈

- **Expo SDK 52** - 最新的 Expo 版本
- **React Native 0.76** - 最新稳定版 React Native
- **React 18.3** - 最新 React 版本
- **TypeScript** - 类型安全的开发体验
- **Expo Router** - 基于文件的路由系统
- **Zustand** - 轻量级状态管理
- **React Native TV** - 电视平台优化

## 📦 安装与运行

### 环境要求

- Node.js 20+
- npm 或 yarn
- Expo CLI

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# Android 开发
npm run android

# iOS 开发 (需要 macOS)
npm run ios
```

### TV 平台开发

```bash
# TV 模式启动
EXPO_TV=1 npm start

# Android TV
EXPO_TV=1 npm run android

# Apple TV
EXPO_TV=1 npm run ios
```

## 🔧 构建配置

### Android 构建

```bash
# Debug 构建
npm run build-debug

# Release 构建
npm run build
```

构建产物位于：`android/app/build/outputs/apk/`

### 国内镜像加速

项目已配置以下国内镜像源加速依赖下载：
- 阿里云 Maven 镜像
- 腾讯云 Maven 镜像
- 华为云 Maven 镜像

## 🤖 CI/CD

本项目使用 GitHub Actions 进行持续集成：

### 工作流概览

| 工作流 | 文件名 | 触发方式 | 用途 |
|--------|--------|----------|------|
| **Android Build** | `android-build.yml` | 自动触发 | CI/CD 持续集成 |
| **Build Android APK** | `build-apk.yml` | 手动触发 | 版本发布构建 |
| **Build Android APK with EAS** | `build-eas.yml` | 手动/标签触发 | EAS 生产构建 |

### 1️⃣ Android Build (自动 CI/CD)

**文件**: `.github/workflows/android-build.yml`

#### 触发条件
- ✅ 推送到 `master` 或 `main` 分支
- ✅ Pull Request 创建/更新
- ✅ 手动触发（workflow_dispatch）

#### 主要功能
- 📦 安装 Node.js 20 和 Java 17
- 🔧 使用 Gradle 缓存加速构建
- 🏗️ 编译 Android Debug APK
- 📤 上传 APK artifact（保留 7 天）

#### 适用场景
- 每次代码提交后的自动验证
- PR 合并前的质量检查
- 快速测试构建（Debug 版本）

### 2️⃣ Build Android APK (手动版本发布)

**文件**: `.github/workflows/build-apk.yml`

#### 触发条件
- 🔘 仅手动触发（workflow_dispatch）

#### 可配置选项
- **version_increment**: patch/minor/major/none
- **create_release**: true/false

#### 主要功能
- 📝 自动递增版本号
- 🔄 更新 package.json 并推送
- 🏗️ 编译 Release APK
- 📦 创建 GitHub Release（可选）
- 📤 上传带版本号的 APK

#### 适用场景
- 正式发布新版本
- 需要版本管理的构建
- 需要创建 Release 的构建

### 3️⃣ Build Android APK with EAS (EAS 构建)

**文件**: `.github/workflows/build-eas.yml`

#### 触发条件
- ✅ 推送到 `master` 分支
- ✅ 创建 `v*` 标签（如 v1.2.3）
- ✅ 手动触发

#### 前置要求
- ⚠️ 需要配置 `EXPO_TOKEN` Secret

#### 主要功能
- 🔧 使用 EAS Build 服务
- 📱 构建优化的生产 APK
- ️ 自动创建 Release（当推送标签时）
- 📤 上传 APK artifact（保留 30 天）

#### 适用场景
- 生产环境构建
- 需要 EAS 特性的构建
- 带标签的正式版本发布

### 查看构建状态

1. 访问 GitHub 仓库的 **Actions** 标签页
2. 查看最近的 workflow runs
3. 点击下载 artifacts 获取 APK 文件

## 📁 项目结构

```
YunYingTV/
├── .github/workflows/    # GitHub Actions 配置
├── android/              # Android 原生项目
├── app/                  # Expo Router 应用代码
├── components/           # React 组件
│   ├── navigation/       # 导航组件
│   ├── settings/         # 设置组件
│   └── ...              # 其他 UI 组件
├── constants/            # 常量定义
├── hooks/                # 自定义 Hooks
├── services/             # 业务服务
├── stores/               # Zustand 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数
├── assets/               # 静态资源
├── scripts/              # 构建脚本
└── package.json          # 项目依赖配置
```

## 🔥 主要功能

- 📺 **多平台支持**: Android TV, Apple TV, Mobile
- 📂 **文件管理**: 支持多种视频源
- 🌐 **网络请求**: 优化的 API 适配器
- 🎨 **自定义 UI**: 响应式设计组件
- 📱 **响应式布局**: 自适应不同屏幕尺寸
- 🔐 **安全存储**: 本地数据加密
- 🎮 **遥控器支持**: TV 平台优化控制

## 📝 开发说明

### 版本升级记录

**v2.0.0** (最新)
- ✅ 升级到 Expo SDK 52
- ✅ 升级到 React Native 0.76
- ✅ 升级到 React 18.3
- ✅ 配置国内 Gradle 镜像
- ✅ 添加 GitHub Actions CI/CD
- ✅ TV 平台优化

### 设备适配

项目实现了多平台响应式设计：
- **Mobile**: 触摸交互，小屏幕优化
- **Tablet**: 触摸交互，中等屏幕
- **TV**: 遥控器交互，大屏幕优化

### 状态管理

使用 Zustand 进行状态管理：
- `homeStore.ts` - 首页内容管理
- `playerStore.ts` - 播放器状态
- `settingsStore.ts` - 应用设置
- `remoteControlStore.ts` - 遥控器功能
- `authStore.ts` - 认证状态

### 组件变体

支持平台特定组件：
- `.tv.tsx` - TV 平台专用组件
- `.mobile.tsx` - 移动平台组件
- `.tablet.tsx` - 平板平台组件

## 🏗️ 构建命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run android` | 运行 Android |
| `npm run ios` | 运行 iOS |
| `npm run build-debug` | 构建 Debug APK |
| `npm run build` | 构建 Release APK |
| `npm run prebuild` | 生成原生项目文件 |
| `npm run clean` | 清理缓存 |
| `npm run test` | 运行测试 |
| `npm run lint` | 代码检查 |
| `npm run typecheck` | 类型检查 |

## 📄 License

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**构建状态**: [![Android Build](https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml/badge.svg)](https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml)
**EAS Build**: [![Build Android APK with EAS](https://github.com/335459215/YunYingTV/actions/workflows/build-eas.yml/badge.svg)](https://github.com/335459215/YunYingTV/actions/workflows/build-eas.yml)
