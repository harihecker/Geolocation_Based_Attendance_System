const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const companySchema = new Schema({
  // companyID:{
  //   type:Number,
  //   required:true,
  //   unique: true
  // },
  companyName: {
    type: String,
    required: true
  },
  Place:{
    type: String,
    required:true
  },
  Latitude:{
    type:String
  },
  Longitude:{
    type:String
  }
});

companySchema.index({ companyName: 1, Place: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);
