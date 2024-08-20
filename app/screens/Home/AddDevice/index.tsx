import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Keyboard, KeyboardAvoidingView } from 'react-native';

//ThirdParty
import { Button, IconButton } from 'react-native-paper';
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
import IDevice from 'app/models/models/device';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import useAppScanConfigStore from 'app/store/appScanConfig';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'AddDevice'>;

const AddDevice = ({ navigation, route }: Props) => {
  //Refs
  let connectionNameRef = useRef<TextInput | null>(null);
  let ipAddress1Ref = useRef<TextInput | null>(null);
  let ipAddress2Ref = useRef<TextInput | null>(null);
  let ipAddress3Ref = useRef<TextInput | null>(null);

  //Constants
  const { colors } = useTheme();
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mode = route.params.mode;
  const ports = useAppScanConfigStore(store => store.ports);
  const upsertDevice = useAppConfigStore(store => store.upsertDevice);
  const largeScreenMode = useLargeScreenMode();

  //States
  const [device, setDevice] = useState<IDevice | null>(null);
  const [connectionName, setConnectionName] = useState('');
  const [ipAddress1, setIPAddress1] = useState('');
  const [ipAddress2, setIPAddress2] = useState('');
  const [ipAddress3, setIPAddress3] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [buttonTitle, setButtonTitle] = useState('');

  useEventEmitter<IDevice>('on_select_scanned_device', data => {
    setDevice(data);
  });

  useEffect(() => {
    if (mode === 'create') {
      setHeaderTitle(t('addDevice.addDevice')!);
      setButtonTitle(t('addDevice.titleCreate')!);
    } else if (mode === 'edit') {
      setHeaderTitle(t('addDevice.updateDevice')!);
      setButtonTitle(t('addDevice.titleUpdate')!);
    } else if (mode === 'connect') {
      setHeaderTitle(t('addDevice.titleConnect')!);
      setButtonTitle(t('addDevice.connectDevice')!);
    }
  }, [mode, t]);

  useEffect(() => {
    setDevice(route.params.device ? route.params.device : null);
  }, [route.params.device]);

  useEffect(() => {
    if (device) {
      return;
    }
  }, [device]);

  useEffect(() => {
    if (device === null) {
      return;
    }

    setConnectionName(device.name ? device.name : '');
    setIPAddress1(device.ip1);
    setIPAddress2(device.ip2 || '');
    setIPAddress3(device.ip3 || '');
  }, [device]);

  const onPressSave = useCallback(async () => {
    Keyboard.dismiss();

    const deviceAddOrUpdate: IDevice = {
      id: device ? device.id : uuid.v4().toString(),
      name: connectionName.trim(),
      scanPorts: ports,
      ip1: ipAddress1.trim(),
      ip2: ipAddress2.trim(),
      ip3: ipAddress3.trim(),
      selectedIp: ipAddress1.trim(),
      piAppServers: device?.piAppServers ?? [],
    };

    upsertDevice(deviceAddOrUpdate);

    navigation.pop();
  }, [connectionName, device, ipAddress1, ipAddress2, ipAddress3, navigation, ports, upsertDevice]);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const validIPAddress = useCallback(
    (field: string): string | null => {
      return field.trim().length < 2 ? t('addDevice.invalidIpAddress') : null;
    },
    [t],
  );

  const validateName = useCallback(
    (field: string): string | null => {
      return field.trim().length < 1 ? t('addDevice.invalidName') : null;
    },
    [t],
  );

  const onScanDevices = useCallback(() => {
    navigation.navigate('ScanDevices', {});
  }, [navigation]);

  const validInputs = useMemo(() => {
    return validIPAddress(ipAddress1) !== null || validateName(connectionName) !== null;
  }, [connectionName, ipAddress1, validIPAddress, validateName]);

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
        title={headerTitle}
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
                ref={connectionNameRef}
                autoCapitalize="none"
                value={connectionName}
                onChangeText={setConnectionName}
                placeholder={t('addDevice.inputPlaceholder1')!}
                containerStyle={styles.inputStyle}
                onSubmitEditing={() => ipAddress1Ref.current?.focus()}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={ipAddress1Ref}
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                value={ipAddress1}
                onChangeText={setIPAddress1}
                placeholder={t('addDevice.inputPlaceholder2')!}
                errorText={validIPAddress(ipAddress1)}
                containerStyle={styles.inputStyle}
                onSubmitEditing={() => ipAddress2Ref.current?.focus()}
                keyboardType={'url'}
                returnKeyType={'next'}
                RightAccessoryView={
                  <IconButton icon="magnify" iconColor={theme.colors.primary} size={20} onPress={onScanDevices} />
                }
              />
              <Components.AppTextInput
                ref={ipAddress2Ref}
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                value={ipAddress2}
                onChangeText={setIPAddress2}
                placeholder={t('addDevice.inputPlaceholder3')!}
                containerStyle={styles.inputStyle}
                onSubmitEditing={() => ipAddress3Ref.current?.focus()}
                keyboardType={'url'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={ipAddress3Ref}
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                value={ipAddress3}
                onChangeText={setIPAddress3}
                placeholder={t('addDevice.inputPlaceholder4')!}
                containerStyle={styles.inputStyle}
                keyboardType={'url'}
                returnKeyType={'done'}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomView}>
        <Button icon={'magnify'} mode={'text'} onPress={onScanDevices}>
          {t('addDevice.searchNearbyDevices')}
        </Button>
        <Button
          disabled={validInputs}
          mode={'contained'}
          style={[styles.button, largeScreenMode && styles.cardTablet, { marginBottom: bottomInsets }]}
          onPress={onPressSave}>
          {buttonTitle}
        </Button>
      </View>
    </Components.AppBaseView>
  );
};

export default AddDevice;
