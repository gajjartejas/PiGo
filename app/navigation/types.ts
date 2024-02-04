import { NavigatorScreenParams } from '@react-navigation/native';
import IPiAppServer from 'app/models/models/piAppServer';
import IDevice from 'app/models/models/device';

export interface LoadingParams {}
export interface MoreAppsParams {}
export interface SettingsParams {}
export interface LicenseTypes {}
export interface AboutParams {}
export interface SelectAppearanceParams {}
export interface TranslatorsParams {}
export interface DashboardTab {
  userId: string;
}
export interface PurchaseScreen {
  fromTheme: boolean;
}

export interface HomeTabsParams {}

export interface MoreTabParams {}
export interface DashboardTabParams {}
export interface ConnectToDeviceListsTabParams {}
export interface ScanSettingParams {}
export interface AddDeviceParams {
  device?: IDevice;
  mode?: 'create' | 'edit' | 'connect';
}
export interface PiAppServersParams {
  mode?: 'view' | 'select';
}
export interface DevicesParams {
  mode?: 'view' | 'select';
}
export interface PiAppWebViewParams {
  piAppServer: IPiAppServer;
}
export interface ViewPiAppServerParams {
  piAppServer: IPiAppServer;
  device?: IDevice;
}
export interface AddPiAppServerParamParams {
  piAppServer?: IPiAppServer;
  mode?: 'create' | 'edit' | 'edit_device_piAppServer';
}
export interface ScanDevicesParams {}
export interface WebViewSettingParams {}
export interface ChangeLanguageParams {}

export type LoggedInTabNavigatorParams = {
  Loading: LoadingParams;
  HomeTabs: HomeTabsParams;
  MoreApps: MoreAppsParams;
  Settings: SettingsParams;
  About: AboutParams;
  SelectAppearance: SelectAppearanceParams;
  License: LicenseTypes;
  Translators: TranslatorsParams;
  Purchase: PurchaseScreen;
  ScanSetting: ScanSettingParams;
  AddDevice: AddDeviceParams;
  PiAppServers: PiAppServersParams;
  Devices: DevicesParams;
  AddPiAppServer: AddPiAppServerParamParams;
  ScanDevices: ScanDevicesParams;
  PiAppWebView: PiAppWebViewParams;
  ViewPiAppServer: ViewPiAppServerParams;
  WebViewSetting: WebViewSettingParams;
  ChangeLanguage: ChangeLanguageParams;
};

export type HomeTabsNavigatorParams = {
  DashboardTab: DashboardTabParams;
  ConnectToDeviceList: ConnectToDeviceListsTabParams;
  MoreTab: MoreTabParams;
};

export type HomeTabNavigatorParams = {
  LoggedInTabNavigator: NavigatorScreenParams<LoggedInTabNavigatorParams>;
};
