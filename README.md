# Magnet Helper

一个功能强大的浏览器扩展程序，用于自动将网页中的磁力链接发送到多种下载管理器（qBittorrent、Transmission、uTorrent）。

## 功能特性

- 🚀 **智能检测**：自动识别网页中的磁力链接（包括 `<a>` 标签和纯文本）
- 🎯 **一键下载**：在每个磁力链接旁边添加下载按钮，点击即可发送到下载客户端
- 🌐 **多客户端支持**：支持 qBittorrent、Transmission、uTorrent 等主流下载管理器
- 📱 **现代化界面**：美观的用户界面，支持深色/浅色主题
- 🔒 **安全可靠**：支持 HTTPS 连接验证，保护用户隐私
- 📊 **下载历史**：记录最近下载的磁力链接
- ⚙️ **灵活配置**：支持连接测试、密码显示/隐藏等高级功能
- ♿ **无障碍访问**：完整的键盘导航和屏幕阅读器支持
- 🔄 **动态内容**：支持动态加载网页的磁力链接检测
- 🛡️ **扩展控制**：可随时启用/禁用扩展功能

## 安装方法

### 从源码安装

1. 克隆或下载此仓库
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录

### 从 Chrome Web Store 安装

> 即将上架 Chrome Web Store，敬请期待

## 使用指南

### 初次设置

1. **打开扩展选项**
   - 点击扩展图标，然后点击"配置设置"
   - 或者在扩展管理页面点击"选项"

2. **配置下载客户端**
   - **客户端类型**：选择您使用的下载客户端
     - qBittorrent：功能丰富的开源 BitTorrent 客户端
     - Transmission：轻量级的跨平台下载工具
     - uTorrent：流行的 Windows 下载客户端
   - **服务器地址**：输入下载客户端 Web UI 的完整 URL
     - qBittorrent 示例：`http://localhost:8080`
     - Transmission 示例：`http://localhost:9091/transmission/rpc`
     - uTorrent 示例：`http://localhost:8080/gui`
   - **用户名**：输入登录用户名
   - **密码**：输入登录密码

3. **测试连接**
   - 点击"测试连接"按钮验证配置是否正确
   - 成功后会显示客户端版本信息

4. **保存设置**
   - 点击"保存设置"完成配置

### 日常使用

1. **下载磁力链接**
   - 访问包含磁力链接的网页
   - 在每个磁力链接旁边会自动出现绿色的"↓ qBittorrent"按钮（按钮文本会根据选择的客户端变化）
   - 点击按钮即可将磁力链接发送到您配置的下载客户端

2. **查看下载状态**
   - 点击扩展图标查看连接状态和最近下载历史
   - 可以清除下载历史记录

3. **启用/禁用扩展**
   - 在弹出窗口中点击"已启用"/"已禁用"按钮
   - 禁用后将不会在网页中显示下载按钮

## 高级功能

### 键盘快捷键

在弹出窗口中：
- `Alt + O`：打开选项页面
- `Alt + T`：切换扩展启用状态
- `Alt + C`：清除下载历史
- `Esc`：关闭弹出窗口

在选项页面中：
- `Ctrl/Cmd + Enter`：保存设置
- `Alt + T`：测试连接
- `Esc`：关闭选项页面

### 安全特性

- **HTTPS 支持**：自动检测并警告 HTTP 连接
- **密码保护**：密码字段默认显示为占位符
- **隐私保护**：下载历史中不存储完整的磁力链接
- **权限透明**：详细说明每个权限的用途

### 无障碍功能

- 完整的 ARIA 标签支持
- 键盘导航优化
- 屏幕阅读器兼容
- 高对比度焦点指示器

## 配置选项

### qBittorrent 设置

确保 qBittorrent Web UI 已正确配置：

1. **启用 Web UI**
   - 工具 → 选项 → Web UI
   - 勾选"启用 Web 用户界面"
   - 设置端口（默认：8080）

2. **设置认证**
   - 勾选"使用以下凭据进行身份验证"
   - 设置用户名和密码

3. **安全设置**
   - 建议启用 HTTPS（需要配置 SSL 证书）
   - 可以设置 CSRF 保护

### Transmission 设置

确保 Transmission Web UI 已正确配置：

1. **启用 Web UI**
   - Transmission 通常默认启用 Web UI
   - 默认端口：9091
   - 访问地址：`http://localhost:9091/transmission/web/`

2. **设置认证**
   - 编辑设置文件或使用 Web 界面设置用户名和密码
   - 某些发行版可能需要额外配置

3. **RPC 访问**
   - 确保允许 RPC 访问
   - 检查白名单设置

### uTorrent 设置

确保 uTorrent Web UI 已正确配置：

1. **启用 Web UI**
   - 选项 → 偏好设置 → 高级 → Web UI
   - 勾选"启用 Web UI"
   - 设置端口（默认：8080）

2. **设置认证**
   - 设置用户名和密码
   - 建议启用"仅允许来自以下 IP 地址的访问"

3. **安全设置**
   - 可以设置 HTTPS（需要配置证书）
   - 注意防火墙设置

### 防火墙配置

如果使用远程 qBittorrent：
- 确保防火墙允许 qBittorrent 端口
- 检查路由器端口转发设置

## 故障排除

### 常见问题

**Q: 点击下载按钮没有反应？**
A: 检查扩展是否已启用，确认 qBittorrent 配置正确，尝试重新测试连接。

**Q: 连接测试失败？**
A: 验证 URL 格式、用户名密码、网络连接，检查 qBittorrent 是否正在运行。

**Q: 找不到下载按钮？**
A: 刷新网页，确认扩展已启用，检查页面是否包含有效的磁力链接。

**Q: 密码字段显示为省略号？**
A: 这是安全特性，点击字段即可编辑密码。

### 调试信息

遇到问题时，可以检查：
1. 浏览器开发者工具的控制台
2. 扩展的错误日志
3. qBittorrent 的日志文件

## 开发信息

### 技术栈

- **前端**：HTML5、CSS3、JavaScript (ES6+)
- **扩展**：Chrome Extension Manifest V3
- **API**：qBittorrent Web API
- **测试**：Jest、jsdom
- **代码质量**：ESLint

### 项目结构

```
magnet-helper/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台服务脚本
├── content.js             # 内容脚本
├── popup.html/js          # 弹出窗口
├── options.html/js        # 选项页面
├── tests/                 # 单元测试
├── .eslintrc.js          # ESLint 配置
└── README.md             # 项目文档
```

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 版本历史

- **v1.0.0** - 初始版本
  - 基础磁力链接检测和下载功能
  - qBittorrent 集成
  - 用户界面和配置选项

## 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您遇到问题或有建议，请：

1. 查看[故障排除](#故障排除)部分
2. 搜索现有的 [Issues](../../issues)
3. 创建新的 Issue 并提供详细信息

## 致谢

- [qBittorrent](https://www.qbittorrent.org/) - 优秀的 BitTorrent 客户端
- Chrome 扩展开发社区
- 所有贡献者和用户
