const mongoose = require('mongoose');
//Player model schema
const playerSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    min:6,
    max:255
  },
  // BoardNum:{
  //   type:Number,
  //   required:true,
  //   default:1
  // },
  password:{
    type:String,
    required:true,
    min:6,
    max:1024
  }
});

module.exports = mongoose.model('Player',playerSchema);
