var express = require('express');
var multer = require('multer');
var hostname = 'localhost'; 
var PORT = process.env.PORT || 3000;
var cors = require('cors');
let UPLOAD_PATH = 'uploads'

var mongoose = require('mongoose'); 
var options = {  useNewUrlParser: true , server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
var conf = require("./config.json");
var urlmongo = `mongodb://${conf.user}:${conf.mdp}@ds247439.mlab.com:47439/setuprcdb`; 

// Multer Settings for file upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage })

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
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//PILOTE SCHEMA

var piloteSchema = mongoose.Schema({
    nom: String, 
    prenom: String, 
    marque: String, 
    description: String   
}); 


// SURFACE SCHEMA

var surfaceSchema = mongoose.Schema({
    name: String
});

// SETUP SCHEMA
var setupSchema = mongoose.Schema({
    surface: String,
    date:String,
    pilote:String,
    piste:String
});

//IMAGE SCHEMA
var imageSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    desc: String,
    piloteId: String,
    created: { type: Date, default: Date.now }
});

var Image = mongoose.model("Images", imageSchema);

var Pilote = mongoose.model('Pilotes', piloteSchema); 
var Surface = mongoose.model('Surfaces', surfaceSchema);
var Setup = mongoose.model('Setups', setupSchema);
//var Image = mongoose.model('Image', imageSchema);

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

myRouter.route('/pilotes/:pilotes_id')
.get(function(req,res) {
    console.log(req.params.pilotes_id);
    Pilote.findById((req.params.pilotes_id), function(err, pilote) {
        if (err){
            res.send(err);
        } 
        res.json(pilote);
    }); 
})
.put(function(req,res) {
    Pilote.findById((req.params.pilotes_id), function(err, pilote) {
        console.log('params : ',req.params);
        console.log('pilote : ',pilote);
        if (err){
            res.send(err);
        } 
            pilote.prenom = req.body.prenom;
            pilote.nom = req.body.nom;
            pilote.marque = req.body.marque;
            pilote.description = req.body.description;
                pilote.save(function(err) {
                    if(err){
                    res.send(err);
                    }
                    res.json({message : 'Bravo, mise à jour du Pilote'});
                });
            
    });
});



myRouter.route('/surfaces')
.get(function(req,res){ 
	Surface.find(function(err, surfaces){
        if (err){
            res.send(err); 
        }
        res.json(surfaces);  
    }); 
});

myRouter.route('/setups')
.post(function(req,res) {
    var setup = new Setup();
    setup.surface = req.body.surface;
    setup.date = req.body.date;
    setup.pilote = req.body.pilote;
    setup.piste = req.body.piste; 
    setup.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message : 'Bravo, le setup est maintenant stockée en base de données'});
    }); 
}); 

myRouter.route('/setups/:surface')
.get(function(req,res) {
       Setup.find({'surface':req.params.surface}, function(err, setups) {
        if (err){
            res.send(err);
        } 
        res.json(setups);
    }); 
}); 

myRouter.route('/setups/:setups_id')
.put(function(req,res) {
    Setup.findById((req.params.setups_id), function(err, setup) {
        console.log('params : ',req.params);
        console.log('setup : ',setup);
        if (err){
            res.send(err);
        } 
        setup.date = req.body.date;
        setup.pilote = req.body.pilote;
        setup.piste = req.body.piste;
        setup.save(function(err) {
            if(err){
            res.send(err);
            }
            res.json({message : 'Bravo, mise à jour du Setup'});
        });
            
    });
})
.delete(function(req,res){
    Setup.remove({_id: req.params.setups_id}, function(err, setup){
        console.log('setup : ',setup);
        if (err){
            res.send(err); 
        }
        res.json({message:"Bravo, setup supprimé"}); 
    }); 
});

myRouter.route('/images')
.post(upload.single('file'), function(req,res, next) {
    // Create a new image model and fill the properties
    let newImage = new Image();
    newImage.filename = req.file.filename;
    newImage.originalName = req.file.originalname;
    newImage.desc = req.body.desc
    //newImage.img.data = req.data;
    newImage.save(err => {
        if (err) {
            return res.sendStatus(400);
        }
        res.status(201).send({ newImage });
    });
    console.log("uploaded");
    res.json({result:1});
});

myRouter.route('/images/:image_id')
.get(function(req,res) {
    console.log(req.params.image_id);
    Image.findById((req.params.image_id), function(err, image) {
        if (err){
            res.send(err);
        } 
        res.json(image);
    }); 
});


app.use(myRouter);   
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));