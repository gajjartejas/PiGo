import React, { memo, ReactElement, useEffect } from 'react';
import { Appearance, View } from 'react-native';

//App Modules
import styles from './styles';
import AppearancePreferences = Appearance.AppearancePreferences;
import useThemeConfigStore, { IAppearanceType } from 'app/store/themeConfig';
import useAppWebViewConfigStore from 'app/store/webViewConfig';
import DeviceInfo from 'react-native-device-info';
import i18n from 'app/locales';
import useAppLangConfigStore from 'app/store/appLangConfig';

//Interface
export type Props = {
  children: ReactElement[] | ReactElement;
};

const AppManager = ({ children }: Props) => {
  const setIsDarkMode = useThemeConfigStore(store => store.setIsDarkMode);
  const appearance = useThemeConfigStore(store => store.appearance);
  const userAgent = useAppWebViewConfigStore(store => store.userAgent);
  const setUserAgent = useAppWebViewConfigStore(store => store.setUserAgent);
  const selectedLanguageCode = useAppLangConfigStore(store => store.selectedLanguageCode);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguageCode).then(() => {});
  }, [selectedLanguageCode]);

  useEffect(() => {
    if (userAgent === undefined) {
      DeviceInfo.getUserAgent().then(ua => {
        setUserAgent(ua);
      });
    }
  }, [setUserAgent, userAgent]);

  useEffect(() => {
    const onThemeChange = (preferences: AppearancePreferences) => {
      if (appearance === IAppearanceType.Auto) {
        setIsDarkMode(preferences.colorScheme === 'dark');
      }
    };
    const listener = Appearance.addChangeListener(onThemeChange);
    return () => listener.remove();
  }, [appearance, setIsDarkMode]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>{children}</View>
    </View>
  );
};

export default memo(AppManager);
