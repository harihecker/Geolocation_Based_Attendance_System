const Admin = require('../models/admin');

exports.getLogin = (req, res, next) => {
    res.render('login');
  }

exports.postLogin = (req, res, next) => {    
    
    Admin.findOne(req.body)
        .then(admin => {
            if (admin) {
                res.send('<h1>Welcome to the Dashboard</h1>');
            } else {
                res.send('<h1>Invalid username or password</h1><a href="/admin/login">Go back to login</a>');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal server error');
        });
};
