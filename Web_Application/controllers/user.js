const bodyParser = require('body-parser');
const User=require('../models/user');

exports.postLogin= async (req,res,next) => {
    const { userID, password } = req.body;

    try {
      const user = await User.findOne({ userID: userID });
        console.log(user);
      if (!user) {
        return res.status(200).json({
          success: false,
          message: 'Login unsuccessful: User not found'
        });
      }
  
      if (password !== user.Password) {
        return res.status(200).json({
          success: false,
          message: 'Login unsuccessful: Incorrect password'
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Login successful'
      });
  
    } catch (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  }