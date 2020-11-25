var express = require('express');
var router = express.Router();
const bd = require('../models/base.db')
var async   = require('async');


/* GET home page. */
router.get('/', async (req, res, next) => {
  const users = await bd.whatsapp.findAll({
    });
  const chats = await bd.whatsapp.findAll({
  include: bd.Chat
  });
  const html = await ejs.renderFile();
  res.render('index', { title: 'Express', users: users, chats: chats });

});

module.exports = router;
