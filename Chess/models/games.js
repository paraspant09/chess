const mongoose = require('mongoose');

//Game model schema
const gameSchema=new mongoose.Schema({
  player1:{
    type:String,
  },
  player2:{
    type:String,
  },
  moves:{
    type:String,
  },
  whitePlayer:{
    type:String,
  },
  player1LeftTime:{
    type:String,
  },
  player2LeftTime:{
    type:String,
  },
  matchStartTime:{
    type:String,
  },
  whiteCurrentTime:{
    type:String,
  },
  blackCurrentTime:{
    type:String,
  },
  winner:{
    type:String,
  },
  moveNum:{
    type:String,
  }
});

module.exports = mongoose.model('Game',gameSchema);
