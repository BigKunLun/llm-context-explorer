# AGNO Context Explorer 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将静态模拟器升级为真实 Agent 可视化工具，接入 AGNO 框架实现实时事件流和上下文可视化。

**Architecture:** Monorepo 结构，frontend (React) + backend (FastAPI + AGNO)，通过 SSE 流式传输事件。后端运行真实 Agent，前端实时捕获并可视化上下文变化。

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind | FastAPI + AGNO + Python 3.11+ | SSE

---

## Task 1: 重构项目结构为 Monorepo

**Files:**
- Move: `src/*` → `frontend/src/*`
- Move: `index.html` → `frontend/index.html`
- Move: `package.json` → `frontend/package.json`
- Move: `vite.config.ts` → `frontend/vite.config.ts`
- Move: `tailwind.config.js` → `frontend/tailwind.config.js`
- Move: `postcss.config.js` → `frontend/postcss.config.js`
- Create: `Makefile`
- Create: `.env.example`
- Create: `README.md` (更新)

**Step 1: 创建 frontend 目录并移动文件**

```bash
mkdir -p frontend
mv src frontend/
mv index.html frontend/
mv package.json frontend/
mv package-lock.json frontend/ 2>/dev/null || true
mv vite.config.ts frontend/
mv tailwind.config.js frontend/
mv postcss.config.js frontend/
mv tsconfig.json frontend/
mv tsconfig.node.json frontend/
mv src frontend/
```

**Step 2: 创建 Makefile**

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

**Step 3: 创建 .env.example**

```env
# .env.example
OPENAI_API_KEY=sk-xxx

# 前端 API 地址（可选，默认 http://localhost:8000）
VITE_API_URL=http://localhost:8000
```

**Step 4: 创建 .gitignore 更新**

```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Build
frontend/dist/
backend/dist/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

**Step 5: Commit**

```bash
git add .
git commit -m "refactor: 重构项目为 monorepo 结构"
```

---

## Task 2: 创建后端基础结构

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/schemas.py`

**Step 1: 创建 requirements.txt**

```txt
# backend/requirements.txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
agno>=0.0.5
pydantic>=2.0.0
python-dotenv>=1.0.0
```

**Step 2: 创建 pyproject.toml**

```toml
# backend/pyproject.toml
[project]
name = "agno-context-explorer-backend"
version = "0.1.0"
description = "AGNO Context Explorer Backend"
requires-python = ">=3.11"

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
```

**Step 3: 创建 app/__init__.py**

```python
# backend/app/__init__.py
```

**Step 4: 创建 schemas.py (Pydantic 模型)**

```python
# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class RunRequest(BaseModel):
    """运行 Agent 请求"""
    message: str

class ContextMessage(BaseModel):
    """上下文消息"""
    role: str
    content: str

class SSEEventData(BaseModel):
    """SSE 事件数据"""
    type: str
    timestamp: int
    context_snapshot: List[ContextMessage] = []
    context_diff: List[ContextMessage] = []
    tokens: Dict[str, int] = {}
    raw_event: Optional[Dict[str, Any]] = None
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: 创建后端基础结构"
```

---

## Task 3: 实现 Mock 工具

**Files:**
- Create: `backend/app/tools.py`

**Step 1: 创建 tools.py**

```python
# backend/app/tools.py
"""Mock 工具定义 - 用于演示 Agent 工具调用"""
from agno.tools import tool
from typing import Dict, Any

@tool
def get_weather(city: str) -> Dict[str, Any]:
    """获取指定城市的天气信息

    Args:
        city: 城市名称，如"北京"、"上海"、"深圳"

    Returns:
        包含温度、天气、湿度等信息的字典
    """
    weather_data = {
        "北京": {"temp": 18, "weather": "多云转晴", "humidity": 55, "wind": "东南风3级"},
        "上海": {"temp": 22, "weather": "晴", "humidity": 65, "wind": "微风"},
        "深圳": {"temp": 26, "weather": "晴", "humidity": 70, "wind": "南风2级"},
        "广州": {"temp": 28, "weather": "多云", "humidity": 75, "wind": "微风"},
    }
    return weather_data.get(city, {"temp": 20, "weather": "晴", "humidity": 60, "wind": "微风"})

@tool
def get_schedule(date: str) -> Dict[str, Any]:
    """获取指定日期的日程安排

    Args:
        date: 日期，如"今天"、"明天" 或具体日期 "2025-03-13"

    Returns:
        包含事件列表的字典
    """
    # Mock 数据
    return {
        "date": date,
        "events": [
            {
                "time": "09:00",
                "title": "晨会",
                "location": "会议室A",
                "duration": "30分钟"
            },
            {
                "time": "14:00",
                "title": "团队户外拓展",
                "location": "奥林匹克森林公园",
                "duration": "3小时"
            }
        ]
    }
```

