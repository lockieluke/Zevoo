const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')

function createWindow () {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: false
        },
        show: false,
        frame: false,
        titleBarStyle: "hidden"
    })

    win.loadFile('index/index.html')
    win.setMenuBarVisibility(false)

    win.webContents.on('dom-ready', async ()=>{
        await win.show()
    })

    ipcMain.on('close', ()=>{
        win.close()
    })

    ipcMain.on('togglemax', ()=>{
        switch (win.isMaximized()) {
            case true:
                win.unmaximize()
                break

            case false:
                win.maximize()
                break
        }
    })

    ipcMain.on('minimize', ()=>{
        win.minimize()
    })

    ipcMain.on('addapp', async ()=>{
        const addappMenu = new BrowserWindow({
            frame: false,
            show: false,
            titleBarStyle: "hidden",
            closable: false,
            skipTaskbar: true,
            maximizable: false,
            movable: false,
            center: true,
            minimizable: false,
            parent: win,
            modal: true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            }
        })

        addappMenu.setClosable(false)

        addappMenu.loadFile('addapp/index.html')

        addappMenu.webContents.on('dom-ready', async ()=>{
            await addappMenu.show()
        })

        ipcMain.on('closeaddapp', ()=>{
            closeAddMenu()
        })

        ipcMain.on('finishservice', (event, args)=>{
            closeAddMenu()
            win.webContents.send('addservice', args)
            console.log("Adding Service with name " + args)
        })

        function closeAddMenu() {
            try {
                addappMenu.setClosable(true)
                addappMenu.close()
                addappMenu.setClosable(false)
                addappMenu.destroy()
            } catch {}
        }
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})