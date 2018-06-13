// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
//WE GOT MONGOOSE UP IN DIS BITCH
var mongoose = require('mongoose');

//DB SCHEMA
mongoose.connect('mongodb://localhost/login_registration');
var UserSchema = new mongoose.Schema({
    f_name:  { 
        type: String,  
        required: [true, 'first name is required'],
        minlength: [2, 'must be at least 2 characters']},
    l_name:  { 
        type: String, 
        required: [true, 'last name is required'], 
        minlength: [2, 'last name must be at least 2 characters']},
    email: { 
        type: String, 
        required: [true, 'email is required'],
        unique: [true, 'email already exists'],
        minlength: [1, 'email must be greater than 1 character'], 
        maxlength: [150, 'email cannot be greater than 150 characters']},
    pwd: { 
        type: String, 
        required: [true, 'password is required'],
        minlength: [8,'password must at least be 8 characters']},
    birthday: {
        type:Date,
        required: [true,'birthdate must be a valid date']}
}, 
{timestamps: true });

   mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
   var User = mongoose.model('User') // We are retrieving this Schema from our Models, named 'User'
mongoose.Promise = global.Promise;

//SESSION
const session = require('express-session');
app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

//BODY PARSER
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//FLASH
const flash = require('express-flash');
app.use(flash());

//BCRYPT
const bcrypt = require('bcrypt-as-promised');

// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request

app.get('/', function(req, res) {
    res.render('index')
})

app.get('/success', function(req, res) {
    console.log('LOAD SUCCESS PAGE');
    if(req.session.email){
        console.log(req.session.email);
        var user;
        User.findOne({email:req.session.email}, (err,user)=>{
            if(err){
                console.log('Error importing user')
            }
            else{
                user=user
                console.log(user);
            }
            res.render('success', {user:user});
        })
    }
    else{
        console.log('Login to see success');
        req.flash('registration', 'Success only comes to those who REGISTER FIRST.');
        req.flash('registration', '凸( ͡° ͜ʖ ͡°)');
        res.redirect('/')
    }
    
    
})
app.get("/logout", function(req, res) {
    req.session.destroy();
    console.log("\n session=>", req.session);
    res.redirect("/");
  });

app.post('/registration', function(req, res) {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    var user = new User(req.body);
    user.save(function(err){
        if(err){
            console.log('Something Wrong')
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            if(11000 === err.code){
                req.flash('registration', 'email already exists');
            }
            console.log(err);
            res.redirect('/');
        }
        else{
            console.log('successfully added user!');
            req.session.email = req.body.email
            console.log(req.session.email);
            res.redirect('/success');
        }
    })
})

app.post('/login', function(req, res) {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    var user;
    User.findOne({email:req.body.email}, (err,user)=>{
        if(err){
            console.log('Error importing user')
        }
        else{
            user=user
            console.log(user);
        }
        if(!user){
            console.log('Invalid Email!!')
            req.flash('login', 'Invalid Credentials')
            res.redirect('/')
        }
        else if(user.pwd != req.body.pwd){
            console.log('Wrong Password!!')
            req.flash('login', 'Invalid Credentials')
            res.redirect('/')
        }
        else{
            console.log('success!');
            req.session.email = req.body.email
            res.redirect('/success')
        }
        })
    })
   

app.listen(8000, function() {
    console.log("listening on port 8000")})