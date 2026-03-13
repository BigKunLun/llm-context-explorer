# AGNO Context Explorer - 设计文档

## 项目概述

将 ReAct Context Explorer 从静态模拟器升级为真实 Agent 可视化工具。接入 AGNO 框架，实时捕获并可视化 Agent 运行过程中的上下文变化、事件流和 Token 使用情况。

**核心价值**：
- 真实 Agent 运行，非静态模拟
- 完整事件流可视化
- 上下文变化实时追踪
- 教育价值：理解真实 Agent 框架内部机制

## 技术选型

| 层面 | 技术 | 理由 |
|------|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind | 复用现有项目 |
| 后端 | Python 3.11+ + FastAPI + AGNO | AGNO 原生 Python |
| 通信 | Server-Sent Events (SSE) | 流式事件，简单可靠 |
| 本地开发 | Makefile / docker-compose | 灵活选择 |

## 项目结构

```
agno-context-explorer/
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── components/         # UI 组件（复用现有）
│   │   ├── hooks/              # 自定义 hooks
│   │   │   └── useAgentRun.ts  # 核心 hook
│   │   ├── types/              # TypeScript 类型
│   │   │   └── index.ts        # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI 入口
│   │   ├── agent.py            # AGNO Agent 定义
│   │   ├── tools.py            # Mock 工具
│   │   ├── events.py           # SSE 事件生成器
│   │   └── schemas.py          # Pydantic 模型
│   ├── requirements.txt
│   └── pyproject.toml
│
├── docker-compose.yml          # 本地开发环境
├── Makefile                     # 常用命令
├── .env.example                 # 环境变量模板
└── README.md
```

## 后端设计

### 依赖

```txt
# backend/requirements.txt
fastapi>=0.109.0
uvicorn>=0.27.0
agno>=0.0.5
pydantic>=2.0.0
sse-starlette>=2.0.0
```

### Mock 工具定义

```python
# backend/app/tools.py
from agno.tools import tool

@tool
def get_weather(city: str) -> dict:
    """获取指定城市的天气信息"""
    weather_data = {
        "北京": {"temp": 18, "weather": "多云转晴", "humidity": 55},
        "上海": {"temp": 22, "weather": "晴", "humidity": 65},
        "深圳": {"temp": 26, "weather": "晴", "humidity": 70},
    }
    return weather_data.get(city, {"temp": 20, "weather": "晴", "humidity": 60})

@tool
def get_schedule(date: str) -> dict:
    """获取指定日期的日程安排"""
    return {
        "events": [
            {"time": "14:00", "title": "团队户外拓展", "location": "奥林匹克森林公园"}
        ]
    }
```

### Agent 定义

```python
# backend/app/agent.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
import os

from .tools import get_weather, get_schedule

def create_agent():
    return Agent(
        name="Demo Agent",
        model=OpenAIChat(id="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY")),
        instructions="""你是一个智能助手，可以帮助用户完成各种任务。

        当用户询问天气时，使用 get_weather 工具。
        当用户询问日程时，使用 get_schedule 工具。
        回答要简洁友好。""",
        tools=[get_weather, get_schedule],
        markdown=True,
    )
```

### SSE 事件端点

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agent import create_agent
from .events import event_generator

