const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userID:{
    type:String,
    required:true,
    unique: true
  }  ,
  Name: {
    type: String,
    required: true
  },
  Password: {
    type: String,
    required: true
  },
  Company:{
    type: String,
    required:true
  },
  LastCheckIn:{
    type:Date
  },
  Presence:{
    type:String
  },
  Latitude:{
    type:String
  },
  Longitude:{
    type:String
  }

});

module.exports = mongoose.model('User', userSchema);
