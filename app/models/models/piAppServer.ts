interface IPiAppServer {
  id: string;
  name: string;
  path: string;
  port: number;
  github: string;
  description: string;
  reachable?: boolean;
}

export default IPiAppServer;
