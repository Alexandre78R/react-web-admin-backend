//Appelle du module express
var express = require('express');

//Apelle de l'utilisation du router
var router = express.Router();

//Import de la config
const config = require('../config/config');

//Shéma bdd de l'user
const User = require('../models/users.js');

//Appelle du module  password-hash
const passwordHash = require("password-hash");

//Appelle du module nodemailer
const nodemailer = require('nodemailer');

//Configuration du transport de l'email avec le service de gamil avec vos informations de connexion gmail 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    secureConnection: true,
    auth: {
           user: config.userGmail,
           pass: config.passGmail
       },
    tls: {
        rejectUnauthorized: false
    }
});

//Route pour enregistrer un nouveau compte.
router.post('/user/signup', function(req, res, next) {
    //Stockage des données reçus du front
    var userData = {
        username: req.body.username, // Username
        password: passwordHash.generate(req.body.password), // Hash du Password
        email : req.body.email, // Email
        emailVerif : false, //Etat de l'email à vérifier
        code : Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000, // Genération du code à 6 chiffre
        online : false, //Statut si la personne est connecté (Pas encore utulisé)
        ban : false, //Statut si la personne est ban  (Pas encore utulisé)
        description : "", // Description de l'utilisateur
    }

    //Recherche dans la BDD 
    User.findOne({
        //Précision de la recherche pour l'email.
        email: req.body.email,
    })
        .then(email => {
            //Si l'email n'existe pas on le créer sinon on le créer pas et on r'envois un message d'erreur.
            if (!email) {
                //Recherche dans la BDD 
                User.findOne({
                    //Précision de la recherche pour l'username.
                    username: req.body.username,
                })
                    .then(user => {
                        console.log("User", user)
                        //Si l'username n'existe pas on le créer sinon on le créer pas et on r'envois un message d'erreur.
                        if (!user) {
                                //Création du document de l'user
                                User.create(userData)
                                    .then(user => {
                                        res.json({
                                            "text" : "Bienvenue " + user.username + " !",
                                            "token" : user.getToken(),
                                            "user": user,
                                        })
                                    })
                                    //Si il y a une erreur
                                    .catch(err => {
                                        console.log("/user/signup ERR (Create User)", err)
                                        res.status(500).json({
                                            "text" : "Erreur Interne !",
                                            "code" : 500
                                        });
                                    })
                        //Si l'utilisateur existe déjà
                        } else {
                            res.json({
                                "text" : "L'utilisateur " + user.username + " existe déjà !",
                                "code" : 403
                        })
                        }
                    })
                    //En cas d'erreur
                    .catch(err => {
                        console.log("/user/signup ERR (Interne)", err)
                        res.status(500).json({
                            "text" : "Erreur Interne !",
                            "code" : 500
                        });
                    })
            //Si l'adresse email existe déjà
            } else {
                res.json({
                    "text" : "L'email " + email.email + " existe déjà !",
                    "code" : 404
               })
            }
        //En cas d'erreur
        })
    .catch(err => {
        console.log("/user/signup ERR (Interne)", err)
        res.status(500).json({
            "text" : "Erreur Interne !",
            "code" : 500
        });
    })

});

//Route pour la connexion.
router.post('/user/login', function(req, res, next) {

    //On regarde dans la BDD si l'username existe bien.
    User.findOne({
        username: req.body.username
    }).then(user => {
            //Si on ne touve pas l'username on r'envois erreur 401
        if (!user) {
            res.json({
                "text": "L'utilisateur " + req.body.username +  " n'existe pas !",
                "code": 401
            })
            //Si l'username est trouvé + le passwoard est correct on lui donne le token
        } else {
            if (user.authenticate(req.body.password)) {
                res.status(200).json({
                    "token": user.getToken(),
                    "text": "Hello " + user.username + " !",
                    "user": user,
                })
                //Si l'username est trouvé mais le password est incorrect on lui envois l'erreur 402.
            } else {
                res.json({
                    "text": "Mot de passe incorrect !",
                    "code": 402
                })
            }
        }
    //En cas d'erreur on sort leport 500
    }).catch(err => {
        console.log("/user/login ERR (Login (Interne))", err)
        res.status(500).json({
            "text" : "Erreur Interne !",
            "code" : 500
        });
    })
});

