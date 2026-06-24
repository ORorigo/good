#!/bin/bash
# =====================================================
# 刷题系统 - 一键部署/启动脚本
# =====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}     刷题系统 - 启动/部署工具${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# 检查 Node.js
check_node() {
  if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
  else
    echo -e "${RED}❌ 未找到 Node.js${NC}"
    echo "请从 https://nodejs.org/ 下载安装 LTS 版本"
    exit 1
  fi
}

# 安装依赖
install_deps() {
  echo ""
  echo -e "${YELLOW}📦 安装依赖...${NC}"
  cd server && npm install && cd ..
  cd client && npm install && cd ..
  echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 本地启动
start_local() {
  echo ""
  echo -e "${YELLOW}🚀 启动本地服务...${NC}"
  
  # 启动后端 (使用 JSON 文件数据库)
  cd server
  PORT=3001 node src/index.js &
  SERVER_PID=$!
  cd ..
  
  # 启动前端
  cd client
  npx vite --host --port 5173 &
  CLIENT_PID=$!
  cd ..
  
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}   ✅ 刷题系统已启动!${NC}"
  echo -e "${GREEN}   📖 前端: http://localhost:5173${NC}"
  echo -e "${GREEN}   🔧 后端: http://localhost:3001${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "按 Ctrl+C 停止服务"
  
  trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" SIGINT SIGTERM
  wait
}

case "${1:-local}" in
  local)
    check_node
    install_deps
    start_local
    ;;
  install)
    check_node
    install_deps
    ;;
  start)
    start_local
    ;;
  *)
    echo "用法: ./deploy.sh [local|install|start]"
    exit 1
    ;;
esac
