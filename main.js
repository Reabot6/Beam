const { app, BrowserWindow, ipcMain } = require('electron')
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
            win.webContents.executeJavaScript(`showUpdateModal('available')`)
        })

        autoUpdater.on('download-progress', (progress) => {
            const pct = Math.round(progress.percent)
            win.webContents.executeJavaScript(`showUpdateModal('downloading', ${pct})`)
        })

        autoUpdater.on('update-downloaded', () => {
            win.webContents.executeJavaScript(`showUpdateModal('ready')`)
        })

    }, 2000)
})

app.on('window-all-closed', () => {
    cleanUploads()
    app.quit()
})

ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall()
})
