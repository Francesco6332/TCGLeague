import fetch from 'node-fetch';

// Test different account ID formats
const ACCOUNT_IDS = [
  'upQ0aZz0vVT0S5FJrQHp0A', // Account hash from dashboard
  '92a408742a66e97ffc7ec3c4c2ff268f' // Account ID from dashboard
];

const API_TOKEN = 'GbewjOnQAeO6jE-98lutGhMoCakhjqzE4K7C5pRt';

async function testAccount(accountId) {
  console.log(`\n🔍 Testing Account ID: ${accountId}`);
  
  try {
    // Test 1: Get account details
    const accountResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log(`✅ Account found: ${accountData.result.name}`);
      return accountId;
    } else {
      console.log(`❌ Account not found: ${accountResponse.status} ${accountResponse.statusText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error testing account: ${error.message}`);
    return null;
  }
}

async function testImagesAPI(accountId) {
  console.log(`\n🖼️ Testing Images API for Account ID: ${accountId}`);
  
  try {
    // Test 2: List images (this should work if the account has Images enabled)
    const imagesResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      console.log(`✅ Images API working: Found ${imagesData.result.images?.length || 0} images`);
      return true;
    } else {
      const errorData = await imagesResponse.json();
      console.log(`❌ Images API error: ${imagesResponse.status} ${imagesResponse.statusText}`);
      console.log(`Error details:`, errorData);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing Images API: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Cloudflare API connection...\n');
  
  let workingAccountId = null;
  
  // Test both account ID formats
  for (const accountId of ACCOUNT_IDS) {
    const accountWorks = await testAccount(accountId);
    if (accountWorks) {
      workingAccountId = accountId;
      const imagesWorks = await testImagesAPI(accountId);
      if (imagesWorks) {
        console.log(`\n🎉 Success! Use Account ID: ${accountId}`);
        break;
      }
    }
  }
  
  if (!workingAccountId) {
    console.log('\n❌ No working account ID found. Please check:');
    console.log('1. Your API token has the correct permissions');
    console.log('2. Your account has Cloudflare Images enabled');
    console.log('3. The account ID is correct');
  }
}

main().catch(console.error);
