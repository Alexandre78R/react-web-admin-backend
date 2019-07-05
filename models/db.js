const mongoose = require('mongoose');

const dbUrl = '';

const options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true
};

mongoose.connect(dbUrl, options, error => {
  if (error) {
    console.error(error);
  } else {
    console.log('Connexion à la BDD')
  }
});

module.exports = {
  mongoose: mongoose,
}
