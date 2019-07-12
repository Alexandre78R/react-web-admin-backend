var express = require('express');
var router = express.Router();

const User = require('../models/users.js');
const passwordHash = require("password-hash");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/user/signup', function(req, res, next) {

  if (!req.body.username || !req.body.password || !req.body.email) {
    res.status(400).json({
        "text": "Requête invalide"
    })
  } else {
      var user = {
          username: req.body.username,
          password: passwordHash.generate(req.body.password),
          email : req.body.email,
          description : "",
      }
      var findUser = new Promise(function (resolve, reject) {
          User.findOne({
              username: user.username,
          }, function (err, result) {
              if (err) {
                console.log(err)
                  reject(500);
              } else {
                  if (result) {
                    console.log(result)
                      reject(204)
                  } else {
                      resolve(true)
                  }
              }
          })
      })

      findUser.then(function () {
          var _u = new User(user);
          _u.save(function (err, user) {
              if (err) {
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
              } else {
                console.log("New User : ",_u)
                  res.status(200).json({
                      "text": "Succès",
                      "token": user.getToken()
                  })
              }
          })
      }, function (error) {
          switch (error) {
              case 500:
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
                  break;
              case 204:
                  res.status(204).json({
                      "text": "L'username existe déjà"
                  })
                  break;
              default:
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
          }
      })
  }
});

router.post('/user/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    //Le cas où l'email ou bien le password ne serait pas soumit ou nul
    res.status(400).json({
        "text": "Requête invalide"
    })
  } else {
      User.findOne({
          username: req.body.username
      }, function (err, user) {
          if (err) {
              res.status(500).json({
                  "text": "Erreur interne"
              })
          } else if (!user) {
              res.status(401).json({
                  "text": "L'utilisateur n'existe pas"
              })
          } else {
              if (user.authenticate(req.body.password)) {
                  res.status(200).json({
                      "token": user.getToken(),
                      "text": "Authentification réussi"
                  })
              } else {
                  res.status(401).json({
                      "text": "Mot de passe incorrect"
                  })
              }
          }
      })
  }
});

module.exports = router;
