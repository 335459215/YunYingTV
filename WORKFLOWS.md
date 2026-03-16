# GitHub Actions 工作流说明

本项目保留了 3 个核心工作流，每个都有明确的用途和触发方式。

## 📋 工作流概览

| 工作流 | 文件名 | 触发方式 | 用途 |
|--------|--------|----------|------|
| **Android Build** | `android-build.yml` | 自动触发 | CI/CD 持续集成 |
| **Build Android APK** | `build-apk.yml` | 手动触发 | 版本发布构建 |
| **Build Android APK with EAS** | `build-eas.yml` | 手动/标签触发 | EAS 生产构建 |

---

## 1️⃣ Android Build (自动 CI/CD)

**文件**: `.github/workflows/android-build.yml`

### 触发条件
- ✅ 推送到 `master` 或 `main` 分支
- ✅ Pull Request 创建/更新
- ✅ 手动触发（workflow_dispatch）

### 主要功能
- 📦 安装 Node.js 20 和 Java 17
- 🔧 使用 Gradle 缓存加速构建
- 🏗️ 编译 Android Debug APK
- 📤 上传 APK artifact（保留 7 天）

### 适用场景
- 每次代码提交后的自动验证
- PR 合并前的质量检查
- 快速测试构建（Debug 版本）

### 构建产物
- `app-debug.apk` - Debug 版本 APK
- 位置：Actions → 最近的 run → Artifacts

### 预计耗时
- 首次：15-20 分钟
- 后续（使用缓存）：5-8 分钟

---

## 2️⃣ Build Android APK (手动版本发布)

**文件**: `.github/workflows/build-apk.yml`

### 触发条件
- 🔘 仅手动触发（workflow_dispatch）

### 可配置选项
```yaml
version_increment: 
  - patch (默认，自动递增 0.0.1)
  - minor (递增 0.1.0)
  - major (递增 1.0.0)
  - none (保持当前版本)

create_release:
  - true (创建 GitHub Release)
  - false (仅构建 APK)
```

### 主要功能
- 📝 自动递增版本号
- 🔄 更新 package.json 并推送
- 🏗️ 编译 Release APK
- 📦 创建 GitHub Release（可选）
- 📤 上传带版本号的 APK

### 适用场景
- 正式发布新版本
- 需要版本管理的构建
- 需要创建 Release 的构建

### 构建产物
- `YunYingTV-v{version}.apk` - 带版本号的 Release APK
- GitHub Release（如果选择创建）

### 预计耗时
- 20-25 分钟（包含版本管理和发布）

---

## 3️⃣ Build Android APK with EAS (EAS 构建)

**文件**: `.github/workflows/build-eas.yml`

### 触发条件
- ✅ 推送到 `master` 分支
- ✅ 创建 `v*` 标签（如 v1.2.3）
- ✅ 手动触发

### 前置要求
- ⚠️ 需要配置 `EXPO_TOKEN` Secret

### 主要功能
- 🔧 使用 EAS Build 服务
- 📱 构建优化的生产 APK
- ️ 自动创建 Release（当推送标签时）
- 📤 上传 APK artifact（保留 30 天）

### 适用场景
- 生产环境构建
- 需要 EAS 特性的构建
- 带标签的正式版本发布

### 构建产物
- `YunYingTV-v{version}.apk` - EAS 构建的 APK
- GitHub Release（如果是标签触发）

### 预计耗时
- 15-20 分钟

---

## 🔧 配置说明

### 设置 EXPO_TOKEN

对于 EAS 构建工作流，需要配置 Expo 令牌：

1. 获取 Expo Token：
   ```bash
   npx expo login
   npx expo access-tokens
   ```

2. 添加到 GitHub Secrets：
   - 访问：https://github.com/335459215/YunYingTV/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: 粘贴 Expo Token

### 自定义构建参数

可以在工作流文件中修改：

**android-build.yml**:
- `timeout-minutes`: 构建超时时间（默认 45 分钟）
- `retention-days`: artifact 保留天数（默认 7 天）

**build-apk.yml**:
- 版本递增策略
- Release 创建选项

**build-eas.yml**:
- EAS profile（preview/production）
- artifact 保留天数（默认 30 天）

---

## 📊 工作流对比

| 特性 | Android Build | Build APK | Build with EAS |
|------|---------------|-----------|----------------|
| **触发方式** | 自动 | 手动 | 自动/手动 |
| **版本管理** | ❌ | ✅ | ✅ |
| **创建 Release** | ❌ | 可选 | 标签触发时 |
| **构建类型** | Debug | Release | Release |
| **需要 Token** | ❌ | ❌ | ✅ (EXPO_TOKEN) |
| **构建时间** | 快 | 中等 | 中等 |
| **适用场景** | CI/CD | 发布 | 生产 |

---

## 🎯 使用建议

### 日常开发
- 使用 **Android Build** - 自动验证每次提交

### 版本发布
1. 使用 **Build Android APK** 手动触发
2. 选择版本递增类型（patch/minor/major）
3. 选择是否创建 Release
4. 下载 APK 进行测试

### 生产部署
- 使用 **Build with EAS** + 标签推送
- 或手动触发 EAS 构建
- 确保 EXPO_TOKEN 已配置

---

## 🗑️ 已删除的工作流

以下工作流已被删除以减少噪音：

- ❌ `hello-world.yml` - 测试用的 Hello World，无生产价值
- ❌ `test-build.yml` - 测试环境脚本，功能已被其他工作流覆盖

---

## 📞 故障排查

如果工作流不触发：

1. 检查 Actions 是否启用
2. 检查分支名称是否匹配
3. 检查工作流语法
4. 查看 GitHub Status

详细故障排查指南请参考：`TROUBLESHOOTING.md`

---

**更新时间**: 2026-03-16
**最新提交**: 2aa8799 - refactor: Remove redundant action workflows
