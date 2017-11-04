import React, { Component } from 'react';

import './Game.less'
import Grid,{Tile, Tetris, buildMatrix,buildMainMatrix} from './Grid';
import AI from './AI'

class Game extends Component {
    constructor(props) {
        super(props);
        this.rows = props.rows || 22;  //行数
        this.cols = props.cols || 14;  //列数
        this.state = {
            total:0,
            score:0,
            data:buildMainMatrix(this.rows,this.cols),
            gameover:''
        };

        this.timer_input = null
        this.interval_input = 500;

        this.enableKeyboard = true
        this.interval_ai = 1;
        this.useAI = false
 
        let aiSeed = {
            alpha:-0.03702270705799994,
            beta:-0.12705154760967602,
            gama:-0.15218776708445955,
            delta:-0.027255935907477033
        }

        this.ai = new AI(aiSeed.alpha,
                        aiSeed.beta,
                        aiSeed.gama,
                        aiSeed.delta)
        this.ai.seed = aiSeed
        
        this.aiAction = [];

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
    //新建方块
    dropNew = ()=>{
        if(this.status <= 0){
            return ;
        }
        console.log("new")
        let next = this.setPreviewPosition(Tetris.random());
        let active = this.state.next?this.setNewTetrisPosition(this.state.next):this.setNewTetrisPosition(Tetris.random());
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
        if(this.status === 0){
            return ;
        }
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
                }else if(r && this.useAI){
                    this.setState({
                        data:this.state.data,
                        active: this.state.active,
                        total: this.state.total,
                        score: this.state.score
                    });
                    this.refs.main.setState({
                        data: this.state.data,
                        active: this.state.active
                    });
                    this.refs.preview.setState({
                        active: this.state.next
                    });
                    window.setTimeout( this.aiStep.bind(this), this.interval_ai);
                    return;
                }
                break;
            case 0x26: //up anticlockwise
                r = this.state.active.turn(false,this.rows,this.cols);

                if(r && Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(true, this.rows, this.cols);
                }
                
                break;
            case 0x28: //down clockwise
                r = this.state.active.turn(true, this.rows, this.cols);
                // console.log(r)
                // console.log(this.state.active)
                if(r && Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(false, this.rows, this.cols);
                }
                break;
            
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
        
 
        let bottom = this.state.active.row + this.state.active.height();
   
        if(bottom <= this.rows){

    
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
                    && tetris.getTile(row,col) !== null
                    )){ 
                        
                        return true;
                }
            }   
        }
        return false;
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
    isFullLine(matrix,line,cols){
        for(let i=0;i<cols;i++){
            if(matrix[line][i] == null||matrix[line][i]=='-1'){
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
        for(let col=0;col<this.state.data[0].length;col++){
            if(col===0||col===1||col===this.state.data[0].length-1||col===this.state.data[0].length-2){
                this.state.data[0][col] = '-2'
            }else{
                this.state.data[0][col] = null
            }
           
        }
    }

    gameover=()=>{
        this.setState({
            gameover:'游戏结束！' 
        })
        this.status = 0     
        if(this.timer_ai) window.clearTimeout(this.timer_ai);
        if(this.timer_input) window.clearTimeout(this.timer_input);
        this.timer_ai = this.timer_input = null;
        let state = this.state;
        if(this.props.onGameOver){
            this.props.onGameOver.call(this, state);
        }
    }
    aiStep(){
        if(this.timer_ai){
            window.clearTimeout(this.timer_ai)
        }
        this.timer_ai = null;
        if(this.aiAction.length === 0){
            this.aiAction = this.ai.think(this);
            // console.log(this.aiAction)
        }
        let step = this.aiAction.shift();
        // console.log(step)
        if(step && step.code){
            this.doAction(step.code);
        }

        if(this.aiAction.length>0){
            // console.log(this.aiAction.length)
            // console.log(this.aiAction)
            this.timer_ai = window.setTimeout(this.aiStep.bind(this),
            this.interval_ai)
        }else{
            console.log("NO")
            this.doAction(0x20)
        }
        
    }
    automation=()=>{
        if(this.status === 1){ //变为AI
            if(this.timer_input){
                window.clearTimeout(this.timer_input);
                this.timer_input = null;
            }
            this.status = 2
            this.useAI = true
            this.aiStep();
        }else if(this.status === 2 && this.useAI){ //变为手动
            if(this.timer_ai){
                window.clearTimeout(this.timer_ai);
            }
            this.status = 1
            this.useAI = false
            this.autoDrop();
        }
    }



    handleStartBtn=()=>{
        window.location.reload()
    }
    handlePauseBtn=()=>{
        console.log(this.status)
        if(this.status === 1){
            this.status = 0
            if(this.timer_input){
                window.clearTimeout(this.timer_input);
            }
        }else if(this.status === 0){
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
                <Grid rows={10} cols={10} ref="preview"/>
                
                </div>
                <div className="gameover">
                    {this.state.gameover}
                </div>
               
                
                <Grid rows={this.rows} cols={this.cols} ref="main"/>
                <div className="btn_table">
                    <span className="btn_pause" onClick={this.handleStartBtn}>重置</span>
                    <span className="btn_pause" onClick={this.handlePauseBtn}>暂停</span>
                </div>
                
                <div className="btn" onClick={this.automation}>AI控制</div>
            </div>
        );
    }



    

}

export default Game;