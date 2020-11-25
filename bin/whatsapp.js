const venom = require('venom-bot');
const dialogflow = require('@google-cloud/dialogflow').v2beta1;
const uuid = require('uuid');
const bd = require("../models/base.db");
const fs = require('fs');
const mime = require('mime-types');
const http = require('http');


//Inicia as Venom-Bot com o numero +55(12)3600-5005

venom
    .create(
        'Auto Py Web2',
        (base64Qr, asciiQR) => {
            console.log(asciiQR); // Optional to log the QR in the terminal
            var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            var imageBuffer = response;
            require('fs').writeFile(
                'out.png',
                imageBuffer['data'],
                'binary',
                function (err) {
                    if (err != null) {
                        console.log(err);
                    }
                }
            );
        },
        (statusSession, session) => {
            console.log('Status Session: ', statusSession);
            //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
            //Create session wss return "serverClose" case server for close
            console.log('Session name: ', session);
        },
        undefined
    )
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });


// Inicia Conversa Bot
function start(client) {
    client.onMessage(async (message) => {
        const fileNameNow = uuid.v4();
        const sessionId = uuid.v4();
        const projectId = 'agente-vendas-lnxa'

        if (message.isMedia === true || message.isMMS === true) {
            const buffer = await client.decryptFile(message);
            console.log()
            // At this point you can do whatever you want with the buffer
            // Most likely you want to write it into a file
            const dir = `media/${message.chatId}/`
            if (!fs.existsSync(dir)) {
                //Efetua a criação do diretório
                fs.mkdirSync(dir);
            }
            const fileName = `media/${message.chatId}/${fileNameNow}.${mime.extension(message.mimetype)}`;
            await fs.writeFile(fileName, buffer, (err) => {
            });
        }

        const name_wpp = function () {
            if (message.sender.pushname !== undefined) {
                return message.sender.pushname
            } else {
                return message.sender.verifiedName
            }
        };


        console.log(name_wpp())

        await bd.whatsapp.create({
            sessionid: sessionId,
            chatid: message.chatId,
            name_save: `${message.sender.formattedName}`,
            name_wpp: name_wpp()
        })
            .catch((erro) => {
                console.error('Já exite um contato com essa ChatId', message.chatId);
            });

        const users = await bd.whatsapp.findOne({
            where: {
                chatid: message.chatId
            }
        });


        const userKey = users.sessionid

        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: "./agente-vendas-lnxa-b897141276bc.json"
        });
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, userKey);
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: message.body,
                    // The language used by the client (en-US)
                    languageCode: 'pt-BR',
                },
            },

        };

        console.log('Mensagem Recebida: ', message.body)
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;



        await bd.Chat.create({
            mensagem: message.body,
            resposta: result.fulfillmentText,
            chatId: users.id,
            whatsappId: users.id
        })

        await client
            .sendText(message.from, `Bot Moda Familly: ${result.fulfillmentText}`)
            .then(() => {
                console.log('Resposta: ', result.fulfillmentText); //return object success
            })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
            });
    });

}