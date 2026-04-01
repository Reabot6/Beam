const path = require('path')
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const os = require('os')
const qrcode = require('qrcode')
const app = express()

let serverUrl = ''

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })
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

app.post('/send', upload.single('file'), (req, res) => {
    res.send('file received and saved')
})

app.listen(3000, () => {
    const interfaces = os.networkInterfaces()
    const allAddresses = interfaces['Wi-Fi']
    const ipv4 = allAddresses.find(i => i.family === 'IPv4')
    serverUrl = `http://${ipv4.address}:3000`
    console.log('Door is open on port 3000')
    console.log(`Phone connect here: ${serverUrl}`)
})