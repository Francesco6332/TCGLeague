# TCG League - One Piece Card Game Tournament Platform

A modern, feature-rich tournament management platform for One Piece TCG, similar to Bandai TCG+. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

### 🎮 Dual User Types
- **Players**: Join events, track standings, build decks
- **Stores**: Create leagues, manage tournaments, update results

### 🏆 Tournament Management
- Create and organize tournaments
- Real-time standings and match results
- Multiple tournament formats (Standard, Limited, Championship)
- Participant management

### 🃏 Deck Builder
- Build and manage One Piece TCG decks
- Import/export deck lists
- Visual deck builder interface
- Leader and card database integration

### 📱 Modern UI/UX
- Responsive design for all devices
- Dark theme with nerdy, fancy styling
- Smooth animations and transitions
- Glass morphism effects

### 🔐 Secure Authentication
- Firebase Authentication
- Encrypted password storage
- User profile management
- Bandai Membership ID integration

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 16+ 
- Firebase project
- Vercel account (for deployment)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd tcgleague
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp env.example .env
\`\`\`

4. Update `.env` with your Firebase configuration:
\`\`\`env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

⚠️ **IMPORTANT**: Never commit the `.env` file to Git. It contains sensitive Firebase configuration and is already included in `.gitignore`.

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up Firebase Storage
5. Add your app to Firebase and copy the configuration

### Deployment

The app is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Navbar, etc.)
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utilities and configurations
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   └── ...           # Other pages
├── types/             # TypeScript type definitions
└── App.tsx           # Main app component
\`\`\`

## Features Roadmap

### Phase 1 (Current)
- ✅ User authentication and registration
- ✅ Basic tournament management
- ✅ Profile management
- ✅ Event listings and details
- ✅ Basic deck builder interface

### Phase 2 (Next)
- 🔄 Complete deck builder with card database
- 🔄 Real-time tournament management
- 🔄 Advanced standings calculations
- 🔄 Push notifications
- 🔄 Mobile app (React Native)

### Phase 3 (Future)
- 📋 Advanced tournament features
- 📋 Social features and community
- 📋 Integration with official Bandai systems
- 📋 Analytics and reporting
- 📋 Prize pool management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- All passwords are encrypted using Firebase Auth
- No sensitive data is stored in the repository
- Environment variables are used for configuration
- Firebase security rules protect user data
- **`.env` file is git-ignored** - never commit Firebase credentials
- **Public repository safe** - no API keys or secrets in source code
- Production deployment uses environment variables from hosting platform

## License

This project is for educational and portfolio purposes. One Piece TCG is owned by Bandai Co., Ltd.

## Support

For issues and questions, please open a GitHub issue or contact the development team.

---

Built with ❤️ for the One Piece TCG community