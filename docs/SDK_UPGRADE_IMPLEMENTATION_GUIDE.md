# Expo SDK 52 → 55 升级实施指南

## 文档信息
- **项目**: YunYingTV
- **版本**: v1.0
- **日期**: 2026-04-07

---

## 目录
1. [前置准备](#1-前置准备)
2. [阶段一实施步骤](#2-阶段一实施步骤-sdk-52--53)
3. [阶段二实施步骤](#3-阶段二实施步骤-sdk-53--54)
4. [阶段三实施步骤](#4-阶段三实施步骤-sdk-54--55)
5. [常见问题解答](#5-常见问题解答)

---

## 1. 前置准备

### 1.1 环境检查清单

- [ ] Node.js 版本 ≥ 20.0.0 (推荐 20.19.4+)
- [ ] npm 版本 ≥ 10.0.0
- [ ] Git 工作区干净 (无未提交的变更)
- [ ] 备份当前代码
- [ ] 确认有足够的时间完成每个阶段 (至少 3 个工作日)
- [ ] 准备好测试设备 (Android 真机 ≥ 2 台, iOS 真机 ≥ 1 台)
- [ ] iOS 开发环境: Xcode 16.1+ (SDK 54+) / Xcode 26 (SDK 55)

### 1.2 代码备份

```bash
# 创建备份分支
git checkout -b release/sdk-52-backup

# 推送到远程仓库
git push -u origin release/sdk-52-backup

# 切回开发分支
git checkout main
```

### 1.3 开发环境准备

```bash
# 更新 EAS CLI
npm i -g eas-cli

# 清理依赖（可选，但推荐）
node scripts/clean-modules.js

# 重新安装依赖
npm install
```

---

## 2. 阶段一实施步骤 (SDK 52 → 53)

### 2.1 执行升级

```bash
# 1. 创建功能分支
git checkout -b feature/sdk-53-upgrade

# 2. 运行 Expo 升级命令
npx expo install expo@^53.0.0 --fix

# 3. 查看变更
git diff

# 4. 运行健康检查
npx expo-doctor@latest
```

### 2.2 配置保持旧架构

编辑 `app.json`:
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

### 2.3 处理 package.json exports 问题（如需要）

如果遇到导入错误，创建或编辑 `metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 临时禁用 package.json exports
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
```

### 2.4 构建测试

```bash
# 1. 清理旧的原生构建
rm -rf android ios

# 2. 重新预构建
npx expo prebuild

# 3. Android 构建测试
npm run build-debug

# 4. 如果有 iOS 环境
# npx expo run:ios
```

### 2.5 功能验证清单

- [ ] 应用正常启动
- [ ] 闪屏正常显示和隐藏
- [ ] 首页加载正常
- [ ] 视频播放功能正常 (LivePlayer.tsx)
- [ ] 视频播放功能正常 (play.tsx)
- [ ] 路由导航正常
- [ ] 设置页面正常
- [ ] 收藏功能正常
- [ ] 历史记录功能正常
- [ ] 搜索功能正常

### 2.6 提交代码

```bash
# 1. 查看变更
git status

# 2. 添加变更
git add .

# 3. 提交
git commit -m "feat: upgrade to Expo SDK 53"

# 4. 推送
git push -u origin feature/sdk-53-upgrade
```

---

## 3. 阶段二实施步骤 (SDK 53 → 54)

### 3.1 执行升级

```bash
# 1. 从阶段一分支继续，或创建新分支
git checkout feature/sdk-53-upgrade
git checkout -b feature/sdk-54-upgrade

# 2. 升级到 SDK 54
npx expo install expo@^54.0.0 --fix

# 3. 升级 TypeScript
npm install typescript@~5.9.2 --save-dev

# 4. 运行健康检查
npx expo-doctor@latest
```

### 3.2 expo-av 迁移

#### 3.2.1 安装新模块

```bash
npx expo install expo-video expo-audio
```

#### 3.2.2 创建适配器

创建文件 `services/expoAvAdapter.ts`:
```typescript
import { Video as ExpoVideo, VideoProps } from 'expo-video';
import { ResizeMode } from 'expo-video';

export const Video: React.FC<VideoProps> = (props) => {
  return <ExpoVideo {...props} />;
};

export { ResizeMode };
```

#### 3.2.3 迁移 LivePlayer.tsx

编辑 `components/LivePlayer.tsx`:
```typescript
// 修改前
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

// 修改后
import { Video, ResizeMode } from "@/services/expoAvAdapter";
```

#### 3.2.4 迁移 play.tsx

编辑 `app/play.tsx`:
```typescript
// 修改前
import { Video } from "expo-av";

// 修改后
import { Video } from "@/services/expoAvAdapter";
```

### 3.3 edge-to-edge 适配

编辑 `app/_layout.tsx`:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// 在 return 语句中
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ThemeProvider value={theme === "light" ? DefaultTheme : DarkTheme}>
          <View style={[styles.container, { backgroundColor }]}>
            <Stack>
              {/* 现有路由配置 */}
            </Stack>
          </View>
          <Toast />
          <LoginModal />
          <UpdateModal />
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
```

### 3.4 构建与测试

```bash
# 1. 清理并重新预构建
rm -rf android ios
npx expo prebuild

# 2. Android 构建
npm run build-debug

# 3. 功能测试（同阶段一验证清单）
```

### 3.5 提交代码

```bash
git add .
git commit -m "feat: upgrade to Expo SDK 54, migrate expo-av to expo-video"
git push -u origin feature/sdk-54-upgrade
```

---

## 4. 阶段三实施步骤 (SDK 54 → 55)

### 4.1 环境确认

- [ ] Node.js ≥ 20.19.4
- [ ] iOS: Xcode 26 (如果构建 iOS)

### 4.2 执行升级

```bash
# 1. 创建分支
git checkout feature/sdk-54-upgrade
git checkout -b feature/sdk-55-upgrade

# 2. 升级到 SDK 55
npx expo install expo@^55.0.0 --fix

# 3. 升级 react-native-reanimated
npx expo install react-native-reanimated@^4.0.0

# 4. 运行健康检查
npx expo-doctor@latest

# 5. 验证原生模块链接
npx expo-modules-autolinking verify -v
```

### 4.3 更新 app.json

移除 `newArchEnabled` 配置:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
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

### 4.4 完全移除 expo-av

#### 4.4.1 修改导入

编辑 `components/LivePlayer.tsx`:
```typescript
import { Video, ResizeMode } from 'expo-video';
```

编辑 `app/play.tsx`:
```typescript
import { Video } from 'expo-video';
```

#### 4.4.2 删除适配器

```bash
rm services/expoAvAdapter.ts
```

#### 4.4.3 卸载 expo-av

```bash
npm uninstall expo-av
```

### 4.5 构建与测试

```bash
# 1. 清理并重新预构建
rm -rf android ios
npx expo prebuild

# 2. Android 构建
npm run build-debug

# 3. 完整功能测试
# 4. 性能测试（启动时间、帧率、内存）
```

### 4.6 提交代码

```bash
git add .
git commit -m "feat: upgrade to Expo SDK 55, migrate to New Architecture"
git push -u origin feature/sdk-55-upgrade
```

---

## 5. 常见问题解答

### Q1: 升级后构建失败怎么办？

**A**:
1. 保存完整的错误日志
2. 运行 `npx expo-doctor@latest` 查看提示
3. 尝试清理后重新构建:
   ```bash
   rm -rf node_modules package-lock.json android ios
   npm install
   npx expo prebuild
   npm run build-debug
   ```
4. 搜索 Expo GitHub Issues 看是否有已知问题
5. 如 2 小时内无法解决，考虑回滚

### Q2: 遇到第三方库不兼容怎么办？

**A**:
1. 检查该库是否有支持新 SDK 的版本
2. 查看是否有替代库
3. 在 package.json 中使用 overrides/resolutions 强制版本
4. 如严重阻塞，考虑在当前 SDK 版本停留更长时间

### Q3: 如何回滚到上一个阶段？

**A**:
```bash
# 1. 切换到备份分支
git checkout release/sdk-52-backup

# 2. 清理依赖
rm -rf node_modules package-lock.json android ios
npm install

# 3. 重新预构建
npx expo prebuild

# 4. 验证构建
npm run build-debug
```

### Q4: expo-video 缺少 expo-av 的某个功能怎么办？

**A**:
1. 查看 expo-video 文档确认该功能是否已支持
2. 检查是否有新的 API 替代
3. 考虑暂时 fork expo-av 自行维护
4. 寻找其他视频播放库作为备选

### Q5: 新架构性能不如旧架构怎么办？

**A**:
1. 确认是发布构建（Release Build）的性能
2. 使用 React DevTools Profiler 分析性能瓶颈
3. 检查是否有不必要的重渲染
4. 参考 Expo 新架构性能优化指南
5. 如无改善，可在社区反馈问题

---

**文档结束**
