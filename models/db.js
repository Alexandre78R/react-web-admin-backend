const mongoose = require('mongoose');

//Url vers votre BDD mongoose
const dbUrl = '';

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
