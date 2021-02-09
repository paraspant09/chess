const express=require('express');
const app = express();
const mongoose=require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

//createServer with socket.io using http instance
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const session = require('express-session');
const MongoStore=require('connect-mongo')(session);   //for storing sessions in mongodb

const authRoute = require('./Routes/auth.js');
const startpoint = require('./Routes/startpoint.js');
const start = require('./Routes/start.js');

const Game = require('./models/games');
const Player = require('./models/player');
var ObjectId = mongoose.Types.ObjectId;

//cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//options for static file folder
const options = {
  index: false
}


//to enable env variable statement from .env file
dotenv.config();

//setting PORT
app.set('port',(process.env.PORT || 3000));

//Database connection
mongoose.connect(
  process.env.DB_CONNECT,
{ useNewUrlParser: true ,useUnifiedTopology: true},
()=>{
  console.log('Connected to mongoose');
});

//body parser for using json data for json post request
app.use(express.json());
//body parser for using json data for post request in query string
app.use(express.urlencoded({
  extended:true
}));

//Create session storage collection in mongodb
const sessionStore=new MongoStore({
  mongooseConnection:mongoose.connection,
  collection: 'sessions'  //collection name for sessions in mongodb
});

//setting session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    // secure: true ,
    maxAge:24 * 60 * 60 * 1000 //1 day
  }
}));

//Middleware for including all the files in public folder for front end
app.use(express.static(path.join(__dirname,"public"),options));

//Routing for user authentication
app.use('/',authRoute);

//start.html
app.use('/startpoint',authRoute,startpoint);

//board.html
app.use('/startpoint/start',start);

//Setting games
class PlayingGame{
  player1;
  player2;
  moves;
  whitePlayer;
  player1LeftTime;
  player2LeftTime;
  matchStartTime;
  whiteCurrentTime;
  blackCurrentTime;
  canplayer1SC;
  canplayer2SC;
  canplayer1LC;
  canplayer2LC;
  player1LastMove;
  player2LastMove;
  winner;
  moveNum;
  myVar; //function for timer
  // constructor(player1,player2,moves,whitePlayer,player1LeftTime,player2LeftTime,matchStartTime,whiteCurrentTime,
  // blackCurrentTime,canplayer1SC,canplayer2SC,canplayer1LC,canplayer2LC,player1LastMove,player2LastMove,
  // winner,moveNum){
  //   this.player1=player1;
  //   this.player2=player2;
  //   this.moves=moves;
  //   this.whitePlayer=whitePlayer;
  //   this.player1LeftTime=player1LeftTime;
  //   this.player2LeftTime=player2LeftTime;
  //   this.matchStartTime=matchStartTime;
  //   this.whiteCurrentTime=whiteCurrentTime;
  //   this.blackCurrentTime=blackCurrentTime;
  //   this.canplayer1SC=canplayer1SC;
  //   this.canplayer2SC=canplayer2SC;
  //   this.canplayer1LC=canplayer1LC;
  //   this.canplayer2LC=canplayer2LC;
  //   this.player1LastMove=player1LastMove;
  //   this.player2LastMove=player2LastMove;
  //   this.winner=winner;
  //   this.moveNum=moveNum;
  // }
}


let i=0;
// let myVar;
// let currentGames=[];
const currentGames= new Map();  //Changing from array to Map(to make deletion easier)

