/* eslint-disable no-undef */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-localize', () => require('react-native-localize/mock'));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  clear: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('@react-native-clipboard/clipboard', () =>
  require('@react-native-clipboard/clipboard/jest/clipboard-mock.js'),
);

jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock'),
);

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    getBoolean: jest.fn(() => false),
    getNumber: jest.fn(() => 0),
    remove: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(() => false),
    getAllKeys: jest.fn(() => []),
  }),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logScreenView: jest.fn(),
  logEvent: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(),
  recordError: jest.fn(),
  log: jest.fn(),
}));

jest.mock('@preeternal/react-native-cookie-manager', () => ({
  default: {
    clearAll: jest.fn(() => Promise.resolve(true)),
    getAll: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve({})),
    set: jest.fn(() => Promise.resolve(true)),
    setFromResponse: jest.fn(() => Promise.resolve(true)),
    clearByName: jest.fn(() => Promise.resolve(true)),
  },
}));

jest.mock('react-native-inappbrowser-reborn', () => ({
  isAvailable: jest.fn(() => Promise.resolve(true)),
  open: jest.fn(() => Promise.resolve()),
  close: jest.fn(),
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { WebView: View, default: View };
});


jest.mock('react-native-in-app-review', () => ({
  isAvailable: jest.fn(() => false),
  RequestInAppReview: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-lan-port-scanner', () => ({
  startScan: jest.fn(),
  cancelScan: jest.fn(),
}));
