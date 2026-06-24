#!/bin/bash
# 启动刷题系统后端服务器
# 用法: ./start.sh [port]

PORT=${1:-3001}

# 尝试多个可能的 Node.js 路径
NODE=""
for cmd in /usr/local/bin/node /opt/homebrew/bin/node /usr/bin/node /snap/bin/node; do
  if [ -x "$cmd" ]; then
    NODE="$cmd"
    break
  fi
done

# Fallback to PATH
if [ -z "$NODE" ]; then
  NODE=$(which node 2>/dev/null)
fi

if [ -z "$NODE" ]; then
  echo "❌ 未找到 Node.js，请先安装 Node.js"
  echo "安装方法: https://nodejs.org/ (下载 LTS 版本)"
  exit 1
fi

echo "✅ 使用 Node.js: $($NODE --version)"
echo "🚀 启动服务器 (端口 $PORT)..."

# 确保依赖已安装
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

cd "$(dirname "$0")"
PORT=$PORT $NODE src/index.js