function MakeTimerforWhite(start,target_diff,room) {
  // let cur_game=currentGames[room];
  let cur_game=currentGames.get(room);
  target_diff= target_diff*1000;
  cur_game.myVar = setInterval(myTimer, 1000);
  // var start = Date.now();
   async function myTimer(){
    let newt = Date.now();
    let current_diff= newt - start;

    let time=Math.floor((target_diff - current_diff)/1000);
    let min=Math.floor( time / 60);
    let sec=Math.floor( time % 60);

    cur_game.whiteCurrentTime=time;

    if(cur_game.whitePlayer == cur_game.player1){
      cur_game.player1LeftTime=time;
    }
    else{
      cur_game.player2LeftTime=time;
    }

    io.to(room).emit('timer', {'color':'White','min':min,'sec':sec});

    if(time==0) {   //White Lost
      await Player.findById(ObjectId(cur_game.whitePlayer==cur_game.player1 ? cur_game.player2.substring(3,27) : cur_game.player1.substring(3,27))).then(async (doc)=>{
          // console.log(doc);
          let winnerName=doc.name;
          await Player.findById(ObjectId(cur_game.whitePlayer.substring(3,27))).then((doc)=>{
              // console.log(doc);
              let loserName=doc.name;
              io.to(room).emit('GameEnd',{"WinID":cur_game.whitePlayer==cur_game.player1 ? cur_game.player2 : cur_game.player1,"Win":winnerName,"LoseID":cur_game.whitePlayer,"Lose":loserName});

              cur_game.winner=cur_game.whitePlayer==cur_game.player1 ? cur_game.player2 : cur_game.player1;

              //store in Database
              const gameObject=new Game({
                player1:cur_game.player1,
                player2:cur_game.player2,
                moves:cur_game.moves,
                whitePlayer:cur_game.whitePlayer,
                player1LeftTime:cur_game.player1LeftTime,
                player2LeftTime:cur_game.player2LeftTime,
                matchStartTime:cur_game.matchStartTime,
                whiteCurrentTime:cur_game.whiteCurrentTime,
                blackCurrentTime:cur_game.blackCurrentTime,
                winner:cur_game.winner,
                moveNum:cur_game.moveNum,
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              // i--;
              // currentGames.splice(room,1);
              currentGames.delete(room);

            }).catch((err)=>{
                 console.log(err);
              });
          }).catch((err)=>{
             console.log(err);
          });
      clearInterval(cur_game.myVar);
      return;
    }
  }
}

function MakeTimerforBlack(start,target_diff,room) {
  // let cur_game=currentGames[room];
  let cur_game=currentGames.get(room);
  target_diff= target_diff*1000;
  cur_game.myVar = setInterval(myTimer, 1000);
  // var start = Date.now();
   async function myTimer() {
    let newt = Date.now();
    let current_diff= newt - start;

    let time=Math.floor((target_diff - current_diff)/1000);
    let min=Math.floor( time / 60);
    let sec=Math.floor( time % 60);

    cur_game.blackCurrentTime=time;

      if(cur_game.whitePlayer == cur_game.player1){
        cur_game.player2LeftTime=time;
      }
      else{
        cur_game.player1LeftTime=time;
      }

    io.to(room).emit('timer', {'color':'Black','min':min,'sec':sec});

    if(time==0) {//Black Lost
      await Player.findById(ObjectId(cur_game.whitePlayer.substring(3,27))).then(async (doc)=>{
          // console.log(doc);
          let winnerName=doc.name;
          await Player.findById(ObjectId(cur_game.whitePlayer==cur_game.player1 ? cur_game.player2.substring(3,27) : cur_game.player1.substring(3,27))).then((doc)=>{
              // console.log(doc);
              let loserName=doc.name;
              io.to(room).emit('GameEnd',{"WinID":cur_game.whitePlayer,"Win":winnerName,"LoseID":cur_game.whitePlayer==cur_game.player1 ? cur_game.player2 : cur_game.player1,"Lose":loserName});

              cur_game.winner=cur_game.whitePlayer;

              const gameObject=new Game({
                player1:cur_game.player1,
                player2:cur_game.player2,
                moves:cur_game.moves,
                whitePlayer:cur_game.whitePlayer,
                player1LeftTime:cur_game.player1LeftTime,
                player2LeftTime:cur_game.player2LeftTime,
                matchStartTime:cur_game.matchStartTime,
                whiteCurrentTime:cur_game.whiteCurrentTime,
                blackCurrentTime:cur_game.blackCurrentTime,
                winner:cur_game.winner,
                moveNum:cur_game.moveNum,
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              // i--;
              // currentGames.splice(room,1);
              currentGames.delete(room);

            }).catch((err)=>{
                 console.log(err);
              });
          }).catch((err)=>{
             console.log(err);
          });

      clearInterval(cur_game.myVar);
      return;
    }
  }
}

io.on('connection', (socket) => {
  // console.log(`${socket.id} user connected`);
  socket.on('start game', (msg) => {
    // console.log(msg);
    let check_game;
    let index=-1;

    for (let [pos, game] of currentGames.entries()) {
      if(i!=pos){
        if(game.player1 == msg){
          check_game=game;
          index=pos;
          console.log(game.player1,msg);
          break;
        }
        else if (game.player2 == msg) {
          check_game=game;
          index=pos;
          console.log(game.player2,msg);
          break;
        }
      }
    }

    console.log(index,check_game);

    if(index!=-1){    //already present in existing games
      socket.join(index);
      // console.log(10-Math.floor((player1Timer[index]-matchStartTime[index])/(60*1000)));
      let sendTime,forColor;
      sendTime = check_game.moveNum%2==0 ? check_game.blackCurrentTime : check_game.whiteCurrentTime;
      forColor = check_game.moveNum%2==0 ? "Black" : "White";

      if(check_game.player1==msg){
        socket.emit('arrange',{'moves':check_game.moves,'forColor':forColor,'otherTime':sendTime});
        io.to(index).emit('canCastle',{"toboth":false,"for":check_game.player1,"SC":check_game.canplayer1SC,"LC":check_game.canplayer1LC});
        socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player1,"LastMove":check_game.player2LastMove});
      }
      else if (check_game.player2==msg) {
        socket.emit('arrange',{'moves':check_game.moves,'forColor':forColor,'otherTime':sendTime});
        io.to(index).emit('canCastle',{"toboth":false,"for":check_game.player2,"SC":check_game.canplayer2SC,"LC":check_game.canplayer2LC});
        socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player2,"LastMove":check_game.player1LastMove});
      }
    }
    else{   //create new Game
      console.log("new Game");
      let cur_game;
      // if(!currentGames[i]){
      if(!currentGames.has(i)){
        cur_game=new PlayingGame();
        // currentGames[i]=cur_game;
        currentGames.set(i,cur_game);
      }
      else {
        // cur_game=currentGames[i];
        cur_game=currentGames.get(i);
      }

      if(!cur_game.player1 || cur_game.player1==msg){ //if game is not set or only one player is there and it comes again
        console.log("player1");
        cur_game.player1=msg;
        socket.join(i);
      }
      else if(cur_game.player1!=msg){
        console.log("player2");
        cur_game.player2=msg;
        socket.join(i);
        cur_game.moves="";
        cur_game.moveNum=0;
        cur_game.whitePlayer=Math.random()==1?cur_game.player1:cur_game.player2;
        cur_game.matchStartTime=Date.now();

        MakeTimerforWhite(cur_game.matchStartTime,10*60,i);

        cur_game.player1LeftTime=10*60;
        cur_game.player2LeftTime=10*60;

        cur_game.whiteCurrentTime=10*60;
        cur_game.blackCurrentTime=10*60;

        cur_game.canplayer1SC=true;
        cur_game.canplayer2SC=true;
        cur_game.canplayer1LC=true;
        cur_game.canplayer2LC=true;

        cur_game.player1LastMove="";
        cur_game.player2LastMove="";

        cur_game.winner="";
        console.log(cur_game.player1.substring(3,27));

        io.to(i).emit('started', {'White':cur_game.whitePlayer,'Black':cur_game.whitePlayer==cur_game.player1 ? cur_game.player2 : cur_game.player1});
        io.to(index).emit('canCastle',{"toboth":true,"p1":cur_game.player1,"p2":cur_game.player2,"p1SC":cur_game.canplayer1SC,"p1LC":cur_game.canplayer1LC,"p2SC":cur_game.canplayer2SC,"p2LC":cur_game.canplayer2LC});

        i++;
        // console.log(player1[i-1],player2[i-1]);
      }
    }

    console.log(currentGames);
  });

  socket.on('move piece', (msg) =>{

    // console.log(msg);
    let check_game;
    let index=-1;

    for (let [pos, game] of currentGames.entries()) {
      if(i!=pos){
        if(game.player1 == msg.user){
          check_game=game;
          index=pos;
          break;
        }
        else if (game.player2 == msg.user) {
          check_game=game;
          index=pos;
          break;
        }
      }
    }

    if(check_game)
      clearInterval(check_game.myVar);

    if(index!=-1){
      console.log(check_game.canplayer1LC,check_game.canplayer1SC,check_game.canplayer2LC,check_game.canplayer2SC);
      if(check_game.player1==msg.user){
        //for setting can it castle or not
        if(['♔','♚'].indexOf(msg.piece)>=0){
          check_game.canplayer1SC=false;
          check_game.canplayer1LC=false;
        }
        else if (['♖','♜'].indexOf(msg.piece)>=0) {   //if piece moved
          if(check_game.whitePlayer==check_game.player1){
            if(msg.from=="A1"){   //cannot Long castle
              check_game.canplayer1LC=false;
            }
            else if (msg.from=="H1") {  //cannot short castle
              check_game.canplayer1SC=false;
            }
          }
          else{
            if(msg.from=="H1"){   //cannot Long castle
              check_game.canplayer1LC=false;
            }
            else if (msg.from=="A1") {  //cannot short castle
              check_game.canplayer1SC=false;
            }
          }
        }
        else{     //if piece captured is moved already then castle is already false
          if(check_game.whitePlayer==check_game.player1){
            if(msg.to=="A8"){   //cannot Long castle
              check_game.canplayer2LC=false;
            }
            else if (msg.to=="H8") {  //cannot short castle
              check_game.canplayer2SC=false;
            }
          }
          else{
            if(msg.to=="H8"){   //cannot Long castle
              check_game.canplayer2LC=false;
            }
            else if (msg.to=="A8") {  //cannot short castle
              check_game.canplayer2SC=false;
            }
          }
        }

        io.to(index).emit('canCastle',{"toboth":false,"for":check_game.player1,"SC":check_game.canplayer1SC,"LC":check_game.canplayer1LC});

        if(msg.from.length==1 && msg.to.length==1){   //pawn promotion
          check_game.player1LastMove="PP:"+msg.piece+":"+msg.from+"7:"+msg.to+"8";    //PP:queen:H7:G8
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player2,"LastMove":check_game.player1LastMove});
          socket.to(index).emit('moving',{"user":check_game.player2,'from':msg.from+"7",'to':msg.to+"8",'PP':msg.piece,'castle':false,'enPrsnt':false});
        }
        else if (msg.castle) {
          check_game.player1LastMove="castle:"+msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player2,"LastMove":check_game.player1LastMove});
          socket.to(index).emit('moving',{"user":check_game.player2,'from':msg.from,'to':msg.to,'PP':"",'castle':true,'enPrsnt':false});
        }
        else if (msg.enPrsnt) {
          check_game.player1LastMove="EP:"+msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player2,"LastMove":check_game.player1LastMove});
          socket.to(index).emit('moving',{"user":check_game.player2,'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':true});
        }
        else{
          check_game.player1LastMove=msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player2,"LastMove":check_game.player1LastMove});
          socket.to(index).emit('moving',{"user":check_game.player2,'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':false});
        }

        check_game.moves+=check_game.player1LastMove+",";

        let whiteLeftTime,blackLeftTime;
        if(check_game.whitePlayer==check_game.player1){
          whiteLeftTime=check_game.player1LeftTime;
          blackLeftTime=check_game.player2LeftTime;
        }
        else{
          whiteLeftTime=check_game.player2LeftTime;
          blackLeftTime=check_game.player1LeftTime;
        }
        check_game.moveNum++;
        if(check_game.moveNum%2==0){
          MakeTimerforWhite(Date.now(),whiteLeftTime,index);
        }
        else{
          MakeTimerforBlack(Date.now(),blackLeftTime,index);
        }
      }
      else if (check_game.player2==msg.user) {
        //for setting can it castle or not
        if(['♔','♚'].indexOf(msg.piece)>=0){
          check_game.canplayer2SC=false;
          check_game.canplayer2LC=false;
        }
        else if (['♖','♜'].indexOf(msg.piece)>=0) {
          if(check_game.whitePlayer==check_game.player2){
            if(msg.from=="A1"){   //cannot Long castle
              check_game.canplayer2LC=false;
            }
            else if (msg.from=="H1") {  //cannot short castle
              check_game.canplayer2SC=false;
            }
          }
          else{
            if(msg.from=="H1"){   //cannot Long castle
              check_game.canplayer2LC=false;
            }
            else if (msg.from=="A1") {  //cannot short castle
              check_game.canplayer2SC=false;
            }
          }
        }
        else{     //if piece captured is moved already then castle is already false
          if(check_game.whitePlayer==check_game.player2){
            if(msg.to=="A8"){   //cannot Long castle
              check_game.canplayer1LC=false;
            }
            else if (msg.to=="H8") {  //cannot short castle
              check_game.canplayer1SC=false;
            }
          }
          else{
            if(msg.to=="H8"){   //cannot Long castle
              check_game.canplayer1LC=false;
            }
            else if (msg.to=="A8") {  //cannot short castle
              check_game.canplayer1SC=false;
            }
          }
        }

        io.to(index).emit('canCastle',{"toboth":false,"for":check_game.player2,"SC":check_game.canplayer2SC,"LC":check_game.canplayer2LC});

        if(msg.from.length==1 && msg.to.length==1){   //pawn promotion
          check_game.player2LastMove="PP:"+msg.piece+":"+msg.from+"7:"+msg.to+"8";    //PP:queen:H7:G8
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player1,"LastMove":check_game.player2LastMove});
          socket.to(index).emit('moving',{"user":check_game.player1,'from':msg.from+"7",'to':msg.to+"8",'PP':msg.piece,'castle':false,'enPrsnt':false});
        }
        else if (msg.castle) {
          check_game.player2LastMove="castle:"+msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player1,"LastMove":check_game.player2LastMove});
          socket.to(index).emit('moving',{"user":check_game.player1,'from':msg.from,'to':msg.to,'PP':"",'castle':true,'enPrsnt':false});
        }
        else if (msg.enPrsnt) {
          check_game.player2LastMove="EP:"+msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player1,"LastMove":check_game.player2LastMove});
          socket.to(index).emit('moving',{"user":check_game.player1,'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':true});
        }
        else{
          check_game.player2LastMove=msg.from+":"+msg.to;
          socket.to(index).emit('LastMoveOfOpponent',{"for":check_game.player1,"LastMove":check_game.player2LastMove});
          socket.to(index).emit('moving',{"user":check_game.player1,'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':false});
        }

        check_game.moves+=check_game.player2LastMove+",";

        let whiteLeftTime,blackLeftTime;
        if(check_game.whitePlayer==check_game.player1){
          whiteLeftTime=check_game.player1LeftTime;
          blackLeftTime=check_game.player2LeftTime;
        }
        else{
          whiteLeftTime=check_game.player2LeftTime;
          blackLeftTime=check_game.player1LeftTime;
        }
        check_game.moveNum++;
        if(check_game.moveNum%2==0){
          MakeTimerforWhite(Date.now(),whiteLeftTime,index);
        }
        else{
          MakeTimerforBlack(Date.now(),blackLeftTime,index);
        }
      }
    }

  });

  socket.on('checkmate',async (msg)=>{

    let check_game;
    let index=-1;

    for (let [pos, game] of currentGames.entries()) {
      if(i!=pos){
        if(game.player1 == msg.Lose){
          check_game=game;
          index=pos;
          break;
        }
        else if (game.player2 == msg.Lose) {
          check_game=game;
          index=pos;
          break;
        }
      }
    }

    if(check_game)
      clearInterval(check_game.myVar);

    if(index!=-1){
      if(check_game.player1==msg.Lose){
        await Player.findById(ObjectId(check_game.player2.substring(3,27))).then(async (doc)=>{
            console.log(doc);
            let winnerName=doc.name;
            await Player.findById(ObjectId(check_game.player1.substring(3,27))).then((doc)=>{
                console.log(doc);
                let loserName=doc.name;

                io.to(index).emit('GameEnd',{"WinID":check_game.player2,"Win":winnerName,"LoseID":check_game.player1,"Lose":loserName});
                check_game.winner=check_game.player2;

                //store in Database
                const gameObject=new Game({
                  player1:check_game.player1,
                  player2:check_game.player2,
                  moves:check_game.moves,
                  whitePlayer:check_game.whitePlayer,
                  player1LeftTime:check_game.player1LeftTime,
                  player2LeftTime:check_game.player2LeftTime,
                  matchStartTime:check_game.matchStartTime,
                  whiteCurrentTime:check_game.whiteCurrentTime,
                  blackCurrentTime:check_game.blackCurrentTime,
                  winner:check_game.winner,
                  moveNum:check_game.moveNum,
                });
                gameObject.save((err, data)=>{
                  if (err) return res.status(400).send(err);
                });

                //delete from array of currently playing games
                // i--;
                // currentGames.splice(index,1);
                currentGames.delete(index);

             }).catch((err)=>{
                console.log(err);
             });
         }).catch((err)=>{
            console.log(err);
         });
      }
      else if (check_game.player2==msg.Lose) {
        await Player.findById(ObjectId(check_game.player1.substring(3,27))).then(async (doc)=>{
            console.log(doc);
            let winnerName=doc.name;

            await Player.findById(ObjectId(check_game.player2.substring(3,27))).then((doc)=>{
                console.log(doc);
                let loserName=doc.name;

                io.to(index).emit('GameEnd',{"WinID":check_game.player1,"Win":winnerName,"LoseID":check_game.player2,"Lose":loserName});
                check_game.winner=check_game.player1;

                //store in Database
                const gameObject=new Game({
                  player1:check_game.player1,
                  player2:check_game.player2,
                  moves:check_game.moves,
                  whitePlayer:check_game.whitePlayer,
                  player1LeftTime:check_game.player1LeftTime,
                  player2LeftTime:check_game.player2LeftTime,
                  matchStartTime:check_game.matchStartTime,
                  whiteCurrentTime:check_game.whiteCurrentTime,
                  blackCurrentTime:check_game.blackCurrentTime,
                  winner:check_game.winner,
                  moveNum:check_game.moveNum,
                });
                gameObject.save((err, data)=>{
                  if (err) return res.status(400).send(err);
                });

                //delete from array of currently playing games
                // i--;
                // currentGames.splice(index,1);
                currentGames.delete(index);

             }).catch((err)=>{
                console.log(err);
             });
         }).catch((err)=>{
            console.log(err);
         });
      }
    }

  });

  // socket.on('timer',(msg)=>{
  //   let index=player1.indexOf(msg.user);
  //   if(index>=0){
  //     player1Timer[index]=msg.newTime;
  //     // console.log(msg.newTime);
  //     return;
  //   }
  //   index=player2.indexOf(msg.user);
  //   if(index>=0){
  //     player2Timer[index]=msg.newTime;
  //     return;
  //   }
  // });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

//start server listening
http.listen(app.get('port'),()=> console.log("Running..... at port ",app.get('port')));
