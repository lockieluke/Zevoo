const {ipcRenderer} = require('electron')
let {services, servicesURLs, serviceIcons} = require('../data/services')
let browserviewids = []
let serviceCounter = 0
let tabCounter = 0
let focusedview = 0
let tabstore = []
let tabservices = []

const closeBtn = document.getElementById('closebtn')
const maxBtn = document.getElementById('maxbtn')
const minBtn = document.getElementById('minBtn')
const addBtn = document.getElementById('addapp')

closeBtn.addEventListener('click', ()=>{
    ipcRenderer.send('close')
})

maxBtn.addEventListener('click', ()=>{
    ipcRenderer.send('togglemax')
})

minBtn.addEventListener('click', ()=>{
    ipcRenderer.send('minimize')
})

addBtn.addEventListener('click', ()=>{
    ipcRenderer.send('addapp')
})

ipcRenderer.on('addservice', (event, args)=>{
    addNewService(args)
})

function addNewService(name) {
    const app = document.createElement('div')
    app.title = services[name]
    app.id = serviceCounter.toString()
    app.className = 'app'
    const icon = document.createElement('img')
    icon.src = serviceIcons[name]
    icon.className = 'appicon'
    app.appendChild(icon)
    document.getElementById('appbar').appendChild(app)

    focusedview = serviceCounter
    tabstore.push(serviceCounter)
    tabservices.push(name)
    serviceCounter++
    tabCounter++

    app.addEventListener('click', (event)=>{
        focusedview = app.id
        ipcRenderer.send('console', "Focusing to " + focusedview)
        ipcRenderer.send('focusapp', browserviewids[focusedview])
    })

    app.addEventListener('contextmenu', async (e)=>{
        e.preventDefault()
        await ipcRenderer.send('contextmenu', app.id)
    })
}

ipcRenderer.on('createdview', (event, args)=>{
    browserviewids.push(args)
})

ipcRenderer.on('removeapp', (event, args)=>{
    tabCounter--
    tabstore.slice(args, args)
    tabservices.slice(args, args)
    document.getElementById(args).remove()
    ipcRenderer.send('removebv', browserviewids[args].toString())
    ipcRenderer.send('removekeys', args)
    if (focusedview == args) {
        ipcRenderer.send('focusapp', browserviewids[0])
    } else {

    }
})