app = FastAPI(title="AGNO Context Explorer API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunRequest(BaseModel):
    message: str

@app.post("/api/run")
async def run_agent(request: RunRequest):
    """运行 Agent 并返回 SSE 事件流"""
    agent = create_agent()
    return event_generator(agent, request.message)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
```

### 事件生成器（核心）

```python
# backend/app/events.py
import json
import asyncio
from fastapi.responses import StreamingResponse
from agno.agent import Agent
from agno.run.agent import RunOutputEvent

def event_generator(agent: Agent, message: str) -> StreamingResponse:
    """生成 SSE 事件流"""

    async def generate():
        # 发送运行开始
        yield sse_event("run_started", {
            "agent_name": agent.name,
            "timestamp": int(time.time())
        })

        # 上下文状态追踪
        context_snapshot = []
        last_message_count = 0

        try:
            # 运行 Agent 并捕获事件
            run_response = agent.run(message, stream=True)

            for event in run_response:
                event_type = event.event if hasattr(event, 'event') else "unknown"

                # 提取上下文快照
                if hasattr(event, 'messages') and event.messages:
                    context_snapshot = extract_messages(event.messages)
                    current_count = len(context_snapshot)
                    context_diff = context_snapshot[last_message_count:]
                    last_message_count = current_count
                else:
                    context_diff = []

                # 提取 Token 信息
                tokens = extract_tokens(event)

                # 构建事件数据
                event_data = {
                    "type": event_type,
                    "timestamp": int(time.time()),
                    "context_snapshot": context_snapshot,
                    "context_diff": context_diff,
                    "tokens": tokens,
                    "raw_event": serialize_event(event),
                }

                yield sse_event(event_type, event_data)

                # 小延迟确保前端有时间处理
                await asyncio.sleep(0.01)

            # 发送运行完成
            yield sse_event("run_completed", {
                "timestamp": int(time.time()),
                "final_tokens": tokens,
            })

        except Exception as e:
            yield sse_event("run_error", {
                "error": str(e),
                "timestamp": int(time.time())
            })

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

def sse_event(event_type: str, data: dict) -> str:
    """格式化 SSE 事件"""
    return f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

def extract_messages(messages: list) -> list:
    """从 AGNO 消息中提取上下文"""
    result = []
    for msg in messages:
        role = msg.role if hasattr(msg, 'role') else 'unknown'
        content = msg.content if hasattr(msg, 'content') else str(msg)
        result.append({
            "role": role,
            "content": content,
        })
    return result

def extract_tokens(event) -> dict:
    """提取 Token 使用信息"""
    if hasattr(event, 'metrics') and event.metrics:
        return {
            "used": getattr(event.metrics, 'input_tokens', 0) + getattr(event.metrics, 'output_tokens', 0),
            "input": getattr(event.metrics, 'input_tokens', 0),
            "output": getattr(event.metrics, 'output_tokens', 0),
        }
    return {"used": 0, "input": 0, "output": 0}

def serialize_event(event) -> dict:
    """序列化事件为可传输格式"""
    if hasattr(event, 'to_dict'):
        return event.to_dict()
    return {"type": str(type(event))}
```

## 前端设计

### 类型定义

```typescript
// frontend/src/types/index.ts

/** AGNO 事件类型 */
export type AgnoEventType =
  | 'run_started'
  | 'model_request_started'
  | 'model_request_completed'
  | 'reasoning_started'
  | 'reasoning_content_delta'
  | 'reasoning_completed'
  | 'tool_call_started'
  | 'tool_call_completed'
  | 'run_content'
  | 'run_completed'
  | 'run_error';

/** SSE 事件 */
export interface SSEEvent {
  type: AgnoEventType;
  timestamp: number;
  context_snapshot: ContextMessage[];
  context_diff: ContextMessage[];
  tokens: { used: number; input: number; output: number };
  raw_event?: Record<string, unknown>;
}

/** 上下文消息 */
export interface ContextMessage {
  role: 'system' | 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'unknown';
  content: string;
  isNew?: boolean;
}

/** 运行状态 */
export interface RunState {
  status: 'idle' | 'running' | 'completed' | 'error';
  events: SSEEvent[];
  contextSnapshot: ContextMessage[];
  currentTokens: number;
  totalTokens: number;
  errorMessage?: string;
}
```

### 核心 Hook

```typescript
// frontend/src/hooks/useAgentRun.ts
import { useState, useCallback } from 'react';
import type { SSEEvent, RunState, ContextMessage } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useAgentRun() {
  const [state, setState] = useState<RunState>({
    status: 'idle',
    events: [],
    contextSnapshot: [],
    currentTokens: 0,
    totalTokens: 0,
  });

  const runAgent = useCallback(async (message: string) => {
    setState(prev => ({
      ...prev,
      status: 'running',
      events: [],
      contextSnapshot: [],
      currentTokens: 0,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const event = parseSSELine(line);
          if (event) {
            setState(prev => processEvent(prev, event));
          }
        }
      }

      setState(prev => ({ ...prev, status: 'completed' }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      events: [],
      contextSnapshot: [],
      currentTokens: 0,
      totalTokens: 0,
    });
  }, []);

  return { state, runAgent, reset };
}

function parseSSELine(line: string): SSEEvent | null {
  if (line.startsWith('event:')) {
    const type = line.substring(7).trim();
    return { type } as SSEEvent;
  }
  if (line.startsWith('data:')) {
    try {
      return JSON.parse(line.substring(5));
    } catch {
      return null;
    }
  }
  return null;
}

function processEvent(prev: RunState, event: SSEEvent): RunState {
  const contextSnapshot = event.context_snapshot || prev.contextSnapshot;
  const currentTokens = event.tokens?.used || prev.currentTokens;

  return {
    ...prev,
    events: [...prev.events, event],
    contextSnapshot: contextSnapshot.map((msg, i) => ({
      ...msg,
      isNew: i >= prev.contextSnapshot.length
    })),
    currentTokens,
    totalTokens: Math.max(prev.totalTokens, currentTokens),
  };
}
```

### App 组件

```tsx
// frontend/src/App.tsx
import { useState } from 'react';
import { useAgentRun } from './hooks/useAgentRun';
import { Timeline } from './components/Timeline';
import { ContextViewer } from './components/ContextViewer';

function App() {
  const { state, runAgent, reset } = useAgentRun();
  const [input, setInput] = useState('');
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && state.status !== 'running') {
      setSelectedEventIndex(0);
      runAgent(input);
      setInput('');
    }
  };

  // 根据选中事件获取上下文快照
  const displayContext = state.events[selectedEventIndex]?.context_snapshot || state.contextSnapshot;
  const displayTokens = state.events[selectedEventIndex]?.tokens || { used: state.currentTokens, limit: 4096 };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">
              AGNO Context Explorer
            </h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                state.status === 'running' ? 'bg-green-500/20 text-green-400' :
                state.status === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-700 text-gray-300'
              }`}>
                {state.status === 'running' ? '● 运行中' :
                 state.status === 'completed' ? '✓ 完成' :
                 state.status === 'error' ? '✗ 错误' : '○ 就绪'}
              </span>
              {state.status !== 'running' && state.events.length > 0 && (
                <button onClick={reset} className="text-gray-400 hover:text-white">
                  重置
                </button>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入消息，例如：今天北京天气怎么样？"
              disabled={state.status === 'running'}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={state.status === 'running' || !input.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
            >
              发送
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {state.events.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <p>输入消息开始运行 Agent，观察上下文变化过程</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Left: Timeline */}
            <aside className="w-80 flex-shrink-0">
              <Timeline
                events={state.events}
                currentIndex={selectedEventIndex}
                onSelect={setSelectedEventIndex}
              />
            </aside>

            {/* Right: Context Viewer */}
            <section className="flex-1 min-w-0">
              <ContextViewer
                messages={displayContext}
                tokens={{ used: displayTokens.used, limit: 4096 }}
              />

              {/* Event Detail */}
              {state.events[selectedEventIndex] && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    📋 事件详情
                  </h4>
                  <pre className="text-sm text-gray-300 overflow-auto max-h-64">
                    {JSON.stringify(state.events[selectedEventIndex], null, 2)}
                  </pre>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

## 本地开发环境

### Makefile

```makefile
# Makefile
.PHONY: dev frontend backend install clean

dev:
	@make -j2 _frontend _backend

_frontend:
	cd frontend && npm run dev

_backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

install:
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

clean:
	rm -rf frontend/dist backend/__pycache__ backend/app/__pycache__
```

### 环境变量

```env
# .env.example
OPENAI_API_KEY=sk-xxx
```

## MVP 边界

### 包含
- ✅ 真实 AGNO Agent 运行
- ✅ SSE 事件流实时推送
- ✅ 上下文快照可视化
- ✅ Mock 工具（天气 + 日程）
- ✅ Token 使用统计
- ✅ 事件详情查看

### 不包含（后续迭代）
- ❌ 真实外部 API 工具
- ❌ 多 Agent / Workflow
- ❌ 会话持久化
- ❌ 用户认证
- ❌ 自定义 Agent 配置

## 成功标准

1. 用户输入消息后能看到 Agent 完整执行过程
2. 每个事件的上下文变化清晰可见
3. Token 使用量实时更新
4. 可以回看任意历史事件
5. 整体流畅无卡顿
