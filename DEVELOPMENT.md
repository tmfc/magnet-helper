# 开发环境搭建指南

本文档详细说明如何搭建 Magnet Helper 扩展的开发环境。

## 系统要求

- **操作系统**：Windows 10+、macOS 10.14+、Ubuntu 18.04+
- **浏览器**：Chrome 88+ 或基于 Chromium 的浏览器
- **Node.js**：16.0+ （推荐使用 LTS 版本）
- **代码编辑器**：VS Code（推荐）或其他支持 JavaScript 的编辑器

## 环境准备

### 1. 安装 Node.js

#### Windows
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 Windows 安装包（.msi）
3. 运行安装包，按提示完成安装
4. 验证安装：
   ```cmd
   node --version
   npm --version
   ```

#### macOS
```bash
# 使用 Homebrew
brew install node

# 或下载官方安装包
# https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装 Git

#### Windows
1. 下载 [Git for Windows](https://git-scm.com/download/win)
2. 运行安装程序，使用默认设置

#### macOS
```bash
# 使用 Homebrew
brew install git

# 或下载 Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install git
```

## 项目设置

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/your-username/magnet-helper.git

# 进入项目目录
cd magnet-helper
```

### 2. 安装依赖

```bash
# 安装开发依赖
npm install
```

### 3. 验证环境

```bash
# 运行测试
npm test

# 检查代码风格
npm run lint
```

## 开发工具配置

### VS Code 配置

推荐安装以下扩展：

1. **ESLint** - 代码质量检查
2. **Prettier** - 代码格式化
3. **Chrome Extension** - Chrome 扩展开发支持
4. **GitLens** - Git 增强功能

创建工作区配置文件 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### Chrome 开发者工具

1. **加载扩展**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目目录

2. **调试技巧**
   - 使用 `console.log()` 进行调试
   - 检查扩展的后台页面：`chrome://extensions/` → "检查视图"
   - 使用 Chrome DevTools 调试内容脚本

## 开发工作流

### 1. 代码开发

```bash
# 启动代码检查（自动监控文件变化）
npm run lint:watch

# 运行测试（监控模式）
npm run test:watch
```

### 2. 调试扩展

**调试后台脚本：**
1. 访问 `chrome://extensions/`
2. 找到 Magnet Helper 扩展
3. 点击"检查视图：背景页面"

**调试内容脚本：**
1. 在目标网页右键
2. 选择"检查"
3. 在 Console 中查看日志

**调试弹出窗口/选项页面：**
1. 右键点击扩展图标
2. 选择"检查弹出内容"

### 3. 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### 4. 代码质量检查

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run lint:fix
```

## 项目结构详解

```
magnet-helper/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台服务脚本
├── content.js             # 内容脚本
├── popup.html             # 弹出窗口 HTML
├── popup.js               # 弹出窗口逻辑
├── options.html           # 选项页面 HTML
├── options.js             # 选项页面逻辑
├── icon.png               # 扩展图标
├── tests/                 # 测试文件
│   ├── background.test.js
│   ├── content.test.js
│   └── options.test.js
├── .eslintrc.js          # ESLint 配置
├── package.json           # 项目配置
├── DEVELOPMENT.md         # 开发指南（本文件）
├── CONTRIBUTING.md        # 贡献指南
└── README.md              # 项目说明
```

## 常见开发任务

### 添加新功能

1. **修改 manifest.json**（如需要新权限）
2. **编写核心逻辑**（background.js 或 content.js）
3. **更新用户界面**（popup.html/js 或 options.html/js）
4. **编写测试**（tests/ 目录）
5. **更新文档**（README.md）

### 修复 Bug

1. **复现问题**
2. **定位代码位置**
3. **编写测试用例**
4. **修复代码**
5. **验证修复**
6. **更新文档**

### 性能优化

1. **使用 Chrome DevTools Performance 面板**
2. **检查内存使用**
3. **优化 JavaScript 执行**
4. **减少不必要的 API 调用**

## 调试技巧

### 1. 使用 Chrome DevTools

- **Network 面板**：监控网络请求
- **Console 面板**：查看日志和错误
- **Elements 面板**：检查 DOM 结构
- **Sources 面板**：调试 JavaScript

### 2. 日志记录

项目使用结构化日志：

```javascript
// 在 background.js 中
log(LOG_LEVELS.INFO, 'Processing download', {
  magnetUrl: sanitizeForLogging(url),
  timestamp: Date.now()
});
```

### 3. 错误处理

```javascript
try {
  // 可能出错的代码
} catch (error) {
  log(LOG_LEVELS.ERROR, 'Operation failed', {
    error: error.message,
    stack: error.stack
  });
}
```

## 发布流程

### 1. 版本更新

1. 更新 `manifest.json` 中的版本号
2. 更新 `package.json` 中的版本号
3. 更新 `README.md` 中的版本历史

### 2. 代码审查

```bash
# 运行完整测试套件
npm test

# 检查代码质量
npm run lint

# 生成覆盖率报告
npm run test:coverage
```

### 3. 打包扩展

```bash
# 创建发布目录
mkdir dist

# 复制必要文件（排除开发文件）
cp manifest.json background.js content.js popup.* options.* icon.png dist/

# 创建 ZIP 包
cd dist
zip -r magnet-helper.zip .
```

## 性能监控

### 1. 扩展性能指标

- 内存使用量
- CPU 使用率
- 网络请求数量
- 响应时间

### 2. 监控工具

- Chrome Task Manager
- DevTools Performance 面板
- DevTools Memory 面板

## 故障排除

### 常见问题

**Q: 扩展加载失败**
A: 检查 manifest.json 语法，确保所有必需文件存在

**Q: 内容脚本不工作**
A: 检查 host_permissions，确保匹配目标网站

**Q: 测试失败**
A: 确保安装了所有依赖，检查 Jest 配置

**Q: ESLint 错误**
A: 运行 `npm run lint:fix` 自动修复常见问题

## 贡献指南

详细的贡献指南请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 获取帮助

如果遇到开发问题：

1. 查看本文档的故障排除部分
2. 搜索项目的 Issues
3. 创建新的 Issue 并提供详细信息
4. 加入开发者社区（如果有）