<div align="center">

```
██████╗ ███████╗ █████╗ ███╗   ███╗
██╔══██╗██╔════╝██╔══██╗████╗ ████║
██████╔╝█████╗  ███████║██╔████╔██║
██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║
██████╔╝███████╗██║  ██║██║ ╚═╝ ██║
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
```

**Transfer files and clipboard between your devices — no internet, no accounts, no cloud.**

[![Windows](https://img.shields.io/badge/Windows-.exe-8b5cf6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Reabot6/Beam/releases/latest)
[![Mac](https://img.shields.io/badge/macOS-.dmg-8b5cf6?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/Reabot6/Beam/releases/latest)
[![Linux](https://img.shields.io/badge/Linux-.AppImage-8b5cf6?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/Reabot6/Beam/releases/latest)

[![Version](https://img.shields.io/github/v/release/Reabot6/Beam?style=flat-square&color=8b5cf6&label=latest)](https://github.com/Reabot6/Beam/releases)
[![License](https://img.shields.io/badge/license-MIT-8b5cf6?style=flat-square)](LICENSE)
[![Made by](https://img.shields.io/badge/made%20by-Reabot6-8b5cf6?style=flat-square)](https://github.com/Reabot6)

</div>

---

## What is Beam?

Beam is a desktop app that turns your PC into a local file transfer hub. Open it, scan the QR code on your phone, and you're connected — no accounts, no internet required, no files leaving your network.

Send files from your PC to your phone. Send files from your phone to your PC. Share clipboard text between any connected device. Everything happens directly over your WiFi, at local network speeds.

---

## How it works

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Your PC runs Beam                                     │
│   ─────────────────                                     │
│   A local server starts on your WiFi network           │
│   A QR code is generated from your PC's IP address     │
│                                                         │
│   Your Phone scans the QR                              │
│   ──────────────────────                                │
│   Browser opens to your PC's Beam interface            │
│   Both devices are now connected                       │
│                                                         │
│   You transfer                                          │
│   ────────────                                          │
│   Files go directly between devices                    │
│   Nothing touches the internet                         │
│   Session ends → all files deleted automatically       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### File Transfer
- Send files in any direction — PC to phone, phone to PC, phone to phone
- Select multiple files at once, transfers queue automatically one by one
- Drag and drop support on desktop
- Real-time progress bar per file
- All major file types supported — videos, images, documents, archives, code

### Clipboard Sync
- Paste text into Beam on one device
- Select which connected device to send it to
- They see it instantly and copy it with one tap
- Works for links, notes, passwords, anything text-based

### Device Awareness
- See every device connected to your Beam session in real time
- Devices identified automatically — iPhone, Android, Windows PC, Mac
- Live connection status, updates instantly when devices join or leave

### Privacy First
- Zero internet dependency — everything stays on your local network
- Session-based storage — when you close Beam, all transferred files are permanently deleted
- No accounts, no sign-up, no telemetry
- Your files never touch any external server

### QR Connect
- PC displays a QR code
- Phone scans it with the camera
- Instantly opens Beam in the phone browser
- No typing, no pairing codes

---

## Download

| Platform | Download |
|----------|----------|
| **Windows** | [Beam-Setup-x.x.x.exe](https://github.com/Reabot6/Beam/releases/latest) |
| **macOS** | [Beam-x.x.x.dmg](https://github.com/Reabot6/Beam/releases/latest) |
| **Linux** | [Beam-x.x.x.AppImage](https://github.com/Reabot6/Beam/releases/latest) |

> Your phone doesn't need to install anything. Just a browser.

---

## Getting Started

**1. Download and install Beam** on your PC using one of the links above.

**2. Open Beam.** You'll see the main interface with SEND, RECEIVE, DEVICES, and CLIPBOARD tabs.

**3. Click QR CONNECT** in the top right. A QR code appears.

**4. Open your phone camera** and scan the code. Your phone browser opens automatically.

**5. You're connected.** Start sending files or clipboard text between your devices.

---

## Usage

### Sending a file from PC to Phone
1. Open the **SEND** tab on your PC
2. Tap the upload area or drag files in
3. On your phone, open the **RECEIVE** tab
4. Your files appear as cards — tap to download

### Sending a file from Phone to PC
1. On your phone, open the **SEND** tab
2. Tap to select any file from your phone storage
3. File uploads to Beam and appears on PC in the **RECEIVE** tab

### Sharing clipboard text
1. Copy something on your phone
2. Open the **CLIPBOARD** tab in Beam on your phone
3. Paste the text into the input field
4. Select your PC from the device list
5. Hit **BEAM CLIPBOARD**
6. On your PC, open the **CLIPBOARD** tab — it's there waiting

---

## Stack

Built with Node.js and Electron. No cloud services, no external APIs.

```
electron          desktop app wrapper
express           local HTTP server
ws                WebSocket for real-time device sync
multer            file upload handling
qrcode            QR code generation
fs + os           file system and network interface access
electron-updater  automatic updates from GitHub releases
```

---

## Running from source

```bash
# clone the repo
git clone https://github.com/Reabot6/Beam.git
cd Beam

# install dependencies
npm install

# start in development mode
npm start

# build installer for your platform
npm run build
```

> Requires Node.js 18 or higher.

---

## Roadmap

- [x] File transfer — PC ↔ Phone
- [x] Multiple file queue with per-file progress
- [x] QR code connection
- [x] Real-time device list
- [x] Clipboard sync between devices
- [x] Session-based storage — auto delete on close
- [x] Auto updates via GitHub releases
- [ ] Transfer history within session
- [ ] Folder transfer support
- [ ] Transfer speed indicator
- [ ] Dark / light theme toggle

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## Support

Beam is free and will stay free. If it's saved you time, a contribution keeps it maintained.

**Moniepoint MSB · Adeiza Onimisi Adeolu · 7074088848**

---

## License

MIT — do whatever you want with it.

---

<div align="center">

Built by [Reabot6](https://github.com/Reabot6) · Lagos, Nigeria

*No internet required. No accounts. Just your network.*

</div>
