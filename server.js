//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express'); 
 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = 3000; 

 
// Database Name
// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'); 
// Ces options sont recommandées par mLab pour une connexion à la base

 
//URL de notre base
var urlmongo = 'mongodb://localhost:27017/'; 
 
// Nous connectons l'API à notre base de données
mongoose.connect(urlmongo);
 
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
 
var app = express(); 

var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
}); 


//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 
 
var pilotesSchema = mongoose.Schema({
  prenom: String, 
  nom: String, 
  marque: String, 
  description: String   
});

var Pilote = mongoose.model('Pilote', pilotesSchema);

// Je vous rappelle notre route (/pilotes).  
myRouter.route('/pilotes')


// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
.get(function(req,res){ 
  // Utilisation de notre schéma Piscine pour interrogation de la base
  Pilote.find(function(err, pilotes){
          if (err){
              res.send(err); 
          }
          res.json(pilotes); 
          
      }); 
  }) // 
//POST
.post(function(req,res){
      res.json({message : "Ajouter un nouveau pilote",
      nom : req.body.nom, 
      prenom : req.body.prenom, 
      marque : req.body.marque,
      methode : req.method});
})
//PUT
.put(function(req,res){ 
      res.json({message : "Mise à jour des informations d'un pilote dans la liste", methode : req.method});
})
//DELETE
.delete(function(req,res){ 
res.json({message : "Suppression d'un pilote dans la liste", methode : req.method});  
}); 

myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre Pilote API ", methode : req.method});
});
 
myRouter.route('/pilotes/:pilotes_id')
.get(function(req,res){ 
	  res.json({message : "Vous souhaitez accéder aux informations du pilote n°" + req.params.piscine_id});
})
.put(function(req,res){ 
	  res.json({message : "Vous souhaitez modifier les informations du pilote n°" + req.params.piscine_id});
})
.delete(function(req,res){ 
	  res.json({message : "Vous souhaitez supprimer le pilote n°" + req.params.piscine_id});
});

// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  
 
// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port+"\n"); 
});