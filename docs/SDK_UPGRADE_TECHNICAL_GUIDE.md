# Expo SDK 52 → 55 升级技术方案文档

## 文档信息
- **项目**: YunYingTV
- **版本**: v1.0
- **日期**: 2026-04-07

---

## 目录
1. [技术架构概述](#1-技术架构概述)
2. [关键技术决策](#2-关键技术决策)
3. [详细迁移方案](#3-详细迁移方案)
4. [代码变更清单](#4-代码变更清单)

---

## 1. 技术架构概述

### 1.1 当前架构 (SDK 52)
```
┌─────────────────────────────────────────┐
│         React Native (0.76.3)           │
│         旧架构 (Legacy)                  │
├─────────────────────────────────────────┤
│  Expo SDK 52                             │
│  ├── expo-router 4.0.6                  │
│  ├── expo-av 15.0.2                     │
│  ├── expo-splash-screen 0.29.7          │
│  └── 其他 expo 模块...                  │
├─────────────────────────────────────────┤
│  第三方库                                │
│  ├── react-native-reanimated 3.16.1     │
│  ├── react-native-gesture-handler 2.20.2│
│  └── zustand 5.0.6                       │
└─────────────────────────────────────────┘
```

### 1.2 目标架构 (SDK 55)
```
┌─────────────────────────────────────────┐
│         React Native (0.83)              │
│         新架构 (Fabric + TurboModules)   │
├─────────────────────────────────────────┤
│  Expo SDK 55                             │
│  ├── expo-router (新版本)                │
│  ├── expo-video + expo-audio            │
│  ├── expo-splash-screen (新版本)         │
│  └── 其他 expo 模块 (v55.x)             │
├─────────────────────────────────────────┤
│  第三方库                                │
│  ├── react-native-reanimated 4.x         │
│  ├── react-native-gesture-handler (新版)│
│  └── zustand 5.0.6 (不变)               │
└─────────────────────────────────────────┘
```

---

## 2. 关键技术决策

### 2.1 升级路径选择

**决策**: 采用渐进式升级，而非直接跳跃

**理由**:
1. 降低单次升级的复杂度和风险
2. 每个阶段都可以充分测试和验证
3. 便于问题定位和回滚
4. 符合 Expo 官方推荐的升级实践

### 2.2 新架构迁移时机

**决策**: SDK 54 → 55 阶段完成新架构迁移

**理由**:
1. SDK 53 和 54 仍支持旧架构，可以先在旧架构下验证功能
2. SDK 55 仅支持新架构，必须迁移
3. 给第三方库留出更新时间

### 2.3 expo-av 迁移策略

**决策**: SDK 53 阶段保持不变，SDK 54 阶段完成迁移

**理由**:
1. expo-av 在 SDK 53 仍可用
2. SDK 54 有充足时间进行迁移和测试
3. SDK 55 必须移除 expo-av

### 2.4 edge-to-edge 适配策略

**决策**: SDK 54 阶段完成适配

**理由**:
1. SDK 54 开始强制启用 edge-to-edge
2. 使用 SafeAreaView 作为兜底方案
3. 逐步调整布局以充分利用 edge-to-edge 优势

---

## 3. 详细迁移方案

### 3.1 SDK 52 → 53 迁移详情

#### 3.1.1 依赖升级命令
```bash
# 1. 更新 EAS CLI
npm i -g eas-cli

# 2. 升级 Expo SDK
npx expo install expo@^53.0.0 --fix

# 3. 运行健康检查
npx expo-doctor@latest
```

#### 3.1.2 app.json 配置变更
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false
          },
          "android": {
            "newArchEnabled": false,
            "enableProguardInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true,
            "kotlinVersion": "1.9.25"
          }
        }
      ],
      "expo-router"
    ]
  }
}
```

#### 3.1.3 潜在问题处理

**问题 1: package.json exports 导致的导入错误**
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 临时禁用 package.json exports
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

**问题 2: React 19 第三方库兼容性**
```json
// package.json
{
  "overrides": {
    "react": "19.x",
    "react-dom": "19.x"
  }
}
```

### 3.2 SDK 53 → 54 迁移详情

#### 3.2.1 expo-av → expo-video 迁移

**步骤 1: 安装新模块**
```bash
npx expo install expo-video expo-audio
```

**步骤 2: 创建适配器 (services/expoAvAdapter.ts)**
```typescript
import { Video as ExpoVideo, VideoProps } from 'expo-video';
import { ResizeMode } from 'expo-video';

