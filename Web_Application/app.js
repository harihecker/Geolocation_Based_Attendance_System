const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Admin = require('./models/admin');
const cors = require('cors');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user')
app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/admin/location', (req,res,next)=>{
//   const location=req.body;
//   console.log('location',location.latitude);
//   res.send({message: 'String received'});
// }
// );
app.use('/admin', adminRoutes);
app.use('/user', userRoutes)
app.use('/',(req, res, next) => {
    res.render('404');
  });


mongoose
  .connect(
    'mongodb+srv://Vasanth:admin@cluster0.j8exy.mongodb.net/Geolocation-based-attendance-system?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(result => {
    app.listen(8080, '0.0.0.0',()=>{
      console.log("running on 0.0.0.0");
    }
    );
  })
  .catch(err => {
    console.log(err);
  });
