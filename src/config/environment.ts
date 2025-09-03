// Environment configuration for TCG League
// This file centralizes all environment variables and provides type safety

// Environment configuration interface
export interface EnvironmentConfig {
  // DigitalOcean Spaces
  digitalOceanSpaces: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
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
  digitalOceanSpaces: {
    endpoint: 'https://tcg-league-images.fra1.cdn.digitaloceanspaces.com',
    bucket: 'tcg-league-images',
    region: 'fra1',
    accessKeyId: '',
    secretAccessKey: ''
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
    digitalOceanSpaces: {
      endpoint: process.env.VITE_DIGITALOCEAN_SPACES_ENDPOINT || defaultConfig.digitalOceanSpaces.endpoint,
      bucket: process.env.VITE_DIGITALOCEAN_SPACES_BUCKET || defaultConfig.digitalOceanSpaces.bucket,
      region: process.env.VITE_DIGITALOCEAN_SPACES_REGION || defaultConfig.digitalOceanSpaces.region,
      accessKeyId: process.env.VITE_DIGITALOCEAN_SPACES_ACCESS_KEY_ID || defaultConfig.digitalOceanSpaces.accessKeyId,
      secretAccessKey: process.env.VITE_DIGITALOCEAN_SPACES_SECRET_ACCESS_KEY || defaultConfig.digitalOceanSpaces.secretAccessKey
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


