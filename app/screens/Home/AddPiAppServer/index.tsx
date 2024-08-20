import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Keyboard, TextInput, KeyboardAvoidingView } from 'react-native';

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
  const pathRef = useRef<TextInput | null>(null);
  const portRef = useRef<TextInput | null>(null);
  const secureConnectionRef = useRef<TextInput | null>(null);
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
  const [path, setPath] = useState('');
  const [port, setPort] = useState('');
  const [secureConnection, setSecureConnection] = useState(false);
  const [gitHubLink, setGitHubLink] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [connectionTypeDialogVisible, setConnectionTypeDialogVisible] = useState(false);

  useEffect(() => {
    if (!piAppServer) {
      return;
    }
    //piAppServer
    setName(piAppServer.name);
    setPath(piAppServer.path);
    setPort(piAppServer.port.toString());
    setSecureConnection(piAppServer.secureConnection);
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
      secureConnection: secureConnection,
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
    secureConnection,
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

  //Category
  const onPressCategoryMenu = useCallback(() => {
    setCategoryDialogVisible(true);
  }, []);

  const onPressConfirmCategory = useCallback((v: string) => {
    setCategory(v);
    setCategoryDialogVisible(false);
  }, []);

  const hideCategoryDialog = useCallback(() => {
    setCategoryDialogVisible(false);
  }, []);

  //Connection Type
  const onPressConnectionTypeMenu = useCallback(() => {
    setConnectionTypeDialogVisible(true);
  }, []);

  const onPressConfirmConnectionType = useCallback((v: string) => {
    setSecureConnection(v === 'HTTPS');
    setConnectionTypeDialogVisible(false);
  }, []);

  const hideConnectionTypeDialog = useCallback(() => {
    setConnectionTypeDialogVisible(false);
  }, []);

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

  const validCategory = useCallback(
    (field: string): string | null => {
      return field.trim().length < 1 ? t('addPiAppServer.invalidCategory') : null;
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
    return validName(name) !== null || validPort(port) !== null || validCategory(category) !== null;
  }, [category, name, port, validCategory, validName, validPort]);

  const bottomInsets = useMemo(() => {
    return insets.bottom > 0 ? insets.bottom : 16;
  }, [insets.bottom]);

  return (
    <Components.AppBaseView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={piAppServer ? t('addPiAppServer.titleUpdate') : t('addPiAppServer.titleAddPiAppServer')}
        style={{ backgroundColor: colors.background }}
      />
      <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={0} style={styles.subView}>
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
                errorText={validName(name)}
                containerStyle={styles.inputStyle}
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
                onSubmitEditing={onPressCategoryMenu}
                keyboardType={'numeric'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={secureConnectionRef}
                value={secureConnection ? 'HTTPS(Secure)' : 'HTTP (Not Secure)'}
                placeholder={t('addPiAppServer.inputPlaceholder4')!}
                containerStyle={styles.inputStyle}
                onPress={onPressConnectionTypeMenu}
              />

              <Components.AppTextInput
                ref={categoryRef}
                value={t(category)!}
                placeholder={t('addPiAppServer.inputPlaceholder5')!}
                containerStyle={styles.inputStyle}
                onPress={onPressCategoryMenu}
              />

              <Components.AppTextInput
                ref={githubLinkRef}
                autoCapitalize="none"
                value={gitHubLink}
                onChangeText={setGitHubLink}
                placeholder={t('addPiAppServer.inputPlaceholder6')!}
                errorText={validURL(gitHubLink)}
                containerStyle={styles.inputStyle}
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
                placeholder={t('addPiAppServer.inputPlaceholder7')!}
                errorText={validURL(gitHubLink)}
                containerStyle={styles.inputStyle}
                style={[styles.inputMultilineStyle, { color: colors.onBackground }]}
                keyboardType={'default'}
                returnKeyType={'default'}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomView}>
        <Button
          disabled={validInputs}
          mode={'contained'}
          style={[styles.button, largeScreenMode && styles.cardTablet, { marginBottom: bottomInsets }]}
          onPress={onPressSave}>
          {piAppServer ? t('addPiAppServer.updateButton') : t('addPiAppServer.saveButton')}
        </Button>
      </View>
      <Components.AppRadioSelectDialog
        visible={categoryDialogVisible}
        title={t('addPiAppServer.selectCategoryDialog.title')}
        items={Object.values(PI_APP_CATEGORIES)}
        onPressConfirm={onPressConfirmCategory}
        onPressCancel={hideCategoryDialog}
        selectedItem={category}
      />

      <Components.AppRadioSelectDialog
        visible={connectionTypeDialogVisible}
        title={t('addPiAppServer.selectConnectionTypeDialog.title')}
        items={['HTTP', 'HTTPS']}
        onPressConfirm={onPressConfirmConnectionType}
        onPressCancel={hideConnectionTypeDialog}
        selectedItem={secureConnection ? 'HTTPS' : 'HTTP'}
      />
    </Components.AppBaseView>
  );
};

export default AddPiAppServer;
