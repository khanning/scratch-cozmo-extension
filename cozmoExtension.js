// cozmoExtension.js
// Kreg Hanning, October 2016
//
// Cozmo robot Scratch extension

(function(ext) {
  var device = null;
  var connected = false;
  var socket = null;
  var rawData = null;
  var shutdown = false;

  var CMD_SPEAK = 0x01,
    CMD_DRIVE = 0x02,
    CMD_STOP = 0x03,
    CMD_TURN = 0x04,
    CMD_PICKUP_BLOCK = 0x05,
    CMD_SET_BLOCK = 0x06,
    CMD_LOOK = 0x07;

  var startHelperSocket = function() {

    socket = new WebSocket('ws://127.0.0.1:8765');

    socket.onopen = function(event) {
      console.log('socket opened');
      connected = true;
    };

    socket.onclose = function(event) {
      connected = false;
      socket = null;
      if (!shutdown)
        setTimeout(startHelperSocket, 2000);
    };

    socket.onmessage = function(event) {
      console.log(event.data);
    };
  };

  var sendHelper = function(buffer) {
    setTimeout(function() {
      socket.send(buffer);
    }, 0);
  };

  ext.speak = function(data) {
    if (connected)
      socket.send(CMD_SPEAK + "," + data);
  };

  ext.forward = function() {
    if (connected)
      socket.send(CMD_DRIVE + "," + 50);
  };

  ext.reverse = function() {
    if (connected)
      socket.send(CMD_DRIVE + "," + -50);
  };

  ext.stop = function() {
    if (connected)
      socket.send(CMD_STOP);
  };

  ext.turn = function(deg) {
    if (connected) {
      if (deg > 360) deg = 360;
      else if (deg < -360) deg = -360;
      socket.send(CMD_TURN + "," + deg);
    }
  };

  ext.pickupBlock = function() {
    if (connected)
      socket.send(CMD_PICKUP_BLOCK);
  };

  ext.setBlock = function() {
    if (connected)
      socket.send(CMD_SET_BLOCK);
  };

  ext.express = function(ex) {
    if (connected)
      socket.send(CMD_LOOK + "," + ex);
  };

  ext._shutdown = function() {
    shutdown = true;
    socket.close()
    socket = null;
    device = null;
  };

  ext._getStatus = function() {
    if(!connected) return {status: 1, msg: 'Cozmo disconnected'};
    return {status: 2, msg: 'Cozmo connected'};
  }

  var descriptor = {
    blocks: [
      [' ', 'speak %s', 'speak', 'hello'],
      [' ', 'forward', 'forward'],
      [' ', 'reverse', 'reverse'],
      [' ', 'turn %n degrees', 'turn', '90'],
      [' ', 'stop', 'stop'],
      [' ', 'pick up block', 'pickupBlock'],
      [' ', 'set down block', 'setBlock'],
      [' ', 'look %m.emotions', 'express', 'happy'],
    ],
    menus: {
      emotions: ['happy', 'sad', 'shocked']
    },
    url: 'http://scratchx.org'
  };

  ScratchExtensions.register('Cozmo robot', descriptor, ext);

  startHelperSocket();

})({});
