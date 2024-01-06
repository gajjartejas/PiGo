import React, { useCallback, useMemo, useState } from 'react';
import { View, TextInput, SectionList } from 'react-native';

//ThirdParty
import { Button, FAB, IconButton, List } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import AppHeader from 'app/components/AppHeader';
import IPiAppServer from 'app/models/models/piAppServer';
import useAppConfigStore from 'app/store/appConfig';
import Components from 'app/components';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import PiAppServer from 'app/models/models/piAppServer';

interface GroupedPiAppServers {
  title: string;
  data: PiAppServer[];
}

export function useSearch(array: GroupedPiAppServers[], searchTerm: string): GroupedPiAppServers[] {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return array;
  }
  return array
    .map(entry => {
      let filteredData = entry.data.filter(
        v =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      return {
        title: entry.title,
        data: filteredData,
      };
    })
    .filter(v => v.data.length > 0);
}

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
  const [searchText, setSearchText] = useState('');
  const [visibleIndex, setVisibleIndex] = React.useState<number | null>(null);
  const [visibleSectionIndex, setVisibleSectionIndex] = React.useState<number | null>(null);

  const groupedPiAppServers: GroupedPiAppServers[] = useMemo(() => {
    return piAppServers.reduce((accumulator: GroupedPiAppServers[], appServer: PiAppServer) => {
      const category = appServer.category;
      const existingCategory = accumulator.find(group => group.title === category);
      if (existingCategory) {
        existingCategory.data.push(appServer);
      } else {
        accumulator.push({
          title: category,
          data: [appServer],
        });
      }

      return accumulator;
    }, []);
  }, [piAppServers]);

  const filteredArray = useSearch(groupedPiAppServers, searchText);

  const openMenu = useCallback((item: IPiAppServer, subIndex: number, index: number) => {
    setVisibleSectionIndex(subIndex);
    setVisibleIndex(index);
  }, []);

  const closeMenu = useCallback(() => {
    setVisibleIndex(null);
    setVisibleSectionIndex(null);
  }, []);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onPressPiAppServer = useCallback(
    (item: IPiAppServer, _sectionIndex: number, _index: number) => {
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
    (item: IPiAppServer, _subIndex: number, _index: number) => {
      closeMenu();
      navigation.navigate('AddPiAppServer', { piAppServer: item });
    },
    [closeMenu, navigation],
  );

  const onPressDeleteMenu = useCallback(
    (item: IPiAppServer, _subIndex: number, _index: number) => {
      deletePiAppServer(item.id);
      closeMenu();
    },
    [closeMenu, deletePiAppServer],
  );

  const onPressInfoMenu = useCallback(
    (item: IPiAppServer, _subIndex: number, _index: number) => {
      navigation.navigate('ViewPiAppServer', { piAppServer: item });
      closeMenu();
    },
    [closeMenu, navigation],
  );

  const renderNoDataButtons = useCallback(() => {
    return (
      <View style={styles.noDataButtonsContainer}>
        <Button onPress={onRedirectToCreatePiAppServer}>{t('piAppServersList.createNewPiAppServer')}</Button>
      </View>
    );
  }, [onRedirectToCreatePiAppServer, t]);

  const onPressClear = () => {
    setSearchText('');
  };

  const renderItem = ({ item, index, section }: { item: PiAppServer; index: number; section: GroupedPiAppServers }) => {
    const sectionIndex = groupedPiAppServers.findIndex(v => v.title === section.title);
    return (
      <Components.PiAppServerRow
        onPressPiAppServer={onPressPiAppServer}
        openMenu={openMenu}
        onPressEditMenu={onPressEditMenu}
        onPressDeleteMenu={onPressDeleteMenu}
        onPressInfoMenu={onPressInfoMenu}
        closeMenu={closeMenu}
        index={index}
        sectionIndex={sectionIndex}
        visibleIndex={visibleIndex}
        visibleSectionIndex={visibleSectionIndex}
        item={item}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={mode === 'select' ? t('piAppServersList.selectTitle') : t('piAppServersList.listTitle')}
        style={{ backgroundColor: colors.background }}
      />

      <View style={[styles.subView, largeScreenMode && styles.cardTablet]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.leftSearchButton, { backgroundColor: colors.surface }]}>
            <IconButton icon={'magnify'} iconColor={`${colors.onBackground}50`} size={22} />
          </View>
          <TextInput
            value={searchText}
            onChangeText={v => setSearchText(v)}
            placeholder={t('piAppServersList.searchText')!}
            style={[styles.searchTextInputText, { color: colors.onBackground }]}
          />
          {searchText.length > 0 && (
            <View style={[styles.rightSearchButton, { backgroundColor: colors.surface }]}>
              <IconButton
                icon={'close-circle'}
                iconColor={`${colors.onBackground}50`}
                size={22}
                onPress={onPressClear}
              />
            </View>
          )}
        </View>
        {piAppServers && piAppServers.length > 0 && (
          <SectionList
            contentContainerStyle={styles.scrollViewContainer}
            style={styles.scrollView}
            sections={filteredArray}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <List.Subheader style={{ backgroundColor: colors.background }}>{t(title)}</List.Subheader>
            )}
          />
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
