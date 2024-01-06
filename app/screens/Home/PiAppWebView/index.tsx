import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

//ThirdParty
import { Button, Dialog, Text, IconButton, Menu, ProgressBar, useTheme } from 'react-native-paper';
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

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'PiAppWebView'>;

const THRESHOLD_DIFF_Y = 100;

const PiAppWebView = ({ navigation, route }: Props) => {
  //Refs
  const webViewRef = useRef<WebView | null>(null);
  const refCurrentURL = useRef<string>('');
  const refCurrentY = useRef(0);
  const refDiffY = useRef(0);
  const refDirection = useRef<'up' | 'down'>('up');

  //Constants
  const { colors } = useTheme();
  const selectedDevice = useAppConfigStore(store => store.selectedDevice);
  const insets = useSafeAreaInsets();

  const piAppServer = route.params.piAppServer;
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, THRESHOLD_DIFF_Y],
    outputRange: [0, THRESHOLD_DIFF_Y],
    extrapolate: 'clamp',
  });

  //States
  const [menuVisible, setMenuVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [appServerURL, setAppServerURL] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [infoDialogVisible, setInfoDialogVisible] = useState<boolean>(false);

  const loadURL = useCallback(async () => {
    if (!selectedDevice) {
      setAppServerURL(null);
      return;
    }

    const serverURLs = [selectedDevice.ip1, selectedDevice.ip2, selectedDevice.ip3]
      .filter(v => !!v)
      .map(v => {
        return 'http://' + v + ':' + piAppServer.port + '/' + piAppServer.path.replace(/^\//, '');
      });
    const abortController = new AbortController();

    try {
      const value = await getLiveURL(serverURLs, abortController);
      setAppServerURL(value);
      setError(false);
    } catch (e) {
      setError(true);
    }
  }, [piAppServer.path, piAppServer.port, selectedDevice]);

  useEffect(() => {
    loadURL();
  }, [loadURL]);

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
      await loadURL();
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
    webViewRef.current?.reload();
  }, []);

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

  const onCopyURL = useCallback(() => {
    setMenuVisible(false);
    Clipboard.setString(refCurrentURL.current);
  }, []);

  const onWRefresh = useCallback(() => {
    setMenuVisible(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const onInfo = useCallback(() => {
    setMenuVisible(false);
    setInfoDialogVisible(true);
    //appServerURL
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

  return (
    <AppBaseView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
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
            onNavigationStateChange={state => {
              refCurrentURL.current = state.url;
              setShowProgress(true);
            }}
            onScroll={onScroll}
          />
        )}
        {error && (
          <Components.AppEmptyDataView
            iconType={'font-awesome5'}
            iconName="box-open"
            style={styles.webview}
            header={t('piAppWebView.emptyData.title')}
            subHeader={t('piAppWebView.emptyData.message')}
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
          <IconButton icon={'arrow-u-left-top'} size={26} style={{}} onPress={onWGoBack} />
          <IconButton icon={'home'} size={26} style={{}} onPress={onWGoHome} />
          <IconButton icon={'arrow-u-right-top'} size={26} style={{}} onPress={onWGoForward} />
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={onDismissModal}
          anchor={<IconButton icon={'dots-vertical'} size={26} onPress={onPressMore} />}>
          <Menu.Item onPress={onWRefresh} title={t('piAppWebView.refresh')} />
          <Menu.Item onPress={onWGoBack} title={t('piAppWebView.back')} />
          <Menu.Item onPress={onWGoForward} title={t('piAppWebView.forward')} />
          <View style={[styles.separator, { backgroundColor: `${colors.onBackground}30` }]} />
          <Menu.Item onPress={onCopyURL} title={t('piAppWebView.copyURL')} />
          <Menu.Item onPress={onInfo} title={t('piAppWebView.info')} />
        </Menu>
        <View pointerEvents={'none'} style={styles.dockerLoadingProgress}>
          {showProgress && <ProgressBar color={`${colors.primary}50`} style={styles.progressBar} progress={progress} />}
        </View>
      </Animated.View>

      <Dialog visible={infoDialogVisible} onDismiss={() => setInfoDialogVisible(false)}>
        <Dialog.Title>{t('piAppWebView.infoDialog.title')}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{t('piAppWebView.infoDialog.description', { url: appServerURL })}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setInfoDialogVisible(false)}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </AppBaseView>
  );
};

export default PiAppWebView;
