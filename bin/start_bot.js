const venom = require('@open-wa/wa-automate');
const start = require('./whatsapp')

const launchConfig ={
    sessionId: "Auto Py Web",
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    useChrome: true,
    logConsole: false,
    popup: true,
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code

  }

var teste = venom.create(launchConfig)


module.exports = teste