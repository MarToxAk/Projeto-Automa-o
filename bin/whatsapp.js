const dialogflow = require('@google-cloud/dialogflow').v2beta1;
const uuid = require('uuid');
const bd = require("../models/base.db");
const fs = require('fs');
const mime = require('mime-types');


class windows {

    constructor(io, client) {
        this.io = io;
        this.client = client;
 
    }
    

    // Inicia Conversa Bot
    start(client = this.client, io = this.io) {

        

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
            console.log(message.sender.profilePicThumbObj.eurl)

            io.on('connection', async function (socket) {
                socket.emit('previusMenssager', menssagem)
                socket.on('sendMenssage', async (data) => {
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
            menssagem.push(mm)




        })

    }
}


module.exports = windows