import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Cloudflare Images API configuration
const ACCOUNT_ID = '92a408742a66e97ffc7ec3c4c2ff268f';
const API_TOKEN = 'GbewjOnQAeO6jE-98lutGhMoCakhjqzE4K7C5pRt'; // You'll need to get this from Cloudflare

// Function to upload a single image
async function uploadImage(imagePath, imageId) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('id', imageId);

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Uploaded: ${imageId}`);
      return result.result.id;
    } else {
      console.error(`❌ Failed to upload ${imageId}:`, result.errors);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error uploading ${imageId}:`, error.message);
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

// Main upload function
async function uploadAllImages() {
  console.log('🚀 Starting image upload to Cloudflare Images...\n');
  
  // Check if API token is set
  if (API_TOKEN === 'YOUR_API_TOKEN_HERE') {
    console.log('❌ Please set your Cloudflare API token in the script');
    console.log('📋 How to get your API token:');
    console.log('1. Go to https://dash.cloudflare.com/profile/api-tokens');
    console.log('2. Create a new token with "Cloudflare Images:Edit" permissions');
    console.log('3. Replace YOUR_API_TOKEN_HERE with your actual token');
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

  // Upload images in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)}...`);
    
    const promises = batch.map(async (filePath) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const imageId = fileName; // Use filename as image ID
      
      const result = await uploadImage(filePath, imageId);
      return { filePath, imageId, success: !!result };
    });

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    // Wait a bit between batches to avoid rate limits
    if (i + batchSize < imageFiles.length) {
      console.log('⏳ Waiting 2 seconds before next batch...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${successCount} images`);
  console.log(`❌ Failed uploads: ${failCount} images`);
  console.log(`📁 Total processed: ${imageFiles.length} images`);
  
  if (successCount > 0) {
    console.log('\n🎉 Your images are now available at:');
    console.log(`https://imagedelivery.net/${ACCOUNT_ID}/<image_id>/public`);
  }
}

// Run the upload
uploadAllImages().catch(console.error);