**Step 2: Commit**

```bash
git add backend/app/tools.py
git commit -m "feat: 添加 Mock 工具（天气 + 日程）"
```

---

## Task 4: 实现 Agent 定义

**Files:**
- Create: `backend/app/agent.py`

**Step 1: 创建 agent.py**

```python
# backend/app/agent.py
"""AGNO Agent 定义"""
import os
from agno.agent import Agent
from agno.models.openai import OpenAIChat

from .tools import get_weather, get_schedule

def create_agent() -> Agent:
    """创建演示 Agent

    Returns:
        配置好的 AGNO Agent 实例
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY 环境变量未设置")

    return Agent(
        name="Demo Agent",
        model=OpenAIChat(
            id="gpt-4o-mini",
            api_key=api_key,
        ),
        instructions="""你是一个智能助手，可以帮助用户完成各种任务。

## 工具使用指南

1. **天气查询**: 当用户询问天气时，使用 get_weather 工具
   - 参数: city (城市名称)
   - 示例: "北京今天天气怎么样？"

2. **日程查询**: 当用户询问日程时，使用 get_schedule 工具
   - 参数: date (日期)
   - 示例: "我今天有什么安排？"

## 回答风格

- 简洁友好
- 如果需要使用工具，先说明意图再调用
- 综合信息给出有价值的建议
""",
        tools=[get_weather, get_schedule],
        markdown=True,
        show_tool_calls=True,
    )
```

**Step 2: Commit**

```bash
git add backend/app/agent.py
git commit -m "feat: 添加 AGNO Agent 定义"
```

---

## Task 5: 实现 SSE 事件生成器（核心）

**Files:**
- Create: `backend/app/events.py`

**Step 1: 创建 events.py**

