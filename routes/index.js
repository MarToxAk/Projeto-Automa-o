var express = require('express');
var router = express.Router();
const bd = require('../models/base.db')


/* GET home page. */
router.get('/', async (req, res, next) => {
  const users = await bd.whatsapp.findAll({
    include: bd.Chat,
    order: '"creatAt" DESC'
    })
  const chats = await bd.Chat.findAll({

  });


  res.render('index', { title: 'Express', users: users, chats: chats });
});

module.exports = router;
