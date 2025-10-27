#!/bin/bash

# StudySpot Enterprise Platform Stop Script
# This script stops all microservices and applications

set -e

echo "🛑 Stopping StudySpot Enterprise Platform..."
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

# Stop a service by PID file
stop_service_by_pid() {
    local service_name=$1
    local pid_file="logs/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            print_status "Stopping $service_name (PID: $pid)..."
            kill $pid
            sleep 2
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                print_warning "Force killing $service_name..."
                kill -9 $pid
            fi
            
            print_success "$service_name stopped"
        else
            print_warning "$service_name was not running"
        fi
        rm -f "$pid_file"
    else
        print_warning "No PID file found for $service_name"
    fi
}

# Stop services by port
stop_service_by_port() {
    local service_name=$1
    local port=$2
    
    local pid=$(lsof -ti :$port)
    if [ -n "$pid" ]; then
        print_status "Stopping $service_name on port $port (PID: $pid)..."
        kill $pid
        sleep 2
        
        # Force kill if still running
        if lsof -ti :$port > /dev/null 2>&1; then
            print_warning "Force killing $service_name..."
            kill -9 $pid
        fi
        
        print_success "$service_name stopped"
    else
        print_warning "$service_name was not running on port $port"
    fi
}

# Stop all Node.js processes
stop_all_node_processes() {
    print_status "Stopping all Node.js processes..."
    
    local node_pids=$(pgrep -f "node.*studyspot" || true)
    if [ -n "$node_pids" ]; then
        echo "$node_pids" | xargs kill
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "node.*studyspot" || true)
        if [ -n "$remaining_pids" ]; then
            print_warning "Force killing remaining Node.js processes..."
            echo "$remaining_pids" | xargs kill -9
        fi
        
        print_success "All Node.js processes stopped"
    else
        print_warning "No Node.js processes found"
    fi
}

# Clean up log files
cleanup_logs() {
    print_status "Cleaning up log files..."
    
    if [ -d "logs" ]; then
        rm -f logs/*.pid
        print_success "PID files cleaned up"
    else
        print_warning "No logs directory found"
    fi
}

# Main execution
main() {
    echo "🛑 Stopping all services..."
    
    # Stop services by PID files
    stop_service_by_pid "api-gateway"
    stop_service_by_pid "crm-service"
    stop_service_by_pid "communication-service"
    stop_service_by_pid "ml-service"
    stop_service_by_pid "web-owner"
    stop_service_by_pid "web-admin"
    
    # Stop services by port (fallback)
    stop_service_by_port "API Gateway" "3000"
    stop_service_by_port "CRM Service" "3005"
    stop_service_by_port "Communication Service" "3006"
    stop_service_by_port "ML Service" "3007"
    stop_service_by_port "Web Owner" "3001"
    stop_service_by_port "Web Admin" "3002"
    
    # Stop any remaining Node.js processes
    stop_all_node_processes
    
    # Clean up
    cleanup_logs
    
    echo ""
    echo "✅ All services stopped successfully!"
    echo "=============================================="
    echo ""
    echo "📝 Next steps:"
    echo "  • Start services:      ./start-services.sh"
    echo "  • View logs:           ls -la logs/"
    echo "  • Check processes:     ps aux | grep node"
    echo "  • Check ports:         lsof -i :3000-3007"
    echo ""
}

# Run main function
main "$@"
