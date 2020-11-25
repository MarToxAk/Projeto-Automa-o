var express = require('express');
const { futimes } = require('fs');
var router = express.Router();
const bd = require('../models/base.db')


/* GET home page. */
router.get('/', async (req, res, next) => {
  const users = await bd.whatsapp.findAll({
    });
  const chats = await bd.whatsapp.findAll({
  include: bd.Chat
  });
  var teste = function(){
    for(chat of chats){
      return chat.name_wpp
    }
  }
  res.render('index', { title: 'Express', users: users, teste: teste });
});

module.exports = router;
