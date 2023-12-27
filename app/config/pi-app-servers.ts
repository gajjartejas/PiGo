const PI_APP_SERVERS = [
  {
    id: 'pi-hole',
    name: 'Pi Hole',
    path: '/admin/index.php',
    port: 80,
    github: 'https://github.com/pi-hole/pi-hole',
    description: 'A black hole for Internet advertisements',
  },
  {
    id: 'ad-guard-home',
    name: 'AdGuardHome',
    path: '',
    port: 8123,
    github: 'https://github.com/AdguardTeam/AdGuardHome',
    description: 'A network-wide ad and tracker blocker.',
  },
  {
    id: 'kodi',
    name: 'Kodi',
    path: '',
    port: 80,
    github: 'https://github.com/xbmc/xbmc',
    description: 'Transform your Raspberry Pi into a media center for streaming and playing multimedia content.',
  },
  {
    id: 'plex',
    name: 'Plex',
    path: '/web/index.html',
    port: 32400,
    github: 'https://github.com/plexinc',
    description: 'Plex organizes all of your personal media so you can enjoy it no matter where you are.',
  },
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    path: '',
    port: 80,
    github: 'https://github.com/home-assistant',
    description: 'Open-source home automation platform that runs on Raspberry Pi.',
  },
  {
    id: 'homebridge',
    name: 'Homebridge',
    path: '',
    port: 8581,
    github: 'https://github.com/homebridge/homebridge',
    description: 'HomeKit support for the impatient.',
  },
  {
    id: 'magic-mirror',
    name: 'Magic Mirror',
    path: '/',
    port: 8080,
    github: 'https://github.com/MichMich/MagicMirror',
    description: 'A smart mirror displaying useful information',
  },
  {
    id: 'motion-eye-os',
    name: 'MotionEyeOS',
    path: '/',
    port: 80,
    github: 'https://github.com/motioneye-project/motioneyeos',
    description: 'Convert your Raspberry Pi into a surveillance camera.',
  },
  {
    id: 'octoprint',
    name: 'OctoPrint',
    path: '',
    port: 5000,
    github: 'https://github.com/OctoPrint/OctoPrint',
    description: 'Manage and monitor 3D printers remotely',
  },

  {
    id: 'rpi-monitor',
    name: 'RPi-Monitor',
    path: '',
    port: 8888,
    github: 'https://github.com/XavierBerger/RPi-Monitor',
    description: 'Real time monitoring for embedded devices',
  },
  {
    id: 'open-wrt-x86-r2s-r4s-r5s-n1',
    name: 'OpenWrt',
    path: '',
    port: 80,
    github: 'https://github.com/kiddin9/OpenWrt_x86-r2s-r4s-r5s-N1',
    description:
      'OpenWrt is an open-source project for embedded operating systems based on Linux, primarily used on embedded devices to route network traffic. The main components are Linux, util-linux, musl, and BusyBox.',
  },
  {
    id: 'umbrel-os',
    name: 'umbrelOS',
    path: '',
    port: 80,
    github: 'https://github.com/getumbrel/umbrel',
    description:
      'A beautiful home server OS for self-hosting with an app store. Buy a pre-built Umbrel Home with umbrelOS, or install on a Raspberry Pi 4, any Ubuntu/Debian system, or a VPS.',
  },
  {
    id: 'tinypilot',
    name: 'tinypilot',
    path: '',
    port: 80,
    github: 'https://github.com/tiny-pilot/tinypilot',
    description: 'Use your Raspberry Pi as a browser-based KVM',
  },
  {
    id: 'tiny-check',
    name: 'TinyCheck',
    path: '',
    port: 80,
    github: 'https://github.com/KasperskyLab/TinyCheck',
    description:
      'TinyCheck allows you to easily capture network communications from a smartphone or any device which can be associated to a Wi-Fi access point in order to quickly analyze them.',
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent Web UI',
    path: '',
    port: 8080,
    github: 'https://manpages.ubuntu.com/manpages/jammy/man1/qbittorrent-nox.1.html',
    description:
      'Bittorrent-nox is an advanced command-line Bittorrent client written in C++ / Qt using the libtorrent-rasterbar library by Arvid Norberg',
  },
  {
    id: 'pigallery2',
    name: 'pigallery2',
    path: '',
    port: 3000,
    github: 'https://github.com/bpatrik/pigallery2',
    description:
      'A fast directory-first photo gallery website, with rich UI, optimized for running on low resource servers (especially on raspberry pi)',
  },
];

export default PI_APP_SERVERS;