```python
# backend/app/events.py
"""SSE 事件生成器 - 将 AGNO 事件转换为前端可消费的 SSE 格式"""
import json
import time
import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
from agno.agent import Agent

from .schemas import ContextMessage

def sse_event(event_type: str, data: dict) -> str:
    """格式化 SSE 事件

    Args:
        event_type: 事件类型
        data: 事件数据

    Returns:
        格式化的 SSE 字符串
    """
    return f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

def extract_messages(messages: Optional[List[Any]]) -> List[Dict[str, str]]:
    """从 AGNO 消息中提取上下文

    Args:
        messages: AGNO 消息列表

    Returns:
        标准化的消息字典列表
    """
    if not messages:
        return []

    result = []
    for msg in messages:
        # 获取角色
        role = getattr(msg, 'role', 'unknown')

        # 获取内容
        content = ""
        if hasattr(msg, 'content'):
            content = str(msg.content) if msg.content else ""

        # 处理工具调用
        if role == "assistant" and hasattr(msg, 'tool_calls') and msg.tool_calls:
            for tool_call in msg.tool_calls:
                tool_name = getattr(tool_call.function, 'name', 'unknown')
                tool_args = getattr(tool_call.function, 'arguments', '{}')
                if isinstance(tool_args, dict):
                    tool_args = json.dumps(tool_args, ensure_ascii=False)
                result.append({
                    "role": "tool_call",
                    "content": f"{tool_name}({tool_args})"
                })

        # 添加常规消息
        if content and role != "assistant":
            result.append({
                "role": role,
                "content": content
            })
        elif content and role == "assistant" and not (hasattr(msg, 'tool_calls') and msg.tool_calls):
            result.append({
                "role": role,
                "content": content
            })

    return result

def extract_tokens(event: Any) -> Dict[str, int]:
    """提取 Token 使用信息

    Args:
        event: AGNO 事件对象

    Returns:
        Token 使用统计
    """
    if hasattr(event, 'metrics') and event.metrics:
        input_tokens = getattr(event.metrics, 'input_tokens', 0) or 0
        output_tokens = getattr(event.metrics, 'output_tokens', 0) or 0
        return {
            "used": input_tokens + output_tokens,
            "input": input_tokens,
            "output": output_tokens,
        }

    # 尝试从其他属性获取
    if hasattr(event, 'usage'):
        input_tokens = getattr(event.usage, 'prompt_tokens', 0) or 0
        output_tokens = getattr(event.usage, 'completion_tokens', 0) or 0
        return {
            "used": input_tokens + output_tokens,
            "input": input_tokens,
            "output": output_tokens,
        }

    return {"used": 0, "input": 0, "output": 0}

def serialize_event(event: Any) -> Dict[str, Any]:
    """序列化事件为可传输格式

    Args:
        event: AGNO 事件对象

    Returns:
        可 JSON 序列化的字典
    """
    try:
        if hasattr(event, 'to_dict'):
            return event.to_dict()
        if hasattr(event, 'model_dump'):
            return event.model_dump()

        # 手动提取关键信息
        result = {"event_type": getattr(event, 'event', 'unknown')}
        if hasattr(event, 'content'):
            result["content"] = str(event.content)[:500]  # 限制长度
        return result
    except Exception:
        return {"type": str(type(event))}

def event_generator(agent: Agent, message: str) -> StreamingResponse:
    """生成 SSE 事件流

    Args:
        agent: AGNO Agent 实例
        message: 用户输入消息

    Returns:
        FastAPI StreamingResponse
    """
    async def generate() -> AsyncGenerator[str, None]:
        # 发送运行开始事件
        yield sse_event("run_started", {
            "agent_name": agent.name,
            "timestamp": int(time.time()),
            "context_snapshot": [],
            "context_diff": [],
            "tokens": {"used": 0, "input": 0, "output": 0},
        })

        # 上下文状态追踪
        context_snapshot: List[Dict[str, str]] = []
        last_count = 0
        total_tokens = 0

        try:
            # 运行 Agent 并捕获事件
            run_response = agent.run(message, stream=True)

            for event in run_response:
                # 获取事件类型
                event_type = getattr(event, 'event', None)
                if event_type is None:
                    event_type = type(event).__name__

                # 映射事件类型名称
                event_type_map = {
                    'RunStarted': 'run_started',
                    'RunContent': 'run_content',
                    'RunCompleted': 'run_completed',
                    'ToolCallStarted': 'tool_call_started',
                    'ToolCallCompleted': 'tool_call_completed',
                    'ModelRequestStarted': 'model_request_started',
                    'ModelRequestCompleted': 'model_request_completed',
                    'ReasoningStarted': 'reasoning_started',
                    'ReasoningContentDelta': 'reasoning_content_delta',
                    'ReasoningCompleted': 'reasoning_completed',
                }
                normalized_type = event_type_map.get(event_type, event_type.lower() if event_type else 'unknown')

                # 提取上下文快照
                if hasattr(event, 'messages') and event.messages:
                    context_snapshot = extract_messages(list(event.messages))
                    current_count = len(context_snapshot)
                    context_diff = context_snapshot[last_count:]
                    last_count = current_count
                else:
                    context_diff = []

                # 提取 Token 信息
                tokens = extract_tokens(event)
                total_tokens = max(total_tokens, tokens.get('used', 0))

                # 构建事件数据
                event_data = {
                    "type": normalized_type,
                    "timestamp": int(time.time()),
                    "context_snapshot": context_snapshot,
                    "context_diff": context_diff,
                    "tokens": tokens,
                    "raw_event": serialize_event(event),
                }

                yield sse_event(normalized_type, event_data)

                # 小延迟确保前端有时间处理
                await asyncio.sleep(0.01)

            # 发送运行完成事件
            yield sse_event("run_completed", {
                "timestamp": int(time.time()),
                "final_tokens": total_tokens,
                "context_snapshot": context_snapshot,
            })

        except Exception as e:
            yield sse_event("run_error", {
                "error": str(e),
                "error_type": type(e).__name__,
                "timestamp": int(time.time()),
            })

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
```

**Step 2: Commit**

```bash
git add backend/app/events.py
git commit -m "feat: 添加 SSE 事件生成器（核心）"
```

---

## Task 6: 实现 FastAPI 主入口

**Files:**
- Create: `backend/app/main.py`

**Step 1: 创建 main.py**

```python
# backend/app/main.py
"""FastAPI 主入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from .schemas import RunRequest
from .agent import create_agent
from .events import event_generator

# 加载环境变量
load_dotenv()

app = FastAPI(
    title="AGNO Context Explorer API",
    description="实时可视化 AGNO Agent 上下文变化",
    version="0.1.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    """健康检查端点"""
    return {"status": "ok", "service": "agno-context-explorer"}

@app.post("/api/run")
async def run_agent(request: RunRequest):
    """运行 Agent 并返回 SSE 事件流

    Args:
        request: 包含用户消息的请求体

    Returns:
        SSE 事件流响应
    """
    agent = create_agent()
    return event_generator(agent, request.message)

@app.on_event("startup")
async def startup():
    """应用启动时检查配置"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⚠️  警告: OPENAI_API_KEY 环境变量未设置")
        print("   请复制 .env.example 为 .env 并配置你的 API Key")
```

