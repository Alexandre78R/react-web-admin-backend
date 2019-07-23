var express = require('express');
var router = express.Router();

const User = require('../models/users.js');
const passwordHash = require("password-hash");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Route pour enregistrer un nouveau compte.
router.post('/user/signup', function(req, res, next) {
    //Stockage des données reçus du front
    var userData = {
        username: req.body.username, // Username
        password: passwordHash.generate(req.body.password), // Hash du Password
        email : req.body.email, // Email
        description : "", //Rajout de la descripton pour plutard dans le profil.
    }

    //Recherche dans la BDD 
    User.findOne({
        //Précision de la recherche pour l'username.
        username: req.body.username
    })
        .then(user => {
            //Si l'username n'existe pas on le créer sinon on le créer pas et on r'envois un message d'erreur.
            if (!user) {
                    User.create(userData)
                        .then(user => {
                            res.json({
                                 "text" : "Bienvenue " + user.username + " !",
                                 "token" : user.getToken()
                            })
                        })
                        .catch(err => {
                            res.json({
                                "text" : 'Erreur interne',
                           })
                        })
            } else {
                res.json({
                    "text" : "L'utilisateur " + user.username + " existe déjà.",
               })
            }
        })
        .catch(err => {
            res.json({
                "text" : "Erreur interne",
           })
        })
// })
});
//Route pour la connexion.
router.post('/user/login', function(req, res, next) {
      
    //On regarde dans la BDD si l'username existe bien.
      User.findOne({
          username: req.body.username
      }, function (err, user) {
          //En cas d'erreur 5O0
          if (err) {
              res.status(500).json({
                  "text": "Erreur interne"
              })
            //Si on ne touve pas l'username on r'envois erreur 401
          } else if (!user) {
              res.status(401).json({
                  "text": "L'utilisateur n'existe pas"
              })
              //Si l'username est trouvé + le passwoard est correct on lui donne le token
          } else {
              if (user.authenticate(req.body.password)) {
                  res.status(200).json({
                      "token": user.getToken(),
                      "text": "Authentification réussi"
                  })
                //Si l'username est trouvé mais le password est incorrect on lui envois l'erreur 402.
              } else {
                  res.status(402).json({
                      "text": "Mot de passe incorrect"
                  })
              }
          }
      })
});

module.exports = router;
