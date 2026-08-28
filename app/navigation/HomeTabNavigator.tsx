import React from 'react';

//Third Party
import { useTheme } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommonIcon from 'app/components/CommonIcon.tsx';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//Screens
import MoreTab from 'app/screens/Home/MoreTab';
import MoreApps from 'app/screens/Settings/MoreApps';
import Settings from 'app/screens/Settings/Settings';
import About from 'app/screens/Settings/About';
import SelectAppearance from 'app/screens/Settings/SelectAppearance';
import License from 'app/screens/Settings/License';
import Translators from 'app/screens/Settings/Translators';

//App Modules
import { HomeTabsNavigatorParams, LoggedInTabNavigatorParams } from 'app/navigation/types';
import Loading from 'app/screens/Loading';
import { AppTheme } from 'app/models/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScanSetting from 'app/screens/Settings/ScanSetting';
import AddDevice from 'app/screens/Home/AddDevice';
import ManagePiAppServers from 'app/screens/Home/ManagePiAppServers';
import AddPiAppServer from 'app/screens/Home/AddPiAppServer';
import ManageDevices from 'app/screens/Home/ManageDevices';
import PiAppServers from 'app/screens/Home/PiAppServers';
import ScanDevices from 'app/screens/Home/ScanDevices';
import PiAppWebView from 'app/screens/Home/PiAppWebView';
import ViewPiAppServer from 'app/screens/Home/ViewPiAppServer';
import WebViewSetting from 'app/screens/Settings/WebViewSetting';
import ChangeLanguage from 'app/screens/Settings/ChangeLanguage';

const Tab = createBottomTabNavigator<HomeTabsNavigatorParams>();

function HomeTabs() {
  //Constants
  const { colors } = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          height: insets.bottom + 44,
          borderTopWidth: 0,
        },
      }}>
      <Tab.Screen
        name="ManageDevices"
        component={ManageDevices}
        initialParams={{ mode: 'connect-pi-server' }}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <CommonIcon
              type="material"
              name="view-dashboard"
              size={22}
              color={focused ? colors.primary : colors.onSurfaceVariant}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreTab}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <CommonIcon
              type="fontawesome6"
              name="ellipsis"
              size={20}
              color={focused ? colors.primary : colors.onSurfaceVariant}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const LoggedInStack = createNativeStackNavigator<LoggedInTabNavigatorParams>();

const LoggedInTabNavigator = () => {
  return (
    <LoggedInStack.Navigator screenOptions={{ headerShown: false }}>
      <LoggedInStack.Screen name="Loading" component={Loading} />
      <LoggedInStack.Screen name="HomeTabs" component={HomeTabs} />
      <LoggedInStack.Screen name="MoreApps" component={MoreApps} />
      <LoggedInStack.Screen name="Settings" component={Settings} />
      <LoggedInStack.Screen name="About" component={About} />
      <LoggedInStack.Screen name="SelectAppearance" component={SelectAppearance} />
      <LoggedInStack.Screen name="License" component={License} />
      <LoggedInStack.Screen name="Translators" component={Translators} />
      <LoggedInStack.Screen name="ScanSetting" component={ScanSetting} />
      <LoggedInStack.Screen name="AddDevice" component={AddDevice} />
      <LoggedInStack.Screen name="ManagePiAppServers" component={ManagePiAppServers} />
      <LoggedInStack.Screen name="AddPiAppServer" component={AddPiAppServer} />
      <LoggedInStack.Screen name="ManageDevices" component={ManageDevices} />
      <LoggedInStack.Screen name="ScanDevices" component={ScanDevices} />
      <LoggedInStack.Screen name="PiAppWebView" component={PiAppWebView} />
      <LoggedInStack.Screen name="ViewPiAppServer" component={ViewPiAppServer} />
      <LoggedInStack.Screen name="WebViewSetting" component={WebViewSetting} />
      <LoggedInStack.Screen name="ChangeLanguage" component={ChangeLanguage} />
      <LoggedInStack.Screen name="PiAppServers" component={PiAppServers} />
    </LoggedInStack.Navigator>
  );
};

export default LoggedInTabNavigator;
