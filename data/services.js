const services = {discord: "Discord", whatsapp: "WhatsApp", signal: "Signal", tg: "Telegram"}
const serviceIcons = {discord: __dirname + "/../static/discord.png", whatsapp: __dirname + '/../static/whatsapp.png', signal: __dirname + '/../static/signal.png',
tg: __dirname + '/../static/telegram.png'}
const servicesURLs = {discord: 'https://discord.com/app', whatsapp: 'https://web.whatsapp.com', signal: 'about:blank', tg: 'https://web.telegram.org'}
let serviceCounter = 0
let addedEventListener = false

module.exports = {services, serviceIcons, servicesURLs, serviceCounter, addedEventListener}