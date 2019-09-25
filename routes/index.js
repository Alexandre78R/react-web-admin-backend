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
                                 "token" : user.getToken(),
                                 "user": user,
                            })
                        })
                        .catch(err => {
                            console.log("/user/signup ERR (Create User)", err)
                        })
            } else {
                res.json({
                    "text" : "L'utilisateur " + user.username + " existe déjà !",
                    "code" : 403
               })
            }
        })
        .catch(err => {
            console.log("/user/signup ERR (Interne)", err)
        })
// })
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
    })
});

//Route count
router.post('/user/count', function(req, res, next) {

    var request = User.find({ username : { "$ne": '$ne' } });

    request.then(data => { 
        // console.log(data.length);
        res.json({
            "UserCount": data.length,
            "code" : 200,
        })
    }).catch(err => {
        console.log("/user/count EROOR (Interne)", err)
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
