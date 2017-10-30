import React, { Component } from 'react';
import {render} from 'react-dom'

import './index.less'
import Game from './components/Game'

class App extends Component {
    render() {
        return (
            <div>
                <h1>Tetris With AI</h1>
                <Game/>
            </div>
        );
    }
}


render( <App/> , document.getElementById('app'));