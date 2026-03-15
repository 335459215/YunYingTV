# GitHub Actions 构建指南

本文档说明如何使用 GitHub Actions 自动构建 Android APK。

## 📋 前提条件

1. GitHub 账号
2. 访问权限：https://github.com/335459215/YunYingTV

## 🚀 触发构建的三种方式

### 方式一：GitHub 网页触发（推荐）

1. 访问 Actions 页面：
   ```
   https://github.com/335459215/YunYingTV/actions
   ```

2. 点击左侧的 **"Build Android APK"** workflow

3. 点击 **"Run workflow"** 按钮

4. 选择分支（默认：master）

5. 点击 **"Run workflow"** 开始构建

6. 等待构建完成（约 10-15 分钟）

7. 构建成功后，APK 文件会自动发布到 Releases 页面

### 方式二：PowerShell 脚本触发

```powershell
# 使用 PowerShell 脚本触发
.\trigger-github-action.ps1 -Token "YOUR_GITHUB_TOKEN"
```

**获取 GitHub Token：**

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：`repo`（完整仓库权限）
4. 生成 token 并复制
5. 在脚本中使用该 token

### 方式三：curl 命令触发

```bash
curl -L -X POST \
  https://api.github.com/repos/335459215/YunYingTV/actions/workflows/build-apk.yml/dispatches \
  -H 'Accept: application/vnd.github+json' \
  -H 'Authorization: Bearer YOUR_GITHUB_TOKEN' \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  -d '{"ref":"master"}'
```

## 📦 构建产物

构建成功后，你会得到：

- **APK 文件**: `orionTV.{version}.apk`
- **发布位置**: https://github.com/335459215/YunYingTV/releases
- **自动创建 Release**: 包含版本号和构建说明

## ⚙️ 构建配置

构建使用以下配置：

- **Node.js**: 18.x
- **Java**: 17 (Zulu JDK)
- **构建工具**: Yarn + Expo
- **输出**: Android TV APK

## 🔍 查看构建进度

1. 访问 Actions 页面
2. 点击正在运行的 workflow
3. 查看实时日志输出

## 🛠️ 故障排查

### 构建失败

1. 检查 workflow 日志
2. 确认依赖安装成功
3. 验证代码没有编译错误

### 权限问题

确保 GitHub Token 有以下权限：
- `repo` - 完整仓库权限
- `workflow` - 触发 workflow 权限

### APK 生成失败

检查：
1. `package.json` 中的版本号
2. `eas.json` 中的构建配置
3. Android 构建日志

## 📝 自定义构建

如需修改构建配置，编辑：

- `.github/workflows/build-apk.yml` - Workflow 配置
- `eas.json` - EAS Build 配置
- `package.json` - 项目版本和脚本

## 🔗 相关链接

- GitHub Actions: https://github.com/335459215/YunYingTV/actions
- Releases: https://github.com/335459215/YunYingTV/releases
- Workflow 文件：`.github/workflows/build-apk.yml`
