//first check for mate
//move the player to find the best move
//give score at each iteration by looking the board 
//Q-9 , R- 5 , B - K - 3 , P - 1 (Sum), checkmate = 1000
//find difference of both players Sum (9+5*2+3*4+8 = 39 is max)
//first Aalysis of board
//then Moving the pieces in each recursion manner

//while moving a piece check is there a check only if no then move in minmax
//check for depth or mate then return the score
//if white moves then he give color of black while calling minmax again so that check for mate so that maximum
//value if black is mated and will return to white.
//Analysis

function BoardAnalysis(oponentPlayerColor){         //player color(if white is moved and black is analysing the board then value will be (white-black) )
    let whitePoints=0,blackPoints=0;
    
    for (let i=0; i < 8 ; i++) {
        for (let j=0; j < 8 ; j++) {
          let piece=boardConfig[i][j];
          if(piece!=""){
            if(piece=='♕') whitePoints+=9;
            else if(piece=='♛')  blackPoints+=9;
            else if(piece=='♖') whitePoints+=5;
            else if(piece=='♜') blackPoints+=5;
            else if(piece=='♗' || piece=='♘') whitePoints+=3;
            else if(piece=='♝' || piece=='♞') blackPoints+=3;
            else if(piece=='♙') whitePoints+=1;
            else if(piece=='♟') blackPoints+=1;
          }
        }
    }

    let userPoints=oponentPlayerColor == "Black"?(blackPoints-whitePoints):(whitePoints-blackPoints);
    console.log(userPoints);

    return (userPoints);
}
// console.log(1);
// if(!CheckForMate("White"))
//     minmax("White",0,true);

function MoveFindUndo(fromRow,fromCol,toRow,toCol,playerColor,depth,bestScore){
    console.log(fromRow,toRow);
    let piecePrsesnt=boardConfig[toRow][toCol];
    boardConfig[toRow][toCol]=boardConfig[fromRow][fromCol];
    boardConfig[fromRow][fromCol]="_";
    console.table(boardConfig);

    if(!CheckForCheck(playerColor)){
        let nextColor=playerColor == "White" ?"Black":"White";
        let score=-minmax(nextColor,depth+1);
        if(score>bestScore) bestScore=score;
        console.log(score,bestScore);
    }

    boardConfig[fromRow][fromCol]=boardConfig[toRow][toCol];
    boardConfig[toRow][toCol]=piecePrsesnt;

    return bestScore;
}

