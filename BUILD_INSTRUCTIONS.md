# GitHub Actions 构建说明

## 🎉 构建成功

恭喜！你的项目已经成功编译并生成 APK！

---

## 📊 当前状态

- ✅ **编译状态**: 成功
- ⚠️ **警告**: 1 个 annotations 警告（正常，不影响构建）
- 📦 **APK 文件**: 已上传到 GitHub Artifacts
- 🏷️ **Release**: 已创建（如果选择）

---

## 🔄 版本自动递增功能

### 功能说明

现在每次触发构建时，**版本号会自动递增**！

**默认行为：** 自动 +0.0.1（patch 版本）

### 使用方式

#### 方式 1：GitHub 网页触发（推荐）

1. **访问 Actions**
   ```
   https://github.com/335459215/YunYingTV/actions
   ```

2. **选择 "Build Android APK"**

3. **点击 "Run workflow"**

4. **选择版本递增类型**：
   - **patch**（默认）：1.0.2 → 1.0.3
   - **minor**：1.0.2 → 1.1.0
   - **major**：1.0.2 → 2.0.0
   - **none**：保持 1.0.2 不变

5. **选择是否创建 Release**：
   - true：创建 GitHub Release
   - false：只构建，不创建 Release

6. **点击 "Run workflow"**

#### 方式 2：使用触发脚本

```powershell
cd G:\project\YunYingTV  # 重命名后的路径
.\trigger-build.ps1
```

脚本会提示输入 GitHub Token，然后自动触发构建。

---

## 📋 构建流程

```
1. ✅ 读取当前版本 (例如：1.0.2)
2. ⬆️ 递增版本 (patch → 1.0.3)
3. 📝 更新 package.json
4. 💾 提交并推送版本变更
5. 📦 安装依赖
6. 🔧 Expo prebuild
7. 📋 复制配置文件
8. 🔨 构建 APK
9. ✅ 验证 APK
10. 📤 上传到 Artifacts
11. 🏷️ 创建 GitHub Release
```

---

## 🎯 版本递增示例

### 示例 1：日常构建（默认 patch）

```
当前版本：1.0.2
选择：patch
结果：1.0.3
```

### 示例 2：功能更新（minor）

```
当前版本：1.0.2
选择：minor
结果：1.1.0
```

### 示例 3：重大更新（major）

```
当前版本：1.0.2
选择：major
结果：2.0.0
```

### 示例 4：重新构建（none）

```
当前版本：1.0.3
选择：none
结果：1.0.3（不变）
```

---

## 📦 构建产物

### 1. GitHub Artifacts

- **位置**: Actions → 构建任务 → Artifacts
- **文件名**: `YunYingTV-v{版本号}.apk`
- **保留时间**: 30 天
- **下载**: 点击文件名即可下载

### 2. GitHub Release

- **位置**: https://github.com/335459215/YunYingTV/releases
- **标签**: `v{版本号}`
- **内容**: 
  - APK 文件
  - 自动生成的发布说明
  - 版本递增类型说明

---

## ⚠️ 关于 Annotations 警告

你看到的警告信息：

```
Node.js 20 actions are deprecated...
```

**这是正常的 GitHub 通知，不影响构建！**

**原因：**
- GitHub 推荐使用 Node.js 20 运行 Actions
- 当前使用的某些 Action 还在迁移中
- 这只是提醒，不会影响构建结果

**解决方案：**
- 可以忽略此警告
- 等待相关 Action 更新到 Node.js 20
- 不影响 APK 构建和发布

---

## 🔧 常见问题

### Q1: 版本号在哪里查看？

**A:** 在三个地方可以查看：

1. **package.json** - `version` 字段
2. **GitHub Release** - 标签名称
3. **APK 文件名** - `YunYingTV-v{版本号}.apk`

### Q2: 如何跳过版本递增？

**A:** 选择 `none` 选项，版本号保持不变。

### Q3: 版本递增失败怎么办？

**A:** 检查以下几点：

1. 确认 `package.json` 版本号格式正确（x.y.z）
2. 确认 Git 配置正常
3. 查看 Actions 日志中的详细错误信息

### Q4: 可以手动指定版本号吗？

**A:** 当前版本自动递增，不支持手动指定。如需手动指定，可以：

1. 手动修改 `package.json` 的 `version` 字段
2. 提交并推送
3. 触发构建时选择 `none`

---

## 📝 最佳实践

### 日常开发

```
版本递增：patch（默认）
创建 Release: true
```

### 功能更新

```
版本递增：minor
创建 Release: true
```

### 重大更新

```
版本递增：major
创建 Release: true
```

### 测试构建

```
版本递增：none
创建 Release: false
```

---

## 🔗 相关链接

- **Actions**: https://github.com/335459215/YunYingTV/actions
- **Releases**: https://github.com/335459215/YunYingTV/releases
- **项目仓库**: https://github.com/335459215/YunYingTV

---

## 🎉 总结

✅ **编译成功** - APK 已生成  
✅ **版本自动递增** - 默认 +0.0.1  
✅ **自动发布** - 创建 Release 并上传 APK  
⚠️ **Annotations 警告** - 正常现象，可忽略  

**现在可以正常使用自动版本递增功能了！** 🚀
