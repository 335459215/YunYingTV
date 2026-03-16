# 🎯 GitHub Actions 构建监控指南

## 📋 当前构建状态

**最新标签**: v1.0.1 (最新创建)
**触发的工作流**: Build Android APK with EAS
**预计时间**: 15-20 分钟

---

## 🔍 实时监控步骤

### 步骤 1: 打开 Actions 页面

**立即访问**: https://github.com/335459215/YunYingTV/actions

### 步骤 2: 查看运行中的工作流

1. 在左侧选择 **"Build Android APK with EAS"**
2. 找到最新的运行记录（应该在顶部）
3. 状态应该是 🟡 **黄色**（运行中）或 🟢 **绿色**（成功）或 🔴 **红色**（失败）

### 步骤 3: 查看详细日志

1. 点击最新的运行记录
2. 点击 **"build"** job
3. 展开各个步骤查看实时日志

---

## ⚠️ 常见问题及解决方案

### 问题 1: EXPO_TOKEN 未配置

**错误信息**:
```
Error: Expo token is required
```

**解决方案**:

#### 方案 A: 配置 EXPO_TOKEN（推荐）

1. 获取 Expo Token:
   ```bash
   npx expo login
   npx expo access-tokens
   ```

2. 添加到 GitHub Secrets:
   - 访问：https://github.com/335459215/YunYingTV/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: 粘贴刚才生成的 token
   - 点击 "Add secret"

3. 重新触发构建:
   - 回到 Actions 页面
   - 点击 "Build Android APK with EAS"
   - 点击 "Run workflow"
   - 选择 master 分支
   - 点击 "Run workflow"

#### 方案 B: 使用手动构建工作流（无需 Token）

1. 访问：https://github.com/335459215/YunYingTV/actions/workflows/build-apk.yml
2. 点击 "Run workflow"
3. 配置选项:
   - **Branch**: master
   - **version_increment**: `patch` (或根据需要选择)
   - **create_release**: `true`
4. 点击 "Run workflow"
5. 等待 20-25 分钟

### 问题 2: Gradle 依赖下载失败

**错误信息**:
```
Could not resolve all artifacts
```

**解决方案**:

此问题已在项目中配置国内镜像，但如果 GitHub Actions 仍然失败：

1. 检查 `android/build.gradle` 中的镜像配置
2. 查看日志确认是否所有镜像都无法访问
3. 通常 GitHub 服务器在国外，下载速度应该很快

### 问题 3: 构建超时

**错误信息**:
```
Error: The operation was cancelled.
```

**解决方案**:

1. 检查工作流 timeout-minutes 设置（已设置为 45 分钟）
2. 如果是网络问题，重新运行工作流
3. 如果持续超时，检查代码是否有编译错误

### 问题 4: 签名问题

**错误信息**:
```
Keystore was not found
```

**解决方案**:

Debug 构建会自动生成签名，Release 构建需要配置签名。

当前版本使用 EAS Build，会自动处理签名。

---

## 📊 构建进度检查点

### ✅ 阶段 1: 环境设置 (2-3 分钟)
- [x] Checkout code
- [x] Setup Node.js
- [x] Setup Java JDK
- [ ] Install dependencies

### ✅ 阶段 2: 依赖安装 (3-5 分钟)
- [ ] npm install
- [ ] Install EAS CLI
- [ ] Restore Gradle cache

### ✅ 阶段 3: EAS 构建 (10-15 分钟)
- [ ] Setup EAS
- [ ] Build APK with EAS
- [ ] Upload artifact

### ✅ 阶段 4: 发布 (1-2 分钟)
- [ ] Create Release (如果是标签触发)
- [ ] Upload APK to Release

---

## 🎯 成功标志

### 构建成功的表现

1. **工作流状态**: 🟢 绿色勾号
2. **运行时间**: 约 15-20 分钟
3. **日志结尾**:
   ```
   ✅ Build completed successfully
   ✅ Artifact uploaded
   ✅ Release created
   ```

### 下载 APK

#### 方式 1: 从 Actions 下载
1. 点击成功的运行记录
2. 滚动到页面底部
3. 点击 **"apk"** artifact
4. 下载并解压

#### 方式 2: 从 Release 下载
1. 访问：https://github.com/335459215/YunYingTV/releases
2. 找到 **v1.0.1** 标签
3. 点击 "Assets"
4. 下载 `YunYingTV-v1.0.1.apk`

---

## 🔄 失败处理流程

### 如果构建失败

#### 第一步：查看错误日志
1. 点击失败的运行记录
2. 找到标红的步骤
3. 查看错误信息

#### 第二步：根据错误类型处理

**网络错误**:
- 重新运行工作流
- 检查镜像配置

**编译错误**:
- 查看具体错误信息
- 修复代码后重新推送

**配置错误**:
- 检查工作流配置
- 检查 Secrets 配置

**资源错误**:
- 检查内存是否充足
- 检查磁盘空间

#### 第三步：重新触发

1. 修复问题后
2. 删除旧标签（如果需要）:
   ```bash
   git tag -d v1.0.1
   git push origin :refs/tags/v1.0.1
   ```
3. 重新创建标签:
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1 - Fixed"
   git push origin v1.0.1
   ```

---

## 📱 实时监控清单

使用以下清单持续监控：

- [ ] 打开 Actions 页面
- [ ] 找到最新的运行记录
- [ ] 检查当前状态（颜色）
- [ ] 查看运行时间
- [ ] 检查是否有错误
- [ ] 等待构建完成
- [ ] 验证构建产物
- [ ] 下载 APK
- [ ] 测试安装

---

## 🎉 发布成功后的操作

### 验证 Release

1. 访问：https://github.com/335459215/YunYingTV/releases
2. 确认 v1.0.1 已创建
3. 确认 APK 文件已上传
4. 确认发布说明完整

### 测试 APK

1. 下载 APK 到本地
2. 在 Android 设备上安装
3. 启动应用测试基本功能
4. 验证版本号

### 通知团队

发布成功后，可以：
- 在团队频道通知
- 更新项目文档
- 准备下一个版本

---

## 📞 需要帮助？

如果遇到问题：

1. **查看日志**: 详细的错误信息在日志中
2. **检查工作流**: 确认配置是否正确
3. **验证 Secrets**: 确认 EXPO_TOKEN 等配置
4. **参考文档**: README.md 和 TROUBLESHOOTING.md

---

**监控开始时间**: 2026-03-16
**预计完成时间**: 15-20 分钟后
**状态**: 🔄 等待构建完成
