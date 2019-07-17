var express = require('express');
var router = express.Router();

const User = require('../models/users.js');
const passwordHash = require("password-hash");

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Route pour enregistrer un nouveau compte.
router.post('/user/signup', function(req, res, next) {
      
        //On stock les infos qu'on reçois du front dans la  variable user.
        var user = {
            username: req.body.username, // Username
            password: passwordHash.generate(req.body.password), // Hash du Password
            email : req.body.email, // Email
            description : "", //Rajout de la descripton pour plutard dans le profil.
        }

        //Réalisation des traitements de façon asynchrone. 
        var findUser = new Promise(function (resolve, reject) {
            //On regarde dans la base de données si le username existe ou pas.
            User.findOne({
                username: user.username,
                //Gestion d'erreur sinon on envoie les infos 
            }, function (err, result) {
                //Erreur 500
                if (err) {
                    // console.log(err)
                    reject(500);
                } else {
                    //Si l'username existe déjà on refuse.
                    if (result) {
                        // console.log(result)
                        reject(204)
                    //Si tous va bien on envois les infos.
                    } else {
                        resolve(true)
                    }
                }
            })
        })

      findUser.then(function () {
          // On stock user dans la variable _u.
          var _u = new User(user);
          //Sauvegaude dans la BDD
          _u.save(function (err, user) {
              //Si il y a une erreur on stop la sauvegarde vers la BDD
              if (err) {
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
                // Si tous va bien on sauvegarde dans la BDD
              } else {
                console.log("New User : ",_u)
                  res.status(200).json({
                      "text": "Succès",
                      "token": user.getToken()
                  })
              }
          }) // Gestion d'erreur
      }, function (error) {
          switch (error) {
              //Erreur pour x raison.
              case 500:
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
                  break;
              //Erreur si l'username existe déjà après la vérification.  
              case 204:
                  res.status(204).json({
                      "text": "L'username existe déjà"
                  })
                  break;
              // Et si on reçois une autre erreur on envois par default erreur 500 (Erreur interne).
              default:
                  res.status(500).json({
                      "text": "Erreur interne"
                  })
          }
      })
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
