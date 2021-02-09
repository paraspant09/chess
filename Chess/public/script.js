var selected=false;
var selectedID="";
var selectedBackClr="";
var selectedPiece="";
var moveRestricted=false;
var cantEnter=false;

var select=document.getElementById("Board").children;
for (let i = 0; i < select.length; i++) {
 select[i].addEventListener("click",MovePiece);
};

function MakeBoardChanges(a,b,inPlace="",promotedTo=""){
  if(a!="" && b!=""){
    // console.log(a);
    if(promotedTo==""){
      document.getElementById(b).innerHTML=document.getElementById(a).innerHTML;
      document.getElementById(a).innerHTML=inPlace;
    }
    else {
      document.getElementById(b).innerHTML=promotedTo;
      document.getElementById(a).innerHTML=inPlace;
    }
  }
}

// PawnPromotion();

function PawnPromotion() {
  let whiteOptions=['♕','♖','♗','♘'];
  let blackOptions=['♛','♜','♝','♞'];
  if(getCookie("User")=="White"){
    whiteOptions.forEach((item, i) => {
      document.getElementById("OptionsOfpawnPromotion").children[i].innerHTML=item;
    });
  }
  else if (getCookie("User")=="Black") {
    blackOptions.forEach((item, i) => {
      document.getElementById("OptionsOfpawnPromotion").children[i].innerHTML=item;
    });
  }
}

function MovePiece(){
  if(!cantEnter){
    let value=this.innerHTML;
    let id=this.getAttribute("id");

    Restrictions(value,id);

    if(!moveRestricted){
      if(selected)
        document.getElementById(selectedID).style.backgroundColor=selectedBackClr;

      if(this.innerHTML!=""){
        selected=true;
        selectedID=this.getAttribute("id");
        selectedBackClr=this.style.backgroundColor;
        selectedPiece=this.innerHTML;

        this.style.backgroundColor="green";
      }
      else if(selected){
        this.innerHTML=selectedPiece;
        document.getElementById(selectedID).innerHTML="";
        selected=false;
        BoardConfigAsArray();
        console.table(boardConfig);
        if(CheckForCheck(getCookie("User")))
        {
          this.innerHTML="";
          document.getElementById(selectedID).innerHTML=selectedPiece;
        }
        else
        {
          // console.log(selectedPiece,selectedID.substr(1,1));
          if(['♙','♟'].indexOf(selectedPiece)>=0 && selectedID.substr(1,1)=="7"){
            //check length on other side for checking pawn promotion
            document.getElementById("OptionsOfpawnPromotion").style.display="grid";
            PPfrom=selectedID.substr(0,1);
            PPto=this.getAttribute("id").substr(0,1);
            PawnPromotion();
            cantEnter=true;
          }
          else {
            SendMovePiece(selectedID,this.getAttribute("id"),selectedPiece);
          }
        }
        BoardConfigAsArray();
        console.table(boardConfig);
      }
    }
    moveRestricted=false;
  }
}

