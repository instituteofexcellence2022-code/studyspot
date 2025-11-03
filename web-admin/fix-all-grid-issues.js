const fs = require('fs');
const path = require('path');

// Files with Grid issues
const files = [
  'src/pages/credits/AutoTopupPage.tsx',
  'src/pages/quotas/SelfServeUpgradePage.tsx',
  'src/pages/search/ContentScanningPage.tsx',
  'src/pages/search/FileManagementPage.tsx',
  'src/pages/search/SearchEnginePage.tsx'
];

// Fix Grid to Box issues
function fixGridIssues() {
  let totalFixed = 0;
  
  files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        
        // Fix Grid container to Box
        content = content.replace(
          /<Grid\s+container\s+spacing={(\d+)}>/g,
          '<Box sx={{ display: \'flex\', flexWrap: \'wrap\', gap: $1 }}>'
        );
        
        // Fix Grid item to Box
        content = content.replace(
          /<Grid\s+item\s+xs={(\d+)(?:\s+sm={(\d+))?(?:\s+md={(\d+))?(?:\s+lg={(\d+))?}/g,
          '<Box sx={{ flex: 1, minWidth: 0 }}'
        );
        
        // Fix Grid with just xs
        content = content.replace(
          /<Grid\s+xs={(\d+)(?:\s+sm={(\d+))?(?:\s+md={(\d+))?(?:\s+lg={(\d+))?}/g,
          '<Box sx={{ flex: 1, minWidth: 0 }}'
        );
        
        // Fix closing Grid tags
        content = content.replace(/<\/Grid>/g, '</Box>');
        
        if (content !== fs.readFileSync(fullPath, 'utf8')) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ Fixed ${filePath}`);
          totalFixed++;
        }
      } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} files`);
}

// Run the fixes
fixGridIssues();



