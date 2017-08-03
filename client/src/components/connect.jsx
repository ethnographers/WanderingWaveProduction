import React from 'react';
import Signal from './signal.jsx';
import io from 'socket.io-client';
import Waiting from './waiting.jsx';
import Gameboard from './gameboard.jsx';
import ViewBars from './view-bars.jsx';

class Connect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      playButton: false,
      matched: false,
      searching: false,
      name: '',
      serial: '',
      opponent: '',
      player1: '',
      player2: ''

    };
    this.serial = localStorage.getItem('serial') || '';
  }

  componentWillMount() {
    this.socket = io.connect();

    this.socket.on('matched', function({opponent, opponentUserId, key, left}) {

      this.setState({
        matched: true,
        searching: false,
        opponent: opponent,
        opponentUserId: opponentUserId,
        key: key
      });

      localStorage.setItem('left', left);
      if (left) {
        this.setState({
          player1: localStorage.getItem('display'),
          player2: opponent
        });
      } else {
        this.setState({
          player1: opponent,
          player2: localStorage.getItem('display')
        });
      }
    }.bind(this));

    this.socket.on('testConnection', function(currentConnection) {
      console.log('current connection is ', currentConnection);
    });
  }

  handlePlay() {
    this.setState({searching: true});
    this.socket.emit('startPlaying', { name: this.state.name, serial: this.state.serial });
  }

  handleConnect() {

    let serial = document.getElementById('serial').value;
    serial = serial.toUpperCase();


    let name = localStorage.getItem('display')
    localStorage.setItem('serial', serial);

    this.setState({name, serial});

    console.log('time to connect for a stream');
    this.setState({
      connected: true,
      playButton: true
    });

    this.socket.emit('streamConnection', {
      name,
      serial,
      userId: localStorage.getItem('userId')
    });

  }
  render() {
    return (
      <div>
        {!this.state.matched &&
        <div>
          <h3 className='instructions'> Enter a headset number to start a game</h3>
          <input className='serial'
                 id="serial"
                 placeholder="3D62 or 4B9F"
                 defaultValue={this.serial}
          />
          <button onClick={this.handleConnect.bind(this)} disabled={this.state.playButton}>Connect</button>
          <button onClick={this.handlePlay.bind(this)} disabled={!this.state.playButton}>Play</button>
        </div>
        }

        {(this.state.connected && !this.state.matched) && <Signal socket={this.socket} />}
        {this.state.connected && <ViewBars socket={this.socket} matched={this.state.matched} />}

        {(this.state.connected && this.state.searching) && <Waiting />}
        {(this.state.connected && this.state.matched) &&
        <Gameboard opponent={this.state.opponent}
                   opponentUserId={this.state.opponentUserId}
                   position={this.state.key}
                   socket={this.socket}
                   player1={this.state.player1}
                   player2={this.state.player2}
        />}
      </div>
    );
  }
}

export default Connect;
