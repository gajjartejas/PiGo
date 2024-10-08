import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, AppState } from 'react-native';

//ThirdParty
import { Button, FAB, IconButton, List, Menu } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import NetInfo from '@react-native-community/netinfo';

//App modules
import Components from 'app/components';
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import useAppConfigStore from 'app/store/appConfig';
import AppHeader from 'app/components/AppHeader';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import IPiAppServer from 'app/models/models/piAppServer';
import getLiveURL from 'app/utils/getLiveURL';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import Icon from 'react-native-easy-icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import SSHClient from '@dylankenneally/react-native-ssh-sftp';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'PiAppServers'>;

const REFRESH_TIMEOUT = 10000;
const PiAppServers = ({ navigation }: Props) => {
  //Refs
  const refDeviceInfoRequestInProgress = useRef(false);
  const refRefreshTimeoutMs = useRef(1000);
  const refAbortController = useRef<AbortController>(new AbortController());

  //Actions

  //Constants
  const { colors } = useTheme();
  const { t } = useTranslation();
  const selectedDevice = useAppConfigStore(store => store.selectedDevice);
  const switchDeviceIp = useAppConfigStore(store => store.switchDeviceIp);
  const disconnect = useAppConfigStore(store => store.disconnect);
  const addPiAppServerToSelectedDevice = useAppConfigStore(store => store.addPiAppServerToSelectedDevice);
  const deletePiAppServerToSelectedDevice = useAppConfigStore(store => store.deletePiAppServerToSelectedDevice);
  const selectDevice = useAppConfigStore(store => store.selectDevice);
  const isFocused = useIsFocused();
  const largeScreenMode = useLargeScreenMode();
  const urls: string[] = useMemo(() => {
    return selectedDevice
      ? [selectedDevice.ip1, selectedDevice.ip2, selectedDevice.ip3].filter(m => !!m).map(m => m!)
      : [];
  }, [selectedDevice]);
  const insets = useSafeAreaInsets();

  //States
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [visibleIndex, setVisibleIndex] = React.useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [subTitleDialogVisible, setSubTitleDialogVisible] = useState(false);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEventEmitter<IPiAppServer>('on_select_piAppServer', eventData => {
    addPiAppServerToSelectedDevice({ ...eventData, id: uuid.v4().toString() });
  });

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    let to: any | null = null;
    let remove = NetInfo.addEventListener(state => {
      to && clearTimeout(to);
      to = setTimeout(async () => {
        console.log('NetInfoState', JSON.stringify(state.isConnected));
        setIsConnected(state.isConnected || false);
      }, 5000);
    });
    return () => {
      to && clearTimeout(to);
      remove();
    };
  }, [isFocused]);

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }
    setTitle(selectedDevice.name);
    setSubTitle(selectedDevice.selectedIp);
  }, [selectedDevice]);

  const onGoBack = useCallback(() => {
    disconnect();
    navigation.pop();
  }, [disconnect, navigation]);

  const onPressSetting = useCallback(() => {
    if (!selectedDevice) {
      return;
    }
    navigation.navigate('AddDevice', { device: selectedDevice, mode: 'edit' });
  }, [navigation, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice || !isFocused) {
      refRefreshTimeoutMs.current = 1000;
      return;
    }

    if (!isConnected) {
      refRefreshTimeoutMs.current = 2000;
    }

    if (!appStateVisible) {
      refRefreshTimeoutMs.current = 1000;
      return;
    }

    console.log('useEffect -> refreshing....');

    const timeoutId = setTimeout(() => {
      console.log('useEffect -> aborted.........');
      refAbortController.current.abort();
      refAbortController.current = new AbortController();
    }, 5000);

    let to = setInterval(async () => {
      console.log('setInterval');
      console.log('refDeviceInfoRequestInProgress', refDeviceInfoRequestInProgress.current);
      if (refDeviceInfoRequestInProgress.current) {
        return;
      }
      refRefreshTimeoutMs.current = REFRESH_TIMEOUT;
      refDeviceInfoRequestInProgress.current = true;
      try {
        const result: any = await Promise.allSettled(
          selectedDevice.piAppServers.map(async v => {
            const serverURLs = [selectedDevice.selectedIp].map(m => {
              return (v.secureConnection ? 'https://' : 'http://') + m + ':' + v.port + '/' + v.path.replace(/^\//, '');
            });
            console.log('getLiveURL serverURLs', serverURLs);
            try {
              const response = await getLiveURL(serverURLs, refAbortController.current);
              console.log('response:', response);
              return { status: 'fulfilled', reachable: !!response };
            } catch (error) {
              console.log(`rejected: ${serverURLs}`, error);
              return { status: 'rejected', reason: error };
            }
          }),
        );

        console.log('result', JSON.stringify(result));
        for (let i = 0; i < selectedDevice.piAppServers.length; i++) {
          selectedDevice.piAppServers[i] = {
            ...selectedDevice.piAppServers[i],
            reachable: result[i].status === 'fulfilled' && result[i].value.reachable,
          };
        }
        selectDevice({ ...selectedDevice });
      } catch (error) {
        console.log('useEffect->refresh->error', error);
      }
      refDeviceInfoRequestInProgress.current = false;
    }, refRefreshTimeoutMs.current);

    return () => {
      refDeviceInfoRequestInProgress.current = false;
      clearInterval(to);
      clearTimeout(timeoutId);
    };
  }, [isFocused, selectDevice, selectedDevice, urls, isConnected, appStateVisible]);

  const onPressSelectPiAppServer = useCallback(() => {
    navigation.navigate('ManagePiAppServers', { mode: 'select' });
    // sshTest();
  }, [navigation]);

  /*
  async function sshTest() {
    let host = '192.168.1.112'; // example: '123.321.123.321';
    let user = 'tejas'; // example: 'root';
    let password = '1234'; // example: 'password123!';

    let _log = 'about to connect to ' + host + ' as ' + user;
    let log = (s: any) => {
      console.log(s);
      _log += '\n' + s;
    };

    try {
      // @ts-ignore - the last parameter is optional
      let client = await SSHClient.connectWithPassword(host, 22, user, password);
      log('connected');
      log(JSON.stringify(client, null, 2));

      let command = 'uptime';
      log(`about to execute '${command}'`);

      let output = await client.execute(command);
      log('done, result is:');
      log(output);

      log('about to disconnect');
      client.disconnect();
      log('disconnected');
    } catch (err) {
      log('error');
      log(err);
    } finally {
      return _log;
    }
  }
*/

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onPressSelectPiAppServer}>{t('dashboard.emptyData.item3.button')}</Button>
      </View>
    );
  }, [onPressSelectPiAppServer, t]);

  const closeMenu = useCallback(() => {
    setVisibleIndex(null);
  }, []);

  const openMenu = useCallback((index: number) => {
    setVisibleIndex(index);
  }, []);

  const onPressDeleteMenu = (item: IPiAppServer, _idx: number) => {
    setVisibleIndex(null);
    deletePiAppServerToSelectedDevice(item.id);
  };

  const onPressEditMenu = (item: IPiAppServer, _idx: number) => {
    setVisibleIndex(null);
    navigation.navigate('AddPiAppServer', { mode: 'edit_device_piAppServer', piAppServer: item });
  };

  const onPressPiAppServer = (item: IPiAppServer, _idx: number) => {
    navigation.navigate('PiAppWebView', { piAppServer: item });
  };

  const onPressInfoMenu = useCallback(
    (item: IPiAppServer, _index: number) => {
      if (!selectedDevice) {
        return;
      }
      navigation.navigate('ViewPiAppServer', { piAppServer: item, device: selectedDevice });
      closeMenu();
    },
    [closeMenu, navigation, selectedDevice],
  );

  const onCloseSubTitleDialog = useCallback(() => {
    setSubTitleDialogVisible(false);
  }, []);

  const onShowSubTitleDialog = useCallback(() => {
    setSubTitleDialogVisible(true);
  }, []);

  const onPressConfirmIpAddress = useCallback(
    (item: string) => {
      switchDeviceIp(item);
      setSubTitleDialogVisible(false);
      refRefreshTimeoutMs.current = 1000;
    },
    [switchDeviceIp],
  );

  const bottomInsets = useMemo(() => {
    return insets.bottom <= 0 ? 16 : insets.bottom;
  }, [insets.bottom]);

  const bottomPadding = useMemo(() => {
    return bottomInsets + (isConnected ? 16 : 40);
  }, [bottomInsets, isConnected]);

  return (
    <Components.AppBaseView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={title}
        style={{ backgroundColor: colors.background }}
        RightViewComponent={
          <IconButton
            style={styles.navigationButton}
            icon="tune-vertical"
            iconColor={colors.onBackground}
            size={20}
            onPress={onPressSetting}
          />
        }
        SubTitleComponent={
          <TouchableOpacity activeOpacity={0.7} onPress={onShowSubTitleDialog} style={styles.subTitleButton}>
            <Icon type="material-community" name="chevron-down" color={`${colors.onBackground}88`} size={24} />
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={[styles.subTitleTextStyle, { color: colors.onBackground }]}>
              {subTitle}
            </Text>
          </TouchableOpacity>
        }
      />
      {selectedDevice && selectedDevice.piAppServers.length > 0 && (
        <View style={[styles.subView, largeScreenMode && styles.cardTablet, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
            {selectedDevice.piAppServers.map((item, idx) => {
              return (
                <List.Item
                  key={item.id}
                  onPress={() => onPressPiAppServer(item, idx)}
                  title={item.name}
                  description={`${item.path}:${item.port}`}
                  left={props => (
                    <List.Icon
                      {...props}
                      color={item.reachable ? '#00D100' : '#ff0000'}
                      icon={item.reachable ? 'web' : 'web-off'}
                    />
                  )}
                  right={props => (
                    <Menu
                      visible={visibleIndex === idx}
                      onDismiss={closeMenu}
                      anchor={<IconButton {...props} size={16} icon={'dots-vertical'} onPress={() => openMenu(idx)} />}>
                      <Menu.Item
                        leadingIcon="pencil"
                        onPress={() => {
                          onPressEditMenu(item, idx);
                        }}
                        title={t('piAppServersList.edit')}
                      />
                      <Menu.Item
                        leadingIcon="delete"
                        onPress={() => {
                          onPressDeleteMenu(item, idx);
                        }}
                        title={t('piAppServersList.delete')}
                      />
                      <Menu.Item
                        leadingIcon="information"
                        onPress={() => {
                          onPressInfoMenu(item, idx);
                        }}
                        title={t('piAppServersList.info')}
                      />
                    </Menu>
                  )}
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      {(!selectedDevice || selectedDevice.piAppServers.length < 1) && (
        <Components.AppEmptyDataView
          iconType={'font-awesome5'}
          iconName="raspberry-pi"
          style={styles.emptyView}
          header={t('dashboard.emptyData.item3.title')}
          subHeader={t('dashboard.emptyData.item3.message')}
          renderContent={renderNoDataButtons}
        />
      )}

      <FAB
        label={t('dashboard.fabAddMore')!}
        icon="plus"
        color={colors.onPrimary}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPadding }]}
        onPress={onPressSelectPiAppServer}
      />

      <Components.AppRadioSelectDialog
        visible={subTitleDialogVisible}
        title={t('dashboard.selectIpAddress.title')}
        items={urls}
        onPressConfirm={onPressConfirmIpAddress}
        onPressCancel={onCloseSubTitleDialog}
        selectedItem={selectedDevice ? selectedDevice.selectedIp : '-'}
      />

      {!isConnected && <Components.AppNoConnection />}
    </Components.AppBaseView>
  );
};

export default PiAppServers;
