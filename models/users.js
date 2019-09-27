const mongoose = require('mongoose');
const passwordHash = require('password-hash');
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
	password: String,
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

//Methode après le Schema.
userSchema.methods = {
	//Vérification password en hash.
	authenticate: function (password) {
		return passwordHash.verify(password, this.password);
	},
	//Vérification code.
	verifCode: function (code) {
		return code, this.code;
	},
	// Créaction du token avec notre clé secret dans le fichier config.
	getToken: function () {
		return jwt.encode(this, config.secret);
	}
}

module.exports = mongoose.model('User', userSchema);