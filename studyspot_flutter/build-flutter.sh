#!/bin/bash

# StudySpot Flutter App - Complete Cross-Platform Build Script
echo "🚀 STUDYSPOT FLUTTER APP - COMPLETE CROSS-PLATFORM BUILD"
echo "========================================================"

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

# Check if Flutter is installed
check_flutter() {
    print_status "Checking Flutter installation..."
    if ! command -v flutter &> /dev/null; then
        print_error "Flutter is not installed. Please install Flutter first."
        print_status "Visit: https://flutter.dev/docs/get-started/install"
        exit 1
    fi
    
    flutter --version
    print_success "Flutter is installed"
}

# Check Flutter doctor
check_flutter_doctor() {
    print_status "Running Flutter doctor..."
    flutter doctor
    
    print_warning "Please ensure all required dependencies are installed before proceeding."
    read -p "Do you want to continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Build cancelled by user"
        exit 0
    fi
}

# Clean and get dependencies
setup_project() {
    print_status "Setting up project..."
    
    # Navigate to Flutter project directory
    cd studyspot_flutter
    
    # Clean project
    print_status "Cleaning project..."
    flutter clean
    
    # Get dependencies
    print_status "Getting dependencies..."
    flutter pub get
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Build for Android
build_android() {
    print_status "Building Android APK..."
    
    # Check if Android SDK is available
    if ! flutter doctor | grep -q "Android toolchain"; then
        print_warning "Android toolchain not found. Skipping Android build."
        return 1
    fi
    
    # Build debug APK
    print_status "Building debug APK..."
    flutter build apk --debug
    
    if [ $? -eq 0 ]; then
        print_success "Debug APK built successfully"
        print_status "APK location: build/app/outputs/flutter-apk/app-debug.apk"
    else
        print_error "Failed to build debug APK"
        return 1
    fi
    
    # Build release APK
    print_status "Building release APK..."
    flutter build apk --release
    
    if [ $? -eq 0 ]; then
        print_success "Release APK built successfully"
        print_status "APK location: build/app/outputs/flutter-apk/app-release.apk"
    else
        print_error "Failed to build release APK"
        return 1
    fi
}

# Build for iOS
build_ios() {
    print_status "Building iOS app..."
    
    # Check if iOS toolchain is available
    if ! flutter doctor | grep -q "iOS toolchain"; then
        print_warning "iOS toolchain not found. Skipping iOS build."
        return 1
    fi
    
    # Build iOS app
    print_status "Building iOS app..."
    flutter build ios --release --no-codesign
    
    if [ $? -eq 0 ]; then
        print_success "iOS app built successfully"
        print_status "iOS app location: build/ios/iphoneos/Runner.app"
    else
        print_error "Failed to build iOS app"
        return 1
    fi
}

# Build for Web
build_web() {
    print_status "Building web app..."
    
    # Build web app
    flutter build web
    
    if [ $? -eq 0 ]; then
        print_success "Web app built successfully"
        print_status "Web app location: build/web/"
    else
        print_error "Failed to build web app"
        return 1
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    flutter test
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed"
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Analyze code
analyze_code() {
    print_status "Analyzing code..."
    
    flutter analyze
    
    if [ $? -eq 0 ]; then
        print_success "Code analysis completed successfully"
    else
        print_warning "Code analysis found issues"
    fi
}

# Generate app bundle
generate_bundle() {
    print_status "Generating app bundle..."
    
    # Android App Bundle
    if flutter doctor | grep -q "Android toolchain"; then
        print_status "Generating Android App Bundle..."
        flutter build appbundle --release
        
        if [ $? -eq 0 ]; then
            print_success "Android App Bundle generated successfully"
            print_status "Bundle location: build/app/outputs/bundle/release/app-release.aab"
        else
            print_error "Failed to generate Android App Bundle"
        fi
    fi
}

# Main build function
main_build() {
    print_status "Starting comprehensive build process..."
    
    # Check Flutter installation
    check_flutter
    
    # Check Flutter doctor
    check_flutter_doctor
    
    # Setup project
    setup_project
    
    # Analyze code
    analyze_code
    
    # Run tests
    run_tests
    
    # Build for different platforms
    print_status "Building for multiple platforms..."
    
    # Android build
    if build_android; then
        print_success "Android build completed"
    else
        print_warning "Android build failed or skipped"
    fi
    
    # iOS build
    if build_ios; then
        print_success "iOS build completed"
    else
        print_warning "iOS build failed or skipped"
    fi
    
    # Web build
    if build_web; then
        print_success "Web build completed"
    else
        print_warning "Web build failed"
    fi
    
    # Generate bundle
    generate_bundle
    
    print_success "Build process completed!"
    print_status "Check the build/ directory for output files"
}

# Show help
show_help() {
    echo "StudySpot Flutter Build Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all       Build for all platforms (default)"
    echo "  android   Build only for Android"
    echo "  ios       Build only for iOS"
    echo "  web       Build only for Web"
    echo "  test      Run tests only"
    echo "  analyze   Analyze code only"
    echo "  clean     Clean project only"
    echo "  help      Show this help message"
    echo ""
}

# Parse command line arguments
case "${1:-all}" in
    "all")
        main_build
        ;;
    "android")
        check_flutter
        setup_project
        build_android
        ;;
    "ios")
        check_flutter
        setup_project
        build_ios
        ;;
    "web")
        check_flutter
        setup_project
        build_web
        ;;
    "test")
        check_flutter
        setup_project
        run_tests
        ;;
    "analyze")
        check_flutter
        setup_project
        analyze_code
        ;;
    "clean")
        check_flutter
        cd studyspot_flutter
        flutter clean
        print_success "Project cleaned"
        ;;
    "help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

echo ""
print_success "Script execution completed!"
echo "========================================================"











