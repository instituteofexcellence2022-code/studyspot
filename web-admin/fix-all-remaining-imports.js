const fs = require('fs');
const path = require('path');

function fixAllRemainingImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix various import path issues based on file location
    const isInServicesFolder = filePath.includes('src/services/');
    const isInStoreSlicesFolder = filePath.includes('src/store/slices/');
    const isInPagesFolder = filePath.includes('src/pages/');

    if (isInServicesFolder) {
      // Fix ../../services imports in services/ folder
      if (content.includes("from '../../services'")) {
        content = content.replace(/from\s*['"]\.\.\/\.\.\/services['"]/g, "from './apiService'");
        modified = true;
      }
      if (content.includes("from '../../services/")) {
        content = content.replace(/from\s*['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g, "from './$1'");
        modified = true;
      }
    } else if (isInStoreSlicesFolder) {
      // Fix ../services imports in store/slices/ folder
      if (content.includes("from '../services'")) {
        content = content.replace(/from\s*['"]\.\.\/services['"]/g, "from '../../services'");
        modified = true;
      }
      if (content.includes("from '../services/")) {
        content = content.replace(/from\s*['"]\.\.\/services\/([^'"]+)['"]/g, "from '../../services/$1'");
        modified = true;
      }
    } else if (isInPagesFolder) {
      // Fix ../../services imports in pages/ folder
      if (content.includes("from '../../services'")) {
        content = content.replace(/from\s*['"]\.\.\/\.\.\/services['"]/g, "from '../../services'");
        modified = true;
      }
      if (content.includes("from '../../services/")) {
        content = content.replace(/from\s*['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g, "from '../../services/$1'");
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixedCount += processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixAllRemainingImports(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Start processing
const srcDir = path.join(__dirname, 'src');
console.log('Fixing all remaining imports...');
const fixedCount = processDirectory(srcDir);
console.log(`Fixed ${fixedCount} files`);







