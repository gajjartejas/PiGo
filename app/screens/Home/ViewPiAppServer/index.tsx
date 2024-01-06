import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';

//ThirdParty
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

//App modules
import styles from './styles';

//Redux
import { LoggedInTabNavigatorParams } from 'app/navigation/types';
import AppHeader from 'app/components/AppHeader';
import Components from 'app/components';
import useLargeScreenMode from 'app/hooks/useLargeScreenMode';
import Utils from 'app/utils';

//Params
type Props = NativeStackScreenProps<LoggedInTabNavigatorParams, 'ViewPiAppServer'>;

const ViewPiAppServer = ({ navigation, route }: Props) => {
  //Refs

  //Constants
  const { colors } = useTheme();
  const theme = useTheme();
  const { t } = useTranslation();
  const largeScreenMode = useLargeScreenMode();
  const piAppServer = route.params.piAppServer;
  const device = route.params.device;

  //States
  const [name, setName] = useState('');
  const [port, setPort] = useState('');
  const [path, setPath] = useState('');
  const [gitHubLink, setGitHubLink] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fullLink, setFullLink] = useState<string | null>(null);

  useEffect(() => {
    if (!piAppServer) {
      return;
    }
    setName(piAppServer.name);
    setPath(piAppServer.path);
    setPort(piAppServer.port.toString());
    setGitHubLink(piAppServer.github.toString());
    setDescription(piAppServer.description.toString());
    setCategory(piAppServer.category);

    if (device) {
      setFullLink('http://' + device?.ip1 + piAppServer.port + piAppServer.path);
    }
  }, [device, piAppServer]);

  const onGoBack = useCallback(() => {
    navigation.pop();
  }, [navigation]);

  const onPressFullLink = useCallback(async () => {
    if (fullLink === null) {
      return;
    }
    await Utils.openInAppBrowser(fullLink);
  }, [fullLink]);

  const onPressGitHub = useCallback(async () => {
    if (gitHubLink.trim().length < 1) {
      return;
    }
    await Utils.openInAppBrowser(gitHubLink);
  }, [gitHubLink]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        showBackButton={true}
        onPressBackButton={onGoBack}
        title={name}
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
                autoCapitalize="none"
                value={name}
                onChangeText={setName}
                placeholder={t('viewPiAppServer.inputPlaceholder1')!}
                containerStyle={styles.inputStyle}
                viewOnly={true}
              />

              <Components.AppTextInput
                autoCapitalize="none"
                value={path}
                onChangeText={setPath}
                placeholder={t('viewPiAppServer.inputPlaceholder2')!}
                containerStyle={styles.inputStyle}
                viewOnly={true}
              />

              <Components.AppTextInput
                autoCapitalize="none"
                value={port}
                onChangeText={setPort}
                placeholder={t('viewPiAppServer.inputPlaceholder3')!}
                containerStyle={styles.inputStyle}
                viewOnly={true}
              />

              {fullLink !== null && (
                <Components.AppTextInput
                  autoCapitalize="none"
                  value={fullLink}
                  placeholder={t('viewPiAppServer.fullLink')!}
                  containerStyle={styles.inputStyle}
                  style={styles.underline}
                  viewOnly={true}
                  onPress={onPressFullLink}
                />
              )}

              <Components.AppTextInput
                autoCapitalize="none"
                value={t(category)!}
                placeholder={t('viewPiAppServer.inputPlaceholder4')!}
                containerStyle={styles.inputStyle}
                viewOnly={true}
              />

              <Components.AppTextInput
                autoCapitalize="none"
                value={gitHubLink.trim().length > 0 ? gitHubLink : '-'}
                onChangeText={setGitHubLink}
                placeholder={t('viewPiAppServer.inputPlaceholder5')!}
                containerStyle={styles.inputStyle}
                style={gitHubLink.trim().length > 0 ? styles.underline : {}}
                viewOnly={true}
                onPress={onPressGitHub}
              />

              <Components.AppTextInput
                multiline={true}
                autoCapitalize="none"
                value={description.trim().length > 0 ? description : '-'}
                onChangeText={setDescription}
                placeholder={t('viewPiAppServer.inputPlaceholder6')!}
                containerStyle={styles.inputStyle}
                style={[styles.inputMultilineStyle, { color: colors.onBackground }]}
                viewOnly={true}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ViewPiAppServer;
