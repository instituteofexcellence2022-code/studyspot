const fs = require('fs');
const path = require('path');

function fixImportPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix various import path issues
    const fixes = [
      // Fix ../services imports in store/slices/ to ../../services
      {
        pattern: /from\s*['"]\.\.\/services\/([^'"]+)['"]/g,
        replacement: "from '../../services/$1'"
      },
      // Fix ../services imports in other folders to ../../services
      {
        pattern: /from\s*['"]\.\.\/services['"]/g,
        replacement: "from '../../services'"
      },
      // Fix ../../services imports in services/ folder to ./serviceName
      {
        pattern: /from\s*['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g,
        replacement: "from './$1'"
      },
      // Fix ../../services imports in services/ folder to ./apiService
      {
        pattern: /from\s*['"]\.\.\/\.\.\/services['"]/g,
        replacement: "from './apiService'"
      }
    ];

    // Determine the correct fix based on file location
    const isInServicesFolder = filePath.includes('src/services/');
    const isInStoreSlicesFolder = filePath.includes('src/store/slices/');
    
    if (isInServicesFolder) {
      // For files in services folder, use relative imports
      if (fixes[2].pattern.test(content)) {
        content = content.replace(fixes[2].pattern, fixes[2].replacement);
        modified = true;
      }
      if (fixes[3].pattern.test(content)) {
        content = content.replace(fixes[3].pattern, fixes[3].replacement);
        modified = true;
      }
    } else if (isInStoreSlicesFolder) {
      // For files in store/slices, use ../../services
      if (fixes[0].pattern.test(content)) {
        content = content.replace(fixes[0].pattern, fixes[0].replacement);
        modified = true;
      }
      if (fixes[1].pattern.test(content)) {
        content = content.replace(fixes[1].pattern, fixes[1].replacement);
        modified = true;
      }
    } else {
      // For other files, use ../../services
      if (fixes[0].pattern.test(content)) {
        content = content.replace(fixes[0].pattern, fixes[0].replacement);
        modified = true;
      }
      if (fixes[1].pattern.test(content)) {
        content = content.replace(fixes[1].pattern, fixes[1].replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed import paths in: ${filePath}`);
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
      if (fixImportPaths(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Start processing
const srcDir = path.join(__dirname, 'src');
console.log('Fixing all import paths...');
const fixedCount = processDirectory(srcDir);
console.log(`Fixed ${fixedCount} files`);







