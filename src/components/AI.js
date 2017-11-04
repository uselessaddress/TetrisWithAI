import {buildMatrix,buildMainMatrix} from './Grid';
class AI{
    constructor(a, b ,c, d){
        this.alpha = a || Math.random();
        this.beta = b || Math.random();
        this.gama = c || Math.random();
        this.delta = d || Math.random();
        
    }

    //统计可以消除的行数
    static fullLineCount(matrix, game){
        let count = 0;
        for(let i=game.rows-1; i>=0; i--){
            if(AI.isFullLine(matrix, i, game.cols)){
                count++;
            }
        }
        return count;
    }

    //统计可以消除的行数
     static isFullLine(matrix, line, cols){
        for(let i=0; i<cols; i++){
            if(matrix[line][i] == null) return false;
        }
        return true;
    }

    //统计某列的列高
    static colHeight(matrix, col, rows){
        for(let i=0; i<rows; i++){
            if(matrix[i][col] != null) return rows - i;
        }
        return 0;
    }

    //统计某列的空洞数
    static holeCount(matrix, col, rows){
        let top = rows;
        //获取列高度
        for(let i=0; i<rows; i++){
            if(matrix[i][col] != null){
                top = i;
                break;
            }
        }

        let count = 0;
        for(let i=top; i<rows; i++){
            if(matrix[i][col] == null){
                count++;
            }
        }

        return count;
    }

    //计算四种状态
    static state(matrix, game){
        let fulllines = AI.fullLineCount(matrix, game);//可以消除的行数（刨去将被消除的行））
        let avgHeight = 0;//平均高度（刨去将被消除的行））

        let last = null;
        let delta = 0;

        for(let i=0; i<game.cols; i++){
            let height = AI.colHeight(matrix, i, game.rows) - fulllines;
            if(last!=null){
                delta += Math.abs(height - last);//各列之间高度之差的绝对值之和（刨去将被消除的行））
            }
            last = height;
            avgHeight +=  height;
        }
        avgHeight = avgHeight / game.cols;

        let holeCount = 0; //总的空洞数
        for(let i=0; i<game.cols; i++){
            holeCount += AI.holeCount(matrix, i, game.rows);
        }
        return {
            clear: fulllines,//可以消除的行数（刨去将被消除的行））
            avgh: avgHeight,//平均高度（刨去将被消除的行））
            hc: holeCount,//总的空洞数
            delta: delta//各列之间高度之差的绝对值之和（刨去将被消除的行）---平整度
        };
    }


    //遍历所有可能性
    think(game){ 
        let tetris = game.state.active;
        let origin = {
            row: tetris.row,
            col: tetris.col,
            matrix: buildMainMatrix(game.rows, game.cols, (row, col)=>{
                return game.state.data[row][col];
            })
        };

        let result = [];
        for(let i=0; i<4; i++){
            do{
                while(game.moveActiveDown()){
                    ;
                }
                game.merge(tetris);
                let state = AI.state(game.state.data, game);
                result.push({
                    state: state,
                    turn: i,
                    row:tetris.row,
                    col:tetris.col
                });
                
                
                tetris.setPos(origin.row, tetris.col);                
                game.state.data = buildMainMatrix(game.rows, game.cols, (i, j)=>{
                    return origin.matrix[i][j];
                });

            }while(game.moveActiveLeft());

            tetris.setPos(origin.row, origin.col);

            while(game.moveActiveRight()){
                while(game.moveActiveDown()){
                    ;
                }

                game.merge(tetris);
                let state = AI.state(game.state.data, game);
                result.push({
                    state: state,
                    turn: i,
                    row:tetris.row,
                    col:tetris.col                   
                });                      
                
                
                tetris.setPos(origin.row, tetris.col);                
                game.state.data = buildMainMatrix(game.rows, game.cols, (i, j)=>{
                    return origin.matrix[i][j];
                });
            }

            tetris.setPos(origin.row, origin.col); 
            tetris.turn(true);
        }
        tetris.setPos(origin.row, origin.col);
        game.state.data = origin.matrix;
        return this.actions(result, tetris, game);
    }

    actions(result, tetris, game){

        if(result.length<=0) return [];

        result.forEach((item)=>{
            item.score = AI.caculate(item.state, game.ai);
        });

        result.sort((a,b)=>{ return b.score - a.score; });

        let target = result[0];
        // console.log(result)
        console.log(this.alpha)
        console.log(this.beta)
        let steps = [];
        switch(target.turn){
            case 0:
                break;
            case 1:
                steps.push({code:0x28,desc:"TR"});
                break;
            case 2:
                steps.push({code:0x28,desc:"TR"});
                steps.push({code:0x28,desc:"TR"});
                break;
            case 3:
                steps.push({code:0x26,desc:"TL"});
                break;
        }
        if(tetris.col < target.col){
            for(let i=tetris.col; i<target.col; i++){
                steps.push({code:0x27,desc:"MR"});                
            }
        }else if(tetris.col > target.col){
            for(let i=target.col; i<tetris.col; i++){
                steps.push({code:0x25,desc:"ML"});                
            }
        }

        for(let i=tetris.row; i<target.row; i++){
            steps.push({code:0x20,desc:"MD"});            
        }
        return steps;
    }

    static caculate(state, ai){
        return state.clear * ai.alpha + state.avgh * ai.beta + state.hc * ai.gama + ai.delta * state.delta;
    }
   
}

export default AI;