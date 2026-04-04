const express = require('express')
const multer = require('multer')
const fs = require('fs')
const os = require('os')
const qrcode = require('qrcode')
const path = require('path')
const WebSocket = require('ws')
const { app: electronApp } = require('electron')

const app = express()
app.use(express.json())

let serverUrl = ''
const connectedDevices = {}
const userDataPath = electronApp.getPath('userData')
const uploadsDir = path.join(userDataPath, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
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
    const files = fs.readdirSync(uploadsDir)
    res.send(files)
})
app.get('/download', (req, res) => {
    const filename = req.query.filename
    res.download(path.join(uploadsDir, filename))
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
app.get('/serverurl', (req, res) => {
    res.send({ url: serverUrl })
})
app.get('/stream', (req, res) => {
    const filename = req.query.filename
    const filepath = path.join(uploadsDir, filename)

    if (!fs.existsSync(filepath)) {
        return res.status(404).send('File not found')
    }

    const stat = fs.statSync(filepath)
    const fileSize = stat.size
    const ext = path.extname(filename).toLowerCase()

    const mimeTypes = {
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const range = req.headers.range

    if (range && contentType.startsWith('video') || range && contentType.startsWith('audio')) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = (end - start) + 1

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType
        })

        fs.createReadStream(filepath, { start, end }).pipe(res)
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        })

        fs.createReadStream(filepath).pipe(res)
    }
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

    if (message.type === 'file-offer') {
        const target = connectedDevices[message.targetId]
        if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
                type: 'file-offer',
                transferId: message.transferId,
                filename: message.filename,
                filesize: message.filesize,
                from: connectedDevices[senderId].name,
                fromId: senderId
            }))
        }
    }

    if (message.type === 'file-accept') {
        const sender = connectedDevices[message.fromId]
        if (sender && sender.ws.readyState === WebSocket.OPEN) {
            sender.ws.send(JSON.stringify({
                type: 'file-start',
                transferId: message.transferId
            }))
        }
    }

    if (message.type === 'file-reject') {
        const sender = connectedDevices[message.fromId]
        if (sender && sender.ws.readyState === WebSocket.OPEN) {
            sender.ws.send(JSON.stringify({
                type: 'file-rejected',
                transferId: message.transferId
            }))
        }
    }

    if (message.type === 'file-chunk') {
        const target = connectedDevices[message.targetId]
        if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
                type: 'file-chunk',
                transferId: message.transferId,
                chunk: message.chunk,
                chunkIndex: message.chunkIndex,
                totalChunks: message.totalChunks
            }))
        }
    }

    if (message.type === 'file-done') {
        const target = connectedDevices[message.targetId]
        if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
                type: 'file-done',
                transferId: message.transferId,
                filename: message.filename
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

    ws.on('message', (data, isBinary) => {
            if (isBinary) return
            const message = JSON.parse(data.toString())
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
    try {
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir)
            files.forEach(file => {
                try {
                    fs.unlinkSync(path.join(uploadsDir, file))
                } catch (e) {
                    console.log('Could not delete file:', file, e.message)
                }
            })
        }
    } catch (e) {
        console.log('cleanUploads error:', e.message)
    }
}

module.exports = { startServer, cleanUploads }