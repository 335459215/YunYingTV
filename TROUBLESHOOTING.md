# 🧪 GitHub Actions 故障排查指南

## 问题诊断步骤

### 1️⃣ 检查 GitHub 仓库是否收到提交

**请在浏览器中访问**：https://github.com/335459215/YunYingTV/commits/master

查看最新的提交记录，应该看到：
- ✅ `b81be9d` - Fix: Add workflow_dispatch trigger for manual testing
- ✅ `56be28b` - Add upgrade summary documentation
- ✅ `2c81a6a` - Add comprehensive README with CI/CD instructions
- ✅ `8d0cc28` - Add GitHub Actions workflow for Android CI/CD
- ✅ `1bedd1c` - Upgrade to Expo SDK 52 and React Native 0.76

**如果没看到这些提交**，说明推送失败，请检查网络连接。

### 2️⃣ 检查 Actions 是否启用

**访问**：https://github.com/335459215/YunYingTV/actions

1. 如果看到提示 "I want to create a workflow"，说明 Actions 还未启用
2. 点击 "Enable Actions" 按钮
3. 然后刷新页面

### 3️⃣ 检查工作流文件是否正确

**访问**：https://github.com/335459215/YunYingTV/tree/master/.github/workflows

确认以下文件存在：
- ✅ `android-build.yml` (新增的自动构建工作流)
- ✅ `build-apk.yml` (旧的手动触发工作流)

### 4️⃣ 检查工作流语法

GitHub 会自动验证工作流语法。如果语法有错误：
1. 访问 https://rhysd.github.io/actionlint/
2. 粘贴工作流内容进行检查

### 5️⃣ 手动触发工作流测试

现在工作流已支持手动触发：

1. 访问：https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml
2. 点击 **"Run workflow"** 按钮
3. 选择分支（master）
4. 点击 **"Run workflow"**
5. 等待构建完成（约 15-20 分钟）

### 6️⃣ 检查分支保护规则

如果仓库设置了分支保护，可能会阻止 Actions 运行：

1. 访问：https://github.com/335459215/YunYingTV/settings/branches
2. 检查 master 分支的规则
3. 确保没有阻止 Actions 的规则

### 7️⃣ 检查 Actions 权限

1. 访问：https://github.com/335459215/YunYingTV/settings/actions
2. 确保 "Allow all actions and reusable workflows" 已启用
3. 或者至少允许 "Actions by contributors with read access"

### 8️⃣ 查看工作流运行历史

**访问**：https://github.com/335459215/YunYingTV/actions

查看所有工作流运行记录：
- 🔴 失败的 run - 点击查看错误日志
- 🟢 成功的 run - 可以下载 APK artifact
- 🟡 运行中的 run - 实时监控进度

## 📋 快速检查清单

请逐项检查：

- [ ] GitHub 仓库收到了最新的 5 个提交
- [ ] Actions 已启用（绿色开关）
- [ ] `.github/workflows/android-build.yml` 文件存在
- [ ] 工作流语法正确（无红色错误提示）
- [ ] Actions 权限已启用
- [ ] 分支名称匹配（master 或 main）
- [ ] 没有工作流语法错误

## 🔧 常见解决方案

### 方案 A: 重新推送触发

```bash
# 在本地执行
git commit --allow-empty -m "Trigger GitHub Actions"
git push origin master
```

### 方案 B: 在 GitHub 上手动触发

1. 访问 https://github.com/335459215/YunYingTV/actions/workflows/android-build.yml
2. 点击 "Run workflow"
3. 选择 master 分支
4. 点击 "Run workflow"

### 方案 C: 检查并修复工作流

如果工作流一直不触发：

1. 删除旧的工作流文件（如果不需要）：
   ```bash
   git rm .github/workflows/build-apk.yml
   git commit -m "Remove old workflow"
   git push
   ```

2. 简化工作流配置，确保基础功能正常

3. 检查 GitHub 仓库的 Actions 标签页是否有错误提示

## 📊 预期结果

成功触发后，应该看到：

1. **Actions 页面**显示新的运行记录
2. **运行状态**显示为黄色（进行中）
3. **大约 15-20 分钟后**变为绿色（成功）或红色（失败）
4. **成功后**可以在页面底部下载 APK 文件

## ⚠️ 如果仍然不触发

可能的原因：

1. **GitHub 服务问题** - 访问 https://www.githubstatus.com/ 检查状态
2. **仓库设置问题** - 检查 Actions 权限设置
3. **工作流语法错误** - GitHub 会在工作流文件中显示红色叉号
4. **分支不匹配** - 确认推送到的是 master 分支
5. **网络问题** - 尝试使用手机热点或其他网络

## 📞 需要帮助？

请提供以下信息：

1. GitHub Actions 页面的截图
2. 最近提交记录的截图
3. 任何错误信息

---

**更新时间**: 2026-03-16 17:50
**最新提交**: b81be9d
