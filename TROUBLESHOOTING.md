# GitHub Actions 构建故障排查

## 当前问题

构建在 2 分钟左右失败，错误代码为 1。这通常意味着：

1. **依赖安装问题** - yarn install 失败
2. **prebuild 问题** - Expo prebuild 需要配置
3. **gradle 构建问题** - Android 构建失败

## 解决方案

### 方案 1：使用 EAS Build（推荐）

EAS Build 是 Expo 官方的云构建服务，更简单可靠。

#### 步骤：

1. **安装 EAS CLI**
   ```bash
   yarn global add eas-cli
   ```

2. **登录 EAS**
   ```bash
   eas login
   ```

3. **配置 EAS**
   ```bash
   eas build:configure
   ```

4. **构建 APK**
   ```bash
   eas build -p android --profile preview
   ```

### 方案 2：修复本地构建

#### 检查步骤：

1. **在本地测试构建**
   ```bash
   yarn install
   yarn prebuild
   cd android
   ./gradlew assembleRelease
   ```

2. **查看具体错误**
   - 如果是 Gradle 错误，检查 `android/build.gradle`
   - 如果是依赖错误，检查 `package.json`

### 方案 3：使用预构建的 APK

如果构建持续失败，可以：

1. 在本地构建 APK
2. 手动上传到 GitHub Releases

## 下一步

请查看 GitHub Actions 的详细日志：

1. 访问：https://github.com/335459215/YunYingTV/actions
2. 点击最近的失败构建
3. 点击 "Build APK"
4. 查看具体错误信息
5. 截图或复制错误日志
