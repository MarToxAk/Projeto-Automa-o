var express = require('express');
var router = express.Router();
const bd = require('../models/base.db')


/* GET home page. */
router.get('/', (req, res, next) => {
  const users = bd.whatsapp.findAll({
    });
  const chats = bd.whatsapp.findAll({
  include: bd.Chat
  });
  
  res.render('index', { title: 'Express', users: users, chats: chats });
});

module.exports = router;
