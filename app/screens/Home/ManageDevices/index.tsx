import React, { useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';

//ThirdParty
import { Button, FAB, IconButton, List, Menu } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import AppHeader from 'app/components/AppHeader';
import useAppConfigStore from 'app/store/appConfig';
import Components from 'app/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IDevice from 'app/models/models/device';
import { useTranslation } from 'react-i18next';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'ManageDevices'>;

const ManageDevices = ({ navigation, route }: Props) => {
  //Refs

  //Constants
  const { colors } = useTheme();
  const devices = useAppConfigStore(store => store.devices);
  const deleteDevice = useAppConfigStore(store => store.deleteDevice);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();
  const mode = route.params.mode;
  const selectDevice = useAppConfigStore(store => store.selectDevice);
  const showBackButton = mode !== 'connect-pi-server';

  //States
  const [visibleIndex, setVisibleIndex] = React.useState<number | null>(null);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onPressDevice = useCallback(
    (item: IDevice, _index: number) => {
      if (mode === 'connect-pi-server') {
        selectDevice(item);
        navigation.navigate('PiAppServers', {});
      } else {
        navigation.navigate('AddDevice', { device: item, mode: 'edit' });
      }
    },
    [mode, navigation, selectDevice],
  );

  const openMenu = useCallback((index: number) => {
    setVisibleIndex(index);
  }, []);

  const closeMenu = useCallback(() => setVisibleIndex(null), []);

  const onPressAddNewDevice = useCallback(() => {
    navigation.navigate('AddDevice', { mode: 'create' });
  }, [navigation]);

  const onRedirectToCreateDevice = useCallback(() => {
    navigation.navigate('AddDevice', { mode: 'create' });
  }, [navigation]);

  const onPressEditMenu = useCallback(
    (item: IDevice, _index: number) => {
      closeMenu();
      navigation.navigate('AddDevice', { device: item, mode: 'edit' });
    },
    [closeMenu, navigation],
  );

  const onPressDeleteMenu = useCallback(
    (item: IDevice, _index: number) => {
      deleteDevice(item.id);
      closeMenu();
    },
    [closeMenu, deleteDevice],
  );

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onRedirectToCreateDevice}>{t('devicesList.createNewDevice')}</Button>
      </View>
    );
  }, [onRedirectToCreateDevice, t]);

  const bottomInsets = useMemo(() => {
    return insets.bottom > 0 ? insets.bottom : 16;
  }, [insets.bottom]);

  return (
    <Components.AppBaseView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={showBackButton}
        onPressBackButton={onGoBack}
        title={t('devicesList.title')}
        style={{ backgroundColor: colors.background }}
      />
      <View style={[styles.subView, largeScreenMode && styles.cardTablet]}>
        {devices && devices.length > 0 && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
            <List.Section>
              <List.Subheader>{t('devicesList.subTitle')}</List.Subheader>
              {devices.map((item, idx) => {
                return (
                  <List.Item
                    key={idx.toString()}
                    onPress={() => onPressDevice(item, idx)}
                    title={item.name ? item.name : t('devicesList.emptyName')}
                    description={[item.ip1, item.ip2, item.ip3].filter(element => !!element).join(',')}
                    left={props => <List.Icon {...props} icon="server-network" />}
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
                          title={t('devicesList.edit')}
                        />
                        <Menu.Item
                          leadingIcon="delete"
                          onPress={() => {
                            onPressDeleteMenu(item, idx);
                          }}
                          title={t('devicesList.delete')}
                        />
                      </Menu>
                    )}
                  />
                );
              })}
            </List.Section>
          </ScrollView>
        )}

        {devices.length < 1 && (
          <Components.AppEmptyDataView
            iconType={'font-awesome5'}
            iconName="raspberry-pi"
            style={{}}
            header={t('devicesList.emptyDeviceTitle')}
            subHeader={t('devicesList.emptyDeviceSubtitle')}
            renderContent={renderNoDataButtons}
          />
        )}
      </View>

      <FAB
        label={t('devicesList.fabAddMore')!}
        icon="plus"
        color={colors.onPrimary}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomInsets }]}
        onPress={onPressAddNewDevice}
      />
    </Components.AppBaseView>
  );
};

export default ManageDevices;
