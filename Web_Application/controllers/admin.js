const Admin = require('../models/admin');
const User=require('../models/user');
const Company=require('../models/company');

const bodyParser = require('body-parser');

let currentLocation = { latitude: 0, longitude: 0 };

exports.getLogin = (req, res, next) => {
    res.render('login');
  }

exports.getDashboard =async (req,res,next) => {
    const companies = await Company.find({});
    res.render('dashboard',{ companies });}

exports.postLogin = (req, res, next) => {    
    
    Admin.findOne(req.body)
        .then(async admin => {
            if (admin) {
                const companies = await Company.find({});
                res.render('dashboard',{ companies });
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

exports.addCompany = (req,res,next)=>{
    res.render('add_company');
};

exports.postAddCompany = async (req,res,next)=>{
    const newCompany = new Company({
        companyName: req.body.CompanyName,
        Place: req.body.Place,
        Latitude: req.body.Latitude,
        Longitude: req.body.Longitude
      });
      console.log(newCompany)
      newCompany.save()
        .then(() => {
          res.status(201).json({ message: "Company added successfully!" });
        })
        .catch(error => {
          if (error.name === 'ValidationError') {
            res.status(400).json({ message: "Validation Error", errors: error.errors });
          } else {
            res.status(500).json({ message: "Internal Server Error" });
          }
        });      
}

exports.getCompanyDetails = (req,res,next)=>{
    res.render('attendance_portal');
}