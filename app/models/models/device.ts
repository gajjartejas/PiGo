import IPiAppServer from 'app/models/models/piAppServer';

interface IDevice {
  id: string;
  name: string | null;
  scanPorts: number[];
  ip: string;
  piAppServers: IPiAppServer[];
}

export default IDevice;
