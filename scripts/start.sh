#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== K8s Learning 启动脚本 ==="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check Docker
if ! docker info > /dev/null 2>&1; then
    log_error "Docker 未运行"
    exit 1
fi

# Check if already running
if docker-compose ps | grep -q "Up"; then
    log_info "服务已在运行中"
    docker-compose ps
    exit 0
fi

log_info "启动服务..."
docker-compose up -d

log_info "等待服务启动..."
sleep 5

# Check status
if docker-compose ps | grep -q "Up"; then
    log_info "服务启动成功"
    docker-compose ps
else
    log_error "服务启动失败，请检查日志: docker-compose logs"
    exit 1
fi
