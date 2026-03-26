// src/components/ContextViewer.tsx
import { useEffect, useRef } from 'react';
import type { ContextMessage, MessageRole } from '../types';

const roleLabels: Record<MessageRole, { label: string; color: string }> = {
  system: { label: 'System', color: 'bg-gray-600 text-gray-200' },
  user: { label: 'User', color: 'bg-blue-600 text-blue-100' },
  assistant: { label: 'Assistant', color: 'bg-green-600 text-green-100' },
  tool_call: { label: 'Tool Call', color: 'bg-purple-600 text-purple-100' },
  tool_result: { label: 'Tool Result', color: 'bg-amber-600 text-amber-100' },
};

interface ContextViewerProps {
  messages: ContextMessage[];
  /** 新增的消息列表（用于高亮显示） */
  newMessages?: ContextMessage[];
  tokens: { used: number; limit: number };
  /** 是否自动滚动到底部 */
  autoScroll?: boolean;
  /** 是否启用动画 */
  animate?: boolean;
}

export function ContextViewer({
  messages,
  newMessages = [],
  tokens,
  autoScroll = true,
  animate = true,
}: ContextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenPercentage = (tokens.used / tokens.limit) * 100;

  // 检查消息是否为新消息
  const isNewMessage = (msg: ContextMessage) => {
    return newMessages.some(
      (newMsg) => newMsg.role === msg.role && newMsg.content === msg.content
    );
  };

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const scrollToBottom = () => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: animate ? 'smooth' : 'auto',
        });
      };

      // 延迟滚动，确保内容渲染完成
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, autoScroll, animate]);

  return (
    <div>
      {/* Token 统计 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          当前上下文
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Tokens: <span className="text-white font-mono">{tokens.used}</span> / {tokens.limit}
          </span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full token-progress-bar ${
                tokenPercentage > 80 ? 'bg-red-500' : tokenPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div
        ref={containerRef}
        className={`
          bg-gray-800/50 rounded-lg border border-gray-700 divide-y divide-gray-700/50
          ${animate ? 'smooth-scroll' : ''}
        `}
      >
        {messages.map((msg, index) => {
          const roleStyle = roleLabels[msg.role];
          const isNew = isNewMessage(msg);
          return (
            <div
              key={index}
              className={`
                context-message p-3
                ${isNew
                  ? 'is-new bg-blue-500/10 border-l-2 border-blue-500'
                  : 'border-l-2 border-transparent'
                }
                ${!animate ? 'animation-none' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleStyle.color}`}>
                  {roleStyle.label}
                </span>
                {isNew && (
                  <span className={`
                    px-1.5 py-0.5 rounded text-xs bg-blue-500 text-white
                    ${animate ? 'context-message-content' : ''}
                  `}>
                    NEW
                  </span>
                )}
              </div>
              <pre className={`
                text-sm text-gray-300 whitespace-pre-wrap font-mono break-all
                ${animate ? 'context-message-content' : ''}
              `}>
                {msg.content}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}
