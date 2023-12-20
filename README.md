[<img align="right" src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/instagram.svg" width="50" height="50" />](http://www.instagram.com/gajjartejas)
[<img align="right" src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/twitter.svg" width="50" height="50" />](http://www.twitter.com/gajjartejas)

# Introduction

Welcome to PiGo – the open-source, free mobile companion for Raspberry Pi enthusiasts. Effortlessly explore and manage multiple Pi servers on the go. PiGo: Your free and open gateway to seamless server navigation.

## Installation

Get the app from Google Play:

<a href="https://play.google.com/store/apps/details?id=com.tejasgajjar.pigo">
  <img alt="Android app on Google Play" src="https://developer.android.com/images/brand/en_generic_rgb_wo_60.png" />
</a>

### Screenshots

|                                                |                                                    |                                          |                                          |                                           |
|:----------------------------------------------:|:--------------------------------------------------:|:----------------------------------------:|:----------------------------------------:|:-----------------------------------------:|
| ![Accounts List](docs/images/screenshot-1.png) | ![Transactions List](docs/images/screenshot-2.png) | ![Reports](docs/images/screenshot-3.png) | ![Reports](docs/images/screenshot-4.png) | ![Reports](docs/images/screenshot-5.png)  |
| ![Accounts List](docs/images/screenshot-6.png) | ![Transactions List](docs/images/screenshot-7.png) | ![Reports](docs/images/screenshot-8.png) | ![Reports](docs/images/screenshot-9.png) | ![Reports](docs/images/screenshot-10.png) |

The application supports Android 5.0 (API 21) and above.

## Features include:

- Auto scan live Raspberry PI web server.
- Add manually/Scan automatically Raspberry remote web server using IP address and port.
- Dark theme support.
- Multi-language support.

## Building

### Basic setup

If you want to build from source, just do

    git clone https://github.com/gajjartejas/PiGo.git
    cd PiGo
    `npm install` or `yarn`
    cd ios && pod install && cd..

### With Android Studio

1. Clone repo `git clone https://github.com/gajjartejas/PiGo.git`
2. In Android Studio select "Open an existing Android Studio Project"
3. Wait for Gradel to sync and then run or build.

### With Xcode

1. Clone repo `git clone https://github.com/gajjartejas/PiGo.git`
2. Navigate to `PiGo/ios` and open `PiGo.xcworkspace` folder.
3. Run the project.

## Todo

1. List all remote web servers within the network. - Done
   Share text or PDF via react-native-share, print system info, or HTML download.
2. Real-time chart.
3. Take a snapshot of data in the database at a particular time or manually.
4. Display data over the internet.
5. Widget support.
6. Alert based on CPU usage, GPU usage, or device goes offline.
7. Firebase real-time support with a separate electron app that syncs data with Firebase login and QR code support.

## Contributing

There are many ways you can contribute to the development.

- Pull requests are always welcome!
- You must respect conventional commits for your commits and MR title.
- You can merge only if your CI is green.
- give priority to squash and merge, and not merge with a merge commit
- Please visit [CrowdIn](https://crowdin.com/project/pigo) to update and create new translations

## License

PiGo is licensed under the [MIT License](https://github.com/gajjartejas/PiGo/blob/main/LICENSE).
