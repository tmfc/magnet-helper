# Magnet Helper - 项目上下文文档

## 项目概述

Magnet Helper 是一个浏览器扩展程序，用于自动将磁力链接发送到 qBittorrent 下载管理器。该扩展程序支持所有网站，能够识别页面中的磁力链接（包括 `<a>` 标签中的链接和纯文本中的磁力链接），并为每个链接添加一个"使用 qBittorrent 下载"按钮。

### 主要功能

- 自动检测网页中的磁力链接
- 在磁力链接旁边添加下载按钮
- 将磁力链接发送到用户配置的 qBittorrent 服务器
- 支持用户配置 qBittorrent 服务器的 URL、用户名和密码

## 技术栈

- **平台**: Chrome 扩展程序 (Manifest V3)
- **语言**: JavaScript (ES6+)
- **API**: 
  - Chrome Storage API (存储用户配置)
  - Chrome Runtime API (扩展内部通信)
  - Chrome Scripting API (内容脚本注入)
  - Fetch API (与 qBittorrent API 通信)

## 项目结构

```
magnet-helper/
├── manifest.json          # 扩展程序配置文件
├── background.js          # 后台服务脚本
├── content.js             # 内容脚本（网页注入）
├── popup.html             # 弹出窗口 HTML
├── popup.js               # 弹出窗口逻辑
├── options.html           # 选项页面 HTML
├── options.js             # 选项页面逻辑
├── icon.png               # 扩展程序图标
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 核心文件说明

### manifest.json
定义了扩展程序的基本配置，包括权限、背景脚本、内容脚本和页面配置。

### background.js
后台服务脚本，负责：
- 接收来自内容脚本的消息
- 与 qBittorrent API 进行身份验证
- 将磁力链接发送到 qBittorrent 服务器

### content.js
内容脚本，负责：
- 检测页面中的磁力链接（`<a>` 标签和纯文本）
- 为磁力链接添加下载按钮
- 处理按钮点击事件，向后台脚本发送消息

### options.html & options.js
选项页面，允许用户配置：
- qBittorrent 服务器 URL
- 用户名
- 密码

配置使用 Chrome Storage API 进行持久化存储。

### popup.html & popup.js
扩展程序的弹出窗口，提供访问选项页面的快捷方式。

## 构建和运行

### 安装扩展程序
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录

### 配置 qBittorrent
1. 点击扩展程序图标打开弹出窗口
2. 点击"Go to Options"按钮
3. 填写 qBittorrent 服务器的 URL、用户名和密码
4. 点击"Save"保存设置

### 使用方法
1. 访问包含磁力链接的网页
2. 磁力链接旁边会自动出现"Download with qBittorrent"按钮
3. 点击按钮将磁力链接发送到 qBittorrent

## 开发约定

### 代码风格
- 使用现代 JavaScript (ES6+)
- 使用清晰的函数和变量命名
- 适当的注释说明关键逻辑

### 权限使用
- `storage`: 保存用户配置
- `activeTab`: 访问当前活动标签页
- `scripting`: 注入内容脚本
- `<all_urls>`: 在所有网站上运行

### 安全注意事项
- 所有配置数据存储在本地，不上传到服务器
- 密码使用 Chrome 的安全存储机制
- 仅与用户指定的 qBittorrent 服务器通信

## 测试

目前项目没有配置自动化测试。测试方法：
1. 手动加载扩展程序
2. 在不同网站上测试磁力链接检测
3. 验证与 qBittorrent 的通信功能

## 扩展可能

- 支持其他下载客户端 (如 Transmission、uTorrent)
- 添加下载进度显示
- 支持批量下载
- 添加下载历史记录