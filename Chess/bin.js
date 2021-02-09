let player1=[];
let i=0;
let player2=[];
let moves=[];
let whitePlayer=[];
let player1LeftTime=[];
let player2LeftTime=[];
let matchStartTime=[];
let whiteCurrentTime=[];
let blackCurrentTime=[];
let canplayer1SC=[];
let canplayer2SC=[];
let canplayer1LC=[];
let canplayer2LC=[];
let player1LastMove=[];
let player2LastMove=[];
let winner=[];
let moveNum=[];
let myVar;

function MakeTimerforWhite(start,target_diff,room) {
  target_diff= target_diff*1000;
  myVar = setInterval(myTimer, 1000);
  // var start = Date.now();
   async function myTimer(){
    let newt = Date.now();
    let current_diff= newt - start;

    let time=Math.floor((target_diff - current_diff)/1000);
    let min=Math.floor( time / 60);
    let sec=Math.floor( time % 60);

    whiteCurrentTime[room]=time;

    if(whitePlayer[room] == player1[room]){
      player1LeftTime[room]=time;
    }
    else{
      player2LeftTime[room]=time;
    }

    io.to(room).emit('timer', {'color':'White','min':min,'sec':sec});

    if(time==0) {   //White Lost
      await Player.findById(ObjectId(whitePlayer[room]==player1[room] ? player2[room].substring(3,27) : player1[room].substring(3,27))).then(async (doc)=>{
          // console.log(doc);
          let winnerName=doc.name;
          await Player.findById(ObjectId(whitePlayer[room].substring(3,27))).then((doc)=>{
              // console.log(doc);
              let loserName=doc.name;
              io.to(room).emit('GameEnd',{"WinID":whitePlayer[room]==player1[room] ? player2[room] : player1[room],"Win":winnerName,"LoseID":whitePlayer[room],"Lose":loserName});

              winner[room]=whitePlayer[room]==player1[room] ? player2[room] : player1[room];

              //store in Database
              const gameObject=new Game({
                player1:player1[room],
                player2:player2[room],
                moves:moves[room],
                whitePlayer:whitePlayer[room],
                player1LeftTime:player1LeftTime[room],
                player2LeftTime:player2LeftTime[room],
                matchStartTime:matchStartTime[room],
                whiteCurrentTime:whiteCurrentTime[room],
                blackCurrentTime:blackCurrentTime[room],
                winner:winner[room],
                moveNum:moveNum[room],
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              i--;
              player1.splice(room, 1);
              player2.splice(room, 1);
              moves.splice(room, 1);
              whitePlayer.splice(room, 1);
              player1LeftTime.splice(room, 1);
              player2LeftTime.splice(room, 1);
              matchStartTime.splice(room, 1);
              whiteCurrentTime.splice(room, 1);
              blackCurrentTime.splice(room, 1);
              winner.splice(room, 1);
              moveNum.splice(room, 1);
              canplayer1SC.splice(room, 1);
              canplayer2SC.splice(room, 1);
              canplayer1LC.splice(room, 1);
              canplayer2LC.splice(room, 1);
              player1LastMove.splice(room, 1);
              player2LastMove.splice(room, 1);

            }).catch((err)=>{
                 console.log(err);
              });
          }).catch((err)=>{
             console.log(err);
          });
      clearInterval(myVar);
      return;
    }
  }
}

function MakeTimerforBlack(start,target_diff,room) {
  target_diff= target_diff*1000;
  myVar = setInterval(myTimer, 1000);
  // var start = Date.now();
   async function myTimer() {
    let newt = Date.now();
    let current_diff= newt - start;

    let time=Math.floor((target_diff - current_diff)/1000);
    let min=Math.floor( time / 60);
    let sec=Math.floor( time % 60);

    blackCurrentTime[room]=time;

      if(whitePlayer[room] == player1[room]){
        player2LeftTime[room]=time;
      }
      else{
        player1LeftTime[room]=time;
      }

    io.to(room).emit('timer', {'color':'Black','min':min,'sec':sec});

    if(time==0) {//Black Lost
      await Player.findById(ObjectId(whitePlayer[room].substring(3,27))).then(async (doc)=>{
          // console.log(doc);
          let winnerName=doc.name;
          await Player.findById(ObjectId(whitePlayer[room]==player1[room] ? player2[room].substring(3,27) : player1[room].substring(3,27))).then((doc)=>{
              // console.log(doc);
              let loserName=doc.name;
              io.to(room).emit('GameEnd',{"WinID":whitePlayer[room],"Win":winnerName,"LoseID":whitePlayer[room]==player1[room] ? player2[room] : player1[room],"Lose":loserName});

              winner[room]=whitePlayer[room];

              //store in Database
              const gameObject=new Game({
                player1:player1[room],
                player2:player2[room],
                moves:moves[room],
                whitePlayer:whitePlayer[room],
                player1LeftTime:player1LeftTime[room],
                player2LeftTime:player2LeftTime[room],
                matchStartTime:matchStartTime[room],
                whiteCurrentTime:whiteCurrentTime[room],
                blackCurrentTime:blackCurrentTime[room],
                winner:winner[room],
                moveNum:moveNum[room],
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              i--;
              player1.splice(room, 1);
              player2.splice(room, 1);
              moves.splice(room, 1);
              whitePlayer.splice(room, 1);
              player1LeftTime.splice(room, 1);
              player2LeftTime.splice(room, 1);
              matchStartTime.splice(room, 1);
              whiteCurrentTime.splice(room, 1);
              blackCurrentTime.splice(room, 1);
              winner.splice(room, 1);
              moveNum.splice(room, 1);
              canplayer1SC.splice(room, 1);
              canplayer2SC.splice(room, 1);
              canplayer1LC.splice(room, 1);
              canplayer2LC.splice(room, 1);
              player1LastMove.splice(room, 1);
              player2LastMove.splice(room, 1);

            }).catch((err)=>{
                 console.log(err);
              });
          }).catch((err)=>{
             console.log(err);
          });

      clearInterval(myVar);
      return;
    }
  }
}

io.on('connection', (socket) => {
  // console.log(`${socket.id} user connected`);
  socket.on('start game', (msg) => {
    // console.log(msg);
    let index=player1.indexOf(msg);
    let index2=player2.indexOf(msg);
    if((index>=0 && i!=index && winner[index]=="") ){
      socket.join(index);
      // console.log(10-Math.floor((player1Timer[index]-matchStartTime[index])/(60*1000)));
      let sendTime,forColor;
      sendTime = moveNum[index]%2==0 ? blackCurrentTime[index] : whiteCurrentTime[index];
      forColor = moveNum[index]%2==0 ? "Black" : "White";

      socket.emit('arrange',{'moves':moves[index],'forColor':forColor,'otherTime':sendTime});
      io.to(index).emit('canCastle',{"toboth":false,"for":player1[index],"SC":canplayer1SC[index],"LC":canplayer1LC[index]});
      socket.to(index).emit('LastMoveOfOpponent',{"for":player1[index],"LastMove":player2LastMove[index]});
    }
    else if (index2>=0 && winner[index2]=="") {
      socket.join(index2);

      let sendTime,forColor;
      sendTime = moveNum[index2]%2==0 ? blackCurrentTime[index2] : whiteCurrentTime[index2];
      forColor = moveNum[index2]%2==0 ? "Black" : "White";

      socket.emit('arrange',{'moves':moves[index2],'forColor':forColor,'otherTime':sendTime});
      io.to(index2).emit('canCastle',{"toboth":false,"for":player2[index2],"SC":canplayer2SC[index2],"LC":canplayer2LC[index2]});
      socket.to(index2).emit('LastMoveOfOpponent',{"for":player2[index2],"LastMove":player1LastMove[index2]});
    }
    else{
      if(!player1[i]){
        player1[i]=msg;
        socket.join(i);
      }
      else if(player1[i]!=msg){
        player2[i]=msg;
        socket.join(i);
        moves[i]="";
        moveNum[i]=0;
        whitePlayer[i]=Math.random()==1?player1[i]:player2[i];
        matchStartTime[i]=Date.now();

        MakeTimerforWhite(matchStartTime[i],10*60,i);

        player1LeftTime[i]=10*60;
        player2LeftTime[i]=10*60;

        whiteCurrentTime[i]=10*60;
        blackCurrentTime[i]=10*60;

        canplayer1SC[i]=true;
        canplayer2SC[i]=true;
        canplayer1LC[i]=true;
        canplayer2LC[i]=true;

        player1LastMove[i]="";
        player2LastMove[i]="";

        winner[i]="";
        console.log(player1[i].substring(3,27));

        io.to(i).emit('started', {'White':whitePlayer[i],'Black':whitePlayer[i]==player1[i] ? player2[i] : player1[i]});
        io.to(index).emit('canCastle',{"toboth":true,"p1":player1[i],"p2":player2[i],"p1SC":canplayer1SC[i],"p1LC":canplayer1LC[i],"p2SC":canplayer2SC[i],"p2LC":canplayer2LC[i]});

        i++;
        // console.log(player1[i-1],player2[i-1]);
      }
    }

    console.log(player2);
  });

  socket.on('move piece', (msg) =>{
    clearInterval(myVar);
    // console.log(msg);
    let index=player1.indexOf(msg.user);
    if(index>=0){
      //for setting can it castle or not
      if(['♔','♚'].indexOf(msg.piece)>=0){
        canplayer1SC[index]=false;
        canplayer1LC[index]=false;
      }
      else if (['♖','♜'].indexOf(msg.piece)>=0) {   //if piece moved
        if(whitePlayer[index]==player1[index]){
          if(msg.from=="A1"){   //cannot Long castle
            canplayer1LC[index]=false;
          }
          else if (msg.from=="H1") {  //cannot short castle
            canplayer1SC[index]=false;
          }
        }
        else{
          if(msg.from=="H1"){   //cannot Long castle
            canplayer1LC[index]=false;
          }
          else if (msg.from=="A1") {  //cannot short castle
            canplayer1SC[index]=false;
          }
        }
      }
      else{     //if piece captured is moved already then castle is already false
        if(whitePlayer[index]==player1[index]){
          if(msg.to=="A1"){   //cannot Long castle
            canplayer1LC[index]=false;
          }
          else if (msg.to=="H1") {  //cannot short castle
            canplayer1SC[index]=false;
          }
        }
        else{
          if(msg.to=="H1"){   //cannot Long castle
            canplayer1LC[index]=false;
          }
          else if (msg.to=="A1") {  //cannot short castle
            canplayer1SC[index]=false;
          }
        }
      }

      io.to(index).emit('canCastle',{"toboth":false,"for":player1[index],"SC":canplayer1SC[index],"LC":canplayer1LC[index]});

      if(msg.from.length==1 && msg.to.length==1){   //pawn promotion
        player1LastMove[index]="PP:"+msg.piece+":"+msg.from+"7:"+msg.to+"8";    //PP:queen:H7:G8
        socket.to(index).emit('LastMoveOfOpponent',{"for":player2[index],"LastMove":player1LastMove[index]});
        socket.to(index).emit('moving',{"user":player2[index],'from':msg.from+"7",'to':msg.to+"8",'PP':msg.piece,'castle':false,'enPrsnt':false});
      }
      else if (msg.castle) {
        player1LastMove[index]="castle:"+msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player2[index],"LastMove":player1LastMove[index]});
        socket.to(index).emit('moving',{"user":player2[index],'from':msg.from,'to':msg.to,'PP':"",'castle':true,'enPrsnt':false});
      }
      else if (msg.enPrsnt) {
        player1LastMove[index]="EP:"+msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player2[index],"LastMove":player1LastMove[index]});
        socket.to(index).emit('moving',{"user":player2[index],'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':true});
      }
      else{
        player1LastMove[index]=msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player2[index],"LastMove":player1LastMove[index]});
        socket.to(index).emit('moving',{"user":player2[index],'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':false});
      }

      moves[index]+=player1LastMove[index]+",";

      let whiteLeftTime,blackLeftTime;
      if(whitePlayer[index]==player1[index]){
        whiteLeftTime=player1LeftTime[index];
        blackLeftTime=player2LeftTime[index];
      }
      else{
        whiteLeftTime=player2LeftTime[index];
        blackLeftTime=player1LeftTime[index];
      }
      moveNum[index]++;
      if(moveNum[index]%2==0){
        MakeTimerforWhite(Date.now(),whiteLeftTime,index);
      }
      else{
        MakeTimerforBlack(Date.now(),blackLeftTime,index);
      }
      return;
    }
    index=player2.indexOf(msg.user);
    if(index>=0){
      //for setting can it castle or not
      if(['♔','♚'].indexOf(msg.piece)>=0){
        canplayer2SC[index]=false;
        canplayer2LC[index]=false;
      }
      else if (['♖','♜'].indexOf(msg.piece)>=0) {
        if(whitePlayer[index]==player2[index]){
          if(msg.from=="A1"){   //cannot Long castle
            canplayer2LC[index]=false;
          }
          else if (msg.from=="H1") {  //cannot short castle
            canplayer2SC[index]=false;
          }
        }
        else{
          if(msg.from=="H1"){   //cannot Long castle
            canplayer2LC[index]=false;
          }
          else if (msg.from=="A1") {  //cannot short castle
            canplayer2SC[index]=false;
          }
        }
      }
      else{     //if piece captured is moved already then castle is already false
        if(whitePlayer[index]==player2[index]){
          if(msg.to=="A1"){   //cannot Long castle
            canplayer2LC[index]=false;
          }
          else if (msg.to=="H1") {  //cannot short castle
            canplayer2SC[index]=false;
          }
        }
        else{
          if(msg.to=="H1"){   //cannot Long castle
            canplayer2LC[index]=false;
          }
          else if (msg.to=="A1") {  //cannot short castle
            canplayer2SC[index]=false;
          }
        }
      }

      io.to(index).emit('canCastle',{"toboth":false,"for":player2[index],"SC":canplayer2SC[index],"LC":canplayer2LC[index]});

      if(msg.from.length==1 && msg.to.length==1){   //pawn promotion
        player2LastMove[index]="PP:"+msg.piece+":"+msg.from+"7:"+msg.to+"8";    //PP:queen:H7:G8
        socket.to(index).emit('LastMoveOfOpponent',{"for":player1[index],"LastMove":player2LastMove[index]});
        socket.to(index).emit('moving',{"user":player1[index],'from':msg.from+"7",'to':msg.to+"8",'PP':msg.piece,'castle':false,'enPrsnt':false});
      }
      else if (msg.castle) {
        player2LastMove[index]="castle:"+msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player1[index],"LastMove":player2LastMove[index]});
        socket.to(index).emit('moving',{"user":player1[index],'from':msg.from,'to':msg.to,'PP':"",'castle':true,'enPrsnt':false});
      }
      else if (msg.enPrsnt) {
        player2LastMove[index]="EP:"+msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player1[index],"LastMove":player2LastMove[index]});
        socket.to(index).emit('moving',{"user":player1[index],'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':true});
      }
      else{
        player2LastMove[index]=msg.from+":"+msg.to;
        socket.to(index).emit('LastMoveOfOpponent',{"for":player1[index],"LastMove":player2LastMove[index]});
        socket.to(index).emit('moving',{"user":player1[index],'from':msg.from,'to':msg.to,'PP':"",'castle':false,'enPrsnt':false});
      }

      moves[index]+=player2LastMove[index]+",";

      let whiteLeftTime,blackLeftTime;
      if(whitePlayer[index]==player1[index]){
        whiteLeftTime=player1LeftTime[index];
        blackLeftTime=player2LeftTime[index];
      }
      else{
        whiteLeftTime=player2LeftTime[index];
        blackLeftTime=player1LeftTime[index];
      }
      moveNum[index]++;
      if(moveNum[index]%2==0){
        MakeTimerforWhite(Date.now(),whiteLeftTime,index);
      }
      else{
        MakeTimerforBlack(Date.now(),blackLeftTime,index);
      }
      return;
    }
  });

  socket.on('checkmate',async (msg)=>{
    clearInterval(myVar);
    let index=player1.indexOf(msg.Lose);
    if(index>=0){
      await Player.findById(ObjectId(player2[index].substring(3,27))).then(async (doc)=>{
          console.log(doc);
          let winnerName=doc.name;
          await Player.findById(ObjectId(player1[index].substring(3,27))).then((doc)=>{
              console.log(doc);
              let loserName=doc.name;

              io.to(index).emit('GameEnd',{"WinID":player2[index],"Win":winnerName,"LoseID":player1[index],"Lose":loserName});
              winner[index]=player2[index];
              //store in Database
              const gameObject=new Game({
                player1:player1[index],
                player2:player2[index],
                moves:moves[index],
                whitePlayer:whitePlayer[index],
                player1LeftTime:player1LeftTime[index],
                player2LeftTime:player2LeftTime[index],
                matchStartTime:matchStartTime[index],
                whiteCurrentTime:whiteCurrentTime[index],
                blackCurrentTime:blackCurrentTime[index],
                winner:winner[index],
                moveNum:moveNum[index],
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              i--;
              player1.splice(index, 1);
              player2.splice(index, 1);
              moves.splice(index, 1);
              whitePlayer.splice(index, 1);
              player1LeftTime.splice(index, 1);
              player2LeftTime.splice(index, 1);
              matchStartTime.splice(index, 1);
              whiteCurrentTime.splice(index, 1);
              blackCurrentTime.splice(index, 1);
              winner.splice(index, 1);
              moveNum.splice(index, 1);
              canplayer1SC.splice(index, 1);
              canplayer2SC.splice(index, 1);
              canplayer1LC.splice(index, 1);
              canplayer2LC.splice(index, 1);
              player1LastMove.splice(index, 1);
              player2LastMove.splice(index, 1);

           }).catch((err)=>{
              console.log(err);
           });
       }).catch((err)=>{
          console.log(err);
       });
      return;
    }
    index=player2.indexOf(msg.Lose);
    if(index>=0){
      await Player.findById(ObjectId(player1[index].substring(3,27))).then(async (doc)=>{
          console.log(doc);
          let winnerName=doc.name;

          await Player.findById(ObjectId(player2[index].substring(3,27))).then((doc)=>{
              console.log(doc);
              let loserName=doc.name;

              io.to(index).emit('GameEnd',{"WinID":player1[index],"Win":winnerName,"LoseID":player2[index],"Lose":loserName});
              winner[index]=player1[index];

              //store in Database
              const gameObject=new Game({
                player1:player1[index],
                player2:player2[index],
                moves:moves[index],
                whitePlayer:whitePlayer[index],
                player1LeftTime:player1LeftTime[index],
                player2LeftTime:player2LeftTime[index],
                matchStartTime:matchStartTime[index],
                whiteCurrentTime:whiteCurrentTime[index],
                blackCurrentTime:blackCurrentTime[index],
                winner:winner[index],
                moveNum:moveNum[index],
              });
              gameObject.save((err, data)=>{
                if (err) return res.status(400).send(err);
              });

              //delete from array of currently playing games
              i--;
              player1.splice(index, 1);
              player2.splice(index, 1);
              moves.splice(index, 1);
              whitePlayer.splice(index, 1);
              player1LeftTime.splice(index, 1);
              player2LeftTime.splice(index, 1);
              matchStartTime.splice(index, 1);
              whiteCurrentTime.splice(index, 1);
              blackCurrentTime.splice(index, 1);
              winner.splice(index, 1);
              moveNum.splice(index, 1);
              canplayer1SC.splice(index, 1);
              canplayer2SC.splice(index, 1);
              canplayer1LC.splice(index, 1);
              canplayer2LC.splice(index, 1);
              player1LastMove.splice(index, 1);
              player2LastMove.splice(index, 1);

           }).catch((err)=>{
              console.log(err);
           });
       }).catch((err)=>{
          console.log(err);
       });

      return;
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
