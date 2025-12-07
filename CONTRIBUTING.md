# 贡献指南

感谢您对 Magnet Helper 项目的关注！我们欢迎各种形式的贡献，包括但不限于代码、文档、测试、问题报告和功能建议。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)
- [问题报告](#问题报告)
- [功能请求](#功能请求)
- [社区](#社区)

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性暗示的语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他在专业环境中可能被认为不当的行为

## 如何贡献

### 报告 Bug

如果您发现了 Bug，请：

1. **搜索现有 Issues**：确保 Bug 尚未被报告
2. **创建新 Issue**：使用 Bug 报告模板
3. **提供详细信息**：
   - 操作系统和浏览器版本
   - 扩展版本
   - 重现步骤
   - 预期行为与实际行为
   - 相关截图或错误信息

### 提出功能请求

1. **搜索现有 Issues**：检查是否已有类似请求
2. **创建新 Issue**：使用功能请求模板
3. **详细描述**：
   - 功能的用途和价值
   - 具体的实现建议
   - 可能的替代方案

### 提交代码

1. **Fork 仓库**
2. **创建功能分支**：`git checkout -b feature/amazing-feature`
3. **编写代码**：遵循项目代码规范
4. **编写测试**：确保代码覆盖率
5. **提交更改**：使用清晰的提交信息
6. **推送分支**：`git push origin feature/amazing-feature`
7. **创建 Pull Request**

## 开发流程

### 1. 环境准备

请参考 [开发环境搭建指南](DEVELOPMENT.md) 设置开发环境。

### 2. 选择任务

- **新手友好**：标记为 `good first issue` 的问题
- **帮助需求**：标记为 `help wanted` 的问题
- **错误修复**：标记为 `bug` 的问题
- **新功能**：标记为 `enhancement` 的问题

### 3. 分支策略

- `main`：主分支，稳定版本
- `develop`：开发分支，集成新功能
- `feature/*`：功能分支
- `bugfix/*`：修复分支
- `release/*`：发布分支

### 4. 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型（type）：**
- `feat`：新功能
- `fix`：错误修复
- `docs`：文档更新
- `style`：代码格式化
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建过程或辅助工具的变动

**示例：**
```
feat(options): add connection timeout setting

Add configurable timeout for qBittorrent connection
to improve user experience on slow networks.

Closes #123
```

### 5. Pull Request 流程

1. **创建 Pull Request**
   - 使用清晰的标题和描述
   - 引用相关的 Issues
   - 添加适当的标签

2. **代码审查**
   - 至少需要一个维护者的审查
   - 响应审查意见并及时修改
   - 保持讨论的专业性和建设性

3. **合并要求**
   - 所有测试通过
   - 代码覆盖率不降低
   - 无 ESLint 错误
   - 文档更新完整

## 代码规范

### JavaScript 规范

我们使用 ESLint 来强制执行代码规范。主要规则：

```javascript
// 使用 const/let，避免 var
const apiUrl = 'https://example.com/api';
let retryCount = 0;

// 使用单引号
const message = 'Hello World';

// 函数命名使用驼峰命名法
function handleDownloadRequest() {
  // 实现
}

// 使用箭头函数（适用于简单函数）
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 添加适当的注释
/**
 * Validates if a string is a valid HTTP/HTTPS URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function validateUrl(url) {
  // 实现
}
```

### HTML/CSS 规范

```html
<!-- 使用语义化 HTML5 标签 -->
<header class="header">
  <nav class="navigation">
    <!-- 导航内容 -->
  </nav>
</header>

<!-- 使用有意义的类名 -->
<div class="download-button-container">
  <button class="download-button primary">下载</button>
</div>
```

```css
/* 使用 BEM 命名规范 */
.download-button {
  /* 基础样式 */
}

.download-button--primary {
  /* 修饰符样式 */
}

.download-button__icon {
  /* 子元素样式 */
}
```

### 文件命名

- 使用小写字母和连字符：`options-page.js`
- 测试文件添加 `.test` 后缀：`options.test.js`
- 配置文件使用点分隔：`.eslintrc.js`

## 测试指南

### 测试结构

```
tests/
├── background.test.js  # 后台脚本测试
├── content.test.js     # 内容脚本测试
├── options.test.js     # 选项页面测试
└── utils.test.js       # 工具函数测试
```

### 编写测试

```javascript
describe('Function Name', () => {
  beforeEach(() => {
    // 测试前准备
    jest.clearAllMocks();
  });

  test('should handle valid input', () => {
    // 测试正常情况
    const result = functionUnderTest(validInput);
    expect(result).toBe(expectedOutput);
  });

  test('should handle invalid input', () => {
    // 测试异常情况
    expect(() => {
      functionUnderTest(invalidInput);
    }).toThrow();
  });
});
```

### 测试命令

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 测试覆盖率要求

- 新功能：至少 80% 代码覆盖率
- 错误修复：100% 错误路径覆盖率
- 重构：保持或提高现有覆盖率

## 文档贡献

### 文档类型

- **README.md**：项目概述和基本使用
- **DEVELOPMENT.md**：开发环境搭建
- **CONTRIBUTING.md**：贡献指南（本文件）
- **API.md**：API 文档（如需要）
- **CHANGELOG.md**：版本更新日志

### 文档规范

- 使用清晰的标题结构
- 提供代码示例
- 包含相关的链接
- 保持信息最新

### 提交文档更改

```bash
# 文档提交示例
git commit -m "docs: update installation instructions for Windows"

# 多个文档更改
git commit -m "docs: improve API documentation and add examples"
```

## 问题报告

### Bug 报告模板

```markdown
**Bug 描述**
简要描述遇到的问题

**重现步骤**
1. 打开页面 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**预期行为**
描述您期望发生的情况

**实际行为**
描述实际发生的情况

**截图**
如果适用，添加截图帮助解释问题

**环境信息**
- 操作系统：[例如 iOS]
- 浏览器：[例如 chrome、safari]
- 扩展版本：[例如 1.0.0]

**附加信息**
添加任何其他关于问题的信息
```

### 功能请求模板

```markdown
**功能描述**
简要描述您希望添加的功能

**问题解决**
这个功能解决了什么问题？

**建议的解决方案**
描述您希望如何实现这个功能

**替代方案**
描述您考虑过的其他解决方案

**附加信息**
添加任何其他关于功能请求的信息
```

## 社区

### 沟通渠道

- **GitHub Issues**：错误报告和功能请求
- **GitHub Discussions**：一般讨论和问答
- **Pull Requests**：代码贡献和审查

### 维护者

项目的维护者负责：

- 审查和合并 Pull Request
- 回答问题和建议
- 维护项目文档
- 发布新版本

### 成为维护者

活跃的贡献者可能被邀请成为维护者。标准包括：

- 持续的高质量贡献
- 对项目的深入理解
- 积极的社区参与
- 良好的沟通技巧

## 发布流程

### 版本号规范

使用 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布检查清单

- [ ] 所有测试通过
- [ ] 文档更新完整
- [ ] CHANGELOG.md 更新
- [ ] 版本号更新正确
- [ ] 测试覆盖率达标
- [ ] 安全审查完成

### 发布步骤

1. **更新版本号**
2. **更新 CHANGELOG**
3. **创建发布标签**
4. **生成发布包**
5. **发布到 Chrome Web Store**

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的 [ISC 许可证](LICENSE) 下授权。

## 致谢

感谢所有为 Magnet Helper 项目做出贡献的开发者！

### 贡献者列表

- [@your-username](https://github.com/your-username) - 项目创建者和主要维护者
- 添加其他贡献者...

### 特别感谢

- qBittorrent 开发团队
- Chrome 扩展开发社区
- 所有提供反馈和建议的用户

---

如果您有任何问题或需要帮助，请随时联系我们。我们期待您的贡献！