import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const CREDENTIALS_PATH = './google-credentials.json';

// Folder IDs from your shared folders
const FOLDER_IDS = [
  '1coC37tIihuy4AcfGAJpw-EBqCd-eLCGs', // OP01-OP05, ST01-ST04
  '12Y9o5_LzXtAry6tw042j7Fgk4eyyrmfj', // EB1, EB2, OP6-OP10, ST5-ST20, PRB01
  '13HwWKRkiwZTarPbH4W0A2WhYqYkDWyxr'  // EB02, EB03, OP11-OP13, ST21-ST28, PRB02
];

// Function to authenticate with Google Drive
async function authenticateGoogleDrive() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.log('❌ Google credentials file not found!');
      console.log('📋 How to get Google Drive API credentials:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create a new project or select existing one');
      console.log('3. Enable Google Drive API');
      console.log('4. Create credentials (Service Account)');
      console.log('5. Download JSON and save as google-credentials.json');
      return null;
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES
    });

    const drive = google.drive({ version: 'v3', auth });
    console.log('✅ Google Drive API authenticated successfully!');
    return drive;
  } catch (error) {
    console.error('❌ Error authenticating with Google Drive:', error.message);
    return null;
  }
}

// Function to list all files in a folder recursively
async function listFilesInFolder(drive, folderId, folderName = '') {
  const files = [];
  
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,parents)',
      pageSize: 1000
    });

    for (const file of response.data.files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        // It's a folder, recursively scan it
        const subFiles = await listFilesInFolder(drive, file.id, `${folderName}/${file.name}`);
        files.push(...subFiles);
      } else if (file.mimeType.startsWith('image/')) {
        // It's an image file
        files.push({
          id: file.id,
          name: file.name,
          path: `${folderName}/${file.name}`,
          mimeType: file.mimeType
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning folder ${folderName}:`, error.message);
  }
  
  return files;
}

// Function to generate file ID mapping
function generateFileIdMapping(allFiles) {
  const mapping = {};
  
  allFiles.forEach(file => {
    // Extract card number from filename (e.g., "OP01-001.png" -> "OP01-OP01-001")
    const fileName = path.basename(file.name, path.extname(file.name));
    
    // Try to match common patterns
    if (fileName.match(/^(OP\d+|ST\d+|EB\d+|PRB\d+)-(\d+)$/)) {
      const [setCode, cardNumber] = fileName.split('-');
      const mappingKey = `${setCode}-${setCode}-${cardNumber}`;
      mapping[mappingKey] = file.id;
    } else {
      // Fallback: use filename as is
      mapping[fileName] = file.id;
    }
  });
  
  return mapping;
}

// Main function to scan all folders
async function scanAllFolders() {
  console.log('🔍 Scanning Google Drive folders for card images...\n');
  
  const drive = await authenticateGoogleDrive();
  if (!drive) {
    return;
  }

  const allFiles = [];
  
  for (let i = 0; i < FOLDER_IDS.length; i++) {
    const folderId = FOLDER_IDS[i];
    console.log(`📁 Scanning folder ${i + 1}/${FOLDER_IDS.length} (${folderId})...`);
    
    const files = await listFilesInFolder(drive, folderId, `Folder${i + 1}`);
    allFiles.push(...files);
    
    console.log(`✅ Found ${files.length} files in folder ${i + 1}`);
  }

  console.log(`\n📊 Total files found: ${allFiles.length}`);

  if (allFiles.length > 0) {
    // Generate file ID mapping
    const fileIdMapping = generateFileIdMapping(allFiles);
    
    // Save the mapping to a file
    const mappingContent = `// Google Drive File ID Mapping
// Generated on ${new Date().toISOString()}
// Total files: ${allFiles.length}

export const DRIVE_FILE_IDS = ${JSON.stringify(fileIdMapping, null, 2)};

// Usage in imageService.ts:
// import { DRIVE_FILE_IDS } from './drive-file-ids.js';
// Then replace the getDriveFileIds() method to return DRIVE_FILE_IDS;

// Example URLs:
// https://drive.google.com/uc?export=view&id=${Object.values(fileIdMapping)[0]}
`;

    fs.writeFileSync('./drive-file-ids.js', mappingContent);
    console.log('\n📝 File ID mapping saved to drive-file-ids.js');
    
    // Show some examples
    console.log('\n🌐 Example mappings:');
    const examples = Object.entries(fileIdMapping).slice(0, 5);
    examples.forEach(([key, id]) => {
      console.log(`${key}: ${id}`);
      console.log(`URL: https://drive.google.com/uc?export=view&id=${id}`);
    });
    
    console.log(`\n🎉 Successfully mapped ${Object.keys(fileIdMapping).length} card images!`);
    console.log('🔧 Now update your imageService.ts to use these file IDs!');
  } else {
    console.log('❌ No image files found in the folders');
  }
}

// Run the scan
scanAllFolders().catch(console.error);
