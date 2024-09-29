const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Admin = require('./models/admin');


const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/',(req, res, next) => {
    res.render('404');
  });
mongoose
  .connect(
    'mongodb+srv://Vasanth:admin@cluster0.j8exy.mongodb.net/Geolocation-based-attendance-system?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });

  app.listen(8080);