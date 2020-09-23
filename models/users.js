const mongoose = require('mongoose');
// const passwordHash = require('password-hash');
const jwt = require('jwt-simple');
const config = require('../config/config');

//Schema Note de la BDD.
var NoteSchema = mongoose.Schema({
	title:String,
	note:String,
	date:String,
	temps:String,
	color:String,
})

// Schema Users de la BDD.
var userSchema = mongoose.Schema({
    username: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	salt: String,
	password: String,
	changePassword: Boolean,
	email: {
	type: String,
	trim: true,
	unique: true,
	required: true
	},
	emailVerif : Boolean,
	code : Number,
	online : Boolean,
	ban : Boolean,
	description : String,
	notes : [NoteSchema],
},{ timestamps: { createdAt: 'created_at' }})



// // Schema Users de la BDD.
// var userSchema = mongoose.Schema({
// 	//Identifiant de l'utiliteur
//     username: {
// 		type: String,
// 		unique: true,
// 	},
// 	//Pour décrypter du mot de passe
// 	salt: String,
// 	//Mot de passe crypter
// 	password: String,
// 	//Email de l'utilisateur
// 	email: {
// 		type: String,
// 		unique: true,
// 	},
// 	//Vérification si l'email est bien vérifier 
// 	emailVerif : Boolean,
// 	//Code générer pour vérifier l'email et le mot de passe
// 	code : Number,
// 	//Etat si l'utilisateur est connecté 
// 	online : Boolean,
// 	//Etat si l'utilisateur est ban 
// 	ban : Boolean,
// 	//Etat si l'utilisateur à les droit admin 
// 	admin : Boolean,
// 	//On stock l'historique de l'utilisateur
// 	history : [historySchema],
// 	//Pour savoir la date et de l'heure d ela création
// 	// du compte et quand on met à jour les informations
// },{ timestamps: { createdAt: 'created_at' }})


//Methode après le Schema.
userSchema.methods = {
	// //Vérification password en hash.
	// authenticate: function (password) {
	// 	return passwordHash.verify(password, this.password);
	// },
	// Créaction du token avec notre clé secret dans le fichier config.
	getToken: function () {
		return jwt.encode(this, config.secret);
	}
}

module.exports = mongoose.model('User', userSchema);