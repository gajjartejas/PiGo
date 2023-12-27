import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Keyboard } from 'react-native';

//ThirdParty
import { Button, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import validateIPAddress from 'app/utils/validateIPAddress';
import { useTranslation } from 'react-i18next';
import AppHeader from 'app/components/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Components from 'app/components';
import useAppConfigStore from 'app/store/appConfig';
import uuid from 'react-native-uuid';
import IDevice from 'app/models/models/device';
import useEventEmitter from 'app/hooks/useDeviceEventEmitter';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import useAppScanConfigStore from 'app/store/appScanConfig';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'AddDevice'>;

const AddDevice = ({ navigation, route }: Props) => {
  //Refs
  let connectionNameRef = useRef<TextInput | null>(null);
  let ipAddressRef = useRef<TextInput | null>(null);

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
  const [ipAddress, setIPAddress] = useState('');
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
    setIPAddress(device.ip);
  }, [device]);

  const onPressSave = useCallback(async () => {
    Keyboard.dismiss();

    let deviceAddOrUpdate: IDevice = {
      id: device ? device.id : uuid.v4().toString(),
      name: connectionName.trim(),
      scanPorts: ports,
      ip: ipAddress.trim(),
      piAppServers: device?.piAppServers ?? [],
    };

    upsertDevice(deviceAddOrUpdate);

    navigation.pop();
  }, [connectionName, device, ipAddress, navigation, ports, upsertDevice]);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const validIPAddress = useCallback(
    (field: string): string | null => {
      return !validateIPAddress(field) ? t('addDevice.invalidIpAddress') : null;
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
    return validIPAddress(ipAddress) !== null || validateName(connectionName) !== null;
  }, [connectionName, ipAddress, validIPAddress, validateName]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={headerTitle}
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
                ref={connectionNameRef}
                autoCapitalize="none"
                value={connectionName}
                onChangeText={setConnectionName}
                placeholder={t('addDevice.inputPlaceholder1')!}
                errorText={validateName(ipAddress)}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={() => ipAddressRef.current?.focus()}
                keyboardType={'default'}
                returnKeyType={'next'}
              />

              <Components.AppTextInput
                ref={ipAddressRef}
                autoCapitalize="none"
                value={ipAddress}
                onChangeText={setIPAddress}
                placeholder={t('addDevice.inputPlaceholder2')!}
                errorText={validIPAddress(ipAddress)}
                containerStyle={styles.inputStyle}
                placeholderTextColor={theme.colors.onSurface}
                onSubmitEditing={() => ipAddressRef.current?.focus()}
                keyboardType={'numeric'}
                returnKeyType={'next'}
                RightAccessoryView={
                  <IconButton icon="magnify" iconColor={theme.colors.primary} size={20} onPress={onScanDevices} />
                }
              />
            </View>
          </View>
        </ScrollView>

        <Button
          disabled={validInputs}
          mode={'contained'}
          style={[styles.button, largeScreenMode && styles.cardTablet, { marginBottom: insets.bottom + 8 }]}
          onPress={onPressSave}>
          {buttonTitle}
        </Button>
      </View>
    </View>
  );
};

export default AddDevice;