**Step 2: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: 添加 FastAPI 主入口"
```

---

## Task 7: 更新前端类型定义

**Files:**
- Modify: `frontend/src/types/index.ts`

**Step 1: 重写类型定义**

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
  type: AgnoEventType | string;
  timestamp: number;
  context_snapshot: ContextMessage[];
  context_diff: ContextMessage[];
  tokens: { used: number; input: number; output: number };
  raw_event?: Record<string, unknown>;
  error?: string;
  error_type?: string;
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

**Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: 更新前端类型定义以支持 AGNO 事件"
```

---

## Task 8: 实现 useAgentRun Hook

**Files:**
- Create: `frontend/src/hooks/useAgentRun.ts`

**Step 1: 创建 hooks 目录**

```bash
mkdir -p frontend/src/hooks
```

**Step 2: 创建 useAgentRun.ts**

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
    // 重置状态
    setState(prev => ({
      ...prev,
      status: 'running',
      events: [],
      contextSnapshot: [],
      currentTokens: 0,
      errorMessage: undefined,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEventType = line.substring(7).trim();
          } else if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5));
              const event: SSEEvent = {
                type: currentEventType || data.type || 'unknown',
                ...data,
              };

              setState(prev => processEvent(prev, event));

              // 检查是否是错误事件
              if (event.type === 'run_error') {
                setState(prev => ({
                  ...prev,
                  status: 'error',
                  errorMessage: event.error,
                }));
              }
            } catch {
              // JSON 解析失败，忽略
            }
          }
        }
      }

      // 标记完成
      setState(prev => {
        if (prev.status === 'running') {
          return { ...prev, status: 'completed' };
        }
        return prev;
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : '未知错误',
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

function processEvent(prev: RunState, event: SSEEvent): RunState {
  // 使用事件的上下文快照或保持之前的
  const contextSnapshot = (event.context_snapshot?.length > 0)
    ? event.context_snapshot.map((msg, i) => ({
        ...msg,
        isNew: i >= prev.contextSnapshot.length,
      }))
    : prev.contextSnapshot;

  const currentTokens = event.tokens?.used ?? prev.currentTokens;

  return {
    ...prev,
    events: [...prev.events, event],
    contextSnapshot,
    currentTokens,
    totalTokens: Math.max(prev.totalTokens, currentTokens),
  };
}
```

**Step 3: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat: 添加 useAgentRun Hook"
```

---

## Task 9: 更新 Timeline 组件以支持 SSE 事件

**Files:**
- Modify: `frontend/src/components/Timeline.tsx`

**Step 1: 更新 Timeline.tsx**

```tsx
// frontend/src/components/Timeline.tsx
import type { SSEEvent } from '../types';

const eventTypeStyles: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  'run_started': { bg: 'bg-green-500/20', text: 'text-green-400', icon: '▶️', label: '开始' },
  'model_request_started': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '📡', label: '请求' },
  'model_request_completed': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '✅', label: '请求完成' },
  'reasoning_started': { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '🧠', label: '推理' },
  'reasoning_content_delta': { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '💭', label: '推理中' },
  'reasoning_completed': { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '✅', label: '推理完成' },
  'tool_call_started': { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '⚡', label: '工具调用' },
  'tool_call_completed': { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '✅', label: '工具完成' },
  'run_content': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: '💬', label: '输出' },
  'run_completed': { bg: 'bg-green-500/20', text: 'text-green-400', icon: '✅', label: '完成' },
  'run_error': { bg: 'bg-red-500/20', text: 'text-red-400', icon: '❌', label: '错误' },
};

interface TimelineProps {
  events: SSEEvent[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function Timeline({ events, currentIndex, onSelect }: TimelineProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        📋 事件流 ({events.length})
      </h3>

      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">等待 Agent 运行...</p>
        ) : (
          events.map((event, index) => {
            const style = eventTypeStyles[event.type] || {
              bg: 'bg-gray-500/20',
              text: 'text-gray-400',
              icon: '❓',
              label: event.type
            };
            const isActive = index === currentIndex;

            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${isActive
                    ? 'bg-gray-800 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                    {style.icon} {style.label}
                  </span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>

                {event.tokens?.used > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Tokens: {event.tokens.used}
                    {event.tokens.input > 0 && (
                      <span className="text-gray-600 ml-1">
                        (↑{event.tokens.input}+{event.tokens.output})
                      </span>
                    )}
                  </div>
                )}

                {event.error && (
                  <div className="text-xs text-red-400 mt-1 truncate">
                    {event.error}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/Timeline.tsx
git commit -m "feat: 更新 Timeline 组件以支持 SSE 事件"
```

---

## Task 10: 更新 App 组件

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: 更新 App.tsx**

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
  const displayTokens = state.events[selectedEventIndex]?.tokens || { used: state.currentTokens };

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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                state.status === 'running' ? 'bg-green-500/20 text-green-400 animate-pulse' :
                state.status === 'error' ? 'bg-red-500/20 text-red-400' :
                state.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-700 text-gray-300'
              }`}>
                {state.status === 'running' ? '● 运行中' :
                 state.status === 'completed' ? '✓ 完成' :
                 state.status === 'error' ? '✗ 错误' : '○ 就绪'}
              </span>
              {state.events.length > 0 && (
                <button
                  onClick={reset}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
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

      {/* Error Banner */}
      {state.errorMessage && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="max-w-7xl mx-auto text-red-400 text-sm">
            ❌ {state.errorMessage}
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {state.events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <p className="text-lg mb-2">输入消息开始运行 Agent</p>
            <p className="text-sm text-gray-600">观察上下文变化过程，理解 ReAct 范式</p>
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
                  <pre className="text-sm text-gray-300 overflow-auto max-h-64 font-mono">
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

**Step 2: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: 更新 App 组件以使用 useAgentRun Hook"
```

---

## Task 11: 清理无用文件

**Files:**
- Delete: `frontend/src/data/scenarios.ts`
- Delete: `frontend/src/components/ScenarioSelect.tsx`
- Delete: `frontend/src/components/StepCard.tsx`
- Delete: `frontend/src/components/StepDetail.tsx`

**Step 1: 删除不需要的文件**

```bash
rm -f frontend/src/data/scenarios.ts
rm -f frontend/src/components/ScenarioSelect.tsx
rm -f frontend/src/components/StepCard.tsx
rm -f frontend/src/components/StepDetail.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: 清理不再使用的静态模拟组件"
```

---

## Task 12: 更新 Vite 代理配置

**Files:**
- Modify: `frontend/vite.config.ts`

**Step 1: 更新 vite.config.ts**

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 2: Commit**

```bash
git add frontend/vite.config.ts
git commit -m "feat: 添加 Vite API 代理配置"
```

---

## Task 13: 最终验证与文档

**Step 1: 验证后端启动**

```bash
cd backend && pip install -r requirements.txt
cp ../.env.example ../.env
# 编辑 .env 添加 OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Expected: 后端启动成功，访问 http://localhost:8000/api/health 返回 `{"status": "ok"}`

**Step 2: 验证前端启动**

```bash
cd frontend && npm install && npm run dev
```

Expected: 前端启动成功，访问 http://localhost:5173 显示界面

**Step 3: 端到端测试**

1. 输入 "北京今天天气怎么样？"
2. 点击发送
3. 观察事件流
4. 检查上下文变化
5. 检查 Token 统计

**Step 4: 更新 README**

```markdown
# AGNO Context Explorer

实时可视化 AGNO Agent 上下文变化过程的教育工具。

## 快速开始

1. 安装依赖
   ```bash
   make install
   ```

2. 配置环境变量
   ```bash
   cp .env.example .env
   # 编辑 .env 添加你的 OPENAI_API_KEY
   ```

3. 启动开发服务器
   ```bash
   make dev
   ```

4. 访问 http://localhost:5173

## 功能

- ✅ 真实 AGNO Agent 运行
- ✅ SSE 事件流实时推送
- ✅ 上下文快照可视化
- ✅ Token 使用统计
- ✅ 事件历史回看
```

**Step 5: 最终 Commit**

```bash
git add .
git commit -m "docs: 更新 README，完成 AGNO Context Explorer MVP"
```

---

## 完成清单

- [ ] Task 1: 重构项目结构为 Monorepo
- [ ] Task 2: 创建后端基础结构
- [ ] Task 3: 实现 Mock 工具
- [ ] Task 4: 实现 Agent 定义
- [ ] Task 5: 实现 SSE 事件生成器
- [ ] Task 6: 实现 FastAPI 主入口
- [ ] Task 7: 更新前端类型定义
- [ ] Task 8: 实现 useAgentRun Hook
- [ ] Task 9: 更新 Timeline 组件
- [ ] Task 10: 更新 App 组件
- [ ] Task 11: 清理无用文件
- [ ] Task 12: 更新 Vite 代理配置
- [ ] Task 13: 最终验证与文档
