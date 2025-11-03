#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes webpack bundle and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing webpack bundle...\n');

// Check if build directory exists
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Analyze static files
const staticDir = path.join(buildDir, 'static');
if (fs.existsSync(staticDir)) {
  const files = fs.readdirSync(staticDir);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  
  console.log('📦 Bundle Analysis:');
  console.log('==================');
  
  let totalJSSize = 0;
  let totalCSSSize = 0;
  
  jsFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalJSSize += sizeKB;
    
    const status = sizeKB > 250 ? '🔴' : sizeKB > 100 ? '🟡' : '🟢';
    console.log(`${status} ${file}: ${sizeKB}KB`);
  });
  
  cssFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalCSSSize += sizeKB;
    
    const status = sizeKB > 50 ? '🔴' : sizeKB > 20 ? '🟡' : '🟢';
    console.log(`${status} ${file}: ${sizeKB}KB`);
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total JS: ${totalJSSize}KB`);
  console.log(`Total CSS: ${totalCSSSize}KB`);
  console.log(`Total: ${totalJSSize + totalCSSSize}KB`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (totalJSSize > 1000) {
    console.log('🔴 Bundle size is large. Consider:');
    console.log('   - Further code splitting');
    console.log('   - Tree shaking unused code');
    console.log('   - Dynamic imports for heavy components');
  }
  
  if (jsFiles.length > 10) {
    console.log('🟡 Many JS chunks. Consider:');
    console.log('   - Consolidating small chunks');
    console.log('   - Optimizing chunk splitting strategy');
  }
  
  if (totalCSSSize > 100) {
    console.log('🟡 CSS bundle is large. Consider:');
    console.log('   - Purging unused CSS');
    console.log('   - Using CSS-in-JS for dynamic styles');
  }
  
  // Performance score
  const performanceScore = Math.max(0, 100 - (totalJSSize / 10) - (totalCSSSize / 2));
  const scoreColor = performanceScore > 80 ? '🟢' : performanceScore > 60 ? '🟡' : '🔴';
  
  console.log(`\n${scoreColor} Performance Score: ${Math.round(performanceScore)}/100`);
  
} else {
  console.log('❌ Static directory not found in build output');
}

console.log('\n✅ Analysis complete!');


