import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';

//ThirdParty
import { Button, FAB, IconButton, List, Menu } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs';
import { CompositeNavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';

//App modules
import Components from 'app/components';
import styles from './styles';

//Redux
import { HomeTabsNavigatorParams, LoggedInTabNavigatorParams } from 'app/navigation/types';
import useAppConfigStore from 'app/store/appConfig';
import AppHeader from 'app/components/AppHeader';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import IPiAppServer from 'app/models/models/piAppServer';

//Params
type DashboardTabNavigationProp = CompositeNavigationProp<
  MaterialBottomTabNavigationProp<HomeTabsNavigatorParams, 'DashboardTab'>,
  NativeStackNavigationProp<LoggedInTabNavigatorParams>
>;
const DashboardTab = ({}: DashboardTabNavigationProp) => {
  //Refs
  const refDeviceInfoRequestInProgress = useRef(false);

  //Actions

  //Constants
  const { colors } = useTheme();
  const navigation = useNavigation<DashboardTabNavigationProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const selectedDevice = useAppConfigStore(store => store.selectedDevice);
  const disconnect = useAppConfigStore(store => store.disconnect);
  const addPiAppServerToSelectedDevice = useAppConfigStore(store => store.addPiAppServerToSelectedDevice);
  const deletePiAppServerToSelectedDevice = useAppConfigStore(store => store.deletePiAppServerToSelectedDevice);
  const selectDevice = useAppConfigStore(store => store.selectDevice);
  const isFocused = useIsFocused();

  //States
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [visibleIndex, setVisibleIndex] = React.useState<number | null>(null);

  useEventEmitter<IPiAppServer>('on_select_piAppServer', eventData => {
    addPiAppServerToSelectedDevice({ ...eventData, id: uuid.v4().toString() });
  });

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }
    setTitle(selectedDevice.name);
    setSubTitle(selectedDevice.ip);
  }, [selectedDevice]);

  const onLogout = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onPressSetting = useCallback(() => {
    if (!selectedDevice) {
      return;
    }
    navigation.navigate('AddDevice', { device: selectedDevice, mode: 'edit' });
  }, [navigation, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice || !isFocused) {
      return;
    }

    let to = setInterval(async () => {
      if (refDeviceInfoRequestInProgress.current) {
        return;
      }
      refDeviceInfoRequestInProgress.current = true;
      try {
        const result: any = await Promise.allSettled(
          selectedDevice.piAppServers.map(async v => {
            const url = `http://${selectedDevice.ip}:${v.port}${v.path}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);
            try {
              const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
              clearTimeout(timeoutId);
              return { status: 'fulfilled', reachable: response.ok };
            } catch (error) {
              clearTimeout(timeoutId);
              return { status: 'rejected', reason: error };
            }
          }),
        );
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
    }, 2000);

    return () => {
      clearInterval(to);
    };
  }, [isFocused, selectDevice, selectedDevice]);

  const onPressSelectPiAppServer = useCallback(() => {
    navigation.navigate('PiAppServers', { mode: 'select' });
  }, [navigation]);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={false}
        onPressBackButton={onLogout}
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
        LeftViewComponent={
          <IconButton
            style={styles.navigationButton}
            icon="format-list-bulleted-square"
            iconColor={colors.onBackground}
            size={20}
            onPress={onLogout}
          />
        }
        SubTitleComponent={
          <Text
            numberOfLines={1}
            ellipsizeMode={'tail'}
            style={[styles.subTitleTextStyle, { color: colors.onBackground }]}>
            {subTitle}
          </Text>
        }
      />

      {selectedDevice && selectedDevice.piAppServers.length > 0 && (
        <View style={styles.subView}>
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
                      anchor={<IconButton {...props} icon={'dots-vertical'} onPress={() => openMenu(idx)} />}>
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
        style={[styles.fab, { bottom: insets.bottom }]}
        onPress={onPressSelectPiAppServer}
      />
    </View>
  );
};

export default DashboardTab;
