# GitHub Actions 自动构建指南

## 🚀 快速开始

### 方式一：使用 Tag 自动触发（推荐）

```powershell
# 运行脚本自动创建 tag 并推送
.\create-release-tag.ps1
```

这会自动：
- 读取 package.json 中的版本号
- 创建并推送 tag（如 v1.0.0）
- 触发 GitHub Actions 构建
- 构建完成后自动创建 Release 并上传 APK

### 方式二：手动触发

1. 访问：https://github.com/335459215/YunYingTV/actions
2. 点击 **"Build Android APK"**
3. 点击 **"Run workflow"** 按钮
4. 选择 `master` 分支
5. 点击 **"Run workflow"**

### 方式三：推送代码自动触发

当你推送代码到 master 分支时，会自动触发构建：

```bash
git push origin master
```

## 📦 构建产物

- **APK 文件**: `YunYingTV-v{version}.apk`
- **发布位置**: https://github.com/335459215/YunYingTV/releases
- **保留时间**: 30 天（手动触发）或永久（tag 触发）

## ️ Workflow 配置

workflow 文件位于：`.github/workflows/build-apk.yml`

**触发条件**:
- ✅ 推送代码到 master 分支
- ✅ 创建新 tag（v*.*.*）
- ✅ 手动触发（workflow_dispatch）

**构建环境**:
- Node.js 18
- Java 17 (Temurin)
- Ubuntu latest

## 🔍 查看构建进度

1. 访问 Actions 页面
2. 点击正在运行的 workflow
3. 查看实时日志

## 🛠️ 故障排查

### workflow 没有显示在 GitHub 页面

1. 等待 2-5 分钟，GitHub 需要时间识别
2. 刷新页面（F5）
3. 检查 workflow 文件语法

### 构建失败

1. 查看 workflow 日志
2. 确认依赖安装成功
3. 验证代码没有编译错误

### 找不到 APK 文件

- 手动触发：查看 Actions 页面的 Artifacts 部分
- Tag 触发：查看 Releases 页面

## 📝 版本管理

更新版本号的步骤：

1. 编辑 `package.json`，修改 `version` 字段
2. 提交更改：`git commit -am "Bump version to 1.0.0"`
3. 运行脚本：`.\create-release-tag.ps1`
4. 或使用 git tag：`git tag -a v1.0.0 -m "Release v1.0.0"`
5. 推送 tag：`git push origin v1.0.0`

## 🔗 相关链接

- Actions: https://github.com/335459215/YunYingTV/actions
- Releases: https://github.com/335459215/YunYingTV/releases
- Workflow 文件：`.github/workflows/build-apk.yml`
