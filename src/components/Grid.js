import React, { Component } from 'react';
const TileWidth = 20    //每个块的宽度
const TileHeight = 20   //每个块的长度
const TilePadding = 1   //每个块之间的间隔

let shapes = []

//7种情况的方块
shapes.push(
    [
        "11",
        "11"
    ],
    [
        "100",
        "111"
    ],
    [
        "001",
        "111"
    ],
    [
        "110",
        "011"
    ],
    [
        "011",
        "110"
    ],
    [
        "111",
        "010"
    ],
    [
        "1",
        "1",
        "1",
        "1"
    ]
)

//选择颜色
class ColorPicker{
    //从四种颜色中随机生成
    static random(){
        let random = parseInt(Math.random()*4)
        switch (random) {
            case 0:
                return '#00A480';
                break;
            case 1:
                return '#0F4FA8';
                break;
            case 2:
                return '#FF9F00';
                break;
            case 3:
                return '#FF6200';
            default:
                return '#FF6200';
                break;
        }
    }
    static activeColor(){
        return '#FFEBCC';
    }
}

let tiles = {}

//每个小方块
class Tile{
    static get(color){
        if(!tiles[color]){
            tiles[color] = new Tile(color);
        }
        return tiles[color];
    }
    constructor(color){
        this.color = color || ColorPicker.random()
    }
}


//生成矩阵
const buildMatrix = function(rows,cols,val){
    let array = new Array(rows);
    for(let i=0;i<rows;i++){
        array[i] = new Array(cols);
        for(let j=0;j<cols;j++){
            if(val){
                //是否有回调
                array[i][j] = typeof(val)==='function'?val(i,j,array):val
            }else{
                array[i][j] = null
            }
        }
    }
    return array;
}

const buildMainMatrix = function(rows,cols,val){
    let array = new Array(rows)
    for(let i=0;i<rows;i++){
        array[i] = new Array(cols)
        for(let j=0;j<cols;j++){
            if(i===rows-1||i === rows-2 ){
                array[i][j] = '-1'
            }else if(j===0||j===1||j===cols-1||j===cols-2){
                array[i][j] = '-2'
            }else{
                if(val){
                    //是否有回调
                    array[i][j] = typeof(val)==='function'?val(i,j,array):val
                }else{
                    array[i][j] = null
                }
            }
        }
    }
    return array;
}

//方块对象
class Tetris{
    constructor(matrix,color) {
        this.data = Tetris.clone(matrix);
        this.color = color || ColorPicker.random();
        this.row = this.col = 0
    }
    //随机获取一种方块的形状
    static getMatrix(){
        let shape = parseInt(Math.random()*shapes.length)
        return shapes[shape];
    }
    //克隆一个新的矩阵
    static clone(matrix){
        return buildMatrix(matrix.length,matrix[0].length,(i,j)=>{
            return matrix[i][j]
        })
    }

    //随机获取一种方块的对象
    static random(){
        let tetris = new Tetris(Tetris.getMatrix());
        let turn = parseInt(4 * Math.random());
        for(let i = 0;i<turn;i++){
            tetris.turn();
        }
        return tetris;
    }

    //获取指定的形状
    static shape(i){
        return shapes[i];
    }

    //获取形状的总数
    static shapeCount(){
        return shapes.length;
    }

    // * 设置位置
    setPos(row,col){
        this.row = row;
        this.col = col;
    }

    //获取传入的行列值对应位置的tile
    getTile(row,col){
        if(this.data[row][col]!=='0')
            return Tile.get(this.color);
        return null;
    }


    // * 当前宽度是传入方块的高度，用于旋转
    width(){
        // console.log(this.data)
        // console.log(this.data[0].length)
        return this.data[0].length;
    }
    
    // * 当前高度是传入方块的宽度，用于旋转
    height(){
        return this.data.length;
    }

