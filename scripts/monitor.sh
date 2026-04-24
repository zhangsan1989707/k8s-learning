#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=========================================="
echo "   K8s Learning 服务状态监控"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; }

# 1. Docker Status
echo "=== Docker 容器状态 ==="
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    docker-compose ps
    echo ""
else
    log_fail "没有运行中的容器"
    echo ""
    exit 1
fi

# 2. Health Check
echo "=== 健康检查 ==="
WEB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' k8s-learning-web-1 2>/dev/null || echo "unknown")
DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' k8s-learning-db-1 2>/dev/null || echo "unknown")

echo "Web 服务: $WEB_HEALTH"
echo "数据库:  $DB_HEALTH"
echo ""

# 3. HTTP Endpoint Check
echo "=== HTTP 服务检查 ==="
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log_ok "Web 服务响应正常"
else
    log_fail "Web 服务无响应"
fi

# API 检查
if curl -sf http://localhost:3000/api/questions > /dev/null 2>&1; then
    QUESTION_COUNT=$(curl -s http://localhost:3000/api/questions | jq '.questions | length' 2>/dev/null || echo "?")
    log_ok "API 服务正常 (题目数: $QUESTION_COUNT)"
else
    log_fail "API 服务异常"
fi
echo ""

# 4. Resource Usage
echo "=== 资源使用情况 ==="
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" k8s-learning-web-1 k8s-learning-db-1 2>/dev/null || echo "无法获取资源统计"
echo ""

# 5. Database Connection
echo "=== 数据库连接检查 ==="
if docker exec k8s-learning-db-1 pg_isready -U k8s_learning > /dev/null 2>&1; then
    log_ok "PostgreSQL 连接正常"
else
    log_fail "PostgreSQL 连接失败"
fi

# Check question count in DB
DB_QUESTION_COUNT=$(docker exec k8s-learning-db-1 psql -U k8s_learning -d k8s_learning -t -c "SELECT COUNT(*) FROM questions;" 2>/dev/null | tr -d ' ' || echo "?")
echo "数据库题目数: $DB_QUESTION_COUNT"
echo ""

# 6. Disk Usage
echo "=== 磁盘使用 ==="
docker volume ls | grep k8s-learning || true
echo ""

# 7. Recent Logs
echo "=== 最近日志 (最后 5 条) ==="
docker-compose logs --tail=5 web 2>/dev/null || echo "无法获取日志"
echo ""

echo "=========================================="
echo "   监控完成"
echo "=========================================="
