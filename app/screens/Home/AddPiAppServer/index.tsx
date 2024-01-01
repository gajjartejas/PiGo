import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Keyboard, TextInput } from 'react-native';

//ThirdParty
import { Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import uuid from 'react-native-uuid';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import AppHeader from 'app/components/AppHeader';
import Components from 'app/components';
import useAppConfigStore from 'app/store/appConfig';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import validatePort from 'app/utils/validatePort';
import IPiAppServer from 'app/models/models/piAppServer';
import isValidHttpUrl from 'app/utils/isValidURL';
import { PI_APP_CATEGORIES } from 'app/config/pi-app-servers';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'AddPiAppServer'>;

const AddPiAppServer = ({ navigation, route }: Props) => {
  //Refs
  const nameRef = useRef<TextInput | null>(null);
  const portRef = useRef<TextInput | null>(null);
  const pathRef = useRef<TextInput | null>(null);
  const categoryRef = useRef<TextInput | null>(null);
  const githubLinkRef = useRef<TextInput | null>(null);
  const descriptionRef = useRef<TextInput | null>(null);

  //Constants
  const { colors } = useTheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();
  const upsertPiAppServer = useAppConfigStore(store => store.upsertPiAppServer);
  const updatePiAppServerToSelectedDevice = useAppConfigStore(store => store.updatePiAppServerToSelectedDevice);
  const mode = route.params.mode;
  const piAppServer = route.params.piAppServer;

  //States
  const [name, setName] = useState('');
  const [port, setPort] = useState('');
  const [path, setPath] = useState('');
  const [gitHubLink, setGitHubLink] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);

  useEffect(() => {
    if (!piAppServer) {
      return;
    }
    //piAppServer
    setName(piAppServer.name);
    setPath(piAppServer.path);
    setPort(piAppServer.port.toString());
    setGitHubLink(piAppServer.github.toString());
    setDescription(piAppServer.description.toString());
    setCategory(piAppServer.category);
  }, [piAppServer]);

  const onPressSave = useCallback(() => {
    Keyboard.dismiss();

    let piAppServerAddOrUpdate: IPiAppServer = {
      id: piAppServer ? piAppServer.id : uuid.v4().toString(),
      name: name.trim(),
      path: path.trim(),
      port: parseInt(port, 10),
      github: gitHubLink.trim(),
      description: description.trim(),
      category: category,
    };

    if (mode === 'edit_device_piAppServer') {
      updatePiAppServerToSelectedDevice(piAppServerAddOrUpdate);
    } else {
      upsertPiAppServer(piAppServerAddOrUpdate);
    }
    navigation.pop();
  }, [
    piAppServer,
    name,
    path,
    port,
    gitHubLink,
    description,
    category,
    mode,
    navigation,
    updatePiAppServerToSelectedDevice,
    upsertPiAppServer,
  ]);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onPressCategoryMenu = () => {
    setCategoryDialogVisible(true);
  };

  const onPressConfirmCategory = (v: string) => {
    setCategory(v);
    setCategoryDialogVisible(false);
  };

  const hideCategoryDialog = () => {
    setCategoryDialogVisible(false);
  };

  const validName = useCallback(
    (field: string): string | null => {
      return !field ? t('addPiAppServer.invalidName') : null;
    },
    [t],
  );

  const validPort = useCallback(
    (field: string): string | null => {
      return !validatePort(field) ? t('addPiAppServer.invalidIpAddress') : null;
    },
    [t],
  );

  const validURL = useCallback(
    (field: string): string | null => {
      return field.trim().length > 1 && !isValidHttpUrl(field) ? t('addPiAppServer.invalidURLAddress') : null;
    },
    [t],
  );

  const validInputs = useMemo(() => {
    return validPort(port) !== null || validName(name) !== null;
  }, [name, port, validName, validPort]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={piAppServer ? t('addPiAppServer.titleUpdate') : t('addPiAppServer.titleAddPiAppServer')}
        style={{ backgroundColor: colors.background }}
      />
      <View style={styles.subView}>
        <ScrollView keyboardDismissMode={'interactive'} style={styles.scrollView}>
          <View style={[styles.centeredView]}>
            <View
              style={[
                styles.modalView,
                largeScreenMode && styles.cardTablet,
                { backgroundColor: `${theme.colors.background}` },
              ]}>
              <Components.AppTextInput
                ref={nameRef}
                autoCapitalize="none"
                value={name}
                onChangeText={setName}
                placeholder={t('addPiAppServer.inputPlaceholder1')!}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={() => pathRef.current?.focus()}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={pathRef}
                autoCapitalize="none"
                value={path}
                onChangeText={setPath}
                placeholder={t('addPiAppServer.inputPlaceholder2')!}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={() => portRef.current?.focus()}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={portRef}
                autoCapitalize="none"
                value={port}
                onChangeText={setPort}
                placeholder={t('addPiAppServer.inputPlaceholder3')!}
                errorText={validPort(port)}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={onPressCategoryMenu}
                keyboardType={'numeric'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={categoryRef}
                autoCapitalize="none"
                value={t(category)!}
                onChangeText={setGitHubLink}
                placeholder={t('addPiAppServer.inputPlaceholder4')!}
                errorText={validURL(gitHubLink)}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onPress={onPressCategoryMenu}
                onSubmitEditing={() => {}}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={githubLinkRef}
                autoCapitalize="none"
                value={gitHubLink}
                onChangeText={setGitHubLink}
                placeholder={t('addPiAppServer.inputPlaceholder5')!}
                errorText={validURL(gitHubLink)}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={() => descriptionRef.current?.focus()}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={descriptionRef}
                multiline={true}
                autoCapitalize="none"
                value={description}
                onChangeText={setDescription}
                placeholder={t('addPiAppServer.inputPlaceholder6')!}
                errorText={validURL(gitHubLink)}
                containerStyle={styles.inputStyle}
                style={[styles.inputMultilineStyle, { color: colors.onBackground }]}
                placeholderTextColor={theme.colors.onSurface}
                keyboardType={'default'}
                returnKeyType={'default'}
              />
            </View>
          </View>
        </ScrollView>

        <Button
          disabled={validInputs}
          mode={'contained'}
          style={[styles.button, largeScreenMode && styles.cardTablet, { marginBottom: insets.bottom + 8 }]}
          onPress={onPressSave}>
          {piAppServer ? t('addPiAppServer.updateButton') : t('addPiAppServer.saveButton')}
        </Button>
      </View>

      <Components.AppRadioSelectDialog
        visible={categoryDialogVisible}
        title={t('addPiAppServer.selectCategoryDialog.title')}
        items={Object.values(PI_APP_CATEGORIES)}
        onPressConfirm={onPressConfirmCategory}
        confirmText={t('addPiAppServer.selectCategoryDialog.ok')}
        onPressCancel={hideCategoryDialog}
        selectedItem={category}
      />
    </View>
  );
};

export default AddPiAppServer;
