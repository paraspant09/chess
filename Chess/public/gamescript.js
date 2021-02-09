let socket = io();
let color;
var PPfrom="";
var PPto="";
var canSC;
var canLC;
var lastMoveOfOpponent;
var boardConfig=new Array(8);

// var myVar;
function BoardConfigAsArray() {
  boardConfig=new Array(8);
  for (let i = 0; i < boardConfig.length; i++) { 
      boardConfig[i] = []; 
  }
  
  for (let i=8; i > 0 ; i--) {
      for (let j=0; j < 8 ; j++) {
          let id=String.fromCharCode(j+65)+i;
          let piece=document.getElementById(id).innerHTML;
          if(piece!=""){
              boardConfig[8-i][j]=piece;
          }
          else
              boardConfig[8-i][j]="_";
      }
  }
  console.log(boardConfig);
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

socket.on('connect', () => {
  console.log(socket.id); // an alphanumeric id...
  socket.emit('start game', getCookie('UserID'));
});

socket.on('started',(msg) => {
  // console.log(msg);
  if(msg.White==getCookie('UserID'))
    color='White';
  else if(msg.Black==getCookie('UserID'))
    color='Black';
  else
    return;

  document.getElementById("LoadingGif").style.display="none";

  MakePieces(color);
  BoardConfigAsArray();
  // MakeTimer(msg.time,msg.totalTime);
});

socket.on('arrange',(msg)=>{
  document.getElementById("LoadingGif").style.display="none";
  // clearInterval(myVar);
  MakePieces(getCookie('User'));
  // console.log(moves);
  let result = msg.moves.split(",");
  if(getCookie('User')=="White"){
    result.forEach((item, i) => {
      if(item!=""){
        let move = item.split(":");
        if(move[0]=="PP"){
          if(i%2==0){
            MakeBoardChanges(move[2],move[3],"",move[1]);
          }
          else {
            MakeBoardChanges(String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2)))
            ,String.fromCharCode((8-(move[3].charCodeAt(0)-65))+64)+(9-parseInt(move[3].substring(1,2))),"",move[1]);
          }
        }
        else if (move[0]=="EP") {
          let to;
          if(i%2==0){
            MakeBoardChanges(move[1],move[2]);
            to=move[2];
            let removePieceID=to.substring(0,1)+(parseInt(to.substring(1,2))-1).toString();
            document.getElementById(removePieceID).innerHTML="";
          }
          else {
            MakeBoardChanges(String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2)))
            ,String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2))));

            to=String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2)));
            let removePieceID=to.substring(0,1)+(parseInt(to.substring(1,2))+1).toString();
            document.getElementById(removePieceID).innerHTML="";
          }

        }
        else if (move[0]=="castle") {
          if(i%2==0){
            MakeBoardChanges(move[1],move[2]);

            if(move[1]=="E1"){
              if(move[2]=="G1"){
                MakeBoardChanges("H1","F1");
              }
              else if(move[2]=="C1"){
                MakeBoardChanges("A1","D1");
              }
            }
            if(move[1]=="D1"){
              if(move[2]=="F1"){
                MakeBoardChanges("H1","E1");
              }
              else if(move[2]=="B1"){
                MakeBoardChanges("A1","C1");
              }
            }
          }
          else {
            MakeBoardChanges(String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2)))
            ,String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2))));

            if(move[1]=="E1"){
              if(move[2]=="G1"){
                MakeBoardChanges("A8","C8");
              }
              else if(move[2]=="C1"){
                MakeBoardChanges("H8","E8");
              }
            }
            if(move[1]=="D1"){
              if(move[2]=="F1"){
                MakeBoardChanges("A8","D8");
              }
              else if(move[2]=="B1"){
                MakeBoardChanges("H8","F8");
              }
            }
          }
        }
        else {
          if(i%2==0){
            MakeBoardChanges(move[0],move[1]);
          }
          else {
            MakeBoardChanges(String.fromCharCode((8-(move[0].charCodeAt(0)-65))+64)+(9-parseInt(move[0].substring(1,2)))
            ,String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2))));
          }
        }
      }
    });
  }
  else if(getCookie('User')=="Black"){
    result.forEach((item, i) => {
      if(item!=""){
        let move = item.split(":");
        if(move[0]=="PP"){
          if(i%2==0){
            MakeBoardChanges(String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2)))
            ,String.fromCharCode((8-(move[3].charCodeAt(0)-65))+64)+(9-parseInt(move[3].substring(1,2))),"",move[1]);
          }
          else {
            MakeBoardChanges(move[2],move[3],"",move[1]);
          }
        }
        else if (move[0]=="EP") {
          let to;
          if(i%2==0){
            MakeBoardChanges(String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2)))
            ,String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2))));

            to=String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2)));
            let removePieceID=to.substring(0,1)+(parseInt(to.substring(1,2))+1).toString();
            document.getElementById(removePieceID).innerHTML="";
          }
          else {
            MakeBoardChanges(move[1],move[2]);

            to=move[2];
            let removePieceID=to.substring(0,1)+(parseInt(to.substring(1,2))-1).toString();
            document.getElementById(removePieceID).innerHTML="";
          }

        }
        else if (move[0]=="castle") {
          if(i%2==0){
            MakeBoardChanges(String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2)))
            ,String.fromCharCode((8-(move[2].charCodeAt(0)-65))+64)+(9-parseInt(move[2].substring(1,2))));

            if(move[1]=="E1"){
              if(move[2]=="G1"){
                MakeBoardChanges("A8","C8");
              }
              else if(move[2]=="C1"){
                MakeBoardChanges("H8","E8");
              }
            }
            if(move[1]=="D1"){
              if(move[2]=="F1"){
                MakeBoardChanges("A8","D8");
              }
              else if(move[2]=="B1"){
                MakeBoardChanges("H8","F8");
              }
            }
          }
          else {
            MakeBoardChanges(move[1],move[2]);

            if(move[1]=="E1"){
              if(move[2]=="G1"){
                MakeBoardChanges("H1","F1");
              }
              else if(move[2]=="C1"){
                MakeBoardChanges("A1","D1");
              }
            }
            if(move[1]=="D1"){
              if(move[2]=="F1"){
                MakeBoardChanges("H1","E1");
              }
              else if(move[2]=="B1"){
                MakeBoardChanges("A1","C1");
              }
            }
          }
        }
        else {
          if(i%2==0){
            MakeBoardChanges(String.fromCharCode((8-(move[0].charCodeAt(0)-65))+64)+(9-parseInt(move[0].substring(1,2)))
            ,String.fromCharCode((8-(move[1].charCodeAt(0)-65))+64)+(9-parseInt(move[1].substring(1,2))));
          }
          else {
            MakeBoardChanges(move[0],move[1]);
          }
        }
      }
    });
  }

  BoardConfigAsArray();
  //Arrange Timer
  // let duration=performance.timing.responseEnd - performance.timing.navigationStart;
  // duration=Math.floor(duration/1000);
  // console.log(duration);
  // let extraMin=Math.floor(duration/60);
  // let extraSec=Math.floor(duration%60);
  // let time=msg.time.split(":");
  // MakeTimer(msg.newTime,msg.totalTime);
  let min=Math.floor(msg.otherTime/60);
  let sec=Math.floor(msg.otherTime%60);
  let minute=min<10?`0${min}`:min;
  let second=sec<10?`0${sec}`:sec;

  if(msg.forColor == getCookie('User')){
    document.getElementById("Timer").innerHTML = minute+":"+second;
  }
  else{
    document.getElementById("OppositionTimer").innerHTML = minute+":"+second;
  }
});