function Capture(id){
  if(selected){
    let curPiece=document.getElementById(id).innerHTML;
    document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
    document.getElementById(id).innerHTML=selectedPiece;
    document.getElementById(selectedID).innerHTML="";
    selected=false;
    if(CheckForCheck(getCookie("User")))
    {
      document.getElementById(id).innerHTML=curPiece;
      document.getElementById(selectedID).innerHTML=selectedPiece;
    }
    else{
      if(['♙','♟'].indexOf(selectedPiece)>=0 && selectedID.substr(1,1)=="7"){
        //check length on other side for checking pawn promotion
        document.getElementById("OptionsOfpawnPromotion").style.display="grid";
        PPfrom=selectedID.substr(0,1);
        PPto=id.substr(0,1);
        PawnPromotion();
        cantEnter=true;
      }
      else {
        SendMovePiece(selectedID,id,selectedPiece);
      }
    }
  }
}
//selectedID is the previous piece ID and id is the current piece ID
function Restrictions(value,id){
  let user=getCookie("User");
  let idNo=parseInt(id.substr(1,1));
  let idAlpha=id.substr(0,1);
  let prevIdNo,prevIdAlpha;

  if(selectedID!=""){
      prevIdNo=parseInt(selectedID.substr(1,1));
      prevIdAlpha=selectedID.substr(0,1);
  }

  if(selected){
    //set en parsant
    if(prevIdNo==5 && idNo==6 && value=="" && ['♟','♙'].indexOf(selectedPiece)>=0){
      if((idAlpha.charCodeAt(0)==(prevIdAlpha.charCodeAt(0)+1) && lastMoveOfOpponent==(idAlpha+"7:"+idAlpha+"5") && ['♟','♙'].indexOf(document.getElementById(idAlpha+"5").innerHTML)>=0) ||
        (idAlpha.charCodeAt(0)==(prevIdAlpha.charCodeAt(0)-1) && lastMoveOfOpponent==(idAlpha+"7:"+idAlpha+"5") && ['♟','♙'].indexOf(document.getElementById(idAlpha+"5").innerHTML)>=0) ){   //right and left en parsant
        document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
        document.getElementById(idAlpha+"6").innerHTML=document.getElementById(prevIdAlpha+"5").innerHTML;
        document.getElementById(prevIdAlpha+"5").innerHTML="";
        document.getElementById(idAlpha+"5").innerHTML="";
        SendMovePiece(selectedID,id,selectedPiece,false,true);
      }
    }

    //Move Only(make moveRestricted=true)
    let check=true;
    if((user=="White" && ['♔','♕','♖','♗','♘','♙'].indexOf(value)>=0) || (user=="Black" && ['♚','♛','♜','♝','♞','♟'].indexOf(value)>=0))
        check=false;

    let diff=(idNo-prevIdNo);
    if((selectedPiece=="♟" || selectedPiece=="♙") && check){
        let comp=1;
        if(prevIdNo==2)
          comp=2;
        if(prevIdAlpha != idAlpha || (diff>comp || diff<0))
          moveRestricted=true;//if some condition not satisfied
        if(comp==2 && document.getElementById(prevIdAlpha+"3").innerHTML!="")
          moveRestricted=true;

        //for handling captures
        if( diff==1 &&((user=="White" && ['♚','♛','♜','♝','♞','♟'].indexOf(value)>=0)||(user=="Black" && ['♔','♕','♖','♗','♘','♙'].indexOf(value)>=0)))
        {
          let diff2;
          if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0))
          {
            diff2=idAlpha.charCodeAt(0) - prevIdAlpha.charCodeAt(0);
          }
          else{
            diff2=prevIdAlpha.charCodeAt(0) - idAlpha.charCodeAt(0);
          }
          if(diff2==1){    //if 1 column ahead or behind of pawn then only capture is possible
            moveRestricted=false;
          }
          else
            moveRestricted=true;
        }

        if( diff==2 &&((user=="White" && ['♚','♛','♜','♝','♞','♟'].indexOf(value)>=0)||(user=="Black" && ['♔','♕','♖','♗','♘','♙'].indexOf(value)>=0)))
        {
          moveRestricted=true;
        }
    }
    else if((selectedPiece=="♜" || selectedPiece=="♖") && check){
      if(prevIdAlpha != idAlpha && idNo!=prevIdNo)
        moveRestricted=true;//if some condition not satisfied
      else if(prevIdAlpha == idAlpha)
      {
        let start,stop;
        if(prevIdNo < idNo)
        {
          start=prevIdNo;
          stop=idNo;
        }
        else{
          stop=prevIdNo;
          start=idNo;
        }

        for (let i = start+1; i < stop; i++) {
          let ch=idAlpha+i;
          if(document.getElementById(ch).innerHTML!=""){
              moveRestricted=true;
              break;
          }
        }
      }
      else if(idNo == prevIdNo)
      {
        let start,stop;
        if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0))
        {
          start=prevIdAlpha.charCodeAt(0);
          stop=idAlpha.charCodeAt(0);
        }
        else{
          stop=prevIdAlpha.charCodeAt(0);
          start=idAlpha.charCodeAt(0);
        }
        for (let i = start+1; i < stop; i++) {
          let ch=String.fromCharCode(i)+idNo;
          if(document.getElementById(ch).innerHTML!=""){
              moveRestricted=true;
              break;
          }
        }
      }
    }
    else if((selectedPiece=="♝" || selectedPiece=="♗") && check){
      let diff1,diff2;
      if(prevIdNo < idNo){
        diff2=idNo-prevIdNo;
        if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
          diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);
          let j=prevIdAlpha.charCodeAt(0);
          for (let i = prevIdNo+1; i < idNo; i++) {
            j=j+1;
            let ch=String.fromCharCode(j)+i;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
        else{
          diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);
          let j=prevIdAlpha.charCodeAt(0);
          for (let i = prevIdNo+1; i < idNo; i++) {
            j=j-1;
            let ch=String.fromCharCode(j)+i;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
      }
      else{
        diff2=prevIdNo-idNo;
        if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
          diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);
          let j=prevIdAlpha.charCodeAt(0);
          for (let i = prevIdNo-1; i > idNo; i--) {
            j=j+1;
            let ch=String.fromCharCode(j)+i;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
        else{
          diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);
          let j=prevIdAlpha.charCodeAt(0);
          for (let i = prevIdNo-1; i > idNo; i--) {
            j=j-1;
            let ch=String.fromCharCode(j)+i;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
      }

      if(diff1 != diff2)
          moveRestricted=true;
    }
    else if((selectedPiece=="♞" || selectedPiece=="♘") && check){
      let diff2;
      if(prevIdNo < idNo){
        diff2=idNo-prevIdNo;
      }
      else{
        diff2=prevIdNo-idNo;
      }
      //Right Half
      if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
        let diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);

        if(!((diff1 == 1 && diff2 == 2)||(diff1 == 2 && diff2 == 1)))
            moveRestricted=true;

      }
      else{   //left Half
        let diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);

        if(!((diff1 == 1 && diff2 == 2)||(diff1 == 2 && diff2 == 1)))
            moveRestricted=true;

      }
    }
    else if((selectedPiece=="♛" || selectedPiece=="♕") && check){
          //Rook Code
      if(prevIdAlpha == idAlpha || idNo==prevIdNo){
        if(prevIdAlpha != idAlpha && idNo!=prevIdNo)
          moveRestricted=true;//if some condition not satisfied
        else if(prevIdAlpha == idAlpha)
        {
          let start,stop;
          if(prevIdNo < idNo)
          {
            start=prevIdNo;
            stop=idNo;
          }
          else{
            stop=prevIdNo;
            start=idNo;
          }

          for (let i = start+1; i < stop; i++) {
            let ch=idAlpha+i;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
        else if(idNo == prevIdNo)
        {
          let start,stop;
          if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0))
          {
            start=prevIdAlpha.charCodeAt(0);
            stop=idAlpha.charCodeAt(0);
          }
          else{
            stop=prevIdAlpha.charCodeAt(0);
            start=idAlpha.charCodeAt(0);
          }
          for (let i = start+1; i < stop; i++) {
            let ch=String.fromCharCode(i)+idNo;
            if(document.getElementById(ch).innerHTML!=""){
                moveRestricted=true;
                break;
            }
          }
        }
      }
      else{         //Bishop Code
          let diff1,diff2;
          if(prevIdNo < idNo){
            diff2=idNo-prevIdNo;
            if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
              diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);
              let j=prevIdAlpha.charCodeAt(0);
              for (let i = prevIdNo+1; i < idNo; i++) {
                j=j+1;
                let ch=String.fromCharCode(j)+i;
                if(document.getElementById(ch).innerHTML!=""){
                    moveRestricted=true;
                    break;
                }
              }
            }
            else{
              diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);
              let j=prevIdAlpha.charCodeAt(0);
              for (let i = prevIdNo+1; i < idNo; i++) {
                j=j-1;
                let ch=String.fromCharCode(j)+i;
                if(document.getElementById(ch).innerHTML!=""){
                    moveRestricted=true;
                    break;
                }
              }
            }
          }
          else{
            diff2=prevIdNo-idNo;
            if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
              diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);
              let j=prevIdAlpha.charCodeAt(0);
              for (let i = prevIdNo-1; i > idNo; i--) {
                j=j+1;
                let ch=String.fromCharCode(j)+i;
                if(document.getElementById(ch).innerHTML!=""){
                    moveRestricted=true;
                    break;
                }
              }
            }
            else{
              diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);
              let j=prevIdAlpha.charCodeAt(0);
              for (let i = prevIdNo-1; i > idNo; i--) {
                j=j-1;
                let ch=String.fromCharCode(j)+i;
                if(document.getElementById(ch).innerHTML!=""){
                    moveRestricted=true;
                    break;
                }
              }
            }
          }

          if(diff1 != diff2)
              moveRestricted=true;
      }
    }
    else if((selectedPiece=="♚" || selectedPiece=="♔") && check){ //Castling will be handled later
      let diff2;
      if(prevIdNo < idNo){
        diff2=idNo-prevIdNo;
      }
      else{
        diff2=prevIdNo-idNo;
      }
      //Right Half
      if(prevIdAlpha.charCodeAt(0) < idAlpha.charCodeAt(0)){
        let diff1=idAlpha.charCodeAt(0)-prevIdAlpha.charCodeAt(0);

        if(!((diff1 == 1 && diff2 == 1) || (diff1 == 1 && diff2 == 0) || (diff1 == 0 && diff2 == 1)))
            moveRestricted=true;

      }
      else{   //left Half
        let diff1=prevIdAlpha.charCodeAt(0)-idAlpha.charCodeAt(0);

        if(!((diff1 == 1 && diff2 == 1) || (diff1 == 1 && diff2 == 0) || (diff1 == 0 && diff2 == 1)))
            moveRestricted=true;

      }

      //for Castling (later check no piece of 3 is moved)
      if(!CheckForCheck(getCookie("User"))){
        if(user=="White" && selectedID=="E1"){
          if(id=="G1" && canSC){   //short Castling
            if(document.getElementById("F1").innerHTML=="" && document.getElementById("G1").innerHTML==""){
              //check for no check between castling
              document.getElementById("E1").innerHTML="";
              document.getElementById("F1").innerHTML=selectedPiece;
              if(!CheckForCheck(getCookie("User"))){
                document.getElementById("F1").innerHTML="";
                document.getElementById("G1").innerHTML=selectedPiece;
                if(!CheckForCheck(getCookie("User"))){   //can castle
                  document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
                  //Move the rook and send data
                  document.getElementById("F1").innerHTML=document.getElementById("H1").innerHTML;
                  document.getElementById("H1").innerHTML="";
                  SendMovePiece(selectedID,id,selectedPiece,true);
                }
                else{
                  document.getElementById("G1").innerHTML="";
                  document.getElementById("E1").innerHTML=selectedPiece;
                }
              }
              else{
                document.getElementById("F1").innerHTML="";
                document.getElementById("E1").innerHTML=selectedPiece;
              }
            }
          }
          if(id=="C1" && canLC) {  //long Castling
            if(document.getElementById("D1").innerHTML=="" && document.getElementById("C1").innerHTML=="" && document.getElementById("B1").innerHTML==""){
              //check for no check between castling
              document.getElementById("E1").innerHTML="";
              document.getElementById("D1").innerHTML=selectedPiece;
              if(!CheckForCheck(getCookie("User"))){
                document.getElementById("D1").innerHTML="";
                document.getElementById("C1").innerHTML=selectedPiece;
                if(!CheckForCheck(getCookie("User"))){   //can castle
                  document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
                  //Move the rook and send data
                  document.getElementById("D1").innerHTML=document.getElementById("A1").innerHTML;
                  document.getElementById("A1").innerHTML="";
                  SendMovePiece(selectedID,id,selectedPiece,true);
                }
                else{
                  document.getElementById("C1").innerHTML="";
                  document.getElementById("E1").innerHTML=selectedPiece;
                }
              }
              else{
                document.getElementById("D1").innerHTML="";
                document.getElementById("E1").innerHTML=selectedPiece;
              }
            }
          }
        }
        else if (user=="Black" && selectedID=="D1") {
          if(id=="B1" && canSC){   //short Castling
            if(document.getElementById("B1").innerHTML=="" && document.getElementById("C1").innerHTML==""){
              //check for no check between castling
              document.getElementById("D1").innerHTML="";
              document.getElementById("C1").innerHTML=selectedPiece;
              if(!CheckForCheck(getCookie("User"))){
                document.getElementById("C1").innerHTML="";
                document.getElementById("B1").innerHTML=selectedPiece;
                if(!CheckForCheck(getCookie("User"))){   //can castle
                  document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
                  //Move the rook and send data
                  document.getElementById("C1").innerHTML=document.getElementById("A1").innerHTML;
                  document.getElementById("A1").innerHTML="";
                  SendMovePiece(selectedID,id,selectedPiece,true);
                }
                else{
                  document.getElementById("B1").innerHTML="";
                  document.getElementById("D1").innerHTML=selectedPiece;
                }
              }
              else{
                document.getElementById("C1").innerHTML="";
                document.getElementById("D1").innerHTML=selectedPiece;
              }
            }
          }
          if(id=="F1" && canLC) {  //long Castling
            if(document.getElementById("E1").innerHTML=="" && document.getElementById("F1").innerHTML=="" && document.getElementById("G1").innerHTML==""){
              //check for no check between castling
              document.getElementById("D1").innerHTML="";
              document.getElementById("E1").innerHTML=selectedPiece;
              if(!CheckForCheck(getCookie("User"))){
                document.getElementById("E1").innerHTML="";
                document.getElementById("F1").innerHTML=selectedPiece;
                if(!CheckForCheck(getCookie("User"))){   //can castle
                  document.getElementById(selectedID).style.backgroundColor=selectedBackClr;
                  //Move the rook and send data
                  document.getElementById("E1").innerHTML=document.getElementById("H1").innerHTML;
                  document.getElementById("H1").innerHTML="";
                  SendMovePiece(selectedID,id,selectedPiece,true);
                }
                else{
                  document.getElementById("F1").innerHTML="";
                  document.getElementById("D1").innerHTML=selectedPiece;
                }
              }
              else{
                document.getElementById("E1").innerHTML="";
                document.getElementById("D1").innerHTML=selectedPiece;
              }
            }
          }
        }
      }

    }
    //Capture Only(make moveRestricted=false)
  }
  //Capture cases if move is not restricted due to any piece in between and oposite color capture
  if(!moveRestricted && ((user=="White" && ['♚','♛','♜','♝','♞','♟'].indexOf(value)>=0)||(user=="Black" && ['♔','♕','♖','♗','♘','♙'].indexOf(value)>=0))){
    Capture(id);
  }


  if(user=="White" && ['♚','♛','♜','♝','♞','♟'].indexOf(value)>=0 && value != "")
      moveRestricted=true;
  if(user=="Black" && ['♔','♕','♖','♗','♘','♙'].indexOf(value)>=0 && value != "")
      moveRestricted=true;
}

