const { app, BrowserWindow, ipcMain, BrowserView, globalShortcut } = require('electron')
const {servicesURLs, serviceCounter, services} = require(__dirname + '/data/services')

let addappMenu
let win

function createWindow () {
    win = new BrowserWindow({
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
    app.commandLine.appendSwitch('--remote-debugging-port', '8080')

    win.loadFile('index/index.html')
    win.setMenuBarVisibility(false)
    win.setBackgroundColor('#ffffff')

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
        addappMenu = new BrowserWindow({
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
    })
}

function closeAddMenu() {
    try {
        addappMenu.setClosable(true)
        addappMenu.close()
        addappMenu.setClosable(false)
        addappMenu.destroy()
    } catch {}
}

function setupView(name) {
    console.log("Setting view for service " + name)
    const webview = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        }
    })
    for (let i = 0; i < BrowserView.getAllViews().length; i++) {
        win.removeBrowserView(BrowserView.getAllViews()[i])
    }

    win.setBrowserView(webview)
    webview.setBackgroundColor('#ffffff')

    webview.setBounds({
        y: 80,
        x: 0,
        height: win.getBounds().height - 80,
        width: win.getBounds().width
    })

    win.on('resize', ()=>{
        resizeWebview()
    })

    function resizeWebview() {
        if (win.isMaximized()) {
            webview.setBounds({
                y: 80,
                x: 0,
                height: win.getBounds().height - 98,
                width: win.getBounds().width - 8
            })
        } else {
            webview.setBounds({
                y: 80,
                x: 0,
                height: win.getBounds().height - 80,
                width: win.getBounds().width
            })
        }
    }

    if (name === 'discord') {
        webview.webContents.userAgent = webview.webContents.userAgent
            .replace(/ Webby\\?.([^\s]+)/g, '')
            .replace(/ Electron\\?.([^\s]+)/g, '')
            .replace(/Chrome\\?.([^\s]+)/g, 'Chrome/85.0.4183.83');
    } else {
        webview.webContents.setUserAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/72.0')
    }

    resizeWebview()

    webview.webContents.loadURL(servicesURLs[name])

    win.webContents.send('createdview', webview.id)
}

ipcMain.on('finishservice', (event, args)=>{
    closeAddMenu()
    win.webContents.send('addservice', args)
    setupView(args)
})

ipcMain.on('focusapp', (event, args)=>{
    win.setBrowserView(BrowserView.fromId(args))
})

ipcMain.on('console', (event, args)=>{
    console.log(args)
})

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