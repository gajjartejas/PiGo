import React, { useCallback } from 'react';
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
import IPiAppServer from 'app/models/models/piAppServer';
import useAppConfigStore from 'app/store/appConfig';
import Components from 'app/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import { useTranslation } from 'react-i18next';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'PiAppServers'>;

const PiAppServers = ({ navigation, route }: Props) => {
  //Refs

  //Constants
  const { colors } = useTheme();
  const piAppServers = useAppConfigStore(store => store.piAppServers);
  const deletePiAppServer = useAppConfigStore(store => store.deletePiAppServer);
  const insets = useSafeAreaInsets();
  const mode = route.params && route.params.mode ? route.params.mode : 'create';
  const onSelectPiAppServerEmitter = useEventEmitter<IPiAppServer>('on_select_piAppServer');
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();

  //States
  const [visibleIndex, setVisibleIndex] = React.useState<number | null>(null);

  const openMenu = useCallback((index: number) => {
    setVisibleIndex(index);
  }, []);

  const closeMenu = useCallback(() => {
    setVisibleIndex(null);
  }, []);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onPressPiAppServer = useCallback(
    (item: IPiAppServer, _index: number) => {
      if (mode === 'select') {
        onSelectPiAppServerEmitter(item);
        navigation.goBack();
      } else {
        navigation.navigate('AddPiAppServer', { piAppServer: item });
      }
    },
    [mode, navigation, onSelectPiAppServerEmitter],
  );

  const onPressAddNewPiAppServer = useCallback(() => {
    navigation.navigate('AddPiAppServer', {});
  }, [navigation]);

  const onRedirectToCreatePiAppServer = useCallback(() => {
    navigation.navigate('AddPiAppServer', {});
  }, [navigation]);

  const onPressEditMenu = useCallback(
    (item: IPiAppServer, _index: number) => {
      closeMenu();
      navigation.navigate('AddPiAppServer', { piAppServer: item });
    },
    [closeMenu, navigation],
  );

  const onPressDeleteMenu = useCallback(
    (item: IPiAppServer, _index: number) => {
      deletePiAppServer(item.id);
      closeMenu();
    },
    [closeMenu, deletePiAppServer],
  );

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onRedirectToCreatePiAppServer}>{t('piAppServersList.createNewPiAppServer')}</Button>
      </View>
    );
  }, [onRedirectToCreatePiAppServer, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={mode === 'select' ? t('piAppServersList.selectTitle') : t('piAppServersList.listTitle')}
        style={{ backgroundColor: colors.background }}
      />
      <View style={[styles.subView, largeScreenMode && styles.cardTablet]}>
        {piAppServers && piAppServers.length > 0 && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
            <List.Section>
              <List.Subheader>{t('piAppServersList.subTitle')}</List.Subheader>
              {piAppServers.map((piAppServer, idx) => {
                return (
                  <List.Item
                    key={idx.toString()}
                    onPress={() => onPressPiAppServer(piAppServer, idx)}
                    title={piAppServer.name}
                    description={`${piAppServer.path}:${piAppServer.port}`}
                    left={props => <List.Icon {...props} icon="web" />}
                    right={props => (
                      <Menu
                        visible={visibleIndex === idx}
                        onDismiss={closeMenu}
                        anchor={<IconButton {...props} icon={'dots-vertical'} onPress={() => openMenu(idx)} />}>
                        <Menu.Item
                          leadingIcon="pencil"
                          onPress={() => {
                            onPressEditMenu(piAppServer, idx);
                          }}
                          title={t('piAppServersList.edit')}
                        />
                        <Menu.Item
                          leadingIcon="delete"
                          onPress={() => {
                            onPressDeleteMenu(piAppServer, idx);
                          }}
                          title={t('piAppServersList.delete')}
                        />
                      </Menu>
                    )}
                  />
                );
              })}
            </List.Section>
          </ScrollView>
        )}

        {piAppServers.length < 1 && (
          <Components.AppEmptyDataView
            iconType={'font-awesome5'}
            iconName="raspberry-pi"
            style={{}}
            header={t('piAppServersList.emptyData.title')}
            subHeader={t('piAppServersList.emptyData.message')}
            renderContent={renderNoDataButtons}
          />
        )}
      </View>

      <FAB
        label={t('piAppServersList.fabAddMore')!}
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={onPressAddNewPiAppServer}
      />
    </View>
  );
};

export default PiAppServers;
