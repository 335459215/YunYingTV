# GitHub Actions 版本管理说明

## 自动版本递增功能

本 workflow 支持自动版本管理，每次手动触发构建时会自动递增版本号。

### 版本递增规则

当前版本：**1.0.0**

#### 递增类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `patch` | 补丁版本递增（默认） | 1.0.0 → 1.0.1 |
| `minor` | 次版本递增 | 1.0.0 → 1.1.0 |
| `major` | 主版本递增 | 1.0.0 → 2.0.0 |
| `none` | 不递增版本 | 1.0.0 → 1.0.0 |

### 使用方法

1. 进入 GitHub Actions 页面
2. 选择 "Build Android APK" workflow
3. 点击 "Run workflow"
4. 选择版本递增类型：
   - **patch**（推荐）：自动 +0.0.1
   - **minor**：功能更新时使用
   - **major**：重大更新时使用
   - **none**：仅重新构建当前版本
5. 选择是否创建 Release
6. 点击 "Run workflow"

### 工作流程

```
1. 读取当前 package.json 版本号
2. 根据选择的类型递增版本
3. 更新 package.json 并推送到仓库
4. 构建新版本 APK
5. 创建 GitHub Release（如果选择）
```

### 示例

#### 示例 1：日常构建（默认 patch）
```
当前版本：1.0.0
选择：patch
结果：1.0.1
```

#### 示例 2：功能更新
```
当前版本：1.0.1
选择：minor
结果：1.1.0
```

#### 示例 3：重大更新
```
当前版本：1.1.0
选择：major
结果：2.0.0
```

### 注意事项

1. **自动提交**：版本更新会自动 commit 并 push 到仓库
2. **跳过 CI**：版本更新的 commit 包含 `[skip ci]`，不会触发新的 workflow
3. **Release 生成**：创建 Release 时会自动生成发布说明
4. **权限要求**：需要 `contents: write` 权限来推送代码和创建 Release

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能新增
- **补丁版本号**：向下兼容的问题修正

### 手动指定版本（高级）

如需手动指定版本号，可修改 workflow 文件添加 `custom_version` 输入参数。

### 相关文件

- `.github/workflows/build-apk.yml` - 构建配置
- `package.json` - 版本号文件
