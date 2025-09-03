// Environment configuration for TCG League
// This file centralizes all environment variables and provides type safety

// Storage provider types
export const STORAGE_PROVIDERS = {
  GITHUB: 'github',
  DIGITALOCEAN_SPACES: 'digitalocean_spaces',
  CLOUDFLARE_R2: 'cloudflare_r2',
  AWS_S3: 'aws_s3',
  AZURE_BLOB: 'azure_blob'
} as const;

export type StorageProvider = typeof STORAGE_PROVIDERS[keyof typeof STORAGE_PROVIDERS];

// Environment configuration interface
export interface EnvironmentConfig {
  // Storage Provider
  storageProvider: StorageProvider;
  
  // DigitalOcean Spaces
  digitalOceanSpaces: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  
  // Cloudflare R2
  cloudflareR2: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  
  // AWS S3
  awsS3: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  
  // Azure Blob Storage
  azureBlob: {
    account: string;
    container: string;
    accessKey: string;
  };
  
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  storageProvider: STORAGE_PROVIDERS.DIGITALOCEAN_SPACES,
  
  digitalOceanSpaces: {
    endpoint: '',
    bucket: 'tcg-league-images',
    region: 'nyc3',
    accessKeyId: '',
    secretAccessKey: ''
  },
  
  cloudflareR2: {
    endpoint: '',
    bucket: 'tcg-league-images',
    region: 'auto',
    accessKeyId: '',
    secretAccessKey: ''
  },
  
  awsS3: {
    bucket: 'tcg-league-images',
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: ''
  },
  
  azureBlob: {
    account: '',
    container: 'tcg-league-images',
    accessKey: ''
  },
  
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  }
};

// Load environment variables
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    storageProvider: (process.env.VITE_STORAGE_PROVIDER as StorageProvider) || defaultConfig.storageProvider,
    
    digitalOceanSpaces: {
      endpoint: process.env.VITE_DIGITALOCEAN_SPACES_ENDPOINT || defaultConfig.digitalOceanSpaces.endpoint,
      bucket: process.env.VITE_DIGITALOCEAN_SPACES_BUCKET || defaultConfig.digitalOceanSpaces.bucket,
      region: process.env.VITE_DIGITALOCEAN_SPACES_REGION || defaultConfig.digitalOceanSpaces.region,
      accessKeyId: process.env.VITE_DIGITALOCEAN_SPACES_ACCESS_KEY_ID || defaultConfig.digitalOceanSpaces.accessKeyId,
      secretAccessKey: process.env.VITE_DIGITALOCEAN_SPACES_SECRET_ACCESS_KEY || defaultConfig.digitalOceanSpaces.secretAccessKey
    },
    
    cloudflareR2: {
      endpoint: process.env.VITE_CLOUDFLARE_R2_ENDPOINT || defaultConfig.cloudflareR2.endpoint,
      bucket: process.env.VITE_CLOUDFLARE_R2_BUCKET || defaultConfig.cloudflareR2.bucket,
      region: process.env.VITE_CLOUDFLARE_R2_REGION || defaultConfig.cloudflareR2.region,
      accessKeyId: process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || defaultConfig.cloudflareR2.accessKeyId,
      secretAccessKey: process.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || defaultConfig.cloudflareR2.secretAccessKey
    },
    
    awsS3: {
      bucket: process.env.VITE_AWS_S3_BUCKET || defaultConfig.awsS3.bucket,
      region: process.env.VITE_AWS_S3_REGION || defaultConfig.awsS3.region,
      accessKeyId: process.env.VITE_AWS_S3_ACCESS_KEY_ID || defaultConfig.awsS3.accessKeyId,
      secretAccessKey: process.env.VITE_AWS_S3_SECRET_ACCESS_KEY || defaultConfig.awsS3.secretAccessKey
    },
    
    azureBlob: {
      account: process.env.VITE_AZURE_STORAGE_ACCOUNT || defaultConfig.azureBlob.account,
      container: process.env.VITE_AZURE_STORAGE_CONTAINER || defaultConfig.azureBlob.container,
      accessKey: process.env.VITE_AZURE_STORAGE_ACCESS_KEY || defaultConfig.azureBlob.accessKey
    },
    
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY || defaultConfig.firebase.apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.firebase.authDomain,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.firebase.projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.firebase.storageBucket,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.firebase.messagingSenderId,
      appId: process.env.VITE_FIREBASE_APP_ID || defaultConfig.firebase.appId
    }
  };
}

// Export the loaded configuration
export const envConfig = loadEnvironmentConfig();

// Helper functions
export function isStorageProviderConfigured(provider: StorageProvider): boolean {
  switch (provider) {
    case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES:
      return !!(envConfig.digitalOceanSpaces.endpoint && envConfig.digitalOceanSpaces.accessKeyId);
    case STORAGE_PROVIDERS.CLOUDFLARE_R2:
      return !!(envConfig.cloudflareR2.endpoint && envConfig.cloudflareR2.accessKeyId);
    case STORAGE_PROVIDERS.AWS_S3:
      return !!(envConfig.awsS3.accessKeyId && envConfig.awsS3.secretAccessKey);
    case STORAGE_PROVIDERS.AZURE_BLOB:
      return !!(envConfig.azureBlob.account && envConfig.azureBlob.accessKey);
    case STORAGE_PROVIDERS.GITHUB:
    default:
      return true; // GitHub doesn't need configuration
  }
}

export function getStorageProviderInfo(provider: StorageProvider) {
  switch (provider) {
    case STORAGE_PROVIDERS.DIGITALOCEAN_SPACES:
      return {
        name: 'DigitalOcean Spaces',
        isFree: false,
        storageLimit: '250GB',
        cost: '$5/month for 250GB + 1TB transfer',
        configured: isStorageProviderConfigured(provider)
      };
    case STORAGE_PROVIDERS.CLOUDFLARE_R2:
      return {
        name: 'Cloudflare R2',
        isFree: true,
        storageLimit: '10GB',
        cost: 'Free tier: 10GB + 1M operations/month',
        configured: isStorageProviderConfigured(provider)
      };
    case STORAGE_PROVIDERS.AWS_S3:
      return {
        name: 'AWS S3',
        isFree: true,
        storageLimit: '5GB',
        cost: 'Free tier: 5GB + 20K requests/month for 12 months',
        configured: isStorageProviderConfigured(provider)
      };
    case STORAGE_PROVIDERS.AZURE_BLOB:
      return {
        name: 'Azure Blob Storage',
        isFree: true,
        storageLimit: '5GB',
        cost: 'Free tier: 5GB + 20K operations/month',
        configured: isStorageProviderConfigured(provider)
      };
    case STORAGE_PROVIDERS.GITHUB:
    default:
      return {
        name: 'GitHub Releases',
        isFree: true,
        storageLimit: 'Unlimited',
        cost: 'Free for public repositories',
        configured: true
      };
  }
}
