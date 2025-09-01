# Deployment Guide for TCG League

## Prerequisites

1. **Firebase Project Setup**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable the following services:
     - Authentication (Email/Password)
     - Firestore Database
     - Storage

2. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com)
   - Connect your GitHub account

## Firebase Configuration

### 1. Authentication Setup
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Configure authorized domains (add your Vercel domain)

### 2. Firestore Database Setup
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Set up security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events are readable by all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.storeId == request.auth.uid || 
         !exists(/databases/$(database)/documents/events/$(eventId)));
    }
    
    // Decks are private to users
    match /decks/{deckId} {
      allow read, write: if request.auth != null && 
        resource.data.playerId == request.auth.uid;
    }
  }
}
\`\`\`

### 3. Storage Setup
1. Go to Firebase Console → Storage
2. Set up storage rules:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

### 4. Get Firebase Config
1. Go to Project Settings → General
2. Add a web app
3. Copy the Firebase configuration object

## Environment Variables

Create a \`.env\` file in your project root:

\`\`\`env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

🔒 **SECURITY WARNING**: 
- **NEVER commit the `.env` file to Git**
- The `.env` file is already in `.gitignore` for your protection
- For production, set environment variables in your hosting platform (Vercel/Netlify)
- Use `env.example` as a template for other developers

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to Vercel Dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`dist\`
   - **Install Command**: \`npm install\`

6. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all Firebase environment variables

7. Deploy the project

### Option 2: Vercel CLI

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Login to Vercel:
\`\`\`bash
vercel login
\`\`\`

3. Deploy:
\`\`\`bash
vercel --prod
\`\`\`

## Post-Deployment Setup

### 1. Update Firebase Auth Domains
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to authorized domains
3. Add your custom domain if using one

### 2. Test the Application
1. Visit your deployed URL
2. Test user registration (both player and store)
3. Test login functionality
4. Verify Firebase integration

### 3. Monitor and Debug
1. Check Vercel Function logs
2. Monitor Firebase usage
3. Set up error tracking (optional)

## Custom Domain (Optional)

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings
4. Update Firebase authorized domains

## Performance Optimization

1. **Enable Vercel Analytics**:
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Optimize Images**:
   - Use Vercel Image Optimization
   - Compress avatars and card images

3. **Enable Caching**:
   - Configure appropriate cache headers
   - Use Vercel Edge Network

## Security Checklist

- ✅ Firebase security rules configured
- ✅ Environment variables set
- ✅ No sensitive data in repository
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Auth domains configured
- ✅ Input validation on forms

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Check environment variables
   - Verify Firebase config
   - Check authorized domains

2. **Build Failures**:
   - Check TypeScript errors
   - Verify all dependencies
   - Check build logs

3. **Authentication Issues**:
   - Verify auth providers enabled
   - Check authorized domains
   - Test locally first

### Getting Help

1. Check Vercel deployment logs
2. Check Firebase console for errors
3. Review browser console for client errors
4. Check GitHub issues for similar problems

## Maintenance

### Regular Tasks
- Monitor Firebase usage and costs
- Update dependencies regularly
- Review security rules
- Monitor application performance
- Backup Firestore data

### Scaling Considerations
- Firestore has generous free tier
- Monitor authentication usage
- Consider upgrading Firebase plan as needed
- Use Vercel Pro for team features
