ReadTheMove("Be5","White");
let curPlayer="White";
function ReadTheMove(move,color) {
    let piece,row,col,fromRow=null,fromCol=null;
    let regex=/^([NBRQK])?([a-h])?([1-8])?(x)?([a-h][1-8])(=[NBRQK])?(\+|#)?$|^O-O(-O)?$/;
    let res = move.match(regex);
    let whitePieces={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙'};
    let blackPieces={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟'};
    let curPieces=(color=="White")?whitePieces:blackPieces;

    if(res!=null){
        if(res[1]!==undefined){
            piece=curPieces[res[1]];
        }
        else{
            piece=curPieces["P"];
        }

        if(res[2]!==undefined){
            let tmp=res[2].charCodeAt(0)-97;
            fromCol=(color=="White")?tmp:7-tmp;
        }

        if(res[3]!==undefined){
            let tmp=parseInt(res[5])-1;
            fromRow=(color=="White")?7-tmp:tmp;
        }

        if(res[5]!==undefined){
            let tmp=parseInt(res[5].charAt(1))-1;
            let tmp2=res[5].charCodeAt(0)-97;
            row=(color=="White")?7-tmp:tmp;
            col=(color=="White")?tmp2:7-tmp2;
        }
    }

    let destinations=[];

    if(fromRow!=null && fromCol!=null)
            destinations=[[fromRow,fromCol]];
    else if(['♟','♙'].indexOf(piece)>=0){
        //pawn promotion and en passant and castling
        if((curPlayer=="White" && color=="Black") ||
            (curPlayer=="Black" && color=="White")){
            destinations=(res[4]!=="x")?
                [[row-1,col],[row-2,col]]:
                [[row-1,col-1],[row-1,col+1]];
        }
        else if((curPlayer=="White" && color=="White") ||
            (curPlayer=="Black" && color=="Black")){
            destinations=(res[4]!=="x")?
                [[row+1,col],[row+2,col]]:
                [[row+1,col-1],[row+1,col+1]];
        }
    }
    else if(['♞','♘'].indexOf(piece)>=0)
    {
        destinations=[
            [row-2,col-1],[row-2,col+1],[row-1,col+2],[row+1,col+2],
            [row+2,col+1],[row+2,col-1],[row+1,col-2],[row-1,col-2]];
    }
    else if(['♝','♗'].indexOf(piece)>=0)
    {
        for (let i = 1; i <= 7; i++)
            destinations=[...destinations,[row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i]];
    }
    else if(['♜','♖'].indexOf(piece)>=0)
    {
        for (let i = 1; i <= 7; i++)
            destinations=[...destinations,[row-i,col],[row,col+i],[row+i,col],[row,col-i]];
    }
    else if(['♛','♕'].indexOf(piece)>=0)
    {
        for (let i = 1; i <= 7; i++)
            destinations=[
                ...destinations,
                [row-i,col-i],[row-i,col+i],[row+i,col-i],[row+i,col+i],//bishop
                [row-i,col],[row,col+i],[row+i,col],[row,col-i],//Rook
            ];
    }
    else if(['♚','♔'].indexOf(piece)>=0)
    {
        destinations=[
            [row-1,col-1],[row-1,col+1],[row+1,col-1],[row+1,col+1],//bishop(only one place)
            [row-1,col],[row,col+1],[row+1,col],[row,col-1],//Rook(only one place)
        ];
    }

    for(let index=0; index<destinations.length ; index++){
        let place=destinations[index];
        if(place[0]>=0 && place[0]<=7 && place[1]>=0 && place[1]<=7){
            
            if(fromRow!=null && place[0]!==fromRow)
                continue;
            if(fromCol!=null && place[1]!==fromCol)
                continue;

            if(boardConfig[place[0]][place[1]]===piece){
                boardConfig[row][col]=piece;
                boardConfig[place[0]][place[1]]="_";
                break;
            }
        }
    }
    
}