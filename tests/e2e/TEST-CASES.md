# React Context Explorer - E2E 测试用例设计

> 日期：2026-03-20
> 测试框架建议：Playwright（配合 `@playwright/test`）
> 覆盖范围：全部用户可见功能 + 状态联动 + 边界情况 + 完整用户旅程

---

## 目录

1. [初始加载](#1-初始加载)
2. [场景选择](#2-场景选择)
3. [Timeline 步骤点击](#3-timeline-步骤点击)
4. [StepDetail 导航](#4-stepdetail-导航)
5. [PlaybackBar 控制](#5-playbackbar-控制)
6. [播放速度控制](#6-播放速度控制)
7. [自动播放流程](#7-自动播放流程)
8. [Agent 状态栏](#8-agent-状态栏)
9. [上下文查看器](#9-上下文查看器)
10. [StepDetail 面板展示](#10-stepdetail-面板展示)
11. [步骤类型样式](#11-步骤类型样式)
12. [动画系统](#12-动画系统)
13. [跨组件状态联动](#13-跨组件状态联动)
14. [边界情况与异常](#14-边界情况与异常)
15. [完整用户旅程](#15-完整用户旅程)

---

## 1. 初始加载

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-001 | 默认加载第一个场景 | 无 | 打开应用首页 | 场景选择器显示 "简单查天气"，右侧面板显示该场景第一步内容 |
| TC-002 | 默认显示第一个步骤 | 无 | 打开应用首页 | Timeline 中第一个 StepCard 高亮（蓝色边框+阴影），StepDetail 显示第一步详情 |
| TC-003 | 播放状态默认暂停 | 无 | 打开应用首页 | PlaybackBar 显示播放按钮（非暂停图标），进度条在起始位置 |
| TC-004 | 播放速度默认1x | 无 | 打开应用首页 | 速度选择器显示 "1x" |
| TC-005 | AgentStatusBar 默认不可见 | 无 | 打开应用首页 | 页面顶部不显示 Agent 状态栏 |
| TC-006 | Header 显示演示按钮 | 无 | 打开应用首页 | Header 区域显示 "开始演示" 按钮文本 |
| TC-007 | 场景描述文本显示 | 无 | 打开应用首页 | 场景选择器下方显示当前场景的描述文本 |

---

## 2. 场景选择

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-010 | 切换到多工具协作场景 | 默认 simple-weather 场景 | 在场景选择器中选择 "多工具协作" | 1. Timeline 显示 7 个步骤卡片<br>2. StepDetail 显示新场景第一步<br>3. PlaybackBar 总步数更新为 7 |
| TC-011 | 切换场景重置步骤索引 | 在 simple-weather 场景浏览到第 3 步 | 切换到 multi-tool 场景 | stepIndex 重置为 0，Timeline 第一步高亮，StepDetail 显示第一步 |
| TC-012 | 播放中切换场景停止播放 | simple-weather 场景正在自动播放 | 切换到 multi-tool 场景 | 1. 播放停止（按钮变回播放图标）<br>2. 新场景从第一步开始<br>3. AgentStatusBar 消失 |
| TC-013 | 切换场景保留速度设置 | 速度设为 2x，在 simple-weather 场景 | 切换到 multi-tool 场景 | 速度选择器仍显示 "2x" |
| TC-014 | 切换回原场景 | 从 simple-weather 切到 multi-tool | 再切回 simple-weather | Timeline 显示 4 步，从第一步开始，所有状态重置 |
| TC-015 | 所有场景都可选择 | 无 | 展开场景选择器 | 下拉列表包含 "简单查天气" 和 "多工具协作" 两个选项 |

---

## 3. Timeline 步骤点击

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-020 | 点击第三步选中 | simple-weather 场景，当前第一步 | 点击 Timeline 中第 3 个 StepCard | 1. 第 3 步高亮（蓝色边框+阴影）<br>2. StepDetail 更新为第 3 步内容<br>3. PlaybackBar 进度条跳到第 3 步 |
| TC-021 | 活动步骤视觉样式 | 选中第 2 步 | 观察 Timeline | 第 2 步：深色背景 + 蓝色边框 + 左侧蓝色渐变指示条 |
| TC-022 | 已完成步骤显示勾号 | 选中第 3 步 | 观察 Timeline | 第 1、2 步右下角显示绿色勾号 SVG，第 3 步无勾号 |
| TC-023 | 未到达步骤样式 | 选中第 2 步 | 观察 Timeline | 第 3、4 步：半透明背景 + 灰色边框，无勾号 |
| TC-024 | 播放中点击非当前步骤 | 正在自动播放，当前第 2 步 | 点击第 4 步 | 1. 播放停止<br>2. 跳转到第 4 步<br>3. PlaybackBar 播放按钮恢复 |
| TC-025 | 点击当前已选中步骤 | 当前选中第 2 步，未播放 | 再次点击第 2 步 | 无变化，保持当前状态 |
| TC-026 | 步骤卡片显示信息完整 | simple-weather 场景 | 观察每个 StepCard | 每个卡片显示：步骤类型标签（带图标和颜色）、标题（单行截断）、Token 数量、步骤序号（#N） |

---

## 4. StepDetail 导航

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-030 | 点击下一步前进 | 当前第 1 步 | 点击 StepDetail 底部 "下一步" 按钮 | 切换到第 2 步，Timeline 和 PlaybackBar 同步更新 |
| TC-031 | 点击上一步后退 | 当前第 3 步 | 点击 StepDetail 底部 "上一步" 按钮 | 切换到第 2 步，Timeline 和 PlaybackBar 同步更新 |
| TC-032 | 第一步上一步按钮禁用 | 当前第 1 步 | 观察 StepDetail 底部导航 | "上一步" 按钮 disabled，不可点击 |
| TC-033 | 最后一步下一步按钮禁用 | 当前第 4 步（simple-weather 末步） | 观察 StepDetail 底部导航 | "下一步" 按钮 disabled，不可点击 |
| TC-034 | 导航按钮点击停止播放 | 正在自动播放 | 点击 StepDetail "下一步" 按钮 | 播放停止，步骤前进一步 |
| TC-035 | 播放中导航按钮隐藏 | 开始自动播放 | 观察 StepDetail 底部 | 导航按钮区域（上一步/下一步 + 导航点）完全不可见 |
| TC-036 | 导航点指示器 | 4 步场景，当前第 2 步 | 观察 StepDetail 底部导航点 | 显示 4 个点，第 2 个点为活跃状态（高亮+脉冲动画） |
| TC-037 | 连续点击下一步遍历所有步骤 | 当前第 1 步 | 连续点击 "下一步" 3 次 | 依次经过 2->3->4 步，第 4 步时下一步按钮变为禁用 |

---

## 5. PlaybackBar 控制

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-040 | 点击播放按钮开始播放 | 暂停状态，第 1 步 | 点击 PlaybackBar 播放按钮 | 1. 按钮变为暂停图标<br>2. 步骤开始自动前进<br>3. AgentStatusBar 出现 |
| TC-041 | 播放中点击暂停 | 正在播放 | 点击 PlaybackBar 暂停按钮 | 1. 播放停止<br>2. 按钮变回播放图标<br>3. 停在当前步骤 |
| TC-042 | 进度条位置正确 | 4 步场景，当前第 3 步（index=2） | 观察进度条 | range input value=2，视觉位置在 2/3 处 |
| TC-043 | 拖动进度条跳转步骤 | 当前第 1 步 | 拖动进度条到最右端 | 跳转到最后一步，StepDetail 和 Timeline 同步更新 |
| TC-044 | 拖动进度条停止播放 | 正在自动播放 | 拖动进度条到任意位置 | 播放停止，跳转到对应步骤 |
| TC-045 | PlaybackBar 上一步按钮 | 当前第 3 步 | 点击 PlaybackBar 上一步按钮 | 后退到第 2 步，播放停止（如在播放中） |
| TC-046 | PlaybackBar 下一步按钮 | 当前第 2 步 | 点击 PlaybackBar 下一步按钮 | 前进到第 3 步，播放停止（如在播放中） |
| TC-047 | 第一步 PlaybackBar 上一步禁用 | 当前第 1 步 | 观察 PlaybackBar | 上一步按钮 disabled |
| TC-048 | 最后一步 PlaybackBar 下一步禁用 | 当前最后一步 | 观察 PlaybackBar | 下一步按钮 disabled |
| TC-049 | 步骤计数显示 | 4 步场景，当前第 2 步 | 观察 PlaybackBar | 显示 "步骤 2 / 4" 及对应百分比 |

---

## 6. 播放速度控制

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-050 | 切换到 0.5x 速度 | 默认 1x | 在速度选择器中选择 "0.5x" | 选择器显示 "0.5x" |
| TC-051 | 切换到 1.5x 速度 | 默认 1x | 在速度选择器中选择 "1.5x" | 选择器显示 "1.5x" |
| TC-052 | 切换到 2x 速度 | 默认 1x | 在速度选择器中选择 "2x" | 选择器显示 "2x" |
| TC-053 | 播放中改速度不停播 | 正在 1x 速度播放 | 切换到 2x | 播放继续（不停止），步骤推进节奏变快 |
| TC-054 | 0.5x 速度播放间隔验证 | 设置 0.5x 速度 | 开始播放，观察步骤切换间隔 | 步骤切换间隔约 3000ms |
| TC-055 | 1x 速度播放间隔验证 | 设置 1x 速度 | 开始播放，观察步骤切换间隔 | 步骤切换间隔约 1500ms |
| TC-056 | 1.5x 速度播放间隔验证 | 设置 1.5x 速度 | 开始播放，观察步骤切换间隔 | 步骤切换间隔约 1000ms |
| TC-057 | 2x 速度播放间隔验证 | 设置 2x 速度 | 开始播放，观察步骤切换间隔 | 步骤切换间隔约 750ms |
| TC-058 | 播放中连续调速 | 正在 1x 播放 | 快速切换 0.5x -> 2x -> 1.5x | 播放始终继续，每次切速后定时器正确重置，无多个定时器叠加 |

---

## 7. 自动播放流程

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-060 | 完整播放 simple-weather | simple-weather 场景第 1 步，1x 速度 | 点击播放，等待播放完成 | 依次经过 THOUGHT -> ACTION -> OBSERVATION -> ANSWER 四步，到达第 4 步后自动停止 |
| TC-061 | 完整播放 multi-tool | multi-tool 场景第 1 步，2x 速度 | 点击播放，等待播放完成 | 依次经过 7 步，到达最后一步后自动停止 |
| TC-062 | 播放到末步自动停止 | 自动播放中 | 等待播放到最后一步 | 1. 播放自动停止<br>2. PlaybackBar 按钮变回播放图标<br>3. AgentStatusBar 消失<br>4. StepDetail 导航按钮重新出现 |
| TC-063 | 末步点击播放重置重播 | 已播放完成停在最后一步 | 点击播放按钮 | 1. stepIndex 重置为 0<br>2. 从第 1 步重新开始播放<br>3. Timeline 从第 1 步开始高亮推进 |
| TC-064 | Header 演示按钮播放 | 暂停状态 | 点击 Header 区域 "开始演示" 按钮 | 开始自动播放，效果与 PlaybackBar 播放按钮相同 |
| TC-065 | Header 按钮末步重播 | 已停在最后一步 | 点击 Header "开始演示" 按钮 | 重置到第 0 步并开始播放 |
| TC-066 | 从中间步骤开始播放 | 手动导航到第 3 步 | 点击播放 | 从第 3 步开始继续向后播放，不重置到第 1 步 |
| TC-067 | 播放-暂停-继续 | 播放到第 2 步时暂停 | 暂停后再次点击播放 | 从第 2 步继续播放，不重置 |

---

## 8. Agent 状态栏

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-070 | 播放中状态栏可见 | 暂停状态 | 开始播放 | AgentStatusBar 出现在页面顶部 |
| TC-071 | 暂停时状态栏消失 | 播放中 | 点击暂停 | AgentStatusBar 从页面消失 |
| TC-072 | THOUGHT 步骤 -> thinking | 播放中，当前步骤类型为 THOUGHT | 观察 AgentStatusBar | 显示 "思考中" 标签，对应紫色图标 |
| TC-073 | ACTION 步骤 -> acting | 播放中，当前步骤类型为 ACTION | 观察 AgentStatusBar | 显示 "执行中" 标签，对应蓝色图标 |
| TC-074 | OBSERVATION 步骤 -> observing | 播放中，当前步骤类型为 OBSERVATION | 观察 AgentStatusBar | 显示 "观察中" 标签，对应绿色图标 |
| TC-075 | ANSWER 步骤 -> answering | 播放中，当前步骤类型为 ANSWER | 观察 AgentStatusBar | 显示 "回答中" 标签，对应琥珀色图标 |
| TC-076 | 状态图标脉冲动画 | 播放中 | 观察 AgentStatusBar 图标 | 图标有 `animate-pulse` 脉冲动画效果 |
| TC-077 | 显示当前步骤标题 | 播放中 | 观察 AgentStatusBar | 显示当前步骤的 title 文本 |
| TC-078 | 显示步骤进度 | 播放中，4 步场景第 2 步 | 观察 AgentStatusBar | 显示 "2/4" 或类似进度信息 |
| TC-079 | 状态随步骤推进实时变化 | 播放 simple-weather（THOUGHT->ACTION->OBSERVATION->ANSWER） | 观察状态栏在整个播放过程中的变化 | 状态依次变为 thinking -> acting -> observing -> answering，颜色和图标同步切换 |

---

## 9. 上下文查看器

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-080 | 显示完整上下文快照 | simple-weather 第 1 步 | 观察 ContextViewer | 显示该步骤的所有上下文消息（system prompt + user query + assistant thought） |
| TC-081 | 消息按顺序排列 | 任意步骤 | 观察消息列表 | 消息按 contextSnapshot 数组顺序从上到下排列 |
| TC-082 | system 消息样式 | 包含 system 消息的步骤 | 观察消息角色标签 | system 消息显示灰色角色标签 |
| TC-083 | user 消息样式 | 包含 user 消息的步骤 | 观察消息角色标签 | user 消息显示蓝色角色标签 |
| TC-084 | assistant 消息样式 | 包含 assistant 消息的步骤 | 观察消息角色标签 | assistant 消息显示绿色角色标签 |
| TC-085 | tool_call 消息样式 | 包含 tool_call 消息的步骤 | 观察消息角色标签 | tool_call 消息显示紫色角色标签 |
| TC-086 | tool_result 消息样式 | 包含 tool_result 消息的步骤 | 观察消息角色标签 | tool_result 消息显示琥珀色角色标签 |
| TC-087 | Token 进度条绿色 (<=50%) | 第 1 步 token 使用量 <= 50% | 观察 Token 进度条 | 进度条为绿色 (`bg-green-500`) |
| TC-088 | Token 进度条黄色 (50%-80%) | 步骤 token 使用量在 50%-80% 之间 | 观察 Token 进度条 | 进度条为黄色 (`bg-yellow-500`) |
| TC-089 | Token 进度条红色 (>80%) | 步骤 token 使用量超过 80% | 观察 Token 进度条 | 进度条为红色 (`bg-red-500`) |
| TC-090 | Token 进度条宽度上限 | token 使用量接近 limit | 观察 Token 进度条 | 进度条宽度不超过 100%（`Math.min(tokenPercentage, 100)`） |
| TC-091 | 步骤切换消息列表更新 | 第 1 步 | 切换到第 3 步 | ContextViewer 消息列表完全更新为第 3 步的 contextSnapshot，消息数量增加 |
| TC-092 | 自动滚动到底部 | 消息列表超出可视区域 | 切换到后面的步骤（消息更多） | 消息列表自动平滑滚动到底部 |
| TC-093 | Token 随步骤递增 | simple-weather 场景 | 逐步浏览 1->2->3->4 | Token used 数值逐步增大（156 -> ... -> 423） |
| TC-094 | 消息内容保留格式 | 包含多行内容的消息 | 观察消息正文 | 消息内容保留换行和空白格式（`whitespace-pre-wrap`），使用等宽字体 |

---

## 10. StepDetail 面板展示

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-100 | 步骤类型标签显示 | THOUGHT 类型步骤 | 观察 StepDetail 头部 | 显示紫色类型标签 Badge，含图标和 "思考" 文本 |
| TC-101 | 步骤标题显示 | 任意步骤 | 观察 StepDetail | 显示步骤的 title 文本 |
| TC-102 | 步骤描述显示 | 任意步骤 | 观察 StepDetail | 显示步骤的 description 文本 |
| TC-103 | Token 统计显示 | 第 1 步 | 观察 StepDetail 头部 | 显示 "156 / 4096 tokens" 或类似格式 |
| TC-104 | 步骤计数显示 | 4 步场景第 2 步 | 观察 StepDetail 头部 | 显示 "步骤 2 / 4" |
| TC-105 | 导航点数量匹配 | simple-weather 场景（4步） | 观察 StepDetail 底部导航点 | 恰好显示 4 个导航点 |
| TC-106 | 导航点活跃状态 | 当前第 3 步 | 观察导航点 | 第 3 个点高亮（活跃样式+脉冲动画），其余点为默认样式 |
| TC-107 | 切换步骤后面板完整更新 | 第 1 步 | 切换到第 4 步 | 类型标签、标题、描述、Token、消息列表全部更新为第 4 步数据 |

---

## 11. 步骤类型样式

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-110 | THOUGHT 类型紫色 | 包含 THOUGHT 步骤的场景 | 观察 THOUGHT 步骤的 StepCard 和 StepDetail | 类型标签背景为紫色系（`purple`），图标为思考图标 |
| TC-111 | ACTION 类型蓝色 | 包含 ACTION 步骤的场景 | 观察 ACTION 步骤的 StepCard 和 StepDetail | 类型标签背景为蓝色系（`blue`），图标为执行图标 |
| TC-112 | OBSERVATION 类型绿色 | 包含 OBSERVATION 步骤的场景 | 观察 OBSERVATION 步骤的 StepCard 和 StepDetail | 类型标签背景为绿色系（`green`），图标为观察图标 |
| TC-113 | ANSWER 类型琥珀色 | 包含 ANSWER 步骤的场景 | 观察 ANSWER 步骤的 StepCard 和 StepDetail | 类型标签背景为琥珀色系（`amber`），图标为回答图标 |
| TC-114 | StepCard 与 StepDetail 类型样式一致 | 选中任意步骤 | 对比 Timeline 中 StepCard 和右侧 StepDetail 的类型标签 | 两处颜色方案和图标完全一致（来自共享 `stepStyles` 常量） |

---

## 12. 动画系统

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-120 | StepCard 渲染淡入 | 无 | 加载页面或切换场景 | 每个 StepCard 有从左侧 12px 淡入的动画（`stepCardFadeIn`，0.3s） |
| TC-121 | 活动 StepCard 呼吸脉冲 | 选中某步骤 | 观察活动状态的 StepCard | 蓝色 box-shadow 呼吸脉冲动画（`activeStepPulse`，2s 循环） |
| TC-122 | StepDetail 切换淡入 | 切换步骤 | 观察右侧面板 | StepDetail 容器有从下方 16px 淡入动画（`stepDetailFadeIn`，0.4s） |
| TC-123 | Badge 弹出效果 | 切换步骤 | 观察 StepDetail 类型标签 | Badge 有缩放弹出动画（`badgePop`，0.3s） |
| TC-124 | 导航点活跃脉冲 | 当前步骤变化 | 观察底部导航点 | 活跃导航点有缩放脉冲动画（`dotPulse`，2s 循环） |
| TC-125 | 上下文消息滑入 | 切换步骤 | 观察 ContextViewer 消息 | 每条消息有从下方 16px 淡入动画（`slideIn`，0.3s） |
| TC-126 | Token 进度条宽度过渡 | 从 Token 少的步骤切到 Token 多的步骤 | 观察进度条宽度变化 | 宽度平滑过渡（`width 0.5s ease-out`），颜色变化也有过渡 |
| TC-127 | AgentStatusBar 图标脉冲 | 播放中 | 观察状态栏图标 | 图标有 Tailwind `animate-pulse` 动画 |
| TC-128 | 导航按钮 hover 效果 | 鼠标未悬停 | 鼠标悬停在上一步/下一步按钮上 | 按钮上移 1px，有 0.2s 过渡 |
| TC-129 | 导航按钮 active 效果 | 鼠标悬停在导航按钮上 | 点击按钮（按下） | 按钮回到原位（active 状态 translateY(0)） |

---

## 13. 跨组件状态联动

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-130 | Timeline-StepDetail-PlaybackBar 步骤同步 | 任意状态 | 点击 Timeline 第 3 步 | 三处同步：Timeline 第 3 步高亮、StepDetail 显示第 3 步、PlaybackBar 进度条在第 3 步 |
| TC-131 | Header 与 PlaybackBar 播放状态同步 | 暂停状态 | 点击 Header "开始演示" 按钮 | PlaybackBar 按钮也变为暂停图标，Header 按钮文本变为 "暂停" |
| TC-132 | PlaybackBar 控制与 Header 按钮同步 | 暂停状态 | 点击 PlaybackBar 播放按钮 | Header 按钮文本变为 "暂停" |
| TC-133 | 场景切换全组件重置 | 在 simple-weather 第 3 步播放中 | 切换到 multi-tool | Timeline（7步+第1步高亮）、StepDetail（第1步）、PlaybackBar（进度0/7+暂停）、AgentStatusBar（消失）全部重置 |
| TC-134 | Token 在各组件间一致 | 选中第 2 步 | 对比 StepCard Token 数 vs StepDetail Token 数 vs ContextViewer 进度条 | 三处显示的 Token 数据一致 |
| TC-135 | 步骤类型在各组件间一致 | 播放中，当前 ACTION 步骤 | 对比 StepCard 类型标签、StepDetail 类型标签、AgentStatusBar 状态 | StepCard 和 StepDetail 显示 ACTION/蓝色，AgentStatusBar 显示 "执行中" |
| TC-136 | 播放停止后 StepDetail 导航恢复 | 播放中（导航按钮隐藏） | 点击暂停 | StepDetail 底部导航按钮和导航点重新出现 |

---

## 14. 边界情况与异常

| ID | 用例名称 | 前置条件 | 操作步骤 | 预期结果 |
|---|---|---|---|---|
| TC-140 | 第一步反复点击上一步 | 当前第 1 步 | 连续快速点击 PlaybackBar 上一步按钮 5 次 | 始终停留在第 1 步，不会越界到负数索引，无报错 |
| TC-141 | 末步反复点击下一步 | 当前最后一步 | 连续快速点击 PlaybackBar 下一步按钮 5 次 | 始终停留在最后一步，不会越界，无报错 |
| TC-142 | 快速连续点击不同步骤 | 第 1 步 | 快速依次点击 Timeline 第 2、3、4 步（<100ms 间隔） | 最终稳定在第 4 步，所有组件状态正确同步，无闪烁或不一致 |
| TC-143 | 快速连续播放暂停 | 暂停状态 | 快速交替点击播放/暂停 10 次 | 最终状态正确（播放或暂停），无多个定时器叠加，步骤推进正常 |
| TC-144 | 快速切换场景 | simple-weather 场景 | 快速交替切换 simple-weather 和 multi-tool 5 次 | 最终场景正确加载，步骤重置为 0，无数据残留或混乱 |
| TC-145 | 播放中快速拖动进度条 | 正在播放 | 在播放过程中快速拖动进度条来回 3 次 | 播放停止，最终停在拖动释放位置，StepDetail 显示正确步骤 |
| TC-146 | 播放中切换速度再暂停再播放 | 1x 播放中 | 切换到 2x -> 暂停 -> 再播放 | 恢复播放后使用 2x 速度（750ms 间隔） |
| TC-147 | 末步播放时 AgentState 变化 | 自动播放到达最后一步 | 观察 AgentState 变化 | 播放中最后一步：status 为对应类型状态；播放停止后：status 变为 'completed'（但 AgentStatusBar 已隐藏） |
| TC-148 | 进度条值为 0 时拖动 | 4 步场景第 1 步 | 拖动进度条到 value=0 | 保持第 1 步，无异常 |
| TC-149 | 进度条拖到最大值 | 4 步场景 | 拖动进度条到 value=3（max） | 跳到第 4 步（最后一步），下一步按钮禁用 |

---

## 15. 完整用户旅程

### TC-150: 首次访问完整体验

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | 打开应用 | 默认加载 simple-weather 场景，第 1 步，暂停状态 |
| 2 | 浏览 Timeline | 看到 4 个步骤卡片：思考、行动、观察、回答，各有不同颜色 |
| 3 | 点击第 2 步 | StepDetail 更新，ContextViewer 显示更多消息，Token 进度条增长 |
| 4 | 点击 "开始演示" | 自动播放启动，AgentStatusBar 出现，StepDetail 导航按钮隐藏 |
| 5 | 观察播放过程 | 步骤依次推进，Timeline 高亮跟随，状态栏依次变化 |
| 6 | 播放到最后一步 | 自动停止，AgentStatusBar 消失，导航按钮恢复 |
| 7 | 回到第 1 步 | 点击 Timeline 第 1 步或拖动进度条到最左 |

### TC-151: 播放-暂停-拖动-继续播放

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | multi-tool 场景，第 1 步 | 显示 7 步 Timeline |
| 2 | 点击播放 | 开始自动推进 |
| 3 | 在第 3 步时点击暂停 | 停在第 3 步，AgentStatusBar 消失 |
| 4 | 拖动进度条到第 5 步 | 跳到第 5 步，StepDetail 和 Timeline 同步 |
| 5 | 再次点击播放 | 从第 5 步继续播放 |
| 6 | 等待播放完成 | 播放到第 7 步自动停止 |
| 7 | 再次点击播放 | 重置到第 1 步重新开始 |

### TC-152: 跨场景操作

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | simple-weather 场景，浏览到第 3 步 | StepDetail 显示第 3 步 OBSERVATION |
| 2 | 开始播放 | 从第 3 步继续播放到第 4 步停止 |
| 3 | 切换到 multi-tool 场景 | 所有状态重置：7 步 Timeline，第 1 步高亮，暂停 |
| 4 | 设置速度 2x，点击播放 | 以 2x 速度播放 multi-tool 场景 |
| 5 | 播放中切回 simple-weather | 播放停止，切到 simple-weather 第 1 步 |
| 6 | 验证速度保留 | 速度选择器仍显示 "2x" |

### TC-153: 全速率体验

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | simple-weather 场景，0.5x 速度 | 选择器显示 "0.5x" |
| 2 | 播放，观察第 1->2 步间隔 | 约 3 秒切换 |
| 3 | 播放中切到 1x | 后续间隔约 1.5 秒 |
| 4 | 播放中切到 1.5x | 后续间隔约 1 秒 |
| 5 | 播放中切到 2x | 后续间隔约 0.75 秒 |
| 6 | 播放完毕 | 全程播放不中断，速度切换平滑 |

### TC-154: 纯键盘/进度条操作流

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | 打开应用 | 默认第 1 步 |
| 2 | 仅通过 PlaybackBar 上一步/下一步浏览全部步骤 | 每次点击正确前进/后退，到头禁用 |
| 3 | 拖动进度条到中间 | 跳到对应步骤 |
| 4 | 拖动进度条到最左 | 回到第 1 步 |
| 5 | 拖动进度条到最右 | 到最后一步 |
| 6 | 点击播放 | 因在最后一步，重置到第 1 步重新播放 |

---

## 附录 A: 已知问题与测试盲区

以下是代码分析中发现的潜在问题，建议纳入回归测试但当前实现中**无法直接触发**：

| 编号 | 问题描述 | 影响范围 | 测试建议 |
|---|---|---|---|
| ISSUE-001 | `isNew` 高亮永不生效：`StepDetail` 传递 `contextSnapshot` 给 `ContextViewer`，但 `contextSnapshot` 中消息不带 `isNew` 标记，导致新消息高亮（蓝色左边框 + "NEW" 徽章 + 脉冲动画）永远不触发 | ContextViewer 新消息视觉提示 | 构造带 `isNew: true` 的测试数据验证高亮逻辑本身是否工作 |
| ISSUE-002 | `paused` AgentStatus 永不产生：类型定义了 `'paused'` 状态，但 `App.tsx` 中 `agentState` 计算逻辑从未输出此值 | AgentStatusBar | 验证 `AGENT_STATUS_CONFIG['paused']` 的渲染（需单元测试） |
| ISSUE-003 | `AgentStatusBar` full 模式未使用：App 中仅使用 `compact` 模式，full 模式含进度条但从未在页面中展示 | AgentStatusBar | 组件级测试覆盖 full 模式渲染 |
| ISSUE-004 | `AgentStatusBar` error 展示未使用：组件支持 `error` 字段显示红色错误信息，但 App 从不传递 error | AgentStatusBar | 组件级测试覆盖 error 渲染 |
| ISSUE-005 | `messageFadeIn` CSS 关键帧已定义但未引用：`src/styles/index.css` 中定义了 `messageFadeIn` 动画但无任何 CSS 类使用它 | 样式文件 | 清理死代码或确认是否预留 |

---

## 附录 B: 测试数据依赖

| 场景 | ID | 步骤数 | 步骤类型序列 | Token 范围 |
|---|---|---|---|---|
| 简单查天气 | `simple-weather` | 4 | THOUGHT -> ACTION -> OBSERVATION -> ANSWER | 156 ~ 423 / 4096 |
| 多工具协作 | `multi-tool` | 7 | THOUGHT -> ACTION -> OBSERVATION -> THOUGHT -> ACTION -> OBSERVATION -> ANSWER | 178 ~ 812 / 4096 |

---

## 附录 C: 用例统计

| 模块 | 用例数量 |
|---|---|
| 初始加载 | 7 |
| 场景选择 | 6 |
| Timeline 步骤点击 | 7 |
| StepDetail 导航 | 8 |
| PlaybackBar 控制 | 10 |
| 播放速度控制 | 9 |
| 自动播放流程 | 8 |
| Agent 状态栏 | 10 |
| 上下文查看器 | 15 |
| StepDetail 面板展示 | 8 |
| 步骤类型样式 | 5 |
| 动画系统 | 10 |
| 跨组件状态联动 | 7 |
| 边界情况与异常 | 10 |
| 完整用户旅程 | 5 |
| **总计** | **125** |
