
function CheckForMate(color) {
    console.log(1);
  let myPieces=[];
  let opponentPieces=[];
  if( color == "White"){
    myPieces=['♔','♕','♖','♗','♘','♙'];
    opponentPieces=['♚','♛','♜','♝','♞','♟'];
  }
  else if (color == "Black") {
    myPieces=['♚','♛','♜','♝','♞','♟'];
    opponentPieces=['♔','♕','♖','♗','♘','♙'];
  }

  for (let row=0; row <8 ; row++) {
    for (let col=0; col < 8 ; col++) {
        let piece=boardConfig[row][col];
        console.log(2);
        if(piece!="_" && opponentPieces.indexOf(piece)<0){
            console.log(3);
          if(!MoveForChecktheMate(row,col,piece,myPieces,opponentPieces,color))
            return false;
        }
    }
  }
  console.log(4);
  
  return true;
}

function MoveCheckForCheckUndo(fromRow,fromCol,toRow,toCol,playerColor){
  console.log(fromRow,toRow);
  let piecePrsesnt=boardConfig[toRow][toCol];
  let isThereACheck=true;
  boardConfig[toRow][toCol]=boardConfig[fromRow][fromCol];
  boardConfig[fromRow][fromCol]="_";
  console.table(boardConfig);

  if(!CheckForCheck(playerColor)){
      isThereACheck=false;
  }

  boardConfig[fromRow][fromCol]=boardConfig[toRow][toCol];
  boardConfig[toRow][toCol]=piecePrsesnt;

  return isThereACheck;
}