    //顺时针旋转
    clockwise(){
        let w = this.width(),h = this.height();
        //w是之前的列数，h是之前的行数
        //用之前的列数对应当前的行数
        //用之前的行数对应到当前的列数
        
        if((w===1&&h===4)||(w===4&&h===1)){
            let preData = buildMatrix(4,4)
            let nextData = buildMatrix(4,4)
            if(w===4){
                for(let i=0;i<4;i++){
                    for(let j=0;j<4;j++){
                        if(i===1){
                            
                            preData[1][j] = this.data[0][j];
                        }else{
                            preData[i][j] = '0'
                        }
                        
                    }
                    
                }
                for(let row = 0;row < 4;row++){
                    for(let col = 0;col < 4;col++){
                        nextData[col][3-row] = preData[row][col]
                        // console.log(col,3-row)
                         /*顺时针旋转规则：
                            当前的行数等于之前的列数
                            当前的列等于之前的总行数-之前的列数
                        */
                    }
                }
              
                return nextData;
            }
            if(w===1){
                
                for(let i=0;i<4;i++){
                   for(let j=0;j<4;j++){
                       if(j === 2){
                            preData[i][2] = this.data[i][0]
                       }else{
                            preData[i][j] = '0'
                       }
                   }
                }
                // console.log(preData)
                for(let row = 0;row < 4;row++){
                    for(let col = 0;col < 4;col++){ 
                        nextData[col][3-row] = preData[row][col]
                         /*顺时针旋转规则：
                            当前的行数等于之前的列数
                            当前的列等于之前的总行数-之前的列数
                        */
                    }
                }
                // console.log(nextData)
                return nextData;
            }

        }
        
        let nextData = buildMatrix(w,h);
        for(let row = 0;row < h;row++){
            for(let col = 0;col < w;col++){
                nextData[col][h-1-row] = this.data[row][col]
                 /*顺时针旋转规则：
                    当前的行数等于之前的列数
                    当前的列等于之前的总行数-之前的列数
                */
            }
        }
        return nextData;
    }

    //逆时针旋转规则
    anticlockwise(){
        let w = this.width(),h = this.height();
        let nextData = buildMatrix(w,h)
        for(let row = 0;row < h;row++){
            for(let col = 0;col < w;col++){
                nextData[w-1-col][row] = this.data[row][col]
            }
        }
        return nextData;
    }

    //旋转
    turn(clockwise,rows,cols){
        // ? 还有疑问
        if(this.col + this.height() > cols || this.row + this.width() > rows)
            return null
        
        let nextData = clockwise?this.clockwise():this.anticlockwise()
        let w = this.width(),h = this.height()
        
        // if(clockwise){
        //     if((w===4&&h===1)||(w===1||h===4)){
        //         if(w===4){
        //             this.col+=2
        //             this.row-=1
        //         }else if(w===1){
        //             this.row+=2
        //             this.col-=2
        //         }
                
        //     }
        // }else{
        //     if((w===4&&h===1)||(w===1||h===4)){
        //         if(w===4){
        //             this.col+=1
        //             this.row-=1
        //         }else if(w===1){
        //             this.row+=1
        //             this.col-=2
        //         }
                
        //     }
        // }

        
        let result = {
            before : this.data,
            after:nextData
        }
        this.data = nextData;
        return result;
    }
}

//画布区域
class Grid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:props.data
        };
    }
    componentDidUpdate() {
        
        let context = this.refs.canvas.getContext('2d');
        context.clearRect(0,0,this.refs.canvas.width,this.refs.canvas.height)
        let tile = null;
       
        if(this.state.data && this.state.data.length && this.state.data[0].length){
            // console.log(this.state.data)
            for(let row = 0;row < this.state.data.length-2;row++){
                for(let col = 0;col < this.state.data[row].length;col++){
                    // if(col===0||col===1||col===this.state.data[row].length-1||this.state.data[row].length-1-2){
                    //     continue
                    // }
                    tile = this.state.data[row][col];
                    if(tile == null) continue;
                    context.fillStyle = tile.color;
                    context.fillRect(
                        (col-2) * TileWidth,
                        row * TileHeight,
                        TileWidth-TilePadding,
                        TileHeight-TilePadding
                    )
                    //绘制图形的四个参数依次为：相对右上角的x坐标，相对左上角的x坐标，宽度，高度
                }
            }
        }

        // ? 还有疑问
        if(this.state.active){
            // console.log(this.state.active)
            context.fillStyle = ColorPicker.activeColor();
            for(let row = 0;row < this.state.active.height();row++){
                for(let col = 0;col < this.state.active.width();col++){
                    tile = this.state.active.getTile(row,col);
                    
                    // console.log(tile)              
                    if(tile){
                        context.fillStyle = tile.color;
                        context.fillRect(
                            (this.state.active.col-2+col)*TileWidth,
                            (this.state.active.row+row)*TileHeight,
                            TileWidth - TilePadding,
                            TileHeight - TilePadding
                        )
                    }
                }
            }
        }
    }

    render() {
        //创建canvans元素
        return React.createElement('canvas',{
            ref : 'canvas',
            width:(this.props.cols-4) * TileWidth,
            height: (this.props.rows-2) * TileHeight
        })
    }
}

export default Grid;
export {Tile, Tetris, buildMatrix,buildMainMatrix};