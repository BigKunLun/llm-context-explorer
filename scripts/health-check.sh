#!/bin/bash
# health-check.sh — auto-loop 健康评分脚本
# 分数 = TS错误数 * 1000 + 构建产物总大小(KB)
# 分数越低越好；构建失败输出 99999

cd "$(dirname "$0")/.." || exit 1

# 1. 统计 TS 错误数
ts_errors=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || true)

# 2. 尝试构建
build_output=$(npx tsc && npx vite build 2>&1)
if [ $? -ne 0 ]; then
  echo "99999"
  exit 0
fi

# 3. 提取产物总大小 (KB)
bundle_kb=$(echo "$build_output" | grep -oE '[0-9]+\.[0-9]+\s*kB' | awk '{s+=$1}END{printf "%.0f", s+0}')
if [ -z "$bundle_kb" ]; then
  bundle_kb=0
fi

# 4. 计算总分
score=$(( ts_errors * 1000 + bundle_kb ))
echo "$score"
