const Admin = require('../models/admin');
const bodyParser = require('body-parser');

exports.getLogin = (req, res, next) => {
    res.render('login');
  }

  let currentLocation = { latitude: 0, longitude: 0 };


exports.postLogin = (req, res, next) => {    
    
    Admin.findOne(req.body)
        .then(admin => {
            if (admin) {
                res.send('<h1>Welcome to the Dashboard</h1><iframe  name="minimap" height="500" width="500"></iframe><a target="minimap" href="/admin/showLocation">show Location</a>');
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