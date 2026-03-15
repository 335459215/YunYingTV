# LunaTV 后端适配指南

## 📋 概述

YunYingTV 现已支持切换到 **LunaTV** 后端，这是一个基于 Next.js 14 的现代化影视聚合系统。

### LunaTV 项目信息

- **GitHub**: https://github.com/MoonTechLab/LunaTV
- **技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- **功能**: 多资源搜索、在线播放、收藏同步、播放记录

---

## 🚀 快速开始

### 方式一：通过设置界面切换（推荐）

1. **打开 YunYingTV 应用**
2. **进入设置页面**
3. **找到 "API 后端" 部分**
4. **点击 "切换到 LunaTV"**
5. **输入 LunaTV 后端地址**（如：`http://localhost:3000`）
6. **确认切换**
7. **重启应用**

### 方式二：代码方式

```typescript
import { ApiBackendManager } from "@/services/apiConfig";

// 切换到 LunaTV 后端
await ApiBackendManager.switchBackend("lunatv", "http://your-lunatv-server:3000");

// 获取当前后端
const currentBackend = await ApiBackendManager.getCurrentBackend();
console.log("Current backend:", currentBackend.name);
```

---

## 📦 部署 LunaTV 后端

### Docker 部署（推荐）

```yaml
services:
  lunatv:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: lunatv
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
    volumes:
      - ./data:/app/data
```

### Zeabur 一键部署

1. 访问 [Zeabur](https://zeabur.com)
2. 点击 "Add Service"
3. 选择 "Docker Images"
4. 输入：`ghcr.io/moontechlab/lunatv:latest`
5. 配置端口：`3000`
6. 添加环境变量：
   - `USERNAME=admin`
   - `PASSWORD=admin_password`

---

## 🔧 API 适配层

### 核心文件

- **`services/lunaTVAdapter.ts`** - LunaTV API 适配器
- **`services/apiConfig.ts`** - API 配置管理器
- **`components/settings/BackendSwitcherSection.tsx`** - 后端切换 UI

### 支持的 API 接口

| 功能 | OrionTV | LunaTV | 状态 |
|------|---------|--------|------|
| 搜索视频 | ✅ | ✅ | 已适配 |
| 视频详情 | ✅ | ✅ | 已适配 |
| 播放地址 | ✅ | ✅ | 已适配 |
| 收藏管理 | ✅ | ✅ | 已适配 |
| 播放记录 | ✅ | ✅ | 已适配 |
| 搜索历史 | ✅ | ✅ | 已适配 |
| 图片代理 | ✅ | ✅ | 已适配 |
| 豆瓣榜单 | ✅ | ✅ | 已适配 |

---

## 📊 数据结构映射

### 搜索结果映射

```typescript
// LunaTV 格式
{
  vod_id: number,
  vod_name: string,
  vod_pic: string,
  vod_year: string,
  vod_play_from: string,
  vod_play_url: string
}

// ↓ 映射为 ↓

// YunYingTV 格式
{
  id: number,
  title: string,
  poster: string,
  year: string,
  source: string,
  source_name: string,
  episodes: string[]
}
```

### 播放地址解析

LunaTV 使用特殊格式：`url1#name1$$url2#name2`

适配器会自动解析为数组：`[url1, url2]`

---

## ⚙️ 配置选项

### 环境变量

在 LunaTV 后端可以配置：

```bash
# 管理员账号
USERNAME=admin
PASSWORD=admin_password

# 存储类型
NEXT_PUBLIC_STORAGE_TYPE=localstorage  # 或 redis

# Redis 配置（当使用 redis 时）
REDIS_URL=redis://localhost:6379
```

### 客户端配置

```typescript
// apiConfig.ts 中配置
const BACKENDS = {
  oriontv: {
    type: "oriontv",
    baseURL: "", // 用户设置
    name: "OrionTV",
  },
  lunatv: {
    type: "lunatv",
    baseURL: "", // 用户设置
    name: "LunaTV",
  },
};
```

---

## 🔍 故障排查

### 无法连接到后端

**问题**: 切换后端时提示 "无法连接到服务器"

**解决方案**:
1. 检查后端地址是否正确
2. 确认后端服务已启动
3. 检查网络连接
4. 尝试使用 `http://localhost:3000`（本地测试）

### API 返回格式不匹配

**问题**: 搜索或播放时出现解析错误

**解决方案**:
1. 检查 LunaTV 后端版本
2. 查看 `lunaTVAdapter.ts` 中的映射逻辑
3. 使用浏览器访问后端 API 测试

### 切换后端后应用异常

**问题**: 切换后端后应用崩溃或功能异常

**解决方案**:
1. 重启应用
2. 清除应用数据
3. 检查后端配置
4. 切换回 OrionTV 后端测试

---

## 📝 使用示例

### 搜索视频

```typescript
import { getCurrentApi } from "@/services/apiConfig";

const api = getCurrentApi();
const { results } = await api.searchVideos("流浪地球");

console.log("搜索结果:", results);
```

### 获取视频详情

```typescript
const api = getCurrentApi();
const detail = await api.getVideoDetail("lunatv", "12345");

console.log("视频详情:", detail);
```

### 保存播放记录

```typescript
const api = getCurrentApi();
await api.savePlayRecord("lunatv+12345", {
  title: "流浪地球",
  source_name: "lunatv",
  cover: "https://...",
  index: 0,
  total_episodes: 1,
  play_time: 100,
  total_time: 7200,
  year: "2023",
});
```

---

## 🎯 最佳实践

1. **本地开发**: 使用 `http://localhost:3000` 运行 LunaTV 后端
2. **生产环境**: 使用 Docker 或 Zeabur 部署
3. **测试**: 先在测试环境验证后端功能
4. **备份**: 切换后端前备份数据
5. **回滚**: 保留 OrionTV 后端作为备用

---

## 🔗 相关链接

- **LunaTV GitHub**: https://github.com/MoonTechLab/LunaTV
- **LunaTV 文档**: https://github.com/MoonTechLab/LunaTV#readme
- **YunYingTV GitHub**: https://github.com/335459215/YunYingTV

---

## 📞 技术支持

如有问题，请提交 Issue 到对应的 GitHub 仓库：
- YunYingTV 问题：https://github.com/335459215/YunYingTV/issues
- LunaTV 问题：https://github.com/MoonTechLab/LunaTV/issues
