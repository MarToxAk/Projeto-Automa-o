const { sequelize } = require('./db');
const db = require('./db')


var Chat = db.sequelize.define('chat', {
    mensagem: {
        type: db.Sequelize.STRING
    },
    resposta: {
        type: db.Sequelize.STRING
    }
})

var Whatsapp = db.sequelize.define('whatsapp', {
    sessionid: {
        type: db.Sequelize.UUID,
        unique: true
    },
    chatid: {
        type: db.Sequelize.STRING,
        unique: true
    },
    name_save: {
        type: db.Sequelize.STRING,
        unique: false,
        defaultValue: null
    },
    name_wpp: {
        type: db.Sequelize.STRING,
        unique: false,
        defaultValue: null
    },
});

Whatsapp.hasMany(Chat, {
    foreignKey: 'chatId',
    onDelete: 'CASCADE'
  });
Chat.belongsTo(Whatsapp);


//Whatsapp.sync({force: true})
//Chat.sync({force: true})



//Whatsapp.findAll({
//}).then(function(users){
//    console.log(users)/
//});




/*/
(async () => {
    const project = await Whatsapp.findOne({ where: { chatid: '5512997783131@c.us' }  });
    if (project === null) {
        console.log('Not found!');
      } else {
        console.log(project instanceof Whatsapp); // true
        console.log(project.name); // 'My Title'
        project.name = "Jose"
        await project.save()
      }
  })();
/*/
module.exports = {
    whatsapp: Whatsapp,
    Chat: Chat,
};