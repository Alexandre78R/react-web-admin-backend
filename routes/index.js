var express = require('express');
var router = express.Router();

const db = require('../models/db');
const userModel = require('../models/users');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup', function(req, res, next) {

  console.log('Signup is running...')
  const newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    password : req.body.password,
    description : "",
  });

  newUser.save(function(error, user) {
    console.log("USER SAVED ---->", user)
    res.json({result: true, user});
  });
});
module.exports = router;
