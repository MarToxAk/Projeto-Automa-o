const dialogflow = require('@google-cloud/dialogflow').v2beta1;
const uuid = require('uuid');
const bd = require("../models/base.db");
const fs = require('fs');
const mime = require('mime-types');
const { log } = require('console');
const { measureMemory } = require('vm');


class windows {

    constructor(io, client) {
        this.io = io;
        this.client = client;
    }



    // Inicia Conversa Bot
    start(client = this.client, io = this.io) {
        let menssagem = []
        let ackT = [{ t: '1607083688' },]



        function decodeBase64Image(dataString) {
            var matches = dataString.match(/^data:([A-Za-z-+0-9\/]+);base64,(.+)$/),
                response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }


            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            return response;
        }
        function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        io.on('connection', async function (socket) {
            const chats = await client.getAllChats();
            socket.emit('listContact', chats)
            socket.on('room', async function (room) {
                socket.join(room);
                const chat22 = await client.getAllMessagesInChat(`${room}@c.us`, true)
                //console.log(chat22)
                io.to(room).emit('chat', chat22)
                //console.log(chat22.id)
            });
            socket.on('leave-room', function (room) {
                socket.leave(room, function (err) {
                    //console.log(err); // display null
                    //console.log(socket.adapter.rooms);  // display the same list of rooms the specified room is still there
                });
                //console.log(`${socket.id} saiu da sala ${room}`)
                //console.log(socket.rooms);
            });
            socket.on('sendMenssage', (data) => {
                menssagem.push(data)
                client
                    .sendText(data.from, data.resposta)
            })

        });

        client.onAck((ack) => {
            async function sendSocket(ack) {
                io.to(ack.to.match(/([0-9]+)/)[0]).emit('updateWhatsapp', ack)
                menssagem.push(ack)
                const chats = await client.getAllChats();
                io.emit('listContact', chats)
            }

            if (ack.ack === 1 && ackT[ackT.length - 1].t !== ack.t) {
                sendSocket(ack)
                ackT.push({ t: ack.t })
            }
        });

        client.onAnyMessage((message)=>{
            const tel = message.to.match(/([0-9]+)/)
            //console.log(message);

            //client.sendLocation('5512982062736@c.us', '-23.7991625', '-45.3587645')
            if(message.to === '551236005005@c.us')
                io.in(message.from.match(/([0-9]+)/)[0]).emit('updateWhatsapp', message)
            else
                io.in(message.to.match(/([0-9]+)/)[0]).emit('updateWhatsapp', message)

        })


        client.onMessage(async (message) => {
            //console.log(message)
            const sessionId = uuid.v4();
            const projectId = 'agente-vendas-lnxa'
            const fileNameNow = uuid.v4();
            const name_wpp = function () {
                if (message.sender.pushname !== undefined) {
                    return message.sender.pushname
                } else {
                    return message.sender.verifiedName
                }
            };

           
            

            //sconsole.log(message.body)

            if (message.type === "location") {
                if (message.shareDuration) {

                    //client.onLiveLocation(message.from, location => console.log(location))

                    const forcedLiveLocation = await client.forceUpdateLiveLocation(message.from);

                    //const motoristaNumber = forcedLiveLocation[0].id.replace('@c.us', '');
                    const motoristaLatitude = forcedLiveLocation[0].lat;
                    const motoristaLongitude = forcedLiveLocation[0].lng;
                    const motoristaData = forcedLiveLocation[0].lastUpdated;
                    // Loop to update informations
                    const time = setInterval(async function () {

                        console.log('Latitude: ' + motoristaLatitude,
                            'Longitude: ' + motoristaLongitude,
                            'Last Update: ' + motoristaData);
                        await client
                            .sendLocation(message.from, motoristaLatitude, motoristaLongitude)


                    }, 60000);
                    //console.log(60*message.shareDuration)
                    await sleep(1001 * message.shareDuration)
                    //console.log('Parou')
                    clearInterval(time)
                }
            }

            //console.log(message);

            if (message.mimetype) {
                //console.log(message.mimetype)

                const buffer = await client.decryptMedia(message);
                //console.log(buffer)

                const dataBuffer = decodeBase64Image(buffer)

                const dir = `media/${message.chatId}/`
                if (!fs.existsSync(dir)) {
                    //Efetua a criação do diretório
                    fs.mkdirSync(dir);
                }
                //Criação da Media e Pasta
                const fileName = `${dir}${fileNameNow}.${mime.extension(message.mimetype)}`;
                await fs.writeFile(fileName, dataBuffer.data, (err) => {
                });
                //console.log('aqui')
                client.sendFile(message.from, buffer, fileName, 'Teste')
            }

            if (message.body === "!Stop" && message.isGroupMsg === false) {
                //console.log('Aqui para')
                clearInterval(time)
            }

            //client.sendLocation('5512982062736@c.us', '-23.7991625', '-45.3587645')
            const chats = await client.getAllChats();
            io.emit('listContact', chats)
            client.sendSeen(message.from);

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
            await bd.whatsapp.create({
                sessionid: sessionId,
                chatid: message.chatId,
                name_save: `${message.sender.formattedName}`,
                name_wpp: name_wpp()
            })
                .then((certo) => console.log('Criado com Sucesso!'))
                .catch((erro) => console.error('Já exite um contato com essa ChatId: ', message.chatId));
    
            //Busca o chatId para inicia a conversa.
    
            const users = await bd.whatsapp.findOne({
                where: {
                    chatid: message.chatId
                }
            });
    
            //Key para  ser usado na conversa com o Google
            const userKey = users.sessionid
    
            //KeyFile da API GOOGLE
            const sessionClient = new dialogflow.SessionsClient({
                keyFilename: "./agente-vendas-lnxa-b897141276bc.json"
            });
    
            //
            const sessionPath = sessionClient.projectAgentSessionPath(projectId, userKey);
    
            //Resposta do Diagflow
            const responses = await sessionClient.detectIntent(request);
            const result = responses[0].queryResult;
    
            //Criação do LOG de Conversa na database
            await bd.Chat.create({
                mensagem: message.body,
                resposta: result.fulfillmentText,
                chatId: users.id,
                whatsappId: users.id
            })

            client
                .sendText(message.from, result.fulfillmentText)
        }
        )

