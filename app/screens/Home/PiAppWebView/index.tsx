import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

//ThirdParty
import { Appbar, Button, Menu, ProgressBar, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import WebView from 'react-native-webview';
import { useTranslation } from 'react-i18next';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import AppHeader from 'app/components/AppHeader';
import useAppConfigStore from 'app/store/appConfig';
import Components from 'app/components';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'PiAppWebView'>;

const PiAppWebView = ({ navigation, route }: Props) => {
  //Refs
  const webViewRef = useRef<WebView | null>(null);

  //Constants
  const { colors } = useTheme();
  const piAppServers = useAppConfigStore(store => store.piAppServers);
  const selectedDevice = useAppConfigStore(store => store.selectedDevice);

  const piAppServer = route.params.piAppServer;
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();

  //States
  const [menuVisible, setMenuVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [appServerURL, setAppServerURL] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDevice) {
      setAppServerURL(null);
      return;
    }
    let url = 'http://' + selectedDevice!.ip + ':' + piAppServer.port + '/' + piAppServer.path.replace(/^\//, '');
    setAppServerURL(url);
  }, [piAppServer.path, piAppServer.port, selectedDevice]);

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      if (progress === 1) {
        setShowProgress(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [progress]);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onRedirectToCreatePiAppServer = useCallback(() => {
    navigation.navigate('AddPiAppServer', {});
  }, [navigation]);

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onRedirectToCreatePiAppServer}>{t('piAppServersList.createNewPiAppServer')}</Button>
      </View>
    );
  }, [onRedirectToCreatePiAppServer, t]);

  const onWGoBack = () => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const onWGoForward = () => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const onCopyURL = () => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const onWRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  const onInfo = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const onPressMore = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const onDismissModal = useCallback(() => {
    setMenuVisible(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={piAppServer.name}
        style={{ backgroundColor: colors.background }}
        RightViewComponent={
          <View style={styles.navigationButton}>
            <Appbar.Action icon={'dots-vertical'} onPress={onPressMore} />
            <Menu
              visible={menuVisible}
              onDismiss={onDismissModal}
              anchor={
                <TouchableOpacity onPress={() => {}}>
                  <Text> </Text>
                </TouchableOpacity>
              }>
              <Menu.Item onPress={onWRefresh} title={t('piAppWebView.refresh')} />
              <Menu.Item onPress={onWGoBack} title={t('piAppWebView.back')} />
              <Menu.Item onPress={onWGoForward} title={t('piAppWebView.forward')} />
              <View style={[styles.separator, { backgroundColor: `${colors.onBackground}30` }]} />
              <Menu.Item onPress={onInfo} title={t('piAppWebView.copyURL')} />
              <Menu.Item onPress={onCopyURL} title={t('piAppWebView.info')} />
            </Menu>
          </View>
        }
      />
      {showProgress && <ProgressBar style={styles.progressBar} progress={progress} />}

      <View style={[styles.subView, largeScreenMode && styles.cardTablet]}>
        {!!appServerURL && (
          <WebView
            ref={webViewRef}
            source={{ uri: appServerURL }}
            style={{ ...styles.webview, backgroundColor: colors.background }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadProgress={({ nativeEvent }) => {
              setProgress(nativeEvent.progress);
            }}
            onNavigationStateChange={() => {
              setShowProgress(true);
            }}
          />
        )}
        {piAppServers.length < 1 && (
          <Components.AppEmptyDataView
            iconType={'font-awesome5'}
            iconName="box-open"
            style={styles.webview}
            header={t('piAppServersList.emptyData.title')}
            subHeader={t('piAppServersList.emptyData.message')}
            renderContent={renderNoDataButtons}
          />
        )}
      </View>
    </View>
  );
};

export default PiAppWebView;
