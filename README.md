# 📱 YunYingTV - React Native 视频应用

基于 React Native + Expo 开发的跨平台视频应用。

## 🚀 技术栈

- **Expo SDK 52** - 最新的 Expo 版本
- **React Native 0.76** - 最新稳定版 React Native
- **React 18.3** - 最新 React 版本
- **TypeScript** - 类型安全的开发体验
- **Expo Router** - 基于文件的路由系统
- **Zustand** - 轻量级状态管理

## 📦 安装与运行

### 环境要求

- Node.js 20+
- npm 或 yarn
- Expo CLI
- Android Studio (用于 Android 开发)

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

## 🔧 构建配置

### Android 构建

```bash
cd android
./gradlew assembleDebug
```

构建产物位于：`android/app/build/outputs/apk/debug/app-debug.apk`

### 国内镜像加速

项目已配置以下国内镜像源加速依赖下载：
- 阿里云 Maven 镜像
- 腾讯云 Maven 镜像
- 华为云 Maven 镜像

## 🤖 CI/CD

本项目使用 GitHub Actions 进行持续集成：

- **自动构建**: 每次 push 到 master/main 分支或创建 PR 时自动触发
- **构建产物**: Debug APK 会作为 artifact 保留 7 天
- **环境**: Ubuntu latest, Node.js 20, Java 17

### 查看构建状态

1. 访问 GitHub 仓库的 **Actions** 标签页
2. 查看最近的 workflow runs
3. 点击下载 artifacts 获取 APK 文件

### 工作流配置

工作流文件位于：`.github/workflows/android-build.yml`

主要步骤：
1.  checkout 代码
2.  设置 Node.js 环境
3.  配置 Java JDK 17
4.  安装 npm 依赖
5.  恢复 Gradle 缓存
6.  执行 Gradle 构建
7.  上传 APK artifact

## 📁 项目结构

```
YunYingTV/
├── .github/workflows/    # GitHub Actions 配置
├── android/              # Android 原生项目
├── app/                  # Expo Router 应用代码
├── components/           # React 组件
├── hooks/                # 自定义 Hooks
├── stores/               # Zustand 状态管理
├── utils/                # 工具函数
├── assets/               # 静态资源
└── package.json          # 项目依赖配置
```

## 🔥 主要功能

- 📺 视频播放
- 📂 文件管理
- 🌐 网络请求
- 🎨 自定义 UI 组件
- 📱 响应式设计
- 🔐 安全存储

## 📝 开发说明

### 版本升级记录

**v2.0.0** (最新)
- ✅ 升级到 Expo SDK 52
- ✅ 升级到 React Native 0.76
- ✅ 升级到 React 18.3
- ✅ 配置国内 Gradle 镜像
- ✅ 添加 GitHub Actions CI/CD

**v1.0.0**
- 初始版本
- Expo SDK 51
- React Native 0.74

### 常见问题

#### Android 构建失败

1. 确保已安装 Android SDK 和 Build Tools
2. 检查 `ANDROID_HOME` 环境变量
3. 清理 Gradle 缓存：`./gradlew clean`
4. 使用国内镜像加速依赖下载

#### 依赖下载缓慢

项目已配置国内镜像源，如遇网络问题：
- 检查 `android/build.gradle` 中的镜像配置
- 尝试使用代理或 VPN
- 使用离线模式：`./gradlew assembleDebug --offline`

## 📄 License

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**构建状态**: [![Android Build](https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml/badge.svg)](https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml)
