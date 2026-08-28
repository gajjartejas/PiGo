/**
 * React Native App
 * Everything starts from the entrypoint
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import './locales';
import AppManager from 'app/components/AppManager';
import Navigator from 'app/navigation';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Entrypoint: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppManager>
          <Navigator />
        </AppManager>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Entrypoint;
