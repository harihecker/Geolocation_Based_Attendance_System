const Admin = require('../models/admin');
const User=require('../models/user');
const bodyParser = require('body-parser');

let currentLocation = { latitude: 0, longitude: 0 };

exports.getLogin = (req, res, next) => {
    res.render('login');
  }

exports.getDashboard = (req,res,next) => {
    res.render('dashboard');
}

exports.postLogin = (req, res, next) => {    
    
    Admin.findOne(req.body)
        .then(admin => {
            if (admin) {
                res.render('dashboard');
            } else {
                res.send('<h1>Invalid username or password</h1><a href="/admin/login">Go back to login</a>');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal server error');
        });
};


exports.postLocation = (req,res,next)=>{
    const { latitude, longitude } = req.body;
    currentLocation = { latitude, longitude };
    console.log('location',currentLocation);
    res.send({message: 'String received'});
};

exports.getLocation = (req,res,next)=>{
    res.json(currentLocation);
};

exports.showLocation=(req,res,next)=>{
    res.render('map');
}

exports.addUser= (req,res,next) => {
    res.render('add_user');
}

exports.postSignUp= async (req,res,next) => {
    const { userID, Name, Password, Branch } = req.body;

    try {
        const existingUser = await User.findOne({ userID });
        
        if (existingUser) {
            return res.status(400).send('User ID already exists. Please choose another one.');
        }

        const newUser = new User({
            userID,
            Name,
            Password,
            Branch,
            LastCheckIn: "", 
            Presence: "No",
            Latitude:"",
            Longitude:""   
        });

        await newUser.save();

        res.status(201).send('User signed up successfully');
    } catch (error) {
        console.error('Error during signup:', error);

        if (error.code === 11000) {
            res.status(400).send('User ID already exists. Please choose another one.');
        } else {
            res.status(500).send('An error occurred while signing up.');
        }
    }
}