function MoveForChecktheMate(row,col,piece,myPieces,opponentPieces,playerColor){
      let sub=0,mul=-1;
      let isThereACheck=true;

      if(getCookie("User")!=playerColor){
          sub=7;
          mul=1;
      }

      if(piece!="_" && opponentPieces.indexOf(piece)<0){
        if(['♟','♙'].indexOf(piece)>=0){
            //double move
            if(row==(sub-6)*mul && boardConfig[(sub-5)*mul][col] == "_" && boardConfig[(sub-4)*mul][col] == "_"){
                isThereACheck=MoveCheckForCheckUndo((sub-6)*mul,col,(sub-4)*mul,col,playerColor);
                console.log("isThereACheck",isThereACheck);
                if(!isThereACheck) return false;
            }
                //single move
            if(row!=(sub-0)*mul && boardConfig[row+mul][col] == "_"){
                isThereACheck=MoveCheckForCheckUndo(row,col,row+mul,col,playerColor);
                console.log("isThereACheck",isThereACheck);
                if(!isThereACheck) return false;
            }
            //left capture
            if(row!=(sub-0)*mul && col!=(sub-0)*mul && opponentPieces.indexOf(boardConfig[row+mul][col+mul])>=0){
                isThereACheck=MoveCheckForCheckUndo(row,col,row+mul,col+mul,playerColor);
                console.log("isThereACheck",isThereACheck);
                if(!isThereACheck) return false;
            }
            //right capture
            if(row!=(sub-0)*mul && col!=(sub-7)*mul && opponentPieces.indexOf(boardConfig[row+mul][col-mul])>=0){
                isThereACheck=MoveCheckForCheckUndo(row,col,row+mul,col-mul,playerColor);
                console.log("isThereACheck",isThereACheck);
                if(!isThereACheck) return false;
            }
            //check en parsant it is not correct as we have to know that current as well as
            //each change in the engine must keep last move of pawn to check EP validity
            // if(row==3){

            //     //right one
            //     if((col+1)<=7 && lastMoveOfOpponent==(idAlpha+"7:"+idAlpha+"5") && ['♟','♙'].indexOf(anotherPiece)>=0){

            //     }
            //     //left one

            //     let idAlpha=String.fromCharCode(col+65+1);
            //     let prevIdAlpha=String.fromCharCode(col+65);
            //     let anotherPiece=document.getElementById(idAlpha+"5").innerHTML;
        
            //     if((col+65+1)<=72 && lastMoveOfOpponent==(idAlpha+"7:"+idAlpha+"5") && ['♟','♙'].indexOf(anotherPiece)>=0){   //right en parsant
            //     document.getElementById(idAlpha+"6").innerHTML=document.getElementById(prevIdAlpha+"5").innerHTML;
            //     document.getElementById(prevIdAlpha+"5").innerHTML="";
            //     document.getElementById(idAlpha+"5").innerHTML="";
            //     isThereACheck=Max(playerColor);
            //     document.getElementById(prevIdAlpha+"5").innerHTML=document.getElementById(idAlpha+"6").innerHTML;
            //     document.getElementById(idAlpha+"6").innerHTML="";
            //     document.getElementById(idAlpha+"5").innerHTML=anotherPiece;
            //     }
        
            //     idAlpha=String.fromCharCode(col+65-1);
            //     anotherPiece=document.getElementById(idAlpha+"5").innerHTML;
            //     // console.log("LM"+lastMoveOfOpponent);
            //     if((col+65-1)>=65 && lastMoveOfOpponent==(idAlpha+"7:"+idAlpha+"5") && ['♟','♙'].indexOf(anotherPiece)>=0)    ////left en parsant
            //     {
            //     document.getElementById(idAlpha+"6").innerHTML=document.getElementById(prevIdAlpha+"5").innerHTML;
            //     document.getElementById(prevIdAlpha+"5").innerHTML="";
            //     document.getElementById(idAlpha+"5").innerHTML="";
            //     isThereACheck=Max(playerColor);
            //     document.getElementById(prevIdAlpha+"5").innerHTML=document.getElementById(idAlpha+"6").innerHTML;
            //     document.getElementById(idAlpha+"6").innerHTML="";
            //     document.getElementById(idAlpha+"5").innerHTML=anotherPiece;
            //     }
            // }
        }
        else if(['♞','♘'].indexOf(piece)>=0)
        {
            let destinations=[
                [row-2,col-1],[row-2,col+1],[row-1,col+2],[row+1,col+2],
                [row+2,col+1],[row+2,col-1],[row+1,col-2],[row-1,col-2]];
            
            for(let index=0; index<destinations.length ; index++){
              let place=destinations[index];
              if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7
                && myPieces.indexOf(boardConfig[place[0]][place[1]])<=0)
                  isThereACheck=MoveCheckForCheckUndo(row,col,place[0],place[1],playerColor);
              console.log("isThereACheck",isThereACheck);
              if(!isThereACheck) return false;
            }

        }
        else if(['♝','♗'].indexOf(piece)>=0)
        {
            let destinations,canIGoAhead=["true","true","true","true"];
            for (let i = 1; i <= 7; i++) {
                destinations=[[row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i]];

                for(let index=0; index < destinations.length ; index++){
                  let place=destinations[index];
                  if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                      if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                      
                      if(canIGoAhead[index])
                          isThereACheck=MoveCheckForCheckUndo(row,col,place[0],place[1],playerColor);
                      
                      if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                  }
                  console.log("isThereACheck",isThereACheck);
                  if(!isThereACheck) return false;
                }

            }
        }
        else if(['♜','♖'].indexOf(piece)>=0)
        {
            let destinations,canIGoAhead=["true","true","true","true"];
            for (let i = 1; i <= 7; i++) {
                destinations=[[row-i,col],[row,col+i],[row+i,col],[row,col-i]];

                for(let index=0; index < destinations.length ; index++){
                  let place=destinations[index];
                  if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                      if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                      
                      if(canIGoAhead[index])
                          isThereACheck=MoveCheckForCheckUndo(row,col,place[0],place[1],playerColor);
                      
                      if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                  }
                  console.log("isThereACheck",isThereACheck);
                  if(!isThereACheck) return false;
                }

            }

        }
        else if(['♛','♕'].indexOf(piece)>=0)
        {
            let destinations,canIGoAhead=["true","true","true","true","true","true","true","true"];
            for (let i = 1; i <= 7; i++) {
                destinations=[
                    [row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i],//bishop
                    [row-i,col],[row,col+i],[row+i,col],[row,col-i],//Rook
                ];

                for(let index=0; index < destinations.length ; index++){
                  let place=destinations[index];
                  if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                      if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                      
                      if(canIGoAhead[index])
                          isThereACheck=MoveCheckForCheckUndo(row,col,place[0],place[1],playerColor);
                      
                      if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                          canIGoAhead[index]=false;
                  }
                  console.log("isThereACheck",isThereACheck);
                  if(!isThereACheck) return false;
                }

            }
        }
        else if(['♚','♔'].indexOf(piece)>=0)
        {

            let destinations=[
                [row-1,col-1],[row-1,col+1],[row+1,col-1],[row+1,col+1],//bishop(only one place)
                [row-1,col],[row,col+1],[row+1,col],[row,col-1],//Rook(only one place)
            ];

            for(let index=0; index<destinations.length ; index++){
              let place=destinations[index];
              if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7
                && myPieces.indexOf(boardConfig[place[0]][place[1]])<=0
                && ['♚','♔'].indexOf(boardConfig[place[0]][place[1]])<=0)
                  isThereACheck=MoveCheckForCheckUndo(row,col,place[0],place[1],playerColor);
              console.log("isThereACheck",isThereACheck);
              if(!isThereACheck) return false;
            }
        }
    }
      
      return isThereACheck;
}