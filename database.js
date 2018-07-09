var express = require('express');
var hostname = 'localhost'; 
var port = 3000; 
var mongoose = require('mongoose'); 
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
var urlmongo = 'mongodb://localhost:27017/tutoriel'; 
mongoose.connect(urlmongo, options);
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 
var app = express(); 
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var piloteSchema = mongoose.Schema({
    nom: String, 
    prenom: String, 
    marque: String, 
    description: String   
}); 
var Pilote = mongoose.model('Pilotes', piloteSchema); 
var myRouter = express.Router(); 
myRouter.route('/')
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre Pilote API ", methode : req.method});
});
  
myRouter.route('/pilotes')
.get(function(req,res){ 
	Pilote.find(function(err, pilotes){
        if (err){
            res.send(err); 
        }
        res.json(pilotes);  
    }); 
});

app.use(myRouter);   
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});