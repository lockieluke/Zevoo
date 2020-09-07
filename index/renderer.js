const {ipcRenderer} = require('electron')
let {services, servicesURLs, serviceIcons} = require('../data/services')
let browserviewids = []
let serviceCounter = 0
let focusedview = 0
let tabstore = []

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
    serviceCounter++

    app.addEventListener('click', (event)=>{
        focusedview = app.id
        ipcRenderer.send('console', "Focusing to " + focusedview)
        ipcRenderer.send('focusapp', browserviewids[focusedview])
    })
}

ipcRenderer.on('createdview', (event, args)=>{
    browserviewids.push(args)
})