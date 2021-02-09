const express=require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const Player = require('../models/player');
const path = require('path');

//Validation
const {authValidation} = require('../validation');

const checkLoggedIn=function(req,res,next){
  if(req.session.player)
  {
    res.sendFile(path.join(path.dirname(__dirname),"public/start.html"));
  }
  else
    next();
}

router.get('/',checkLoggedIn,async (req,res)=>{
  res.sendFile(path.join(path.dirname(__dirname),"public/index.html"));
})

//Routing for saving user data in database
router.post('/',async (req,res)=>{
  //Requested object
  const reqObject={
    name:req.body.name,
    password:req.body.password
  };

  //Validation before Sending
  const { error }=authValidation(reqObject);
  if(error) return res.status(400).send(error.details[0].message);

  if(req.body.Entry === 'SIGNUP'){
    //Checking player already exists in database
    const playerExist=await Player.findOne({name:req.body.name});
    if(playerExist)  return res.status(400).send("Player already exists.");

    //Hahing password
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(reqObject.password,salt);

    //Filling player model with data
    const player=new Player({name:reqObject.name,password:hashedPassword});
    //saving data to database
    player.save((err, data)=>{
      if (err) return res.status(400).send(err);
      res.send({player:player._id});
    });
  }
  else if(req.body.Login === 'LOGIN'){
    //Checking player name exists in database
    const player=await Player.findOne({name:req.body.name});
    if(!player)  return res.status(400).send("Name or password is incorrect.");

    //Checking entered password with hashed password
    const validPass=await bcrypt.compare(reqObject.password,player.password);
    if(!validPass) return res.status(400).send("Name or password is incorrect.");

    //Create and assign token
    // const token=jwt.sign({_id:player._id},process.env.TOKEN_SECRET);
    // res.header('auth-token',token).send(token);
    // return res.status(400).send("Logged In.");
    req.session.player=player._id;

    res.cookie('UserID', player._id);

    res.sendFile(path.join(path.dirname(__dirname),"public/start.html"));
    // res.status(200).send("Logged In");
  }
});

module.exports=router;
