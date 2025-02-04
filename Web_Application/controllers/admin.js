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
    // companies.total=Company.countDocuments({});
    // companies.present=Company.countDocuments({ Presence: "True" });
    res.render('dashboard',{ companies });}

exports.postLogin = (req, res, next) => {    
    Admin.findOne(req.body)
        .then(async admin => {
            if (admin) {
                const companies = await Company.find({});
                // const count = await Company.
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


const R = 6371e3; // Earth radius in meters

// Function to calculate the distance between two points in meters using the Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180; // Convert latitude to radians
    const φ2 = lat2 * Math.PI / 180; // Convert latitude to radians
    const Δφ = (lat2 - lat1) * Math.PI / 180; // Difference in latitudes
    const Δλ = (lon2 - lon1) * Math.PI / 180; // Difference in longitudes

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Returns the distance in meters
}

exports.postLocation = async (req, res, next) => {
  const { userID, latitude, longitude } = req.body;
  console.log(req.body);
  if (!userID || latitude === undefined || longitude === undefined) {
      console.log('Validation failed:', { latitude, longitude, userID });
      return res.status(400).json({ error: 'Missing required fields' });
  }

  let companyData = { x: 0, y: 0, rad: 0 }; 

  // Function to get company coordinates
  async function getCompanyCoordinates(userID) {
      try {
          const user = await User.findOne({ userID: userID }).select('Company');
          if (!user) throw new Error("User not found");

          const company = await Company.findOne({ companyName: user.Company });
          if (!company) throw new Error("Company not found");

          return { C_x: company.Latitude, C_y: company.Longitude, rad: company.Radius };
      } catch (err) {
          console.error("Error:", err.message);
          throw err;
      }
  }

  // Function to calculate the distance between two latitude/longitude points
  function haversine(lat1, lon1, lat2, lon2) {
      const toRad = (degree) => degree * (Math.PI / 180);
      const R = 6371; // Radius of the Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      console.log("Distance : ",R*c);
      return (R * c* 1000); // distance in kilometers
  }

  // Fetch company coordinates
  try {
      const coords = await getCompanyCoordinates(userID);
      companyData.x = coords.C_x;
      companyData.y = coords.C_y;
      companyData.rad = coords.rad;

      let isPresent = "False";

      const distance = haversine(latitude, longitude, companyData.x, companyData.y);

      if (distance <= companyData.rad) {
          isPresent = "True";
      }

      console.log("isPresent:", isPresent);

      // Update the user's location and presence
      const updatedUser = await User.findOneAndUpdate(
          { userID: userID },
          { Latitude: latitude, Longitude: longitude, Presence: isPresent },
          { new: true }
      );

      if (!updatedUser) {
          console.log('User not found for userID:', userID);
          return res.status(404).json({ error: 'User not found' });
      }

      console.log('Updated user location:', updatedUser);

      // After updating user presence, update the company information
      await updateNumberOfPresent(updatedUser.Company);

      res.status(200).json({ message: 'Location and presence updated successfully', user: updatedUser });

  } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Server error' });
  }
};

// Function to update the number of present users in the company
async function updateNumberOfPresent(companyName) {
  try {
      const presentCount = await User.countDocuments({ Company: companyName, Presence: "True" });
      const company = await Company.findOneAndUpdate(
          { companyName: companyName },
          { numberOfPresent: presentCount },
          { new: true }
      );

      if (!company) {
          console.log("Company not found!");
          return;
      }

      console.log(`Updated number of present users in ${companyName}: ${presentCount}`);
  } catch (error) {
      console.error("Error updating number of present users:", error);
  }
}



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
    const { userID, Name, Password, Company: companyName } = req.body;  

    try {
        const existingUser = await User.findOne({ userID });
        
        if (existingUser) {
            return res.status(400).send('User ID already exists. Please choose another one.');
        }

        const company = await Company.findOne({ companyName });

        if (!company) {
            return res.status(404).send('Company not found.');
        }

        const newUser = new User({
            userID,
            Name,
            Password,
            Company: companyName,  
            LastCheckIn: "", 
            Presence: "No",
            Latitude: "",
            Longitude: ""   
        });

        await newUser.save();

        await Company.updateOne(
            { companyName },
            { $inc: { totalEmployees: 1 } }
        );

        res.status(201).send('User signed up successfully, and company employee count updated.');
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
        Longitude: req.body.Longitude,
        Radius: req.body.Radius
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

  