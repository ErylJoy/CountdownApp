import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as cloneDeep from 'lodash/cloneDeep'; 
import axios from 'axios';





function NumHolder(props) {
    return (
        <button className="number" onClick={props.onClick}>
            {props.value}
        </button>
    )
}

function LevelHolder(props) {
    let numberLabels = [];
    for(let i = 0; i < props.numbers.length; i++){
        numberLabels.push(<label key={i}>{props.numbers[i]}, </label>);
    }
    return (
        <div>
            <label>User: {props.user} </label><br/>
            <label>Target: {props.theNumber} </label><br/>
            The Numbers: {numberLabels}<br/>
            <button onClick={props.onClick}>Load</button>
        </div>
    )
}



  function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

function initiate(sec) {
    var fiveMinutes = sec,
        display = document.querySelector('#time');
    startTimer(fiveMinutes, display);
};

class Game extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            theNumber: null,
            numbers: [],
            numButtons: [],
            solution: "",
            numberIsNext: true,
            numOne: null,
            numTwo: null,
            symbol: null,
            history: null,
            small: [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],
            big: [25,50,75,100],
            resetState: null,
            levels: null,
        };
        
    }

    componentWillMount() {
        window.addEventListener('load', () => {this.getLevels()});
     }

    renderNumHolder(i){
        return(<NumHolder 
                value={this.state.numbers[i]}
                onClick={()=>{this.handleNumClick(i)}} />);
    }

    buildNumButtons(nums){
        const numButtons = [];
        console.log(nums);
        for (let i = 0; i<nums.length; i++){
            numButtons.push(<button key={i} className="Number" onClick={()=>{this.handleNumClick(i)}}>{nums[i]}</button>)
        }
        return numButtons;
    }

    handleLoadClick(i){
        console.log(i);
        this.setState({
            theNumber: this.state.levels[i].theNumber,
            numbers: this.state.levels[i].numbers,
            numButtons: this.buildNumButtons(this.state.levels[i].numbers),
            solution: "",
            numberIsNext: true,
            numOne: null,
            numTwo: null,
            symbol: null,
            history: null,
            small: [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],
            big: [25,50,75,100],
            resetState: null,
        });
         initiate(30);
    }



    createLevels(newLevels){
        let levels = [];
        for(let i = 0; i<newLevels.length; i++){
            console.log(i)
            levels.push(<LevelHolder key={i} onClick={() =>{this.handleLoadClick(i)}} user={newLevels[i].user} numbers={newLevels[i].numbers} theNumber={newLevels[i].theNumber} />);
        }
        return levels;
    }

    getLevels(){
        axios({
            method: 'post',
            url: 'http://81.136.166.64:4000/get',

            headers: {
                'Content-Type': 'application/json'

            },
        }).then((response) => {
                console.log(response.data);
                this.setState({
                    levels: response.data,
                    levelHolders: this.createLevels(response.data),
                });
            }); 
            this.createLevels(3)             
    }   

    handleNumClick(i){
        if(this.state.theNumber){
            this.recordHistory();
            if (this.state.numbers[i] && this.state.numberIsNext){
                const solution = this.state.solution + this.state.numbers[i];
                const numbers = this.state.numbers;
                const number = numbers[i];
                numbers.splice(i, 1);
                console.log(this.state.numTwo);
                if (!this.state.numOne){
                    this.setState({
                        numberIsNext: false,
                        numButtons: this.buildNumButtons(numbers),
                        solution: solution,
                        numbers: numbers,
                        numOne: number,
                        numOnePos: i,
                    });
                }else if(!this.state.numTwo){
                    this.setState({
                        numberIsNext: true,
                        numButtons: this.buildNumButtons(numbers),
                        solution: solution,
                        numbers: numbers,
                        numTwo: number,
                        numTwoPos: i,
                    });
                    
                }
                
            }
    }
    }



    createNewNumber(){
        if(this.state.numTwo){
            this.recordHistory();
            let value;
            switch(this.state.symbol){
                case '+':
                    value = this.state.numOne + this.state.numTwo;
                    break;
                case '-':
                    value = this.state.numOne - this.state.numTwo;
                    break;
                case '*':
                    value = this.state.numOne * this.state.numTwo;
                    break;
                case '/':
                    if(this.state.numOne % this.state.numTwo === 0){
                        value = this.state.numOne / this.state.numTwo;
                        break;
                    }
                    alert("illegal action")
                    const numbers = this.state.numbers;
                    numbers.push(this.state.numOne);
                    numbers.push(this.state.numTwo);
                    this.setState({
                        numbers:numbers,
                        numButtons: this.buildNumButtons(numbers),
                        numOne: null,
                        numTwo: null,
                        symbol: null,
                    })
                    return;
                default:
                    alert("Something broke");
                    break;
            }
            const numbers = this.state.numbers;
            numbers.push(value);
            
            this.setState({
                numOne: null,
                numTwo: null,
                symbol: null,
                numbers: numbers,
                numButtons: this.buildNumButtons(numbers),
            });

            if (value === this.state.theNumber){
                alert("Winner! \nPress restart to go again!");
            }else if(numbers.length ===1){
                alert("Well you messed up :/\nPress restart to go again!\nBe better this time");
            }
        }
    }

    recordHistory(){
        let newState = cloneDeep(this.state);;
        this.setState({
            history: newState,
        });
    }

    handleSymClick(c){
        this.recordHistory();
        if(!this.state.numberIsNext){
            const solution = this.state.solution + c;
            this.setState({
                solution: solution,
                numberIsNext: true,
                symbol: c,
            });
        }
    }

    handleUndoClick(){
        this.setState(this.state.history);
    }

    saveLevel(){
        if(this.state.theNumber){    
            axios({
                method: 'post',
                url: 'http://81.136.166.64:4000/save',
                data: {
                    username: 'temp',
                    numbers: this.state.numbers,
                    theNumber: this.state.theNumber,
                },
                headers: {
                    'Content-Type': 'application/json'

                },
            });
        }
    }

    reset(){
        this.setState({
            theNumber: null,
            numbers: [],
            numButtons: [],
            solution: "",
            numberIsNext: true,
            numOne: null,
            numTwo: null,
            symbol: null,
            history: null,
            small: [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10],
            big: [25,50,75,100],
            resetState: null,
        });
    }

    handleNewNumberClick(small){
        if(!this.state.theNumber && this.state.numbers.length !== 6){
            this.recordHistory();
            const numbers = this.state.numbers;
            const little = this.state.small;
            const big = this.state.big;
            let i;
            if(numbers.length<6){     
                if(small){
                    i = Math.floor(Math.random()*little.length);
                    numbers.push(little[i]);
                    little.splice(i, 1);
                }
                else{
                    console.log(big);
                    if(big.length>0){
                        i = Math.floor(Math.random()*big.length);
                        numbers.push(big[i]);
                        big.splice(i, 1);
                    }else{
                     alert("no more big numbers");
                     return;
                    }
                }
            }
            this.setState({
                numbers: numbers,
                numButtons: this.buildNumButtons(numbers),
                big: big,
                small: little,
            });
        }
    }
    

    render(){
        return(
        <div className="page">

            <div className="Game">
        
        
                <div className="Initialisation">
                    <button className="NewNumberButton" onClick={() => this.handleNewNumberClick(false)}>Large</button>
                    <button className="NewNumberButton" onClick={() => this.handleNewNumberClick(true)}>Small</button>
                    <br/>

                    <div className="TheNumbers">
                        {this.state.numButtons}
                    </div>
                    <div className="TheOperators">
                        <button className="Operator" onClick={() => this.handleSymClick('+')} >
                            +
                        </button>
                        <button className="Operator"  onClick={() => this.handleSymClick('-')}>
                            -
                        </button>
                        <button className="Operator" onClick={() => this.handleSymClick('*')}>
                            *
                        </button>
                        <button className="Operator" onClick={() => this.handleSymClick('/')}>
                            /
                        </button>
                    </div>
                </div>
                <div className="TargetTimerHolder">
                    <div id="time"></div>
                    <div className="TheNumber">
                        {this.state.theNumber || " "}
                    </div>
                    <button className="GenerateTarget" onClick={() => {
                            if(this.state.numbers.length === 6 && !this.state.theNumber){
                                this.setState({ theNumber: Math.round(Math.random()*1000), 
                                                history: null,
                                            }, () => {this.setState({resetState: cloneDeep(this.state),});});
                                            console.log("aa");
                                initiate(30);
                            }
                        }}
                        >
                            Generate Target
                        </button>
                

                    <div className="SolutionHolder">
                        <label className="Solution">
                            {((String(this.state.numOne|| " "))+ (this.state.symbol|| " ") + String(this.state.numTwo|| " "))}
                        </label>
                    </div>
                    <button className="Equals" onClick={() => this.createNewNumber()}>Equals</button>
                    <br/>
                    <button className="Undo" onClick={() => this.handleUndoClick()} >Undo</button>
                </div>

                <div className="Tools">
                        <button className="ToolButton" onClick={() => {if(this.state.resetState){ this.setState(this.state.resetState)}}} >Restart</button>
                        <br/>
                        <button className="ToolButton" onClick={() => this.reset()} >Reset</button>
                        <br/>

                        <button className="ToolButton" onClick={() => this.saveLevel()}>Save</button>

                
                </div>
                
            </div>
            
            <div className="levels">{this.state.levelHolders}</div>
        
        </div>
        )
    }

}


ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  