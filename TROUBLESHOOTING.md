# 故障排除指南

本文档提供了 Magnet Helper 扩展常见问题的解决方案和调试技巧。

## 目录

- [安装问题](#安装问题)
- [配置问题](#配置问题)
- [功能问题](#功能问题)
- [性能问题](#性能问题)
- [兼容性问题](#兼容性问题)
- [调试技巧](#调试技巧)
- [日志分析](#日志分析)
- [常见错误](#常见错误)
- [获取帮助](#获取帮助)

## 安装问题

### 扩展无法加载

**症状**：在 `chrome://extensions/` 中加载扩展时出现错误

**可能原因和解决方案：**

1. **manifest.json 语法错误**
   - 检查 JSON 格式是否正确
   - 使用在线 JSON 验证器验证
   - 确保所有必需字段都存在

2. **文件缺失**
   - 确保所有在 manifest.json 中引用的文件都存在
   - 检查文件路径是否正确

3. **权限问题**
   - 确保请求的权限是必需的
   - 检查 host_permissions 格式是否正确

### 扩展图标不显示

**症状**：扩展已安装但工具栏中没有图标

**解决方案：**
1. 检查 `manifest.json` 中的 `action` 配置
2. 确保 `icon.png` 文件存在且格式正确
3. 尝试重新加载扩展
4. 检查 Chrome 是否隐藏了扩展图标

## 配置问题

### 连接测试失败

**症状**：在选项页面点击"测试连接"失败

**排查步骤：**

1. **检查 qBittorrent 是否运行**
   ```bash
   # Linux/macOS
   ps aux | grep qbittorrent
   
   # Windows
   tasklist | findstr qbittorrent
   ```

2. **验证 URL 格式**
   - 正确格式：`http://localhost:8080`
   - 常见错误：`localhost:8080`（缺少协议）
   - 远程访问：`http://192.168.1.100:8080`

3. **检查防火墙设置**
   - Windows：控制面板 → 系统和安全 → Windows 防火墙
   - macOS：系统偏好设置 → 安全性与隐私 → 防火墙
   - Linux：`sudo ufw status`

4. **验证 qBittorrent Web UI 配置**
   - 工具 → 选项 → Web UI
   - 确保"启用 Web 用户界面"已勾选
   - 检查端口号设置

### 用户名密码错误

**症状**：连接测试显示"认证失败"

**解决方案：**
1. 检查 qBittorrent Web UI 设置
2. 确保勾选了"使用以下凭据进行身份验证"
3. 尝试在浏览器中直接访问 qBittorrent Web UI
4. 重置 qBittorrent 密码（如果忘记）

## 功能问题

### 下载按钮不显示

**症状**：网页中的磁力链接旁边没有下载按钮

**排查步骤：**

1. **检查扩展是否启用**
   - 点击扩展图标查看状态
   - 确保显示"已启用"状态

2. **刷新网页**
   - 按 `Ctrl+R`（Windows）或 `Cmd+R`（macOS）
   - 或者硬刷新：`Ctrl+Shift+R` 或 `Cmd+Shift+R`

3. **检查网页内容**
   - 确认网页包含有效的磁力链接
   - 磁力链接格式：`magnet:?xt=urn:btih:...`

4. **检查控制台错误**
   - 右键点击网页 → "检查"
   - 查看 Console 面板是否有错误信息

### 点击下载按钮无响应

**症状**：点击下载按钮后没有任何反应

**排查步骤：**

1. **检查网络连接**
   - 确保能够访问 qBittorrent 服务器
   - 尝试 ping 服务器地址

2. **检查后台脚本**
   - 访问 `chrome://extensions/`
   - 点击"检查视图：背景页面"
   - 查看 Console 面板的错误信息

3. **检查通知权限**
   - 确保扩展有发送通知的权限
   - 在 Chrome 设置中检查通知设置

### 扩展在某些网站不工作

**症状**：扩展在特定网站上无法检测磁力链接

**可能原因：**
1. **网站使用了 CSP（内容安全策略）**
2. **网站动态加载内容**
3. **网站结构特殊**

**解决方案：**
1. 检查浏览器控制台的 CSP 错误
2. 等待页面完全加载后再试
3. 手动刷新页面

## 性能问题

### 扩展导致网页变慢

**症状**：安装扩展后网页加载速度变慢

**优化建议：**

1. **减少不必要的 DOM 操作**
2. **优化磁力链接正则表达式**
3. **添加防抖机制**

### 内存使用过高

**症状**：浏览器内存使用量持续增加

**排查步骤：**
1. 打开 Chrome 任务管理器（`Shift+Esc`）
2. 查看扩展的内存使用情况
3. 检查是否存在内存泄漏

## 兼容性问题

### qBittorrent 版本兼容性

**支持的版本：**
- qBittorrent 4.1.0+
- 推荐使用最新版本

**已知问题：**
- 4.1.0 以下版本：API 不兼容
- 某些特定版本可能存在 API 变更

### 浏览器兼容性

**支持的浏览器：**
- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器

**不支持的浏览器：**
- Firefox（需要不同的扩展格式）
- Safari（需要不同的扩展格式）

## 调试技巧

### 启用开发者模式

1. 访问 `chrome://extensions/`
2. 启用右上角的"开发者模式"
3. 现在可以访问更多调试选项

### 检查扩展状态

```javascript
// 在浏览器控制台中运行
chrome.runtime.sendMessage({ type: 'status' }, (response) => {
  console.log('Extension status:', response);
});
```

### 查看扩展日志

1. **后台脚本日志**
   - 访问 `chrome://extensions/`
   - 点击"检查视图：背景页面"
   - 查看 Console 面板

2. **内容脚本日志**
   - 在目标网页右键 → "检查"
   - 查看 Console 面板

3. **选项页面日志**
   - 右键点击扩展图标 → "检查弹出内容"
   - 切换到选项页面查看日志

### 网络请求调试

1. 打开 Chrome DevTools（`F12`）
2. 切换到 Network 面板
3. 执行操作（如点击下载按钮）
4. 查看网络请求和响应

## 日志分析

### 错误日志类型

1. **连接错误**
   ```
   [ERROR] Failed to connect to qBittorrent: NetworkError
   ```

2. **认证错误**
   ```
   [ERROR] Authentication failed: Invalid credentials
   ```

3. **API 错误**
   ```
   [ERROR] API request failed: HTTP 404
   ```

4. **解析错误**
   ```
   [ERROR] Failed to parse magnet URL
   ```

### 日志级别

- `ERROR`：严重错误，需要立即处理
- `WARN`：警告信息，可能影响功能
- `INFO`：一般信息，正常操作日志
- `DEBUG`：调试信息，详细的执行过程

### 导出日志

```javascript
// 在浏览器控制台中导出错误日志
chrome.storage.local.get(['errorLogs'], (result) => {
  const logs = result.errorLogs || [];
  console.log('Error logs:', logs);
  
  // 复制到剪贴板
  navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
});
```

## 常见错误

### 错误 1：`net::ERR_CONNECTION_REFUSED`

**原因**：无法连接到 qBittorrent 服务器

**解决方案**：
1. 确保 qBittorrent 正在运行
2. 检查端口号是否正确
3. 验证防火墙设置

### 错误 2：`HTTP 401 Unauthorized`

**原因**：用户名或密码错误

**解决方案**：
1. 检查 qBittorrent Web UI 设置
2. 重新输入用户名和密码
3. 确保 qBittorrent 启用了身份验证

### 错误 3：`HTTP 404 Not Found`

**原因**：API 端点不存在

**解决方案**：
1. 检查 qBittorrent 版本
2. 确保 Web UI 路径正确
3. 尝试更新 qBittorrent 到最新版本

### 错误 4：`磁力链接格式无效`

**原因**：磁力链接格式不正确

**解决方案**：
1. 检查磁力链接是否完整
2. 确保以 `magnet:?` 开头
3. 验证包含必要的参数

## 高级故障排除

### 重置扩展设置

```javascript
// 在浏览器控制台中运行
chrome.storage.sync.clear(() => {
  console.log('All settings cleared');
  location.reload();
});
```

### 清除扩展数据

1. 访问 `chrome://extensions/`
2. 找到 Magnet Helper 扩展
3. 点击"详细信息"
4. 点击"清除存储空间"

### 重新安装扩展

1. 在 `chrome://extensions/` 中移除扩展
2. 重新下载扩展文件
3. 重新加载扩展

## 获取帮助

### 自助资源

- [README.md](README.md) - 基本使用说明
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发环境搭建
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南

### 社区支持

1. **GitHub Issues**
   - 搜索现有问题
   - 创建新问题并提供详细信息

2. **GitHub Discussions**
   - 一般讨论和问答
   - 与其他用户交流

3. **文档反馈**
   - 报告文档错误
   - 建议改进内容

### 报告问题时提供的信息

为了更快地解决问题，请在报告问题时提供：

1. **环境信息**
   - 操作系统和版本
   - 浏览器和版本
   - 扩展版本

2. **问题描述**
   - 详细的重现步骤
   - 预期行为与实际行为
   - 错误信息和截图

3. **已尝试的解决方案**
   - 列出已尝试的解决方法
   - 描述尝试的结果

4. **附加信息**
   - 相关的配置信息
   - 网络环境描述
   - 其他可能相关的信息

---

如果您遇到的问题未在此文档中涵盖，请创建 GitHub Issue 或联系开发团队。我们致力于提供最好的支持和帮助！