        /**
        client.onMessage(async (message) => {
            const fileNameNow = uuid.v4();
            const sessionId = uuid.v4();
            const projectId = 'agente-vendas-lnxa'
    
    
            //Download de Media enviadas do Wpp
            if (message.isMedia === true || message.isMMS === true) {
                const buffer = await client.decryptFile(message);
                const dir = `media/${message.chatId}/`
                if (!fs.existsSync(dir)) {
                    //Efetua a criação do diretório
                    fs.mkdirSync(dir);
                }
                //Criação da Media e Pasta
                const fileName = `media/${message.chatId}/${fileNameNow}.${mime.extension(message.mimetype)}`;
                await fs.writeFile(fileName, buffer, (err) => {
                });
            }
    
            //Verifica o nome do WPP (Sendo empresa ou Usuario Comum)
            const name_wpp = function () {
                if (message.sender.pushname !== undefined) {
                    return message.sender.pushname
                } else {
                    return message.sender.verifiedName
                }
            };
    
            //Criação do Banco de Dados WhatsApp
            await bd.whatsapp.create({
                sessionid: sessionId,
                chatid: message.chatId,
                name_save: `${message.sender.formattedName}`,
                name_wpp: name_wpp()
            })
                .then((certo) => console.log('Criado com Sucesso!'))
                .catch((erro) => console.error('Já exite um contato com essa ChatId: ', message.chatId));
    
            //Busca o chatId para inicia a conversa.
    
            const users = await bd.whatsapp.findOne({
                where: {
                    chatid: message.chatId
                }
            });
    
            //Key para  ser usado na conversa com o Google
            const userKey = users.sessionid
    
            //KeyFile da API GOOGLE
            const sessionClient = new dialogflow.SessionsClient({
                keyFilename: "./agente-vendas-lnxa-b897141276bc.json"
            });
    
            //
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
    
            //Resposta do Diagflow
            const responses = await sessionClient.detectIntent(request);
            const result = responses[0].queryResult;
    
            //Criação do LOG de Conversa na database
            await bd.Chat.create({
                mensagem: message.body,
                resposta: result.fulfillmentText,
                chatId: users.id,
                whatsappId: users.id
            })
    
    
    
            //Envio da Mensagem para o Clinte do WPP
    
    
            let menssagem = []
            io.on('connection', function (socket) {
                socket.emit('previusMenssager', menssagem)
                socket.on('sendMenssage', (data) => {
                    menssagem.push(data)
                    socket.broadcast.emit('receivedMensagem', data);
                    client.sendText(message.from, data.resposta)
                })
     
            });
    
        
    
    
            var mm = {
                mensagem: message.body,
                resposta: '',
                imagem: message.sender.profilePicThumbObj.eurl
            }
            io.emit('previusMenssager2', mm)
            io.broadcast.emit('previusMenssager2', mm)
            menssagem.push(menssagem)
    
    
    
    
        })
         */

    }
}


module.exports = windows
