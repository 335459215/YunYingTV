# 🛠️ 构建问题解决记录

## 📋 构建尝试历史

### 第一次构建 ❌
**Run ID**: 23142793959  
**工作流**: build-eas.yml (EAS 构建)  
**状态**: 失败  
**错误**: `Dependencies lock file is not found`  
**原因**: 工作流配置使用 yarn 缓存，但项目使用 npm（只有 package-lock.json）

**解决方案**: 改用 build-apk.yml 工作流（使用 npm install）

---

### 第二次构建 ❌
**Run ID**: 23142818293  
**工作流**: build-apk.yml (手动触发)  
**状态**: 失败  
**错误**: `Duplicate resources`  
**原因**: Android 图标同时存在 .png 和 .webp 格式

**详细错误**:
```
ERROR: [mipmap-xxxhdpi-v4/ic_launcher] 
ic_launcher.webp 和 ic_launcher.png: Resource and asset merger: Duplicate resources
```

影响所有 mipmap 文件夹：
- mipmap-xxxhdpi
- mipmap-xxhdpi
- mipmap-xhdpi
- mipmap-hdpi
- mipmap-mdpi

**解决方案**: 删除所有 .webp 图标文件，保留 .png 格式

**执行命令**:
```powershell
Get-ChildItem -Path "android\app\src\main\res" -Filter "*.webp" -Recurse | Remove-Item -Force
```

**提交修复**:
```bash
git commit -m "fix: Remove duplicate .webp icon files to fix resource conflict"
git push origin master
```

---

### 第三次构建 ✅ (进行中)
**Run ID**: 23143391547  
**工作流**: build-apk.yml  
**状态**: 🔄 正在运行  
**触发时间**: 2026-03-16 12:20  
**预计完成**: 20-25 分钟

**修复内容**:
- ✅ 使用 npm 而不是 yarn
- ✅ 删除重复的 .webp 图标文件
- ✅ 配置自动版本递增（patch）
- ✅ 自动创建 GitHub Release

---

## 🔍 问题总结

### 问题 1: 包管理器不匹配
**症状**: yarn.lock 未找到  
**根本原因**: 工作流配置使用 yarn 缓存，但项目使用 npm  
**解决**: 使用 build-apk.yml 工作流（配置为 npm install）

### 问题 2: 资源文件重复
**症状**: BUILD FAILED: Duplicate resources  
**根本原因**: Android 图标同时存在 .png 和 .webp 格式  
**解决**: 删除所有 .webp 文件，保留 .png

---

## 📊 构建进度

### 已完成的步骤（第二次构建验证）
- ✅ Set up job
- ✅ Checkout
- ✅ Setup Node.js
- ✅ Configure Git
- ✅ Get current version
- ✅ Increment version
- ✅ Update package.json version
- ✅ Install dependencies
- ✅ Get version for build
- ✅ Expo Prebuild
- ✅ Copy config files
- ✅ Make gradlew executable
- ❌ Build APK (失败于资源合并)

### 预期完整流程
1. ✅ Set up job
2. ✅ Checkout
3. ✅ Setup Node.js
4. ✅ Configure Git
5. ✅ Get current version
6. ✅ Increment version
7. ✅ Update package.json version
8. ✅ Install dependencies
9. ✅ Get version for build
10. ✅ Expo Prebuild
11. ✅ Copy config files
12. ✅ Make gradlew executable
13. ⏳ Build APK (当前步骤)
14. ⏳ Verify APK
15. ⏳ Prepare APK
16. ⏳ Upload APK
17. ⏳ Create Release

---

## 🎯 监控命令

### 实时查看状态
```bash
gh run view 23143391547 --repo 335459215/YunYingTV
```

### 查看详细日志
```bash
gh run view 23143391547 --repo 335459215/YunYingTV --log
```

### 持续监控直到完成
```bash
gh run watch 23143391547 --repo 335459215/YunYingTV
```

---

## 📝 经验教训

### 1. 包管理器一致性
- **教训**: 确保工作流配置的包管理器与项目一致
- **改进**: build-apk.yml 使用 npm，与项目匹配

### 2. 资源文件管理
- **教训**: Android 资源不能有重复（即使格式不同）
- **改进**: 统一使用 .png 格式图标
- **预防**: 在 .gitignore 中添加规则防止未来冲突

### 3. 快速故障恢复
- **教训**: 构建失败后立即查看详细日志
- **改进**: 使用 gh CLI 工具快速诊断
- **预防**: 本地预验证资源文件

---

## 🎉 预期成功

### 构建产物
- **APK 文件**: `YunYingTV-v1.0.2.apk`（版本自动递增）
- **GitHub Release**: v1.0.2 标签
- **Release Notes**: 自动包含提交历史

### 下载方式
1. GitHub Actions → 成功的 run → Artifacts
2. GitHub Releases → v1.0.2 → Assets

---

**问题解决时间**: 2026-03-16  
**总解决时长**: ~15 分钟  
**问题数量**: 2 个  
**状态**: 🔄 第三次构建进行中
