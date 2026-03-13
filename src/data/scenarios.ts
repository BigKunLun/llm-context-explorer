// src/data/scenarios.ts
import type { Scenario, Step, ContextMessage } from '../types';

/** 系统消息模板 */
const SYSTEM_MESSAGE: ContextMessage = {
  role: 'system',
  content: '你是一个智能助手，可以帮助用户完成各种任务。当需要外部信息时，你可以使用提供的工具来获取。',
};

/**
 * 场景1: 简单查天气 (4 steps)
 * 展示基础的 ReAct 循环
 */
const scenario1Steps: Step[] = (() => {
  const steps: Step[] = [];
  const TOKEN_LIMIT = 4096;

  // Step 1: THOUGHT - 分析用户请求
  const step1Context: ContextMessage[] = [
    { ...SYSTEM_MESSAGE },
    { role: 'user', content: '北京今天天气怎么样？适合户外活动吗？' },
    { role: 'assistant', content: '用户想了解北京今天的天气情况，并询问是否适合户外活动。我需要使用天气工具来获取北京的实时天气信息。' },
  ];
  steps.push({
    id: 's1-step1',
    type: 'THOUGHT',
    title: '分析用户请求',
    description: '理解用户想查询北京天气，判断需要调用天气工具',
    contextSnapshot: step1Context,
    contextDiff: [
      { ...SYSTEM_MESSAGE, isNew: true },
      { role: 'user', content: '北京今天天气怎么样？适合户外活动吗？', isNew: true },
      { role: 'assistant', content: '用户想了解北京今天的天气情况，并询问是否适合户外活动。我需要使用天气工具来获取北京的实时天气信息。', isNew: true },
    ],
    tokens: { used: 156, limit: TOKEN_LIMIT },
  });

  // Step 2: ACTION - 调用天气工具
  const step2Context: ContextMessage[] = [
    ...step1Context,
    { role: 'tool_call', content: 'get_weather(city="北京")' },
  ];
  steps.push({
    id: 's1-step2',
    type: 'ACTION',
    title: '调用天气工具',
    description: '使用 get_weather 工具查询北京天气',
    contextSnapshot: step2Context,
    contextDiff: [
      { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
    ],
    tokens: { used: 234, limit: TOKEN_LIMIT },
  });

  // Step 3: OBSERVATION - 工具返回结果
  const step3Context: ContextMessage[] = [
    ...step2Context,
    { role: 'tool_result', content: '{"temp": 15, "weather": "晴", "humidity": 45, "wind": "微风"}' },
  ];
  steps.push({
    id: 's1-step3',
    type: 'OBSERVATION',
    title: '获取天气结果',
    description: '天气工具返回北京当前天气数据',
    contextSnapshot: step3Context,
    contextDiff: [
      { role: 'tool_result', content: '{"temp": 15, "weather": "晴", "humidity": 45, "wind": "微风"}', isNew: true },
    ],
    tokens: { used: 312, limit: TOKEN_LIMIT },
  });

  // Step 4: ANSWER - 生成最终答案
  const step4Context: ContextMessage[] = [
    ...step3Context,
    { role: 'assistant', content: '北京今天天气晴朗，气温15°C，湿度45%，微风。这样的天气非常适合户外活动！建议您可以进行散步、跑步或野餐等活动。记得适当添衣保暖。' },
  ];
  steps.push({
    id: 's1-step4',
    type: 'ANSWER',
    title: '给出最终建议',
    description: '综合天气信息，给出是否适合户外活动的建议',
    contextSnapshot: step4Context,
    contextDiff: [
      { role: 'assistant', content: '北京今天天气晴朗，气温15°C，湿度45%，微风。这样的天气非常适合户外活动！建议您可以进行散步、跑步或野餐等活动。记得适当添衣保暖。', isNew: true },
    ],
    tokens: { used: 423, limit: TOKEN_LIMIT },
  });

  return steps;
})();

/**
 * 场景2: 多工具协作 (7 steps)
 * 展示 Agent 如何在多次工具调用间保持上下文
 */
const scenario2Steps: Step[] = (() => {
  const steps: Step[] = [];
  const TOKEN_LIMIT = 4096;

  // Step 1: THOUGHT - 分析复杂请求
  const step1Context: ContextMessage[] = [
    { ...SYSTEM_MESSAGE },
    { role: 'user', content: '今天下午团队有户外活动，我需要知道天气情况和我的日程安排，帮我看看要带什么东西。' },
    { role: 'assistant', content: '用户需要了解两方面信息：1) 今天的天气情况，用于决定穿着和携带物品；2) 用户的日程安排，确认户外活动的具体时间。我将依次调用天气工具和日程工具。' },
  ];
  steps.push({
    id: 's2-step1',
    type: 'THOUGHT',
    title: '分析复杂请求',
    description: '识别需要天气和日程两个信息源',
    contextSnapshot: step1Context,
    contextDiff: [
      { ...SYSTEM_MESSAGE, isNew: true },
      { role: 'user', content: '今天下午团队有户外活动，我需要知道天气情况和我的日程安排，帮我看看要带什么东西。', isNew: true },
      { role: 'assistant', content: '用户需要了解两方面信息：1) 今天的天气情况，用于决定穿着和携带物品；2) 用户的日程安排，确认户外活动的具体时间。我将依次调用天气工具和日程工具。', isNew: true },
    ],
    tokens: { used: 178, limit: TOKEN_LIMIT },
  });

  // Step 2: ACTION - 调用天气工具
  const step2Context: ContextMessage[] = [
    ...step1Context,
    { role: 'tool_call', content: 'get_weather(city="北京")' },
  ];
  steps.push({
    id: 's2-step2',
    type: 'ACTION',
    title: '查询天气',
    description: '先获取北京今天的天气信息',
    contextSnapshot: step2Context,
    contextDiff: [
      { role: 'tool_call', content: 'get_weather(city="北京")', isNew: true },
    ],
    tokens: { used: 256, limit: TOKEN_LIMIT },
  });

  // Step 3: OBSERVATION - 天气结果
  const step3Context: ContextMessage[] = [
    ...step2Context,
    { role: 'tool_result', content: '{"temp": 18, "weather": "多云转晴", "humidity": 55, "wind": "东南风3级", "uv_index": "中等"}' },
  ];
  steps.push({
    id: 's2-step3',
    type: 'OBSERVATION',
    title: '获取天气结果',
    description: '天气工具返回北京天气：18°C，多云转晴',
    contextSnapshot: step3Context,
    contextDiff: [
      { role: 'tool_result', content: '{"temp": 18, "weather": "多云转晴", "humidity": 55, "wind": "东南风3级", "uv_index": "中等"}', isNew: true },
    ],
    tokens: { used: 334, limit: TOKEN_LIMIT },
  });

  // Step 4: THOUGHT - 继续获取日程
  const step4Context: ContextMessage[] = [
    ...step3Context,
    { role: 'assistant', content: '已获取天气信息：北京今天18°C，多云转晴，东南风3级，紫外线中等。接下来需要查询用户的日程安排，确认户外活动的具体时间。' },
  ];
  steps.push({
    id: 's2-step4',
    type: 'THOUGHT',
    title: '规划下一步',
    description: '天气已获取，继续查询日程安排',
    contextSnapshot: step4Context,
    contextDiff: [
      { role: 'assistant', content: '已获取天气信息：北京今天18°C，多云转晴，东南风3级，紫外线中等。接下来需要查询用户的日程安排，确认户外活动的具体时间。', isNew: true },
    ],
    tokens: { used: 412, limit: TOKEN_LIMIT },
  });

  // Step 5: ACTION - 调用日程工具
  const step5Context: ContextMessage[] = [
    ...step4Context,
    { role: 'tool_call', content: 'get_schedule(date="today")' },
  ];
  steps.push({
    id: 's2-step5',
    type: 'ACTION',
    title: '查询日程',
    description: '获取用户今天的日程安排',
    contextSnapshot: step5Context,
    contextDiff: [
      { role: 'tool_call', content: 'get_schedule(date="today")', isNew: true },
    ],
    tokens: { used: 490, limit: TOKEN_LIMIT },
  });

  // Step 6: OBSERVATION - 日程结果
  const step6Context: ContextMessage[] = [
    ...step5Context,
    { role: 'tool_result', content: '{"events": [{"time": "14:00-17:00", "title": "团队户外拓展", "location": "奥林匹克森林公园", "type": "户外活动"}]}' },
  ];
  steps.push({
    id: 's2-step6',
    type: 'OBSERVATION',
    title: '获取日程结果',
    description: '日程显示下午2点在奥森公园有团队拓展活动',
    contextSnapshot: step6Context,
    contextDiff: [
      { role: 'tool_result', content: '{"events": [{"time": "14:00-17:00", "title": "团队户外拓展", "location": "奥林匹克森林公园", "type": "户外活动"}]}', isNew: true },
    ],
    tokens: { used: 601, limit: TOKEN_LIMIT },
  });

  // Step 7: ANSWER - 综合建议
  const step7Context: ContextMessage[] = [
    ...step6Context,
    { role: 'assistant', content: '根据天气和日程信息，我为您准备以下建议：\n\n📍 活动安排：下午2点-5点，奥林匹克森林公园团队拓展\n\n🌤️ 天气情况：18°C，多云转晴，东南风3级，紫外线中等\n\n🎒 建议携带物品：\n1. 穿着舒适的运动服和运动鞋\n2. 带一件薄外套，下午可能会转凉\n3. 涂抹防晒霜（紫外线中等）\n4. 带一瓶水保持水分\n5. 可以带太阳镜\n\n祝您活动愉快！' },
  ];
  steps.push({
    id: 's2-step7',
    type: 'ANSWER',
    title: '给出综合建议',
    description: '结合天气和日程，提供携带物品建议',
    contextSnapshot: step7Context,
    contextDiff: [
      { role: 'assistant', content: '根据天气和日程信息，我为您准备以下建议：\n\n📍 活动安排：下午2点-5点，奥林匹克森林公园团队拓展\n\n🌤️ 天气情况：18°C，多云转晴，东南风3级，紫外线中等\n\n🎒 建议携带物品：\n1. 穿着舒适的运动服和运动鞋\n2. 带一件薄外套，下午可能会转凉\n3. 涂抹防晒霜（紫外线中等）\n4. 带一瓶水保持水分\n5. 可以带太阳镜\n\n祝您活动愉快！', isNew: true },
    ],
    tokens: { used: 812, limit: TOKEN_LIMIT },
  });

  return steps;
})();

/** 预设场景列表 */
export const scenarios: Scenario[] = [
  {
    id: 'simple-weather',
    name: '简单查天气',
    description: '展示基础的 ReAct 循环：思考 → 行动 → 观察 → 回答',
    steps: scenario1Steps,
  },
  {
    id: 'multi-tool',
    name: '多工具协作',
    description: '展示 Agent 如何在多次工具调用间保持上下文，综合多个信息源给出建议',
    steps: scenario2Steps,
  },
];

/** 根据 ID 获取场景 */
export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
