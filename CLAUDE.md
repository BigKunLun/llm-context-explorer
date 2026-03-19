# React Context Explorer

## 项目定位

可视化 LLM (大语言模型) 的 ReAct Context 学习过程。通过交互式 Timeline + 播放演示，展示 Agent 每步操作如何影响上下文窗口。

## 技术栈

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4（通过 PostCSS 集成）
- 原生 CSS 动画（无第三方动画库）
- 包管理：npm

## 常用命令

```bash
npm run dev      # 启动开发服务器 (localhost:5173)
npm run build    # tsc + vite build
npm run preview  # 预览构建产物
npx tsc --noEmit # 仅类型检查
```

## 文件结构

```
src/
  App.tsx                  # 主组件，播放状态管理
  main.tsx                 # 入口
  types/index.ts           # 全局类型（Step, Scenario, PlaybackState, AgentState 等）
  constants/stepStyles.ts  # 步骤类型样式映射（共享常量）
  data/scenarios.ts        # 预设场景数据
  styles/index.css         # 全局样式 + CSS 动画关键帧
  components/
    ScenarioSelect.tsx     # 场景选择下拉框
    Timeline.tsx           # 左侧步骤时间线
    StepCard.tsx           # 时间线中的步骤卡片
    StepDetail.tsx         # 右侧步骤详情面板
    ContextViewer.tsx      # 上下文消息列表
    AgentStatusBar.tsx     # 顶部 Agent 状态指示栏
    PlaybackBar.tsx        # 底部播放控制条
```

## 约定

- **共享常量**放 `src/constants/`，组件间复用的样式映射、配置等提取到此
- **类型定义**集中在 `src/types/index.ts`
- **场景数据**在 `src/data/scenarios.ts`，每个场景由多个 Step 组成，每个 Step 包含 contextSnapshot（完整快照）和 contextDiff（增量）
- **CSS 动画**统一在 `src/styles/index.css` 中定义关键帧，组件通过 CSS 类名引用
- 组件的 `animate` prop 控制是否启用动画，`animation-none` CSS 类用于强制禁用
- 颜色方案：深色主题（gray-800/900），步骤类型用语义色（purple=思考, blue=行动, green=观察, amber=回答）

## 设计文档

- `docs/plans/` - 初始设计和实现计划
- `docs/superpowers/` - 动画增强的设计规格和实现计划
