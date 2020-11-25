var express = require('express');
var router = express.Router();
const bd = require('../models/base.db')
const ejs = require('ejs');


/* GET home page. */
router.get('/', async (req, res, next) => {
  const users = await bd.whatsapp.findAll({
    });
  const chats = await bd.whatsapp.findAll({
  include: bd.Chat
  });
  const html = await ejs.renderFile('./models/index.ejs', { title: 'Express', users: users, chats: chats }, {async: true}, {async: true});
  res.send(html);

});

module.exports = router;
