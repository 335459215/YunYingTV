# 云影 TV 📺

> **基于 AI 辅助开发的个人自用项目** | 借助 AI 增加功能自用

一个基于 React Native 和 Expo 构建的跨平台视频流媒体应用，支持手机、平板和 TV 设备，提供流畅的视频观看体验和现代化的用户界面。

---

## 📌 项目说明

本项目基于 [OrionTV](https://github.com/orion-lib/OrionTV) 进行二次开发，在原项目基础上借助 AI 工具增加了多个自用功能。

- **原项目地址**: https://github.com/orion-lib/OrionTV
- **原项目作者**: orion-lib 团队
- **本项目作者**: 个人开发者（基于 OrionTV 修改）

---

## ✨ 功能特性

- **跨平台支持**: 同时支持 Android、iOS、Android TV、Apple TV
- **响应式设计**: 自动适配手机、平板和电视屏幕
- **现代化前端**: 使用 Expo、React Native 和 TypeScript 构建，性能卓越
- **Expo Router**: 基于文件系统的路由，使导航逻辑清晰简单
- **TV 优化的 UI**: 专为电视遥控器交互设计的用户界面
- **触摸控制**: 支持手势操作、双击暂停、滑动调节

## 🛠️ 技术栈

- **前端**:
  - [React Native](https://reactnative.dev/) (支持 TVOS)
  - [Expo](https://expo.dev/) (~51.0)
  - [Expo Router](https://docs.expo.dev/router/introduction/)
  - [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Zustand](https://github.com/pmndrs/zustand) - 状态管理

- **构建工具**:
  - [Gradle 8.8](https://gradle.org/)
  - [Java 17](https://adoptium.net/) (Amazon Corretto 17)
  - [Metro Bundler](https://facebook.github.io/metro/)

## 📂 项目结构

本项目采用模块化的目录结构：

```
yunyingtv/
├── app/              # Expo Router 路由和页面
├── assets/           # 静态资源 (字体，图片，TV 图标)
├── components/       # React 组件 (响应式组件)
├── constants/        # 应用常量 (颜色，样式)
├── hooks/            # 自定义 Hooks
├── services/         # 服务层 (API, 存储)
├── stores/           # 状态管理 (Zustand)
├── utils/            # 工具函数
├── package.json      # 前端依赖和脚本
└── ...
```

## 🚀 快速开始

### 环境准备

#### 必需软件
- [Node.js](https://nodejs.org/) (LTS 版本，推荐 20+)
- [Yarn](https://yarnpkg.com/) (推荐 1.22+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Java 17](https://adoptium.net/) (Amazon Corretto 17)

#### 可选软件
- [Xcode](https://developer.apple.com/xcode/) (用于 Apple TV 开发)
- [Android Studio](https://developer.android.com/studio) (用于 Android TV 开发)

### 项目启动

#### 1. 安装依赖

```bash
yarn install
```

#### 2. 配置环境 (重要)

```bash
# 设置 JAVA_HOME 为 Java 17 (不是 Java 25)
# Windows:
set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk17.0.18_9

# 设置 ANDROID_HOME
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
```

#### 3. 运行应用

```bash
# TV 模式 (Android TV / Apple TV)
yarn start-tv
yarn android-tv        # Android TV
yarn ios-tv            # Apple TV

# 手机/平板模式
yarn start
yarn android           # Android
yarn ios               # iOS
```

#### 4. 构建 APK

```bash
# 使用 EAS Build (推荐)
eas build --platform android --profile production

# 本地构建
yarn run-android
```

## 📜 主要脚本

### 开发脚本
- `yarn start`: 在手机模式下启动 Metro Bundler
- `yarn start-tv`: 在 TV 模式下启动 Metro Bundler
- `yarn android`: 在 Android 设备上运行
- `yarn ios`: 在 iOS 设备上运行
- `yarn android-tv`: 在 Android TV 上构建并运行应用
- `yarn ios-tv`: 在 Apple TV 上构建并运行应用

### 构建脚本
- `yarn prebuild-tv`: 为 TV 构建生成原生项目文件
- `yarn build`: 构建生产版本

### 维护脚本
- `yarn lint`: 检查代码风格
- `yarn test`: 运行测试
- `yarn clean`: 清理构建缓存

## 🙏 致谢

- 感谢 [OrionTV](https://github.com/orion-lib/OrionTV) 原项目作者提供的优秀基础代码
- 感谢所有开源项目的贡献者
- 本项目在开发过程中借助了 AI 工具进行功能增强和优化

## ⚠️ 免责声明

1. **仅供学习和个人使用**：本项目仅供学习交流和个人使用，不得用于任何商业用途。

2. **内容来源**：本项目不提供任何视频内容，所有视频资源均来自第三方 API。请确保您使用的 API 来源合法合规。

3. **法律责任**：使用本项目产生的任何法律纠纷与原作者及本项目无关，请使用者自行承担法律责任。

4. **删除声明**：如本项目对任何第三方构成侵权或违反相关法律法规，请联系删除。

5. **使用限制**：请在下载后 24 小时内删除本项目，不得传播或用于其他目的。

## 📜 License

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

**注意**：本项目基于 [OrionTV](https://github.com/orion-lib/OrionTV) 修改，遵循原项目的开源协议。
