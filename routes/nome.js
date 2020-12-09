var express = require('express');
var router = express.Router();
const bd = require('../models/base.db')


router.post('/', function(req, res, next) {
    console.log(req)
    const resposta = req.body.queryResult.fulfillmentText
    res.send({
        "fulfillmentMessages": [
          {
            "card": {
              "title": "card title",
              "subtitle": "card text",
              "imageUri": "https://example.com/images/example.png",
              "buttons": [
                {
                  "text": "button text",
                  "postback": "https://example.com/path/for/end-user/to/follow"
                }
              ]
            }
          }
        ]
      });
  });
  
  module.exports = router;