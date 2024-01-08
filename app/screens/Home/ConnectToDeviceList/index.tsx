import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

//ThirdParty
import { useTranslation } from 'react-i18next';
import { Appbar, Button, FAB, List, Menu, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabsNavigatorParams, LoggedInTabNavigatorParams } from 'app/navigation/types';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { MaterialBottomTabNavigationProp } from '@react-navigation/material-bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//App modules
import Components from 'app/components';
import styles from './styles';

//Modals
import IDevice from 'app/models/models/device';
import useAppConfigStore from 'app/store/appConfig';
import AppHeader from 'app/components/AppHeader';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';

//Params
type ConnectToDeviceListTabNavigationProp = CompositeNavigationProp<
  MaterialBottomTabNavigationProp<HomeTabsNavigatorParams, 'ConnectToDeviceList'>,
  NativeStackNavigationProp<LoggedInTabNavigatorParams>
>;

const ConnectToDeviceList = ({}: ConnectToDeviceListTabNavigationProp) => {
  //Refs
  //Actions

  //Constants
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<ConnectToDeviceListTabNavigationProp>();
  const recentDevices = useAppConfigStore(store => store.devices);
  const selectDevice = useAppConfigStore(store => store.selectDevice);
  const insets = useSafeAreaInsets();
  const largeScreenMode = useLargeScreenMode();

  //States
  const [menuVisible, setMenuVisible] = useState(false);

  const onPressDevice = useCallback(
    async (device: IDevice, _index: number) => {
      selectDevice(device);
    },
    [selectDevice],
  );

  const onPressMore = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const onDismissModal = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const onPressAddDevice = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('AddDevice', { mode: 'create' });
  }, [navigation]);

  const onPressAdvanceSetting = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('Devices', {});
  }, [navigation]);

  const renderNoRecentlyConnectedButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onPressAddDevice}>{t('connectToDeviceList.emptyData.button')}</Button>
      </View>
    );
  }, [onPressAddDevice, t]);

  return (
    <Components.AppBaseView
      edges={['left', 'right', 'top']}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={false}
        title={t('general.appname')}
        style={{ backgroundColor: colors.background }}
        RightViewComponent={
          <View style={styles.navigationButton}>
            <Menu
              visible={menuVisible}
              onDismiss={onDismissModal}
              anchor={<Appbar.Action icon={'dots-vertical'} onPress={onPressMore} />}>
              <Menu.Item onPress={onPressAddDevice} title={t('connectToDeviceList.addManually')} />
              <Menu.Item onPress={onPressAdvanceSetting} title={t('connectToDeviceList.devicesSettings')} />
            </Menu>
          </View>
        }
      />

      <View style={[styles.subView, largeScreenMode && styles.cardTablet, { backgroundColor: colors.background }]}>
        {recentDevices.length > 0 && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
            <List.Section>
              <List.Subheader>{t(t('connectToDeviceList.savedConnections'))}</List.Subheader>
              {recentDevices.map((device, idx) => {
                return (
                  <List.Item
                    key={device.id}
                    onPress={() => onPressDevice(device, idx)}
                    title={device.name}
                    description={[device.ip1, device.ip2, device.ip3].filter(element => !!element).join(',')}
                    left={props => <List.Icon {...props} icon="raspberry-pi" />}
                  />
                );
              })}
            </List.Section>
          </ScrollView>
        )}

        {recentDevices.length < 1 && (
          <Components.AppEmptyDataView
            iconType={'font-awesome5'}
            iconName="raspberry-pi"
            style={{}}
            header={t('connectToDeviceList.emptyData.emptyDeviceTitle')}
            subHeader={t('connectToDeviceList.emptyData.emptyDeviceSubtitle')}
            renderContent={renderNoRecentlyConnectedButtons}
          />
        )}
      </View>
      <FAB
        label={t('connectToDeviceList.fabAddMore')!}
        icon="plus"
        color={colors.onPrimary}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 16 }]}
        onPress={onPressAddDevice}
      />
    </Components.AppBaseView>
  );
};

export default ConnectToDeviceList;
