import IPiAppServer from 'app/models/models/piAppServer';

interface IDevice {
  id: string;
  name: string;
  scanPorts: number[];
  ip1: string;
  ip2: string | null;
  ip3: string | null;
  selectedIp: string;
  piAppServers: IPiAppServer[];
}

export default IDevice;
