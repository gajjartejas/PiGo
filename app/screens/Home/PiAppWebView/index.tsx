import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, ToastAndroid, View } from 'react-native';

//ThirdParty
import { Button, Dialog, Text, IconButton, Menu, ProgressBar, useTheme, Portal, Snackbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import useAppConfigStore from 'app/store/appConfig';
import Components from 'app/components';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import AppBaseView from 'app/components/AppBaseView';
import getLiveURL from 'app/utils/getLiveURL';
import Utils from 'app/utils';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'PiAppWebView'>;

const THRESHOLD_DIFF_Y = 100;

const PiAppWebView = ({ navigation, route }: Props) => {
  //Refs
  const webViewRef = useRef<WebView | null>(null);
  const refCurrentURL = useRef<string | null>(null);
  const refCurrentY = useRef(0);
  const refDiffY = useRef(0);
  const refDirection = useRef<'up' | 'down'>('up');
  const showBackToast = useRef(true);

  //Constants
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const largeScreenMode = useLargeScreenMode();
  const selectedDevice = useAppConfigStore(store => store.selectedDevice);
  const urlLoadCount = useRef(0);
  const piAppServer = route.params.piAppServer;
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, THRESHOLD_DIFF_Y],
    outputRange: [0, THRESHOLD_DIFF_Y],
    extrapolate: 'clamp',
  });
  const urls: string[] = useMemo(() => {
    return selectedDevice
      ? [selectedDevice.ip1, selectedDevice.ip2, selectedDevice.ip3].filter(m => !!m).map(m => m!)
      : [];
  }, [selectedDevice]);
  const switchDeviceIp = useAppConfigStore(store => store.switchDeviceIp);

  //States
  const [menuVisible, setMenuVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [appServerURL, setAppServerURL] = useState<string | null>(null);
  const [infoDialogVisible, setInfoDialogVisible] = useState<boolean>(false);
  const [appServerAltURL, setAppServerAltURL] = useState<string | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [subTitleDialogVisible, setSubTitleDialogVisible] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);

  const [canGoFw, setCanGoFw] = useState(false);
  const [canGoBw, setCanGoBw] = useState(false);

  const allUrls = useMemo(() => {
    return [selectedDevice?.ip1, selectedDevice?.ip2, selectedDevice?.ip3].filter(v => !!v);
  }, [selectedDevice?.ip1, selectedDevice?.ip2, selectedDevice?.ip3]);

  useEffect(() => {
    urlLoadCount.current = allUrls.filter(v => !!v).length;
  }, [allUrls]);

  const getURL = (url: string, path: string, port: number, secure: boolean) => {
    return (secure ? 'https://' : 'http://') + url + ':' + port + '/' + path.replace(/^\//, '');
  };

  const loadURL = useCallback(() => {
    if (!selectedDevice) {
      setAppServerURL(null);
      return;
    }
    const serverURL = getURL(
      selectedDevice?.selectedIp,
      piAppServer.path,
      piAppServer.port,
      piAppServer.secureConnection,
    );
    console.log('serverURL', serverURL);
    setAppServerURL(serverURL);
  }, [piAppServer.path, piAppServer.port, piAppServer.secureConnection, selectedDevice]);

  const fetchAlternateAddress = useCallback(async (): Promise<string | null> => {
    const abortController = new AbortController();
    try {
      const serverURLs = allUrls
        .filter(v => v !== selectedDevice?.selectedIp)
        .map(v => {
          return getURL(v!, piAppServer.path, piAppServer.port, piAppServer.secureConnection);
        });
      const value = await getLiveURL(serverURLs, abortController, 10000);
      console.log('fetchAlternateAddress->address', value);
      return value;
    } catch (e) {
      console.log('fetchAlternateAddress->error', e);
      return null;
    }
  }, [allUrls, piAppServer.path, piAppServer.port, piAppServer.secureConnection, selectedDevice?.selectedIp]);

  useEffect(() => {
    loadURL();
    fetchAlternateAddress().then(url => {
      if (url) {
        setAppServerAltURL(url);
      }
    });
  }, [fetchAlternateAddress, loadURL]);

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

  const onRefresh = useCallback(() => {
    (async () => {
      loadURL();
    })();
  }, [loadURL]);

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onRefresh}>{t('piAppWebView.emptyData.button')}</Button>
      </View>
    );
  }, [onRefresh, t]);

  const onWGoHome = useCallback(() => {
    setMenuVisible(false);
    setWebViewKey(v => v + 1);
    setAppServerURL(appServerURL);
  }, [appServerURL]);

  const onWGoBack = useCallback(() => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  }, []);

  const onWGoForward = useCallback(() => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.goForward();
    }
  }, []);

  const onSwitchURL = () => {
    setMenuVisible(false);
    setSubTitleDialogVisible(true);
  };

  const onCopyURL = useCallback(() => {
    setMenuVisible(false);

    if (refCurrentURL.current !== null) {
      Clipboard.setString(refCurrentURL.current);
    } else if (appServerURL) {
      Clipboard.setString(appServerURL);
    }
  }, [appServerURL]);

  const onOpenWith = useCallback(() => {
    setMenuVisible(false);
    if (refCurrentURL.current !== null) {
      Utils.openBrowser(refCurrentURL.current);
    } else if (appServerURL) {
      Utils.openBrowser(appServerURL);
    }
  }, [appServerURL]);

  const onWRefresh = useCallback(() => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const onInfo = useCallback(() => {
    setMenuVisible(false);
    setInfoDialogVisible(true);
  }, []);

  const onPressMore = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const onDismissModal = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleScroll = useCallback(
    (e: any) => {
      if (showProgress || e.nativeEvent.contentOffset.y < 0) {
        return;
      }
      const { contentOffset } = e.nativeEvent;
      const direction = contentOffset.y - refCurrentY.current > 0 ? 'up' : 'down';
      if (refDirection.current === direction && refDiffY.current >= THRESHOLD_DIFF_Y) {
        refCurrentY.current = contentOffset.y;
        return;
      }
      refDiffY.current = Math.abs(contentOffset.y - refCurrentY.current);
      if (direction === 'down') {
        scrollY.setValue(THRESHOLD_DIFF_Y - (refCurrentY.current - contentOffset.y));
      } else {
        scrollY.setValue(contentOffset.y - refCurrentY.current);
      }
      if (contentOffset.y === 0) {
        scrollY.setValue(0);
        refCurrentY.current = contentOffset.y;
      }
      refDirection.current = direction;
    },
    [scrollY, showProgress],
  );

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: {} } }], {
    useNativeDriver: false,
    listener: event => handleScroll(event),
  });

  useEffect(() => {
    if (error && appServerAltURL && appServerURL !== appServerAltURL) {
      webViewRef.current?.stopLoading();
      setError(null);
      setAppServerURL(appServerAltURL);
      setSnackbarVisible(true);
    }
  }, [appServerAltURL, appServerURL, error]);

  const onPressConfirmIpAddress = (item: string) => {
    switchDeviceIp(item);
    setSubTitleDialogVisible(false);
  };

  const onCloseSubTitleDialog = () => {
    setSubTitleDialogVisible(false);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBw) {
        navigation.pop();
        return true;
      }
      if (backPressCount === 0) {
        setBackPressCount(prevCount => prevCount + 1);
        setTimeout(() => {
          setBackPressCount(0);
          webViewRef.current?.goBack();
        }, 400);
        if (showBackToast.current) {
          showBackToast.current = false;
          ToastAndroid.show(t('piAppWebView.backPressHint'), ToastAndroid.SHORT);
        }
      } else if (backPressCount === 1) {
        navigation.pop();
      }
      return true;
    });

    return () => backHandler.remove();
  }, [backPressCount, canGoBw, navigation, t]);

  return (
    <AppBaseView edges={['left', 'right', 'top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.subView]}>
        {!error && !!appServerURL && (
          <WebView
            key={webViewKey}
            ref={webViewRef}
            source={{ uri: appServerURL }}
            style={{ ...styles.webview, backgroundColor: colors.background }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            onLoadProgress={({ nativeEvent }) => {
              setProgress(nativeEvent.progress);
            }}
            onNavigationStateChange={state => {
              refCurrentURL.current = state.url;
              setShowProgress(true);
              setCanGoFw(state.canGoForward);
              setCanGoBw(state.canGoBack);
            }}
            onScroll={onScroll}
            onHttpError={(e: any) => {
              console.log('onHttpError', e.nativeEvent.description);
              setError(e);
              setRetryAttempt(retryAttempt + 1);
            }}
            onError={(e: any) => {
              console.log('onError', e.nativeEvent.description);
              setError(e);
              setRetryAttempt(retryAttempt + 1);
            }}
            onLoad={() => {
              console.log('onLoad');
            }}
            onLoadEnd={() => {
              console.log('onLoadEnd');
            }}
            onLoadStart={() => {
              console.log('onLoadStart');
            }}
          />
        )}
        {error && retryAttempt > 2 && (
          <Components.AppEmptyDataView
            iconType={'material-community'}
            iconName="web-off"
            style={styles.webview}
            header={t('piAppWebView.emptyData.title')}
            subHeader={
              error.nativeEvent.description ? error.nativeEvent.description : t('piAppWebView.emptyData.message')
            }
            renderContent={renderNoDataButtons}
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.docker,
          {
            bottom: insets.bottom + 12,
            backgroundColor: colors.background,
            borderColor: `${colors.primary}50`,
            transform: [{ translateY }],
          },
        ]}>
        <IconButton icon={'chevron-left'} size={26} style={{}} onPress={onGoBack} />
        <View style={styles.homeBackFwdButtonContainer}>
          <IconButton icon={'arrow-u-left-top'} disabled={!canGoBw} size={26} style={{}} onPress={onWGoBack} />
          <IconButton icon={'home'} size={26} style={{}} onPress={onWGoHome} />
          <IconButton icon={'arrow-u-right-top'} size={26} disabled={!canGoFw} style={{}} onPress={onWGoForward} />
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={onDismissModal}
          anchor={<IconButton icon={'dots-vertical'} size={26} onPress={onPressMore} />}>
          <Menu.Item leadingIcon={'refresh'} onPress={onWRefresh} title={t('piAppWebView.refresh')} />
          <Menu.Item
            leadingIcon={'arrow-left'}
            disabled={!canGoBw}
            onPress={onWGoBack}
            title={t('piAppWebView.back')}
          />
          <Menu.Item
            leadingIcon={'arrow-right'}
            disabled={!canGoFw}
            onPress={onWGoForward}
            title={t('piAppWebView.forward')}
          />
          <View style={[styles.separator, { backgroundColor: `${colors.onBackground}30` }]} />
          <Menu.Item leadingIcon={'swap-horizontal'} onPress={onSwitchURL} title={t('piAppWebView.switchURL')} />
          <Menu.Item leadingIcon={'content-copy'} onPress={onCopyURL} title={t('piAppWebView.copyURL')} />
          <Menu.Item leadingIcon={'open-in-app'} onPress={onOpenWith} title={t('piAppWebView.openWith')} />
          <Menu.Item leadingIcon={'information-outline'} onPress={onInfo} title={t('piAppWebView.info')} />
        </Menu>
        <View pointerEvents={'none'} style={styles.dockerLoadingProgress}>
          {showProgress && <ProgressBar color={`${colors.primary}50`} style={styles.progressBar} progress={progress} />}
        </View>
      </Animated.View>

      <Portal>
        <Dialog
          style={largeScreenMode && styles.cardTablet}
          visible={infoDialogVisible}
          onDismiss={() => setInfoDialogVisible(false)}>
          <Dialog.Title>{t('piAppWebView.infoDialog.title')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('piAppWebView.infoDialog.description', { url: appServerURL })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
        }}>
        {t('piAppWebView.switchedURL', { URL: appServerAltURL })}
      </Snackbar>

      <Components.AppRadioSelectDialog
        visible={subTitleDialogVisible}
        title={t('dashboard.selectIpAddress.title')}
        items={urls}
        onPressConfirm={onPressConfirmIpAddress}
        onPressCancel={onCloseSubTitleDialog}
        selectedItem={selectedDevice ? selectedDevice.selectedIp : '-'}
      />
    </AppBaseView>
  );
};

export default PiAppWebView;
