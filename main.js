const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const { startServer, cleanUploads } = require('./express.js')

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false
        }
    })

    win.loadURL('http://localhost:3000')
    return win
}

app.whenReady().then(() => {
    startServer()

    setTimeout(() => {
        const win = createWindow()

        autoUpdater.checkForUpdatesAndNotify()

        autoUpdater.on('update-available', () => {
            win.webContents.executeJavaScript(`
                showToast('New update available — downloading...', 'success')
            `)
        })

        autoUpdater.on('update-downloaded', () => {
            win.webContents.executeJavaScript(`
                showToast('Update ready — restart Beam to apply it', 'success')
            `)
        })

    }, 2000)
})

app.on('window-all-closed', () => {
    cleanUploads()
    app.quit()
})
