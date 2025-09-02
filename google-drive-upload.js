import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const CREDENTIALS_PATH = './google-credentials.json';

// Function to authenticate with Google Drive
async function authenticateGoogleDrive() {
  try {
    // Check if credentials file exists
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

// Function to upload a single image to Google Drive
async function uploadImageToDrive(drive, imagePath, fileName) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: ['root'] // Upload to root folder
    };

    const media = {
      mimeType: 'image/png',
      body: fs.createReadStream(imagePath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    console.log(`✅ Uploaded: ${fileName} (ID: ${response.data.id})`);
    return {
      id: response.data.id,
      name: response.data.name,
      url: `https://drive.google.com/uc?export=view&id=${response.data.id}`
    };
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

// Function to get all image files from a directory
function getImageFiles(directory) {
  const files = [];
  
  if (fs.existsSync(directory)) {
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively get files from subdirectories
        files.push(...getImageFiles(fullPath));
      } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
        files.push(fullPath);
      }
    });
  }
  
  return files;
}

// Function to generate the file ID mapping
function generateFileIdMapping(uploadResults) {
  const mapping = {};
  
  uploadResults.forEach(result => {
    if (result) {
      const fileName = path.basename(result.name, path.extname(result.name));
      mapping[fileName] = result.id;
    }
  });
  
  return mapping;
}

// Main upload function
async function uploadAllImagesToDrive() {
  console.log('🚀 Starting image upload to Google Drive...\n');
  
  // Authenticate with Google Drive
  const drive = await authenticateGoogleDrive();
  if (!drive) {
    return;
  }

  // Get all image files from public/images directory
  const imageFiles = getImageFiles('./public/images');
  
  if (imageFiles.length === 0) {
    console.log('❌ No image files found in public/images directory');
    return;
  }

  console.log(`📁 Found ${imageFiles.length} image files to upload\n`);

  let successCount = 0;
  let failCount = 0;
  const uploadResults = [];

  // Upload images in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)}...`);
    
    const promises = batch.map(async (filePath) => {
      const fileName = path.basename(filePath);
      const result = await uploadImageToDrive(drive, filePath, fileName);
      return result;
    });

    const results = await Promise.all(promises);
    uploadResults.push(...results);
    
    results.forEach(result => {
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    });

    // Wait a bit between batches to avoid rate limits
    if (i + batchSize < imageFiles.length) {
      console.log('⏳ Waiting 3 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${successCount} images`);
  console.log(`❌ Failed uploads: ${failCount} images`);
  console.log(`📁 Total processed: ${imageFiles.length} images`);

  if (successCount > 0) {
    // Generate file ID mapping
    const fileIdMapping = generateFileIdMapping(uploadResults);
    
    // Save the mapping to a file
    const mappingContent = `// Google Drive File ID Mapping
// Generated on ${new Date().toISOString()}
export const DRIVE_FILE_IDS = ${JSON.stringify(fileIdMapping, null, 2)};

// Usage in imageService.ts:
// import { DRIVE_FILE_IDS } from './drive-file-ids.js';
// Then replace the getDriveFileIds() method to return DRIVE_FILE_IDS;
`;
    
    fs.writeFileSync('./drive-file-ids.js', mappingContent);
    console.log('\n📝 File ID mapping saved to drive-file-ids.js');
    console.log('🔧 Update your imageService.ts to use these file IDs!');
    
    // Show example URLs
    console.log('\n🌐 Example image URLs:');
    uploadResults.slice(0, 3).forEach(result => {
      if (result) {
        console.log(`${result.name}: ${result.url}`);
      }
    });
  }
}

// Run the upload
uploadAllImagesToDrive().catch(console.error);
