const Admin = require('../models/admin');
const User=require('../models/user');
const Company=require('../models/company');

const bodyParser = require('body-parser');

let currentLocation = { Latitude: 0, Longitude: 0 };

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


exports.postLocation = async(req,res,next)=>{
    // const { latitude, longitude ,userID} = req.body;
    // currentLocation = { latitude, longitude ,userID};
    // console.log('location',currentLocation);
    // res.send({message: 'String received'});
    console.log('Raw body received:', req.body); 

  const { userID, latitude, longitude } = req.body; 

  if (!userID || latitude === undefined || longitude === undefined) {
    console.log('Validation failed:', { latitude, longitude, userID });
    return res.status(400).json({ error: 'Missing required fields' });
  }

//   console.log('Extracted fields:', { userID, latitude, longitude });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userID: userID }, 
      { Latitude: latitude, Longitude: longitude },
      { new: true, useFindAndModify: false } 
    );

    if (!updatedUser) {
      console.log('User not found for userID:', userID);
      return res.status(404).json({ error: 'User not found' });
    }

    // console.log('Updated user location:', updatedUser);
    res.status(200).json({ message: 'Location updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getLocation = async (req, res, next) => {
  try {
      const userID = req.query.userID;

      if (!userID) {
          return res.status(400).json({ error: 'UserID is required' });
      }
      const user = await User.findOne(
          { userID },
          { Latitude: 1, Longitude: 1, _id: 0 }
      );

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const { Latitude, Longitude } = user;

      res.json({ latitude: Latitude, longitude: Longitude });
  } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ error: 'Server error' });
  }
};

exports.showLocation = (req, res, next) => {
  const userID = req.query.userID;
  res.render('map', { userID });
};

// Get all user locations for a given company
exports.getAllLocations = async (req, res, next) => {
  const company = req.query.company;
  console.log("Fetching locations for company:", company);

  if (!company) {
    return res.status(400).send('Company name is required');
  }

  try {
    const users = await User.find({ Company: company }, { Latitude: 1, Longitude: 1, Name: 1, _id: 0 });
    if (users.length === 0) {
      return res.status(404).send('No users found in this company');
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
};

// Render the map page with the company name
exports.showAllLocations = (req, res, next) => {
  const company = req.query.company;
  if (!company) {
    return res.status(400).send('Company name is required');
  }
  res.render('all_locations', { company });
};

exports.addUser=async (req,res,next) => {
    try {
        const companies = await Company.find();
        res.render('add_user', { companies });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
}

exports.postSignUp = async (req, res, next) => {
    const { userID, Name, Password, Company } = req.body;  

    try {
        const existingUser = await User.findOne({ userID });
        
        if (existingUser) {
            return res.status(400).send('User ID already exists. Please choose another one.');
        }

        const newUser = new User({
            userID,
            Name,
            Password,
            Company,  
            LastCheckIn: "", 
            Presence: "No",
            Latitude: "",
            Longitude: ""   
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
};


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

exports.getCompanyDetails = async (req, res,next) => {
    const companyName = req.query.companyName;
  
    if (!companyName) {
      return res.status(400).send('Company name is required');
    }
  
    try {
      const users = await User.find({ Company: companyName });
  
      res.render('attendance_portal', { users, companyName });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
  