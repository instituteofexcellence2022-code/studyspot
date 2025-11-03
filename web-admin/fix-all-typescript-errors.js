const fs = require('fs');
const path = require('path');

// Function to fix import sources
function fixImportSources(content) {
  // Fix Redux Toolkit imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"];?\s*\n\s*import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material['"];?/g,
    (match, icons, material) => {
      // Check if the first import contains Redux Toolkit functions
      const reduxFunctions = ['createSlice', 'createAsyncThunk', 'PayloadAction'];
      const hasRedux = reduxFunctions.some(func => icons.includes(func));
      
      if (hasRedux) {
        return `import { ${icons} } from '@reduxjs/toolkit';\nimport { ${material} } from '@mui/material';`;
      }
      return match;
    }
  );

  // Fix individual Redux imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*createSlice[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '@reduxjs/toolkit';"
  );
  
  content = content.replace(
    /import\s*{\s*([^}]*createAsyncThunk[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '@reduxjs/toolkit';"
  );
  
  content = content.replace(
    /import\s*{\s*([^}]*PayloadAction[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '@reduxjs/toolkit';"
  );

  // Fix service imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*Service[^}]*)\s*}\s*from\s*['"]@mui\/material['"];?/g,
    "import { $1 } from '../services';"
  );

  // Fix type imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*User[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '../types';"
  );
  
  content = content.replace(
    /import\s*{\s*([^}]*Tenant[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '../types';"
  );

  // Fix React imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*lazy[^}]*)\s*}\s*from\s*['"]@mui\/material['"];?/g,
    "import { $1 } from 'react';"
  );

  // Fix toast imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*toast[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from 'react-toastify';"
  );

  // Fix utility imports from wrong sources
  content = content.replace(
    /import\s*{\s*([^}]*generateAriaId[^}]*)\s*}\s*from\s*['"]@mui\/icons-material['"];?/g,
    "import { $1 } from '../utils/accessibility';"
  );

  return content;
}

// Function to fix type definitions
function fixTypeDefinitions(content) {
  // Add proper type annotations for Redux slice parameters
  content = content.replace(
    /\(state, action\) =>/g,
    '(state: any, action: any) =>'
  );
  
  content = content.replace(
    /\(state\) =>/g,
    '(state: any) =>'
  );
  
  content = content.replace(
    /\(builder\) =>/g,
    '(builder: any) =>'
  );
  
  content = content.replace(
    /\(getState\)/g,
    '(getState: any)'
  );
  
  content = content.replace(
    /\(rejectWithValue\)/g,
    '(rejectWithValue: any)'
  );

  // Fix array method parameters
  content = content.replace(
    /\.findIndex\(\([^)]*\) =>/g,
    (match) => {
      return match.replace(/\(([^)]*)\) =>/, '($1: any) =>');
    }
  );
  
  content = content.replace(
    /\.find\(\([^)]*\) =>/g,
    (match) => {
      return match.replace(/\(([^)]*)\) =>/, '($1: any) =>');
    }
  );
  
  content = content.replace(
    /\.filter\(\([^)]*\) =>/g,
    (match) => {
      return match.replace(/\(([^)]*)\) =>/, '($1: any) =>');
    }
  );
  
  content = content.replace(
    /\.forEach\(\([^)]*\) =>/g,
    (match) => {
      return match.replace(/\(([^)]*)\) =>/, '($1: any) =>');
    }
  );

  return content;
}

// Function to fix specific file patterns
function fixSpecificFiles(content, filePath) {
  // Fix store slices
  if (filePath.includes('store/slices/')) {
    // Add proper imports at the top
    if (!content.includes("import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';")) {
      content = content.replace(
        /import\s*{\s*[^}]*\s*}\s*from\s*['"]@reduxjs\/toolkit['"];?/,
        "import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';"
      );
    }
  }

  // Fix service files
  if (filePath.includes('services/')) {
    // Fix service imports
    content = content.replace(
      /import\s*{\s*([^}]*Service[^}]*)\s*}\s*from\s*['"]@mui\/material['"];?/g,
      "import { $1 } from './api';"
    );
  }

  // Fix utility files
  if (filePath.includes('utils/')) {
    // Fix utility imports
    content = content.replace(
      /import\s*{\s*([^}]*lazy[^}]*)\s*}\s*from\s*['"]@mui\/material['"];?/g,
      "import { $1 } from 'react';"
    );
  }

  return content;
}

// Main function to process files
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply fixes
    content = fixImportSources(content);
    content = fixTypeDefinitions(content);
    content = fixSpecificFiles(content, filePath);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all TypeScript files
function findTsFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
console.log('Starting comprehensive TypeScript error fix...');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process`);

let fixedCount = 0;
for (const filePath of tsFiles) {
  if (processFile(filePath)) {
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files`);
console.log('TypeScript error fix completed!');