socket.on('timer',(msg)=>{
  let min=msg.min,sec=msg.sec;
  let minute=min<10?`0${min}`:min;
  let second=sec<10?`0${sec}`:sec;

  if(msg.color == getCookie('User')){
    document.getElementById("Timer").innerHTML = minute+":"+second;
    if(PPfrom=="")
      cantEnter=false;
    document.getElementById("Timer").setAttribute("class", "resume");
    document.getElementById("OppositionTimer").setAttribute("class", "pause");
  }
  else{
    document.getElementById("OppositionTimer").innerHTML = minute+":"+second;
    cantEnter=true;
    document.getElementById("Timer").setAttribute("class", "pause");
    document.getElementById("OppositionTimer").setAttribute("class", "resume");
  }
});

socket.on('moving',(msg)=>{
  if(msg.user==getCookie('UserID'))
  {
    // console.log(msg);
    let from=String.fromCharCode((8-(msg.from.charCodeAt(0)-65))+64)+(9-parseInt(msg.from.substring(1,2)));
    let to=String.fromCharCode((8-(msg.to.charCodeAt(0)-65))+64)+(9-parseInt(msg.to.substring(1,2)));
    if(msg.PP=="" && !msg.castle && !msg.enPrsnt){
      MakeBoardChanges(from,to);
    }
    else if (msg.enPrsnt) {
      MakeBoardChanges(from,to);

      let removePieceID=to.substring(0,1)+(parseInt(to.substring(1,2))+1).toString();
      console.log(removePieceID);
      document.getElementById(removePieceID).innerHTML="";
    }
    else if (msg.castle) {
      MakeBoardChanges(from,to);

      if(msg.from=="E1"){
        if(msg.to=="G1"){
          MakeBoardChanges("A8","C8");
        }
        else if(msg.to=="C1"){
          MakeBoardChanges("H8","E8");
        }
      }
      if(msg.from=="D1"){
        if(msg.to=="F1"){
          MakeBoardChanges("A8","D8");
        }
        else if(msg.to=="B1"){
          MakeBoardChanges("H8","F8");
        }
      }
    }
    else {
      MakeBoardChanges(from,to,"",msg.PP);
    }

    BoardConfigAsArray();
    
    if(CheckForCheck(getCookie("User"))){
      if(CheckForMate(getCookie("User"))){
        socket.emit('checkmate',{"Lose":msg.user});
        // document.getElementById("result").innerHTML=`<h1>YOU LOST</h1> <h1>Winner:${msg.Win} </h1><h1>Loser:${msg.Lose}</h1> `;
        // document.getElementById("result").setAttribute("class","showResult");
      }
    }
  }
});

