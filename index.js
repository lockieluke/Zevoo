const { app, BrowserWindow, ipcMain, BrowserView, globalShortcut, Menu, MenuItem } = require('electron')
const {servicesURLs} = require(__dirname + '/data/services')
const rimraf = require('rimraf')
const config = require('electron-json-config')

let addappMenu
let win
let serviceCounter = 0
let cachePath = []

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

    let serviceLength = config.get('length')
    let tabservices = []
    for (let i = 0; i < serviceLength; i++) {
        tabservices.push(config.get(i.toString()))
        console.log("Reading settings from save, service is " + config.get(i.toString()))
        cachePath.push(config.get(i.toString() + '-cache'))
        console.log("Reading cache path from save, cache path is " + config.get(i.toString() + '-cache'))
    }
    console.log("Restore service length " + config.get('length'))

    win.webContents.on('dom-ready', async ()=>{
        await win.show()
        for (let i = 0; i < tabservices.length; i++) {
            win.webContents.send('addservice', tabservices[i])
            setupView(tabservices[i], cachePath[i])
        }
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

function setupView(name, cache = 'persist:' + app.getPath('appData') + '\\' + serviceCounter + 'cache') {
    console.log("Setting view for service " + name)
    const webview = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            partition: cache
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

    config.set(serviceCounter.toString(), name)
    config.set(serviceCounter.toString() + '-cache', 'persist:' + app.getPath('appData') + '\\' + serviceCounter + 'cache')

    function resizeWebview() {
        if (!webview.isDestroyed() && win.getBrowserView() == webview) {
            if (win.isMaximized()) {
                webview.setBounds({
                    y: 80,
                    x: 0,
                    height: win.getBounds().height - 98,
                    width: win.getBounds().width - 15
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
    serviceCounter++
    config.set('length', serviceCounter)
    console.log("ServiceCount from save " + config.get('length'))
}

ipcMain.on('finishservice', (event, args)=>{
    closeAddMenu()
    win.webContents.send('addservice', args)
    setupView(args)
})

ipcMain.on('focusapp', (event, args)=>{
    win.setBrowserView(BrowserView.fromId(args))

    const webview = BrowserView.fromId(args)

    try {
        if (!webview.isDestroyed() && win.getBrowserView() === webview) {
            if (win.isMaximized()) {
                webview.setBounds({
                    y: 80,
                    x: 0,
                    height: win.getBounds().height - 98,
                    width: win.getBounds().width - 15
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
    } catch {}
})

ipcMain.on('console', (event, args)=>{
    console.log(args)
})

ipcMain.on('contextmenu', (event, args)=>{
    const menu = new Menu()
    menu.append(new MenuItem({
        label: 'Remove',
        click() {
            console.log("Removing service " + args)
            win.webContents.send('removeapp', args)
        },
        toolTip: 'Remove current service'
    }))
    menu.popup({
        window: win,
    })
})

ipcMain.on('removebv', (event, args = [])=>{
    try {
        console.log("Preparing to remove service " + args)
        const bv = BrowserView.fromId(parseInt(args.toString()))
        win.removeBrowserView(bv)
        win.setBrowserView(null)
        bv.destroy()
        serviceCounter--
        config.set('length', serviceCounter)
    } catch (e) {
        console.log("Error happened when removing service " + e)
    }
})

ipcMain.on('removecache', (event, args)=>{
    require('electron').session.fromPartition(config.get(args.toString() + '-cache')).clearCache()
    console.log("Removing cache from " + config.get(args.toString() + '-cache'))
    config.delete(args.toString() + '-cache')
    config.delete(args)
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