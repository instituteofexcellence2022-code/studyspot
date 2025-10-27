#!/bin/bash

# StudySpot Enterprise Platform Startup Script
# This script starts all microservices and applications

set -e

echo "🚀 Starting StudySpot Enterprise Platform..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
}

# Check if Redis is running
check_redis() {
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis CLI not found. Please install Redis."
        return 1
    fi
    
    if ! redis-cli ping &> /dev/null; then
        print_warning "Redis is not running. Please start Redis first."
        return 1
    fi
    
    print_success "Redis is running"
    return 0
}

# Check if PostgreSQL is running
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL CLI not found. Please install PostgreSQL."
        return 1
    fi
    
    if ! pg_isready &> /dev/null; then
        print_warning "PostgreSQL is not running. Please start PostgreSQL first."
        return 1
    fi
    
    print_success "PostgreSQL is running"
    return 0
}

# Install dependencies for a service
install_dependencies() {
    local service_name=$1
    local service_path=$2
    
    print_status "Installing dependencies for $service_name..."
    
    if [ -d "$service_path" ]; then
        cd "$service_path"
        if [ -f "package.json" ]; then
            npm install
            print_success "Dependencies installed for $service_name"
        else
            print_warning "No package.json found in $service_path"
        fi
        cd - > /dev/null
    else
        print_warning "Directory $service_path not found"
    fi
}

# Start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local command=$4
    
    print_status "Starting $service_name on port $port..."
    
    if [ -d "$service_path" ]; then
        cd "$service_path"
        if [ -f "package.json" ]; then
            # Check if port is available
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
                print_warning "Port $port is already in use. Skipping $service_name"
                cd - > /dev/null
                return 1
            fi
            
            # Start service in background
            if [ -n "$command" ]; then
                npm run $command > "../logs/$service_name.log" 2>&1 &
            else
                npm start > "../logs/$service_name.log" 2>&1 &
            fi
            
            SERVICE_PID=$!
            echo $SERVICE_PID > "../logs/$service_name.pid"
            print_success "$service_name started with PID $SERVICE_PID"
        else
            print_warning "No package.json found in $service_path"
        fi
        cd - > /dev/null
    else
        print_warning "Directory $service_path not found"
    fi
}

# Wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Main execution
main() {
    echo "🔍 Checking prerequisites..."
    check_node
    check_npm
    check_redis
    check_postgres
    
    echo ""
    echo "📦 Installing dependencies..."
    
    # Create logs directory
    mkdir -p logs
    
    # Install dependencies for all services
    install_dependencies "API Gateway" "apps/api-gateway"
    install_dependencies "CRM Service" "apps/crm-service"
    install_dependencies "Communication Service" "apps/communication-service"
    install_dependencies "ML Service" "apps/ml-service"
    install_dependencies "AI Service" "apps/ai-service"
    install_dependencies "Analytics Service" "apps/analytics-service"
    install_dependencies "Data Pipeline" "apps/data-pipeline"
    install_dependencies "Automation Service" "apps/automation-service"
    install_dependencies "Security Service" "apps/security-service"
    install_dependencies "Face Recognition Service" "apps/face-recognition-service"
    install_dependencies "QR Service" "apps/qr-service"
    install_dependencies "Notification Service" "apps/notification-service"
    install_dependencies "Payment Service" "apps/payment-service"
    install_dependencies "Subscription Service" "apps/subscription-service"
    install_dependencies "Monitoring Service" "apps/monitoring-service"
    install_dependencies "Social Media Service" "apps/social-media-service"
    install_dependencies "Content Generation Service" "apps/content-generation-service"
    install_dependencies "Engagement Service" "apps/engagement-service"
    install_dependencies "Social Analytics Service" "apps/social-analytics-service"
    install_dependencies "Scheduling Service" "apps/scheduling-service"
    install_dependencies "Ticket Management Service" "apps/ticket-management-service"
    install_dependencies "Lead Conversion Service" "apps/lead-conversion-service"
    install_dependencies "Tenant Management Service" "apps/tenant-management-service"
    install_dependencies "Web Owner" "web-owner"
    install_dependencies "Web Admin" "web-admin"
    install_dependencies "Mobile App" "mobile"
    
    echo ""
    echo "🚀 Starting services..."
    
    # Start services in order
    start_service "API Gateway" "apps/api-gateway" "3004" "dev"
    start_service "CRM Service" "apps/crm-service" "3005" "dev"
    start_service "Communication Service" "apps/communication-service" "3006" "dev"
    start_service "ML Service" "apps/ml-service" "3007" "dev"
    start_service "AI Service" "apps/ai-service" "3008" "dev"
    start_service "Analytics Service" "apps/analytics-service" "3009" "dev"
    start_service "Data Pipeline" "apps/data-pipeline" "3010" "dev"
    start_service "Automation Service" "apps/automation-service" "3011" "dev"
    start_service "Security Service" "apps/security-service" "3012" "dev"
    start_service "Face Recognition Service" "apps/face-recognition-service" "3013" "dev"
    start_service "QR Service" "apps/qr-service" "3014" "dev"
    start_service "Notification Service" "apps/notification-service" "3015" "dev"
    start_service "Payment Service" "apps/payment-service" "3016" "dev"
    start_service "Subscription Service" "apps/subscription-service" "3017" "dev"
    start_service "Monitoring Service" "apps/monitoring-service" "3018" "dev"
    start_service "Social Media Service" "apps/social-media-service" "3019" "dev"
    start_service "Content Generation Service" "apps/content-generation-service" "3020" "dev"
    start_service "Engagement Service" "apps/engagement-service" "3021" "dev"
    start_service "Social Analytics Service" "apps/social-analytics-service" "3022" "dev"
    start_service "Scheduling Service" "apps/scheduling-service" "3023" "dev"
    start_service "Ticket Management Service" "apps/ticket-management-service" "3024" "dev"
    start_service "Lead Conversion Service" "apps/lead-conversion-service" "3025" "dev"
    start_service "Tenant Management Service" "apps/tenant-management-service" "3026" "dev"
    start_service "Web Owner" "web-owner" "3001" "start"
    start_service "Web Admin" "web-admin" "3002" "start"
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    
    # Wait for services to be ready
    wait_for_service "API Gateway" "3004"
    wait_for_service "CRM Service" "3005"
    wait_for_service "Communication Service" "3006"
    wait_for_service "ML Service" "3007"
    wait_for_service "AI Service" "3008"
    wait_for_service "Analytics Service" "3009"
    wait_for_service "Data Pipeline" "3010"
    wait_for_service "Automation Service" "3011"
    wait_for_service "Security Service" "3012"
    wait_for_service "Face Recognition Service" "3013"
    wait_for_service "QR Service" "3014"
    wait_for_service "Notification Service" "3015"
    wait_for_service "Payment Service" "3016"
    wait_for_service "Subscription Service" "3017"
    wait_for_service "Monitoring Service" "3018"
    wait_for_service "Social Media Service" "3019"
    wait_for_service "Content Generation Service" "3020"
    wait_for_service "Engagement Service" "3021"
    wait_for_service "Social Analytics Service" "3022"
    wait_for_service "Scheduling Service" "3023"
    wait_for_service "Ticket Management Service" "3024"
    wait_for_service "Lead Conversion Service" "3025"
    wait_for_service "Tenant Management Service" "3026"
    wait_for_service "Web Owner" "3001"
    wait_for_service "Web Admin" "3002"
    
    echo ""
    echo "🎉 StudySpot Enterprise Platform is running!"
    echo "=============================================="
    echo ""
    echo "📱 Applications:"
    echo "  • Web Owner Portal:    http://localhost:3001"
    echo "  • Web Admin Portal:    http://localhost:3002"
    echo "  • Mobile App:          http://localhost:3003"
    echo ""
    echo "🔧 Services:"
    echo "  • API Gateway:         http://localhost:3004"
    echo "  • CRM Service:        http://localhost:3005"
    echo "  • Communication:      http://localhost:3006"
    echo "  • ML Service:         http://localhost:3007"
    echo "  • AI Service:         http://localhost:3008"
    echo "  • Analytics Service:  http://localhost:3009"
    echo "  • Data Pipeline:      http://localhost:3010"
    echo "  • Automation Service: http://localhost:3011"
    echo "  • Security Service:   http://localhost:3012"
    echo "  • Face Recognition:   http://localhost:3013"
    echo "  • QR Service:         http://localhost:3014"
    echo "  • Notification:      http://localhost:3015"
    echo "  • Payment Service:    http://localhost:3016"
    echo "  • Subscription:       http://localhost:3017"
    echo "  • Monitoring:         http://localhost:3018"
    echo "  • Social Media:       http://localhost:3019"
    echo "  • Content Generation: http://localhost:3020"
    echo "  • Engagement:         http://localhost:3021"
    echo "  • Social Analytics:   http://localhost:3022"
    echo "  • Scheduling:         http://localhost:3023"
    echo "  • Ticket Management:   http://localhost:3024"
    echo "  • Lead Conversion:     http://localhost:3025"
    echo "  • Tenant Management:   http://localhost:3026"
    echo ""
    echo "📊 Health Checks:"
    echo "  • API Gateway:         http://localhost:3004/health"
    echo "  • CRM Service:         http://localhost:3005/health"
    echo "  • Communication:       http://localhost:3006/health"
    echo "  • ML Service:          http://localhost:3007/health"
    echo "  • AI Service:          http://localhost:3008/health"
    echo "  • Analytics Service:   http://localhost:3009/health"
    echo "  • Data Pipeline:       http://localhost:3010/health"
    echo "  • Automation Service:  http://localhost:3011/health"
    echo "  • Security Service:    http://localhost:3012/health"
    echo "  • Face Recognition:   http://localhost:3013/health"
    echo "  • QR Service:         http://localhost:3014/health"
    echo "  • Notification:       http://localhost:3015/health"
    echo "  • Payment Service:     http://localhost:3016/health"
    echo "  • Subscription:       http://localhost:3017/health"
    echo "  • Monitoring:         http://localhost:3018/health"
    echo "  • Social Media:       http://localhost:3019/health"
    echo "  • Content Generation: http://localhost:3020/health"
    echo "  • Engagement:         http://localhost:3021/health"
    echo "  • Social Analytics:   http://localhost:3022/health"
    echo "  • Scheduling:         http://localhost:3023/health"
    echo "  • Ticket Management:  http://localhost:3024/health"
    echo "  • Lead Conversion:    http://localhost:3025/health"
    echo "  • Tenant Management:  http://localhost:3026/health"
    echo ""
    echo "📝 Logs:"
    echo "  • View logs:           tail -f logs/*.log"
    echo "  • Stop services:       ./stop-services.sh"
    echo ""
    echo "🔍 Monitoring:"
    echo "  • Service status:      ps aux | grep node"
    echo "  • Port usage:          lsof -i :3001-3026"
    echo ""
    
    # Keep script running
    print_status "Press Ctrl+C to stop all services"
    
    # Trap Ctrl+C to stop all services
    trap 'echo ""; print_status "Stopping all services..."; ./stop-services.sh; exit 0' INT
    
    # Wait indefinitely
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
