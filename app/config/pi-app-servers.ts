const PI_APP_SERVERS = [
  {
    id: 'pi-hole',
    name: 'Pi Hole',
    path: '/admin/index.php',
    port: 80,
  },
  {
    id: 'rpi-monitor',
    name: 'RPi-Monitor',
    path: '',
    port: 8888,
  },
  {
    id: 'plex',
    name: 'Plex',
    path: '/web/index.html',
    port: 32400,
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent Web UI',
    path: '',
    port: 8080,
  },
];

export default PI_APP_SERVERS;
