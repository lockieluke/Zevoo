const {ipcRenderer} = require('electron')
let {services, serviceIcons, servicesURLs, serviceCounter, addedEventListener} = require('../data/services')

window.onload = function () {
    init()
}

for (const service in services) {
    createService(service)
}

function createService(name) {
    const row = document.createElement('div')
    row.className = 'app'
    row.title = services[name]
    const text = document.createElement('h2')
    text.innerText = services[name]
    row.appendChild(text)
    const appicon = document.createElement('img')
    appicon.src = 'file:///' + serviceIcons[name]
    console.log(appicon.src)
    appicon.className = 'appicon'
    row.appendChild(appicon)
    document.getElementById('apps').appendChild(row)
}

const closeBtn = document.getElementById('closebtn')

closeBtn.addEventListener('click', ()=>{
    ipcRenderer.send('closeaddapp')
})

function getKeyByValue(object, value) {
    try {
        return Object.keys(object).find(key => object[key] === value);
    } catch (e) {
        return null
    }
}

function init() {
    if (!addedEventListener) {
        const appButtons = document.getElementsByClassName('app')
        for (let i = 0; i < appButtons.length; i++) {
            if (appButtons.item(i).id === '') {
                appButtons.item(i).addEventListener('click', ()=>[
                    ipcRenderer.send('finishservice', getKeyByValue(services, appButtons.item(i).innerText))
                ])
                appButtons.item(i).id = i.toString()
            }
        }
    }
    addedEventListener = true
}