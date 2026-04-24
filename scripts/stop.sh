#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== K8s Learning 停止脚本 ==="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

# Check if any containers are running
if ! docker-compose ps | grep -q "Up"; then
    log_info "没有运行中的服务"
    exit 0
fi

log_info "停止服务..."
docker-compose stop

log_info "服务已停止"
docker-compose ps
