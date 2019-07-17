const mongoose = require('mongoose');

//Url vers votre BDD mongoose
const dbUrl = 'mongodb+srv://Alexandre78R:alexdu785@cluster0-wbqy3.mongodb.net/react-admin?retryWrites=true';

//Options
const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true
};

//Connexion à la BDD
mongoose.connect(dbUrl, options, error => {
  //En cas d'erreur on l'affiche sinon sa se connect à  la bdd.
  if (error) {
    console.error(error);
  } else {
    console.log('Connexion à la BDD')
  }
});

module.exports = {
  mongoose: mongoose,
}
