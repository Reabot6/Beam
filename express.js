const express = require('express')
const multer = require('multer')
const fs = require('fs')
const os = require('os')
const qrcode = require('qrcode')
const path = require('path')
const WebSocket = require('ws')

const app = express()
app.use(express.json())

let serverUrl = ''
const connectedDevices = {}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

// ── ROUTES ──────────────────────────────────────────

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/files', (req, res) => {
    const files = fs.readdirSync('uploads/')
    res.send(files)
})

app.get('/download', (req, res) => {
    const filename = req.query.filename
    res.download('uploads/' + filename)
})

app.get('/qr', (req, res) => {
    res.setHeader('Content-Type', 'image/png')
    qrcode.toFileStream(res, serverUrl)
})

app.get('/devices', (req, res) => {
    const deviceList = Object.entries(connectedDevices).map(([id, device]) => ({
        id,
        name: device.name
    }))
    res.send(deviceList)
})

app.post('/send', upload.single('file'), (req, res) => {
    res.send('file received and saved')
})

// ── HELPERS ─────────────────────────────────────────

function getDeviceName(userAgent, ip) {
    const shortIp = ip.replace('::ffff:', '')
    if (/iPhone/.test(userAgent)) return `iPhone · ${shortIp}`
    if (/Android/.test(userAgent)) return `Android · ${shortIp}`
    if (/iPad/.test(userAgent)) return `iPad · ${shortIp}`
    if (/Windows/.test(userAgent)) return `Windows PC · ${shortIp}`
    if (/Mac/.test(userAgent)) return `Mac · ${shortIp}`
    if (/Linux/.test(userAgent)) return `Linux · ${shortIp}`
    return `Device · ${shortIp}`
}

function broadcastDeviceList() {
    const deviceList = Object.entries(connectedDevices).map(([id, device]) => ({
        id,
        name: device.name
    }))

    const message = JSON.stringify({
        type: 'device-list',
        devices: deviceList
    })

    Object.values(connectedDevices).forEach(device => {
        if (device.ws.readyState === WebSocket.OPEN) {
            device.ws.send(message)
        }
    })
}

function handleMessage(message, senderId) {
    if (message.type === 'clipboard') {
        const target = connectedDevices[message.targetId]
        if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
                type: 'clipboard-receive',
                text: message.text,
                from: connectedDevices[senderId].name
            }))
        }
    }
}

// ── WEBSOCKET ────────────────────────────────────────

function startServer() {
    const server = app.listen(3000, () => {
        const interfaces = os.networkInterfaces()
        const allAddresses = interfaces['Wi-Fi']
        const ipv4 = allAddresses.find(i => i.family === 'IPv4')
        serverUrl = `http://${ipv4.address}:3000`
        console.log('Door is open on port 3000')
        console.log(`Phone connect here: ${serverUrl}`)
    })

    const wss = new WebSocket.Server({ server })

    wss.on('connection', (ws, req) => {
        const ip = req.socket.remoteAddress
        const userAgent = req.headers['user-agent']
        const deviceId = ip + '-' + Date.now()
        const deviceName = getDeviceName(userAgent, ip)

        connectedDevices[deviceId] = {
            name: deviceName,
            ip: ip,
            ws: ws
        }

        console.log(`Device connected: ${deviceName}`)
        broadcastDeviceList()

        ws.on('message', (data) => {
            const message = JSON.parse(data)
            handleMessage(message, deviceId)
        })

        ws.on('close', () => {
            console.log(`Device disconnected: ${deviceName}`)
            delete connectedDevices[deviceId]
            broadcastDeviceList()
        })
    })
}

// ── SESSION CLEANUP ──────────────────────────────────

function cleanUploads() {
    if (fs.existsSync('uploads/')) {
        fs.rmSync('uploads/', { recursive: true, force: true })
        fs.mkdirSync('uploads/')
    }
}

module.exports = { startServer, cleanUploads }