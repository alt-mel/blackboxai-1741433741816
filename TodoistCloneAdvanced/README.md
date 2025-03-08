# Todoist Clone Advanced

A feature-rich task management application built with React Native, TypeScript, and Firebase. This project demonstrates advanced mobile development concepts and best practices.

## Features

- 🔐 User Authentication
  - Email/Password sign in
  - Secure session management
  - Password reset functionality

- 📋 Task Management
  - Create, read, update, and delete tasks
  - Set due dates and priorities
  - Mark tasks as complete/incomplete
  - Task categorization and filtering
  - Rich task descriptions

- 📁 Project Organization
  - Create and manage projects
  - Color-coding for projects
  - Favorite and archive projects
  - Task grouping by projects

- 🎨 Modern UI/UX
  - Clean and intuitive interface
  - Smooth animations and transitions
  - Responsive design
  - Dark mode support

- 🔄 Sync & Backup
  - Real-time data synchronization
  - Offline support
  - Automatic data backup

## Technology Stack

- **Frontend Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context API
- **Backend & Database**: Firebase (Authentication, Firestore)
- **Navigation**: React Navigation
- **UI Components**: Custom components with React Native elements
- **Styling**: Custom theme system
- **Data Validation**: TypeScript types and interfaces
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── components/         # Reusable UI components
├── config/            # Configuration files
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── screens/           # Screen components
├── services/          # API and service layers
├── theme/             # Theme configuration
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/todoist-clone-advanced.git
cd todoist-clone-advanced
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Firebase project and configure it:
   - Create a new project in Firebase Console
   - Enable Authentication and Firestore
   - Add a web app to your Firebase project
   - Copy the configuration values

4. Create a `.env` file in the root directory:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm start
# or
yarn start
```

## Development

### Code Style

- Follow the TypeScript best practices
- Use functional components with hooks
- Maintain consistent file and folder naming conventions
- Write meaningful comments and documentation
- Follow the ESLint and Prettier configurations

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

### Building

```bash
# Build for iOS
npm run ios

# Build for Android
npm run android

# Build for web
npm run web
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Todoist](https://todoist.com/)
- Built with [React Native](https://reactnative.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- UI components from [React Native Elements](https://reactnativeelements.com/)

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/todoist-clone-advanced](https://github.com/yourusername/todoist-clone-advanced)