// CheckForCheck(getCookie("User"));
function CheckForCheck(playerColor){
  // BoardConfigAsArray();
  // console.table(boardConfig);
  let myPieces=[];
  let opponentPieces=[];
  let row,col;
    
  if(playerColor == "White"){
      myPieces=['♔','♕','♖','♗','♘','♙'];
      opponentPieces=['♚','♛','♜','♝','♞','♟'];
  }
  else if (playerColor == "Black") {
      myPieces=['♚','♛','♜','♝','♞','♟'];
      opponentPieces=['♔','♕','♖','♗','♘','♙'];
  }
  //iterate and find king and set row and column to its position
  for (let i=7; i >=0 ; i--) {
    for (let j=7; j >=0; j--) {
        // let id=String.fromCharCode(col+65)+row;
        let piece=boardConfig[i][j];
        if(myPieces.indexOf(piece)>=0 && ['♚','♔'].indexOf(piece)>=0){
          row=i;
          col=j;
          console.log("King Position",row,col);
          break;
        }
    }
  }

  let destinations,canIGoAhead=["true","true","true","true","true","true","true","true"];
  
  //like queen or bishop&rook
  for (let i = 1; i <= 7; i++) {
      destinations=[
          [row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i],//bishop
          [row-i,col],[row,col+i],[row+i,col],[row,col-i],//Rook
      ];
  
      for(let index=0; index < destinations.length ; index++){
          let place=destinations[index];
          if(canIGoAhead[index] && place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
              if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0){
                  canIGoAhead[index]=false;
                  console.log("My Piece at",place[0],place[1]);
              }
              else if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0){
                  canIGoAhead[index]=false;
                  console.log("Oponent Piece at",place[0],place[1]);
                  if(index>=0 && index<=3 && ['♝','♗','♛','♕'].indexOf(boardConfig[place[0]][place[1]])>=0){
                    console.log("B/Q at",place[0],place[1]);
                    return true;
                  }
                  if(index>=4 && index<=7 && ['♜','♖','♛','♕'].indexOf(boardConfig[place[0]][place[1]])>=0){
                    console.log("R/Q at",place[0],place[1]);
                    return true;
                  }
  
                  if(i === 1){
                    if((index===0 || index===1) && ['♟','♙'].indexOf(boardConfig[place[0]][place[1]])>=0){    //upleft and upright pawn
                      console.log("Pawn at",place[0],place[1]);
                      return true;
                    }
                    if(['♚','♔'].indexOf(boardConfig[place[0]][place[1]])>=0){      //1st layer king check
                      console.log("King at",place[0],place[1]);
                      return true;
                    }
                  }
              }
              
          }
      }
  
  }
  //like knight
  destinations=[
      [row-2,col-1],[row-2,col+1],[row-1,col+2],[row+1,col+2],
      [row+2,col+1],[row+2,col-1],[row+1,col-2],[row-1,col-2]];
  
  for(let index=0; index<destinations.length ; index++){
    let place=destinations[index];
    if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7 
      && opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0
      && ['♞','♘'].indexOf(boardConfig[place[0]][place[1]])>=0){
        console.log("Knight at",place[0],place[1]);
        return true;
      }
  }
  
  //after this correct restriction and move piece code using technique written in notes
  return false;
}