import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Dropbox API configuration
const DROPBOX_ACCESS_TOKEN = 'YOUR_DROPBOX_ACCESS_TOKEN';
const DROPBOX_FOLDER = '/TCG-Cards'; // Folder in Dropbox

// Function to upload a single image to Dropbox
async function uploadImageToDropbox(imagePath, fileName) {
  try {
    const fileContent = fs.readFileSync(imagePath);
    const dropboxPath = `${DROPBOX_FOLDER}/${fileName}`;
    
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxPath,
          mode: 'add',
          autorename: true,
          mute: false
        })
      },
      body: fileContent
    });

    if (response.ok) {
      const result = await response.json();
      
      // Create a shared link
      const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: result.path_display,
          settings: {
            requested_visibility: 'public',
            audience: 'public',
            access: 'viewer'
          }
        })
      });

      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        const directLink = shareResult.link.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        
        console.log(`✅ Uploaded: ${fileName} (Link: ${directLink})`);
        return {
          name: fileName,
          path: result.path_display,
          link: directLink
        };
      }
    }
    
    console.error(`❌ Failed to upload ${fileName}`);
    return null;
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
        files.push(...getImageFiles(fullPath));
      } else if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(item)) {
        files.push(fullPath);
      }
    });
  }
  
  return files;
}

// Main upload function
async function uploadAllImagesToDropbox() {
  console.log('🚀 Starting image upload to Dropbox...\n');
  
  if (DROPBOX_ACCESS_TOKEN === 'YOUR_DROPBOX_ACCESS_TOKEN') {
    console.log('❌ Please set your Dropbox access token!');
    console.log('📋 How to get Dropbox access token:');
    console.log('1. Go to https://www.dropbox.com/developers/apps');
    console.log('2. Create a new app');
    console.log('3. Generate access token');
    console.log('4. Replace YOUR_DROPBOX_ACCESS_TOKEN with your token');
    return;
  }

  const imageFiles = getImageFiles('./public/images');
  
  if (imageFiles.length === 0) {
    console.log('❌ No image files found in public/images directory');
    return;
  }

  console.log(`📁 Found ${imageFiles.length} image files to upload\n`);

  let successCount = 0;
  let failCount = 0;
  const uploadResults = [];

  // Upload images in batches
  const batchSize = 5;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)}...`);
    
    const promises = batch.map(async (filePath) => {
      const fileName = path.basename(filePath);
      const result = await uploadImageToDropbox(filePath, fileName);
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

    if (i + batchSize < imageFiles.length) {
      console.log('⏳ Waiting 2 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${successCount} images`);
  console.log(`❌ Failed uploads: ${failCount} images`);

  if (successCount > 0) {
    console.log('\n🌐 Example image URLs:');
    uploadResults.slice(0, 3).forEach(result => {
      if (result) {
        console.log(`${result.name}: ${result.link}`);
      }
    });
  }
}

// Run the upload
uploadAllImagesToDropbox().catch(console.error);
