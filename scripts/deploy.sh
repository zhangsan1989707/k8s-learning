#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== K8s Learning 部署脚本 ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
    log_info "Docker 运行正常"
}

# Pull latest code if git available
update_code() {
    if [ -d ".git" ]; then
        log_info "检查代码更新..."
        git pull origin main 2>/dev/null || log_warn "无法拉取更新，继续使用当前版本"
    fi
}

# Build and start containers
deploy() {
    log_info "正在构建并启动服务..."
    docker-compose up -d --build
    log_info "服务启动中，等待健康检查..."
    sleep 10

    # Wait for web service to be healthy
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps web | grep -q "(healthy)"; then
            log_info "Web 服务健康检查通过"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_warn "健康检查超时，服务可能仍在启动中"
    return 1
}

# Main
check_docker
update_code
deploy

echo ""
log_info "部署完成！"
echo ""
echo "服务状态:"
docker-compose ps
echo ""
echo "访问地址: http://localhost:3000"