//Route envoie d'email
router.post('/user/emailVerif', function(req, res, next) {

    //On stock les infos reçus du frontend dnas des variables
    var email = req.body.email;
    var username = req.body.username;
    var code = req.body.code;

    //Création de l'email à envoyer
    let mailOptions = {
        // should be replaced with real recipient's account
        to: email,
        subject: `Code vérification d'email pour le compte ${username}.`,
        html: `
        Hello ${username},
        <br/>
        Voici votre code de vérication pour vérifier votre adresse e-mail : ${code}
        <br/>
        Cordialement,
        ${config.userGmail}
        `
    };
    //Puis on envoie le email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                "text" : "Erreur Interne !",
                "code" : 500
            });
        }else{
            console.log('Message %s sent: %s', info.messageId, info.response);
            res.json({
                "text": `L'email a était envoyer à l'adresse email suivant : ${email} !`,
                "code" : 200,
            }) 
        }
    });
});

//Route pour changer le statut de l'email vérifier
router.post('/status/emailVerif', function(req, res, next) {

    //Condition de recherhce dans la BDD par l'id de l'user
    var condition = { _id : req.body.idUser };

    //La requette de modification
    var update = { emailVerif: true };

    //On stock la requette BDD dna sune varible pour l'utiliser pour l'envoyer vers le front la réponse
    var request = User.update(condition, update, { multi: true },
    function(err, numberAffected, raw) {
        // console.log("numberAffected",numberAffected)
        // console.log("raw", raw)
    })
    //On evoie la réponse au frontend
    //Si on a changer le statut on l'envoie en front
    request.then(data => { 
        // console.log(data.length);
        res.json({
            "text": "Le statut à était bien changé !",
            "code" : 200,
        })
    //En cas d'erreur 
    }).catch(err => {
        console.log("/status/emailVerif EROOR (Interne)", err)
        res.status(500).json({
            "text" : "Erreur Interne !",
            "code" : 500
        });
    })
});

//Route de nombre d'utilisateur enregistrer dans la BDD
router.post('/user/count', function(req, res, next) {

    //On stock la requette  bdd dna sune variable pour l'utiliser à renvoyer les infos au frontend
    var request = User.find({ username : { "$ne": '$ne' } });
    
    //Si la requette à marcher on l'envoie au frontend
    request.then(data => { 
        // console.log(data.length);
        res.json({
            "UserCount": data.length,
            "code" : 200,
        })
    //En cas d'erreur
    }).catch(err => {
        console.log("/user/count EROOR (Interne)", err)
        res.status(500).json({
            "text" : "Erreur Interne !",
            "code" : 500
        });
    })
});

//Route ajout de la note
router.post('/note/add', function(req, res, next) {
    //On cherche l'utilisateur 
    User.findById(req.body.idUser, function(err, user){

        //On envois les infos de la notes dans la bdd
        user.notes.push({
        title : req.body.title,
        note : req.body.note,
        date : req.body.date,
        temps : req.body.temps,
        color : req.body.color,
        })

        //on sauvgarde dans la bdd
        user.save(function(err, note){
            if (err) {
                console.log("/note/add ERR (Interne)", err)
                res.status(500).json({
                    "text" : "Erreur Interne !",
                    "code" : 500
                });
            }else{
                // console.log("Notes : ",user);

                //On prend le nombre de note que l'user possède et on retire 1 pour prendre la dernière note 
                var numberMaxNote = note.notes.length - 1; 

                // console.log(note.notes[nombreMaxNote])

                //On envoie en front les informations
                res.json({
                    "note": note.notes[numberMaxNote],
                    "code" : 200,
                })       
            }
        })
    })
});

//Route suppression de la note
router.post('/note/del', function(req, res, next) {
    //On cherche l'utilisateur 
    User.findById(req.body.idUser, function(err, user){

        // console.log("user -->", user)
        // console.log("user.note -->", user.notes)

        //On stock la position dans une variable 
        var position = req.body.position;

        //Suppression de la note avec la position.
        user.notes.splice(position,1);

        //on sauvgarde dans la bdd
        user.save(function(err, note){
            if (err) {
                console.log("/note/del (Suppression Interne)",err);
                res.status(500).json({
                    "text" : "Erreur Interne !",
                    "code" : 500
                });
            }else{
                // On envoie en front les informations
                res.json({
                    "position": position,
                    "code" : 200,
                })  
            }
        })
    })
});

module.exports = router;