socket.on('canCastle',(msg)=>{
  // console.log(msg);
  if(msg.toboth){
    if(msg.p1==getCookie("UserID")){
      canSC=msg.p1SC;
      canLC=msg.p1LC;
    }
    else if(msg.p2==getCookie("UserID")){
      canSC=msg.p2SC;
      canLC=msg.p2LC;
    }
  }
  else{
    if(msg.for==getCookie("UserID")){
      canSC=msg.SC;
      canLC=msg.LC;
      // console.log(canSC);
      // console.log(canLC);
    }
    // console.log(msg.for);
    // console.log(getCookie("UserID"));
  }
});

socket.on('LastMoveOfOpponent',(msg)=>{
  if(msg.for==getCookie("UserID")){
    console.log(msg.LastMove);
    let seeMove=msg.LastMove.split(":"),ind=0;
    if(seeMove[0]=="EP" || seeMove[0]=="castle") ind=1;
    else if (seeMove[0]=="PP") ind=2;

    lastMoveOfOpponent=String.fromCharCode((8-(seeMove[ind].charCodeAt(0)-65))+64)+(9-parseInt(seeMove[ind].substring(1,2)))+":"+String.fromCharCode((8-(seeMove[ind+1].charCodeAt(0)-65))+64)+(9-parseInt(seeMove[ind+1].substring(1,2)));
    console.log(lastMoveOfOpponent);
  }
});

socket.on('GameEnd',(msg)=>{
  if(msg.WinID == getCookie("UserID")){
    document.getElementById("result").innerHTML=`<h1>YOU WON</h1> <h1>Winner:${msg.Win} </h1><h1>Loser:${msg.Lose}</h1> <button type="button" onclick="HideResult()" name="button">CLOSE</button>`;
    console.log("Winner");
  }
  else if(msg.LoseID == getCookie("UserID")){
    document.getElementById("result").innerHTML=`<h1>YOU LOST</h1> <h1>Winner:${msg.Win} </h1><h1>Loser:${msg.Lose}</h1> <button type="button" onclick="HideResult()" name="button">CLOSE</button>`;
    console.log("Loser");
  }
  document.getElementById("result").setAttribute("class","showResult");
});

function HideResult() {
  document.getElementById("result").setAttribute("class","hideResult");
  location.href = "/startpoint";
}

function SendMovePiece(a,b,piece="",castle=false,enPrsnt=false){
  if(a.length==1 && b.length==1){   //pawn promotion
    socket.emit('move piece', {"user":getCookie('UserID'),'from':a,'to':b,'piece':piece,'castle':false,'enPrsnt':false});
    document.getElementById("OptionsOfpawnPromotion").style.display="none";
    cantEnter=false;
  }
  else if (castle) {    //for castling
    socket.emit('move piece', {"user":getCookie('UserID'),'from':a,'to':b,'piece':piece,'castle':true,'enPrsnt':false});
  }
  else if (enPrsnt) {    //for en parsant
    socket.emit('move piece', {"user":getCookie('UserID'),'from':a,'to':b,'piece':piece,'castle':false,'enPrsnt':true});
  }
  else{
    socket.emit('move piece', {"user":getCookie('UserID'),'from':a,'to':b,'piece':piece,'castle':false,'enPrsnt':false});
  }
  cantEnter=true;
  BoardConfigAsArray();
}

