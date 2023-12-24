import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import zustandStorage from 'app/store/zustandStorage';
import IDevice from 'app/models/models/device';
import IDeviceInfo from 'app/models/models/deviceInfo';
import IPiAppServer from 'app/models/models/piAppServer';
import PI_APP_SERVERS from 'app/config/pi-app-servers';

interface IAppConfigState {
  scanning: boolean;
  connected: boolean;
  piAppServers: IPiAppServer[];
  devices: IDevice[];
  selectedDevice: IDevice | null;
  error: any | null;
}

interface IAppConfigActions {
  setScanning: (scanning: boolean) => void;
  reset: () => void;
  upsertPiAppServer: (piAppServer: IPiAppServer) => void;
  deletePiAppServer: (id: string) => void;
  upsertDevice: (device: IDevice) => void;
  deleteDevice: (deviceId: string) => void;
  selectDevice: (device: IDevice) => void;
  updateDeviceInfo: (device: IDeviceInfo | null) => void;

  addPiAppServerToSelectedDevice: (piAppServer: IPiAppServer) => void;
  deletePiAppServerToSelectedDevice: (id: string) => void;
  updatePiAppServerToSelectedDevice: (piAppServer: IPiAppServer) => void;

  disconnect: () => void;
}

const initialState: IAppConfigState = {
  scanning: false,
  connected: false,
  piAppServers: PI_APP_SERVERS,
  devices: [],
  selectedDevice: null,
  error: null,
};

const useAppConfigStore = create<IAppConfigState & IAppConfigActions>()(
  devtools(
    persist(
      set => ({
        ...initialState,
        setScanning: (s: boolean) => set(_state => ({ scanning: s })),
        reset: () => set(_state => ({ ...initialState })),
        upsertPiAppServer: (piAppServer: IPiAppServer) =>
          set(state => {
            const newPiAppServer = [...state.piAppServers];
            const i = newPiAppServer.findIndex(_element => _element.id === piAppServer.id);
            if (i > -1) {
              newPiAppServer[i] = piAppServer;
            } else {
              newPiAppServer.unshift(piAppServer);
            }
            return { ...state, piAppServers: newPiAppServer };
          }),
        deletePiAppServer: (id: string) =>
          set(state => ({ ...state, piAppServers: [...state.piAppServers.filter(v => v.id !== id)] })),
        upsertDevice: (dev: IDevice) =>
          set(state => {
            const newDevice = [...state.devices];
            const i = newDevice.findIndex(_element => _element.id === dev.id);
            if (i > -1) {
              newDevice[i] = dev;
            } else {
              newDevice.unshift(dev);
            }
            return {
              ...state,
              devices: newDevice,
              selectedDevice:
                state.selectedDevice?.id === dev.id ? { ...state.selectedDevice, ...dev } : state.selectedDevice,
            };
          }),
        deleteDevice: (id: string) =>
          set(state => ({ ...initialState, devices: [...state.devices.filter(v => v.id !== id)] })),
        selectDevice: (d: IDevice) => set(() => ({ selectedDevice: d })),
        updateDeviceInfo: (d: IDeviceInfo | null) =>
          set(state => ({
            ...state,
            selectedDevice: state.selectedDevice ? { ...state.selectedDevice, deviceInfo: d } : null,
            error: null,
            requestAuth: false,
          })),
        addPiAppServerToSelectedDevice: (piAppServer: IPiAppServer) =>
          set(state => {
            const selectedDevice = state.selectedDevice
              ? {
                  ...state.selectedDevice,
                  piAppServers: [...state.selectedDevice.piAppServers, piAppServer],
                }
              : state.selectedDevice;

            const devices = state.devices.map(device => (device.id === selectedDevice?.id ? selectedDevice : device));
            return {
              ...state,
              selectedDevice: selectedDevice,
              devices,
            };
          }),
        updatePiAppServerToSelectedDevice: (piAppServer: IPiAppServer) =>
          set(state => {
            const selectedDevice = state.selectedDevice
              ? {
                  ...state.selectedDevice,
                  piAppServers: state.selectedDevice.piAppServers.map(ps =>
                    ps.id === piAppServer.id ? piAppServer : ps,
                  ),
                }
              : state.selectedDevice;

            const devices = state.devices.map(device => (device.id === selectedDevice?.id ? selectedDevice : device));
            return {
              ...state,
              selectedDevice: selectedDevice,
              devices,
            };
          }),
        deletePiAppServerToSelectedDevice: (id: string) => {
          set(state => {
            const selectedDevice = state.selectedDevice
              ? { ...state.selectedDevice, piAppServers: state.selectedDevice.piAppServers.filter(v => v.id !== id) }
              : state.selectedDevice;

            const devices = state.devices.map(device => (device.id === selectedDevice?.id ? selectedDevice : device));

            return {
              ...state,
              devices: devices,
              selectedDevice: selectedDevice,
            };
          });
        },
        disconnect: () =>
          set(_state => ({
            error: null,
            selectedDevice: null,
            requestAuth: false,
            connected: false,
            deviceInfoLoading: false,
          })),
      }),
      {
        name: 'app-config-storage',
        storage: createJSONStorage(() => zustandStorage),
        onRehydrateStorage: state => {
          console.log('useAppConfigStore->hydration starts', state);
        },
        version: 1,
      },
    ),
  ),
);

export default useAppConfigStore;
