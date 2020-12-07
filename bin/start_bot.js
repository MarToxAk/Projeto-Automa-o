const venom = require('@open-wa/wa-automate');
const maps = require("@googlemaps/google-maps-services-js");
const start = require('./whatsapp');


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
const teste = venom.create(launchConfig)
const mmaps = new maps.Client({});

mmaps
  .directions({
    params: {
      origin: { lat: -23.822591375488635, lng: -45.37750908562859 },
      destination: { lat: -23.799402783917, lng: -45.35869944626199 },
      key: "AIzaSyA7zjgM_3IIlHJkR_cqJCW6wrRJ_D5PADA",
    },
    timeout: 1000, // milliseconds
  })
  .then((r) => {
    console.log(r);
  })
  .catch((e) => {
    console.log(e);
  });


module.exports = teste