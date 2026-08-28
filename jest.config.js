module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '\\.(ttf|woff|woff2)$': '<rootDir>/jest.fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-navigation|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-paper|react-native-vector-icons|@react-native-vector-icons|react-native-toast-message|@preeternal/react-native-cookie-manager|react-native-inappbrowser-reborn)/',
  ],
};