export const Video: React.FC<VideoProps> = (props) => {
  return <ExpoVideo {...props} />;
};

export { ResizeMode };
```

**步骤 3: 迁移 LivePlayer.tsx**
```typescript
// 修改前
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

// 修改后
import { Video, ResizeMode } from "@/services/expoAvAdapter";
```

**步骤 4: 迁移 play.tsx**
```typescript
// 修改前
import { Video } from "expo-av";

// 修改后
import { Video } from "@/services/expoAvAdapter";
```

#### 3.2.2 edge-to-edge 适配

**修改 app/_layout.tsx**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  // ... 现有代码 ...

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <ThemeProvider value={theme === "light" ? DefaultTheme : DarkTheme}>
            {/* 现有内容 */}
          </ThemeProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**移除或调整 SystemUI 调用**
```typescript
// SDK 54+ edge-to-edge 强制启用后
// 移除手动设置背景色的代码，或使用 expo-navigation-bar
```

### 3.3 SDK 54 → 55 迁移详情

#### 3.3.1 新架构迁移

**步骤 1: 移除旧架构配置**
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          // 删除 newArchEnabled 配置
          "android": {
            "enableMinifyInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true,
            "kotlinVersion": "1.9.25"
          }
        }
      ],
      "expo-router"
    ]
  }
}
```

**步骤 2: 升级 react-native-reanimated**
```bash
npx expo install react-native-reanimated@^4.0.0
```

**步骤 3: 验证原生模块**
```bash
npx expo-modules-autolinking verify -v
```

#### 3.3.2 完全移除 expo-av

**删除适配器，直接使用 expo-video**
```typescript
// LivePlayer.tsx
import { Video, ResizeMode } from 'expo-video';

// play.tsx
import { Video } from 'expo-video';
```

**卸载 expo-av**
```bash
npm uninstall expo-av
```

---

## 4. 代码变更清单

### 4.1 阶段一 (SDK 52 → 53)

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| package.json | 修改 | 升级 expo 及相关模块到 53.x |
| app.json | 修改 | 添加 newArchEnabled: false |
| metro.config.js | 新增/修改 | 可能需要添加 unstable_enablePackageExports: false |

### 4.2 阶段二 (SDK 53 → 54)

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| package.json | 修改 | 升级到 54.x，添加 expo-video, expo-audio |
| services/expoAvAdapter.ts | 新增 | expo-av 兼容性适配器 |
| components/LivePlayer.tsx | 修改 | 替换 expo-av 导入 |
| app/play.tsx | 修改 | 替换 expo-av 导入 |
| app/_layout.tsx | 修改 | 添加 SafeAreaView 适配 edge-to-edge |
| app.json | 修改 | 可能添加 expo-navigation-bar 配置 |

### 4.3 阶段三 (SDK 54 → 55)

| 文件 | 变更类型 | 说明 |
|-----|---------|------|
| package.json | 修改 | 升级到 55.x，升级 reanimated 到 v4 |
| app.json | 修改 | 移除 newArchEnabled 配置 |
| services/expoAvAdapter.ts | 删除 | 移除适配器 |
| components/LivePlayer.tsx | 修改 | 直接使用 expo-video |
| app/play.tsx | 修改 | 直接使用 expo-video |

---

**文档结束**
