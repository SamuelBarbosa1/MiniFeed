# MiniFeed

A social media mobile application built with React Native and Expo. MiniFeed allows users to create accounts, post updates, like and comment on posts, and connect with others in a simple, intuitive interface.

## Features

### User Authentication
- User registration with email and password
- Secure login system
- Auto-login functionality with "Remember me" option
- Account deletion support

### Social Features
- Create, edit, and delete posts
- Like posts with real-time counter updates
- Comment on posts with persistent storage
- Share posts with other applications
- @mentions functionality in posts

### Profile Management
- Personalized user profiles
- Profile picture upload (camera or gallery)
- Bio editing
- Post history display in grid layout
- Tabbed interface for Posts, Likes, and Media

### User Experience
- Dark mode toggle with persistent settings
- Offline functionality with local data storage
- Real-time timestamp formatting (e.g., "5 minutes ago")
- Responsive design for all screen sizes
- Intuitive navigation with bottom tab bar

### Settings & Privacy
- Password change functionality
- Biometric authentication toggle
- Privacy controls
- Network connectivity indicator
- Account management (edit profile, change password, delete account)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: @react-navigation/native
- **Data Persistence**: @react-native-async-storage/async-storage
- **UI Components**: react-native-gesture-handler, react-native-safe-area-context, react-native-screens
- **Media Handling**: expo-image-picker, expo-sharing, expo-clipboard
- **Network Monitoring**: @react-native-community/netinfo

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Expo CLI
- Mobile device with Expo Go app OR emulator

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd MiniFeed
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Scan the QR code with the Expo Go app
   - Or use an emulator with `npm run android` or `npm run ios`

## Project Structure

```
MiniFeed/
├── components/
│   └── Comment.js          # Comment component for post comments
├── screens/
│   ├── FeedScreen.js       # Main feed display
│   ├── HomeFeedScreen.js   # Home screen with post creation
│   ├── LoginScreen.js      # User login interface
│   ├── ProfileScreen.js    # User profile management
│   ├── RegisterScreen.js   # User registration interface
│   ├── SearchScreen.js     # Search functionality
│   └── SettingsScreen.js   # Application settings
├── utils/
│   ├── Storage.js          # Data persistence layer
│   └── Theme.js            # Theme management
├── App.js                  # Main application component
├── app.json                # Expo configuration
├── index.js                # Entry point
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Available Scripts

- `npm start`: Starts the Expo development server
- `npm run android`: Runs the app on Android emulator/device
- `npm run ios`: Runs the app on iOS simulator/device
- `npm run web`: Runs the app in web browser

## Data Management

MiniFeed uses AsyncStorage for local data persistence:
- User credentials and profile information
- Posts and comments
- Application settings (dark mode, etc.)
- Auto-login preferences

All user data is isolated, ensuring that each account has its own private data space.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native and Expo communities
- All contributors who have helped build and maintain this project

## Support

For support, please open an issue on the GitHub repository or contact the development team.