function PawnPromotionSendData(pieceNo) {
  SendMovePiece(PPfrom,PPto,document.getElementById("OptionsOfpawnPromotion").children[pieceNo].innerHTML);// PP(Pawn Promotion) from Column name:to Column name
  document.getElementById(PPto+"8").innerHTML=document.getElementById("OptionsOfpawnPromotion").children[pieceNo].innerHTML;
  document.getElementById("OptionsOfpawnPromotion").style.display="none";
  PPfrom="";
  PPto="";
}

function MakePieces(color){
  let place,secondplace;
  if(color === "White")
  {
    place=0;
    secondplace=6;
    document.cookie='User=White';
  }
  else if(color === "Black"){
    place=6;
    secondplace=0;
    document.cookie='User=Black';
  }

  let squares=document.getElementById('Board').children;
  var pieces=['♜','♞','♝','♚','♛','♟'  ,  '♖','♘','♗','♔','♕','♙'];
  for (let i = 0; i < squares.length; i++) {
    if(i==0 || i==7)
      squares[i].innerHTML=pieces[place];
    else if (i==1 || i==6) {
      squares[i].innerHTML=pieces[place+1];
    }
    else if (i==2 || i==5) {
      squares[i].innerHTML=pieces[place+2];
    }
    else if(i>=8 && i<=15){
      squares[i].innerHTML=pieces[place+5];
    }
    else if(i==56 || i==63){
      squares[i].innerHTML=pieces[secondplace];
    }
    else if (i==57 || i==62) {
      squares[i].innerHTML=pieces[secondplace+1];
    }
    else if (i==58 || i==61) {
      squares[i].innerHTML=pieces[secondplace+2];
    }
    else if(i>=48 && i<=55){
      squares[i].innerHTML=pieces[secondplace+5];
    }
  }

  if(color === "White")
  {
    document.getElementById('E8').innerHTML=pieces[3];
    document.getElementById('D8').innerHTML=pieces[4];
    document.getElementById('E1').innerHTML=pieces[9];
    document.getElementById('D1').innerHTML=pieces[10];
  }
  else if(color === "Black"){
    document.getElementById('E8').innerHTML=pieces[10];
    document.getElementById('D8').innerHTML=pieces[9];
    document.getElementById('E1').innerHTML=pieces[4];
    document.getElementById('D1').innerHTML=pieces[3];
  }

}

// function MakeTimer(start,target_diff) {
//   // let myVar = setInterval(myTimer, 1000);
//   // let minute=min<10?`0${min}`:min;
//   // let second=sec<10?`0${sec}`:sec;
//   // document.getElementById("Timer").innerHTML = minute+":"+second;
//   // function myTimer() {
//   //   socket.emit('timer', {"user":getCookie('UserID'),'min':min,'sec':sec});
//   //   if(min==0 && sec==0){
//   //   	clearInterval(myVar);
//   //     return;
//   //   }
//   //   if(sec == 0) min=(min-1)%10;
//   //   sec--;
//   //   if(sec<0) sec=59;
//   //   minute=min<10?`0${min}`:min;
//   //   second=sec<10?`0${sec}`:sec;
//   //   document.getElementById("Timer").innerHTML = minute +":"+second;
//   // }
//   target_diff= target_diff*60*1000;
//   myVar = setInterval(myTimer, 1000);
//   // var start = Date.now();
//   function myTimer() {
//     let newt = Date.now();
//     let current_diff= newt - start;
//
//     socket.emit('timer', {"user":getCookie('UserID'),'newTime':current_diff});
//
//     if((target_diff - current_diff)==0) clearInterval(myVar);
//
//     let min=Math.floor(Math.floor((target_diff - current_diff)/1000) / 60);
//     let sec=Math.floor((target_diff - current_diff)/1000) % 60;
//
//     let minute=min<10?`0${min}`:min;
//     let second=sec<10?`0${sec}`:sec;
//     document.getElementById("Timer").innerHTML = minute+":"+second;
//   }
// }
