const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express()
const models = require('./models');
const Sequelize = require('sequelize');
const pug = require('pug');
const path = require('path');
var passport = require('passport')
var session = require('express-session')
var env = require('dotenv').load()
var exphbs = require('express-handlebars')

// Decode json and x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// For Passport

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));



require('./config/passport/passport.js')(passport, models.user);
// Add a bit of logging
app.use(morgan('short'))
//Association
models.Monkeys.belongsTo(models.Enclos);
models.Enclos.hasMany(models.Monkeys, { as: "Monkeys" });

//-------------------Route pour passport-------------------
var authController = require('./controllers/authcontroller.js');

//-------------------Page signup-------------------
app.get('/signup', authController.signup);

//-------------------Page signin-------------------
app.get('/signin', authController.signin);

//-------------------signup-------------------
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/connected',
    failureRedirect: '/signup'
}));
//-------------------logout-------------------
app.get('/logout', authController.logout);

//-------------------Signin-------------------
app.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/connected',
    failureRedirect: '/signin'
}
));


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}



//-------------------Get Singes et enclos----------------------------
app.get('/monkeys', isLoggedIn, function (req, res) {
    let m_Monkeys = [];
    let m_Enclos = [];

    models.Monkeys.findAll()
        .then((monkeys) => {
           
            m_Monkeys = monkeys;
        })
    models.Enclos.findAll()
        .then((enclos) => {
            
            m_Enclos = enclos;
        })
        .then(() => {
            res.render('index', { monkeys: m_Monkeys, enclos: m_Enclos });
        })
        
})
app.get('/connected', function (req, res) {
    res.render('connected')
})

//-------------------Créé un singe----------------------------
app.get('/createMonkey', function (req, res) {
    res.render('creation_singe')
})

app.post('/monkeys', function (req, res) {
    models.Monkeys.create({
        name: req.body.name,
        num: req.body.num,
        color: req.body.color
    })
        .then(() => {
            res.render('singe_cree')
        })
})

//-------------------Modifie un singe----------------------------
app.get('/modification_singe/:id', function (req, res) {
    res.render('modification_singe', { id: req.params.id })
})

app.post('/monkeys/update/:id', [MiddleWareup], function (req, res) {
    
    models.Monkeys.update({ name: req.body.name, num: req.body.num, color: req.body.color }, { where: { id: req.params.id } })
        .then(() => {
            res.render('modification_faite');
        })
})

//-------------------Supprime un singe----------------------------

app.get('/monkeys/destroy/:id', function (req, res) {
    models.Monkeys.destroy({ where: { id: req.params.id } })
        .then((monkey) => {
            res.render("suppression_singe")
        })
})

//-------------------Vue detail singe----------------------------

app.get('/monkeys/:id', function (req, res) {
    models.Monkeys.findOne({ where: { id: req.params.id } })
        .then((monkey) => {
            res.render('vue_detail_singe', { monkey: monkey });
        })
})

//-------------------Lier singe----------------------------
app.get('/lier_singe/:id', function (req, res) {
    let m_Enclos = [];

    
    models.Enclos.findAll()
        .then((enclos) => {

            m_Enclos = enclos;
        })
        .then(() => {
            res.render('lier_singe', { id_singe: req.params.id, enclos: m_Enclos });
        })
    
})

//-------------------Lier singe a un enclos----------------------------
app.get('/lier_singe_enclos/:id_singe/:id_enclos', function (req, res) {
    let m_Enclos;
    let m_Monkey;
    models.Monkeys.findOne({ where: { id: req.params.id_singe } })
        .then((monkey) => {
             m_Monkey = monkey;
        })
    models.Enclos.findOne({ where: { id: req.params.id_enclos } })
        .then((enclos) => {
            m_Enclos = enclos;
            
            enclos.addMonkeys(m_Monkey);
            
        })
        .then(() => {
            
           
            res.render('lien_enclos_singes');
        })
})


//-------------------Créé un enclos----------------------------
app.get('/createEnclos', function (req, res) {
    res.render('creation_enclos')
})

app.post('/enclos', function (req, res) {
    models.Enclos.create({
        nom: req.body.nom,
        capacity: req.body.capacity
        
    })
        .then(() => {
            res.render('enclos_cree')
        })
})

//-------------------Modifie un enclos----------------------------
app.get('/modification_enclos/:id', function (req, res) {
    res.render('modification_enclos', { id: req.params.id })
})

app.post('/enclos/update/:id', [MiddleWareup], function (req, res) {

    models.Enclos.update({ nom: req.body.nom, capacity: req.body.capacity }, { where: { id: req.params.id } })
        .then(() => {
            res.render('modification_faite_enclos');
        })
})

//-------------------Supprime un enclos----------------------------

app.get('/enclos/destroy/:id', function (req, res) {
    models.Enclos.destroy({ where: { id: req.params.id } })
        .then((enclos) => {
            res.render("suppression_enclos")
        })
})


