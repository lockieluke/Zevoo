const {ipcRenderer} = require('electron')
let {services, servicesURLs, serviceIcons, serviceCounter} = require('../data/services')

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
    serviceCounter++
})

function addNewService(name) {
    const app = document.createElement('div')
    app.title = services[name]
    app.className = 'app'
    const icon = document.createElement('img')
    icon.src = serviceIcons[name]
    icon.className = 'appicon'
    app.appendChild(icon)
    document.getElementById('appbar').appendChild(app)
}