const mongoose = require('mongoose');
const passwordHash = require('password-hash');
const jwt = require('jwt-simple');
const config = require('../config/config');

// Schema de la BDD.
var userSchema = mongoose.Schema({
    username: {
		type: String,
		lowercase: true,
		trim: true,
		unique: true,
		required: true
	},
  password: String,
  email: String,
  description : String,
},{ timestamps: { createdAt: 'created_at' }})

//Methode après le Schema.
userSchema.methods = {
	//Vérification password en hash.
	authenticate: function (password) {
		return passwordHash.verify(password, this.password);
	},
	// Créaction du token avec notre clé secret dans le fichier config.
	getToken: function () {
		return jwt.encode(this, config.secret);
	}
}

module.exports = mongoose.model('User', userSchema);