function minmax(playerColor,depth){
    var maxDepth=2;

    let myPieces=[];
    let opponentPieces=[];
    
    if(playerColor == "White"){
        myPieces=['♔','♕','♖','♗','♘','♙'];
        opponentPieces=['♚','♛','♜','♝','♞','♟'];
    }
    else if (playerColor == "Black") {
        myPieces=['♚','♛','♜','♝','♞','♟'];
        opponentPieces=['♔','♕','♖','♗','♘','♙'];
    }

    if(depth>0 && CheckForMate(playerColor))
        return 100000;
    
    if(depth==maxDepth)
        return BoardAnalysis(playerColor);

        let sub=0,mul=-1;
        let bestScore=-10000;

        if(getCookie("User")!=playerColor){
            sub=7;
            mul=1;
        }

        for (let row=0; row <8 ; row++) {
            for (let col=0; col < 8 ; col++) {
                // let id=String.fromCharCode(col+65)+row;
                let piece=boardConfig[row][col];
                if(piece!="_" && opponentPieces.indexOf(piece)<0){
                    if(['♟','♙'].indexOf(piece)>=0){
                        //double move
                        if(row==(sub-6)*mul && boardConfig[(sub-5)*mul][col] == "_" && boardConfig[(sub-4)*mul][col] == "_"){
                            bestScore=MoveFindUndo((sub-6)*mul,col,(sub-4)*mul,col,playerColor,depth,bestScore);
                            console.log("Best Score",bestScore);
                        }
                            //single move
                        if(row!=(sub-0)*mul && boardConfig[row+mul][col] == "_"){
                            bestScore=MoveFindUndo(row,col,row+mul,col,playerColor,depth,bestScore);
                            console.log("Best Score",bestScore);
                        }
                        //left capture
                        if(row!=(sub-0)*mul && col!=(sub-0)*mul && opponentPieces.indexOf(boardConfig[row+mul][col+mul])>=0){
                            bestScore=MoveFindUndo(row,col,row+mul,col+mul,playerColor,depth,bestScore);
                            console.log("Best Score",bestScore);
                        }
                        //right capture
                        if(row!=(sub-0)*mul && col!=(sub-7)*mul && opponentPieces.indexOf(boardConfig[row+mul][col-mul])>=0){
                            bestScore=MoveFindUndo(row,col,row+mul,col-mul,playerColor,depth,bestScore);
                            console.log("Best Score",bestScore);
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
                        //     bestScore=Max(playerColor,depth,bestScore);
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
                        //     bestScore=Max(playerColor,depth,bestScore);
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
                        
                        destinations.forEach((place)=>{
                            if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7
                                && myPieces.indexOf(boardConfig[place[0]][place[1]])<=0)
                                bestScore=MoveFindUndo(row,col,place[0],place[1],playerColor,depth,bestScore);
                                console.log("Best Score",bestScore);
                        });
        
                    }
                    else if(['♝','♗'].indexOf(piece)>=0)
                    {
                        let destinations,canIGoAhead=["true","true","true","true"];
                        for (let i = 1; i <= 7; i++) {
                            destinations=[[row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i]];

                            destinations.forEach((place,index)=>{
                                if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                                    if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                    
                                    if(canIGoAhead[index])
                                        bestScore=MoveFindUndo(row,col,place[0],place[1],playerColor,depth,bestScore);
                                    
                                    if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                }
                                console.log("Best Score",bestScore);
                            });
        
                        }
                    }
                    else if(['♜','♖'].indexOf(piece)>=0)
                    {
                        let destinations,canIGoAhead=["true","true","true","true"];
                        for (let i = 1; i <= 7; i++) {
                            destinations=[[row-i,col],[row,col+i],[row+i,col],[row,col-i]];

                            destinations.forEach((place,index)=>{
                                if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                                    if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                    
                                    if(canIGoAhead[index])
                                        bestScore=MoveFindUndo(row,col,place[0],place[1],playerColor,depth,bestScore);
                                    
                                    if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                }
                                console.log("Best Score",bestScore);
                            });
        
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

                            destinations.forEach((place,index)=>{
                                if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
                                    if(myPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                    
                                    if(canIGoAhead[index])
                                        bestScore=MoveFindUndo(row,col,place[0],place[1],playerColor,depth,bestScore);
                                    
                                    if(opponentPieces.indexOf(boardConfig[place[0]][place[1]])>=0)
                                        canIGoAhead[index]=false;
                                }
                                console.log("Best Score",bestScore);
                            });
        
                        }
                    }
                    else if(['♚','♔'].indexOf(piece)>=0)
                    {
        
                        let destinations=[
                            [row-1,col-1],[row-1,col+1],[row+1,col-1],[row+1,col+1],//bishop(only one place)
                            [row-1,col],[row,col+1],[row+1,col],[row,col-1],//Rook(only one place)
                        ];
                        
                        destinations.forEach((place)=>{
                            if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7
                                && myPieces.indexOf(boardConfig[place[0]][place[1]])<=0
                                && ['♚','♔'].indexOf(boardConfig[place[0]][place[1]])<=0)
                                bestScore=MoveFindUndo(row,col,place[0],place[1],playerColor,depth,bestScore);
                                console.log("Best Score",bestScore);
                        });
                    }
                }
            }
        }
        
        return bestScore;
}

var btn = document.getElementById("Engine");
btn.addEventListener("click", function() {
	console.log(minmax(getCookie("User"),0));
}, false);