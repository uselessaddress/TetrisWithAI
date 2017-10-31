import React, { Component } from 'react';

import './Game.less'
import Grid,{Tile, Tetris, buildMatrix} from './Grid';

class Game extends Component {
    constructor(props) {
        super(props);
        this.rows = props.rows || 20;  //行数
        this.cols = props.cols || 15;  //列数
        this.state = {
            total:0,
            score:0,
            data:buildMatrix(this.rows,this.cols,null),
            gameover:''
        };

        this.timer_input = null
        this.interval_input = 500;
        this.status = 1; // 0: pause, 1: running, -1: game over
    }

    componentDidMount() {
        document.onkeydown = this.keydown.bind(this)
        this.status = 1;
        this.dropNew();
    }
    setPreviewPosition = (tetris)=>{
        tetris.setPos(
            (this.refs.preview.props.rows - tetris.height())>>1,
            (this.refs.preview.props.cols - tetris.width())>>1
        );
        return tetris;
    }

    setNewTetrisPosition = (tetris)=>{
        tetris.setPos(
            0,(this.refs.main.props.cols - tetris.width())>>1
        )
        return tetris;
    }
    componentDidUpdate() {
       
    }
    //新建方块
    dropNew = ()=>{
        if(this.status <= 0){
            return ;
        }
        console.log("new")
        let next = this.setPreviewPosition(Tetris.random());
        let active = this.state.next?this.setNewTetrisPosition(this.state.next):this.setNewTetrisPosition(Tetris.random());
        console.log(active)
        this.setState({
            active:active,
            next:next
        })
        this.refs.preview.setState({
            active:next
        })
        this.refs.main.setState({
            data:this.state.data,
            active: active
        });
        if(this.timer_input == null){
            this.timer_input = window.setTimeout(this.autoDrop.bind(this),this.interval_input)
        }
        
        
    }
    
    autoDrop(){
        this.keydown({
            keyCode: 0x20
        });
    }
    //按下键
    keydown(event){
        switch(event.keyCode){
            case 0x25:
            case 0x27:
            case 0x26:
            case 0x28:
                break;
            case 0x20:
                if(this.timer_input){
                    window.clearTimeout(this.timer_input);
                    this.timer_input = null;
                }
                break;
            default:
                return;
        }
        // console.log(this.state.active)
        this.doAction(event.keyCode);
        if(this.timer_input == null) this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);
    }
   

    //按下键触发的相应事件
    doAction=(keyCode)=>{
        // console.log(this.state.active)
        let r = null
        switch(keyCode){
            case 0x25: //left
                this.moveActiveLeft();
                break;
            case 0x27: //right
                this.moveActiveRight();
                break;
            case 0x20: //speed up
                // console.log('down')
                r = this.moveActiveDown();
                if(r == null){
                    this.gameover()
                }else if(r === false){
                    this.merge(this.state.active);
                    this.state.score += this.clear();
                    this.state.total ++;
                    this.dropNew()
                }
                
                
                break;
            case 0x26: //up anticlockwise
                this.state.active.turn(false,this.rows,this.cols);
                break;
            case 0x28: //down clockwise
                this.state.active.turn(true,this.rows,this.cols)
        }

        this.setState({
            data:this.state.data,
            active:this.state.active,
        })
        this.refs.main.setState({
            data:this.state.data,
            active:this.state.active
        })
        // if(this.timer_input == null) this.timer_input = window.setTimeout(this.autoDrop(), this.interval_input);
    }

    moveActiveLeft(){
        if(this.state.active.col>0){
            this.state.active.col --;
            if(Game.testCollsion(this.state.data,this.state.active)){
                this.state.active.col ++;
                return false;
            }
            return true;
        }
        return false;
    }

    moveActiveRight(){
        if(this.state.active.col+this.state.active.width()<this.cols){
            this.state.active.col++;
            if(Game.testCollsion(this.state.data,this.state.active)){
                this.state.active.col --;
                return false;
            }
            return true;
        }
        return false;
    }

    moveActiveDown = ()=>{
        // console.log(this.state.active)
        let bottom = this.state.active.row + this.state.active.height();
        // console.log(bottom,this.rows)
        if(bottom <this.rows){
            this.state.active.row++
            if(Game.testCollsion(this.state.data,this.state.active)){
                this.state.active.row --;
                if(Game.testCollsion(this.state.data,this.state.active)){
                    return null;
                }
                return false;
            }
            return true
        }else{
            return false
        }
    }

    merge(tetris){
        if(tetris.height()+tetris.row > this.state.data.length){
            return ;
        }
        for(let i = 0 ;i<tetris.height();i++){
            for(let j = 0; j < tetris.width();j++){
                if(this.state.data[i+tetris.row][tetris.col+j] == null){
                    this.state.data[i+tetris.row][tetris.col+j] = tetris.getTile(i,j)
                }
            }
        }
    }

    //碰撞测试
    static testCollsion(matrix,tetris){
        for(let row = 0;row < tetris.height(); row++){
            for(let col = 0;col < tetris.width();col++){
                if((tetris.row + row >= matrix.length)
                    ||(tetris.col + col >= matrix[0].length)
                    ||(matrix[tetris.row + row][tetris.col + col] !== null
                    && tetris.getTile(row,col) !== null)){
                        return true;
                }
            }   
        }
        return false;
    }

    isFullLine(matrix,line,cols){
        for(let i=0;i<cols;i++){
            if(matrix[line][i] == null){
                return false;
            }
        }
        return true
    }

    clearLine(line){
        for(let i=line;i>0;i--){
            for(let j=0;j<this.cols;j++){
                this.state.data[i][j] = this.state.data[i-1][j];
            }          
        }
        this.state.data[0].fill(null)
    }
    clear(){
        let count = 0;
        for(let i = 0;i < this.state.active.height();i++){
            if(this.isFullLine(this.state.data,i+this.state.active.row,this.cols)){
                count++;
                this.clearLine(i+this.state.active.row)
            }
        }
        return count;
    }

    gameover=()=>{
        this.setState({
            gameover:'游戏结束！'
        })
        console.log("game over")
        if(this.timer_input){
            window.clearTimeout(this.timer_input);
        }
    }
    handleStartBtn=()=>{
        window.location.reload()
    }
    handlePauseBtn=()=>{
        let status = this.status?0:1
        if(status === 0){
            this.status = 0
            if(this.timer_input){
                window.clearTimeout(this.timer_input);
            }
        }else{
            this.status = 1
            this.timer_input = window.setTimeout(this.autoDrop.bind(this),this.interval_input)
        }
        
       
    }
    render() {
        return (
            <div className = "game_table">
                <div className  = "data_table">
                    <span>Total:{this.state.total}</span>
                    <span>Score:{this.state.score}</span>
                </div>
                <div className="preview">
                <Grid rows={6} cols={6} ref="preview"/>
                
                </div>
                <div className="gameover">
                    {this.state.gameover}
                </div>
               
                
                <Grid rows={this.rows} cols={this.cols} ref="main"/>
                <div className="btn_table">
                    <span className="btn_pause" onClick={this.handleStartBtn}>重置</span>
                    <span className="btn_pause" onClick={this.handlePauseBtn}>暂停</span>
                </div>
                
                <div className="btn">AI控制</div>
            </div>
        );
    }



    

}

export default Game;