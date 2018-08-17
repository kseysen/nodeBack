var express = require('express');
var multer = require('multer');
var hostname = 'localhost'; 
var PORT = process.env.PORT || 3000;
var cors = require('cors');
var path = require('path');
var fs = require('fs');
//var UPLOAD_PATH = 'uploads';
var UPLOAD_PATH= path.join(__dirname, 'uploads')

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
app.use(cors());
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
    description: String,
    imageid: String
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
    originalname: String,
    desc: String,
    piloteId: String,
    created: { type: Date, default: Date.now }
});

var ItemSchema = new mongoose.Schema(
    { img:
        { data: Buffer, contentType: String }
    }
   );
//var Image = mongoose.model("Image", ItemSchema);
var Image = mongoose.model("Image", imageSchema);

var Pilote = mongoose.model('Pilotes', piloteSchema); 
var Surface = mongoose.model('Surfaces', surfaceSchema);
var Setup = mongoose.model('Setups', setupSchema);
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
            pilote.imageid = req.body.imageid; 
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


app.post('/images', upload.single('image'), (req, res, next) => {
    console.log("path de l'upload",UPLOAD_PATH);
    var newImage = new Image();
    newImage.filename = req.file.filename;
    newImage.originalName = req.file.originalname;
    newImage.save(err => {
        if (err) {
            return res.sendStatus(400);
        }
        res.status(201).send( newImage.id); 
    });
});


app.get('/images', (req, res, next) => {
    // use lean() to get a plain JS object
    // remove the version key from the response
    Image.find({}, '-__v').lean().exec((err, images) => {
        if (err) {
            res.sendStatus(400);
        }
 
        // Manually set the correct URL to each image
        for (let i = 0; i < images.length; i++) {
            var img = images[i];
            img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
        }
        res.json(images);
    })
});

app.get('/lastimage', (req, res, next) => {
    // use lean() to get a plain JS object
    // remove the version key from the response
    Image.find({}, '-__v').lean().exec((err, images) => {
        if (err) {
            res.sendStatus(400);
        }
 
        // Manually set the correct URL to each image
        for (let i = 0; i < images.length; i++) {
            var img = images[i];
            img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
        }
        res.json(img);
    })
});

// Get one image by its ID
app.get('/images/:id', (req, res, next) => {
    let imgId = req.params.id;
 
    Image.findById(imgId, (err, image) => {
        if (err) {
            res.sendStatus(400);
        }
        // stream the image back by loading the file
        res.setHeader('Content-Type', 'image/jpeg');   
        res.set     
        fs.createReadStream(path.join(UPLOAD_PATH, image.filename)).pipe(res);
    })
});

app.use(myRouter);   
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));