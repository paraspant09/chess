const express=require('express');
const router = express.Router();
const path = require('path');

const checkLoggedIn=function(req,res,next){
  if(!req.session.player)
    res.redirect('/');
  else
    next();
}

router.get('/',checkLoggedIn, (req, res) => {
  res.sendFile(path.join(path.dirname(__dirname),"public/start.html"));
});

module.exports=router;