//-------------------Recupere un enclos----------------------------
app.get('/enclos/:id', function (req, res) {
    models.Enclos.findOne({ where: { id: req.params.id } })
        .then((enclos) => {
            enclos.getMonkeys().then(associatedTasks => {
                res.render('vue_detail_enclos', { enclos: enclos, monkeys: associatedTasks })
            })
        })
})



function MiddleWareup(req, res, next) {
    
    const objRet = req.body;
    for (let property in req.body) {
        if (req.body[property] == '') {
            delete objRet[property];
        }
    }
    req.body = objRet;
    next();
}


app.get('/', function (req, res) {
    res.redirect('/monkeys')
})

app.get('/AddEnclos', function (req, res) {
    res.render('creation_enclos')
})

app.get('/LierAEnclos/:id', function (req, res) {
    res.render('lierAEnclos', { id: req.params.id })
})



// Synchronize models
models.sequelize.sync().then(function() {
  /**
   * Listen on provided port, on all network interfaces.
   * 
   * Listen only when database connection is sucessfull
   */
  app.listen(3000, function() {
    console.log('Express server listening on port 3000');
  });
});

//Api Rest
//Avoir liste des singes
app.get('/rest/monkeys', function (req, res) {
    
    models.Monkeys.findAll()
        .then((monkey) => {
            res.send(monkey)
        })
})

//Avoir un singe
app.get('/rest/monkeys/:id', function (req, res) {

    models.Monkeys.findOne({ where: { id: req.params.id } })
        .then((monkey) => {
            res.send(monkey)
        })
})

//Creer un singe
app.post('/rest/monkeys', function(req, res) {
  models.Monkeys.create({
      name: req.body.name,
      num: req.body.num,
      color: req.body.color
  })
        .then(() => {
          res.send('Monkey added !')
        })
})

//Mettre a jour un singe
app.put('/rest/monkeys/:id',[MiddleWareup], function (req, res) {
    models.Monkeys.update({ name: req.body.name, num: req.body.num, color: req.body.color }, { where: { id: req.params.id } })
        .then((monkey) => {
            res.send("Monkey mis a jour")
        })
})

//Supprimer un singe
app.delete('/rest/monkeys/:name', function (req, res) {
    models.Monkeys.destroy({ where: { name: req.params.name } })
        .then((monkey) => {
            res.send("Monkey supprimé")
        })
})

//Supprimer tout les singes
app.delete('/rest/monkeys/', function (req, res) {
    models.Monkeys.destroy({ where: { } })
        .then((monkey) => {
            res.send("Monkeys supprimes")
        })
})

//enclos
//Avoir listes des enclos
app.get('/rest/enclos', function (req, res) {

    models.Enclos.findAll()
        .then((enclos) => {
            res.send(enclos)
        })
})

//Avoir un enclos
app.get('/rest/enclos/:id', function (req, res) {

    models.Enclos.findOne({ where: { id: req.params.id } })
        .then((enclos) => {
            res.send(enclos)
        })
})

//Creer un enclos
app.post('/rest/enclos', function (req, res) {
    models.Enclos.create({
        nom: req.body.nom,
        capacity: req.body.capacity
        
    })
        .then(() => {
            res.send('Enclos added !')
        })
})

//Mettre a jour un enclos
app.put('/rest/enclos/:id', [MiddleWareup], function (req, res) {
    models.Enclos.update({ nom: req.body.nom, capacity: req.body.capacity }, { where: { id: req.params.id } })
        .then((enclos) => {
            res.send("Enclos mis a jour")
        })
})

//Supprimer un enclos
app.delete('/rest/enclos/:nom', function (req, res) {
    models.Enclos.destroy({ where: { nom: req.params.nom } })
        .then((enclos) => {
            res.send("Enclos supprime")
        })
})

//Supprimer tout les enclos
app.delete('/rest/enclos/', function (req, res) {
    models.Enclos.destroy({ where: {} })
        .then((enclos) => {
            res.send("Enclos supprimes")
        })
})

//Association
//Lier un singe a un enclos
app.get('/rest/lier/:id_singe/:id_enclos', function (req, res) {
    let m_Enclos;
    let m_Monkey;
    models.Monkeys.findOne({ where: { id: req.params.id_singe } })
        .then((monkey) => {
            m_Monkey = monkey;
        })
    models.Enclos.findOne({ where: { id: req.params.id_enclos } })
        .then((enclos) => {
            m_Enclos = enclos;

            enclos.addMonkeys(m_Monkey);

        })
        .then(() => {


            res.send('Le singe a ete liee');
        })
})

//Avoir tout les singes d'un enclos
app.get('/rest/monkeysinenclos/:id', function (req, res) {
    models.Enclos.findOne({ where: { id: req.params.id } })
        .then((enclos) => {
            enclos.getMonkeys().then(associatedTasks => {
                res.send( { enclos: enclos, monkeys: associatedTasks })
            })
        })
})

