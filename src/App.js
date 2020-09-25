import React from 'react';
import './App.scss';
import shuffle from 'shuffle-array';
import { Button } from '@blueprintjs/core';
import UIfx from 'uifx';
import { useSpring, animated } from 'react-spring';

import { categories } from './utils.js';

import Buzzer from './audio/buzzer.mp3';
import Ticking from './audio/ticking.mp3';
import Gunshot from './audio/gunshot.mp3';
import Breath from './audio/breath.mp3';
import Breath2 from './audio/breath2.mp3';
import Swell from './audio/swell.mp3';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            categories: shuffle(categories),
            list: [],
            showLetters: false,
            allLetters: [],
            currentLetter: null,
            timer: 22,
            timerActive: false,
        };

        this.buzzer = new UIfx(Buzzer);
        this.ticking = new UIfx(Ticking);
        this.gunshot = new UIfx(Gunshot);
        this.breath = new UIfx(Breath, { volume: 0.6 });
        this.breath2 = new UIfx(Breath2, { volume: 0.7 });
        this.swell = new UIfx(Swell);
    }

    componentDidMount() {
        const { allLetters } = this.state;
        for (let i = 0; i < 26; i++) {
            allLetters.push({
                letter: (i + 10).toString(36),
                selected: true,
            });
        }
        this.setState({ allLetters });
    }

    generateList = () => {
        this.setState(prevState => {
            const newCategories = prevState.categories;
            const list = newCategories.splice(0, 6);
            return {
                list,
                categories: newCategories,
            };
        });
    }

    toggleLettersView = () => {
        this.setState(prevState => {
            return {
                showLetters: !prevState.showLetters
            }
        });
    }

    newCategory = category => {
        this.setState(prevState => {
            const list = prevState.list;
            const newCategories = prevState.categories;
            const newCategory = newCategories.pop();
            const changeIndex = list.findIndex(cat => cat === category);
            list[changeIndex] = newCategory;
            return {
                list,
                categories: newCategories,
            }
        });
    }

    selectLetter = letter => {
        const { allLetters } = this.state;
        const letterIndex = allLetters.findIndex(l => l.letter === letter);
        allLetters[letterIndex].selected = !allLetters[letterIndex].selected;
        this.setState({ allLetters });
    }

    rollLetter = () => {
        const { allLetters } = this.state;
        const validLetters = allLetters.filter(l => l.selected);
        shuffle(validLetters);
        this.setState({ currentLetter: validLetters[0].letter.toUpperCase() });
    } 

    toggleTimer = () => {
        const { timerActive } = this.state;
        if (timerActive) {
            this.setState({ timer: 90, timerActive: false }, () => { clearInterval(this.timer) });
        } else {
            this.startTimer();
        }
    }

    startTimer = () => {
        const { currentLetter, list } = this.state;
        if (!list.length) {
            alert('No categories displayed!');
            return;
        }

        if (!currentLetter) {
            alert('No letter selected!');
            return;
        }

        this.setState({ timerActive: true });
        this.gunshot.play();

        this.timer = setInterval(() => {
            if (this.state.timer) {
                if (this.state.timer === 1)
                    this.buzzer.play();

                if (this.state.timer === 18)
                    this.ticking.play();

                if (this.state.timer > 1 && this.state.timer < 10){
                    if (this.state.timer % 2) {
                        this.breath.play();
                    } else {
                        this.breath2.play();
                    }
                }

                if (this.state.timer === 6)
                    this.swell.play();

                this.setState(prevState => {
                    return {
                        timer: prevState.timer - 1
                    }
                });
            } else {
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer = () => {
        clearInterval(this.timer);
        this.setState({ timerActive: false, timer: 90 });
    }

    render() {
        const { list, showLetters, allLetters, currentLetter, timer, timerActive } = this.state;
        return <div className="App">
            <h1>SCATTERGORIES</h1>
            <Button onClick={this.toggleLettersView} text='Toggle Letters' className='bp3-large bp3-fill' />
            {showLetters && <div className='Letters'>
                {allLetters.length && allLetters.map(l => <div key={l.letter} onClick={() => this.selectLetter(l.letter)} className={`Letter ${l.selected ? '' : 'nah'}`}>
                    <span>{l.letter.toUpperCase()}</span>
                </div>)}
            </div>}
            <Button onClick={this.generateList} text='Generate Categories!' className='bp3-intent-primary bp3-large bp3-fill' />
            {!!list.length && <ul className='Categories'>
                {list.map(cat =><li key={cat}>{cat}<Button text='Replace' className='bp3-intent-danger' onClick={() => this.newCategory(cat)} /></li>)}
            </ul>}
            <Button onClick={this.rollLetter} text='Gimme a Letter!' className='bp3-large bp3-fill bp3-intent-primary' />
            {currentLetter && <div className='CurrentLetter'>
                {currentLetter}
            </div>}
            <Button onClick={this.toggleTimer} text={timerActive ? 'Reset Timer' : 'Start Timer!'} className='bp3-large bp3-fill bp3-intent-success' />
            {timerActive && <Timer timer={timer} />}
        </div>;
    }   
}

const Timer = props => {
    const styles = useSpring({
        config: {
            duration: 900
        },
        opacity: 0,
        from: {
            opacity: 1
        },
        reset: true
    });

    return <animated.div className={`Timer ${props.timer < 18 ? 'hurry' : ''}`} style={styles}>
        {props.timer || 'X'}
    </animated.div>;
}

export default App;
