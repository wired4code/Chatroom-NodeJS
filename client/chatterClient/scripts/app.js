var app = {
  server: "http://127.0.0.1:3000/classes/chatterbox/",
  username: window.location.search.substr(10),
  // default room which shows messages from all rooms
  room: 'all',
  // used to filter out room repeats in populateRoomList method
  roomList: {},
  // when usernames are clicked they get inserted into the friends array
  friends: {},

  init: function() {},

  send: function(message) {
    $.ajax({
        url: 'http://127.0.0.1:3000/classes/chatterbox/',
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
      success: function (data) {
        console.log('message sent:', data);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
  },

  fetch: function(roomName){
    if (roomName === undefined || app.room === 'all') {
      $.ajax({
        type: 'GET',
        url: "http://127.0.0.1:3000/classes/chatterbox/",
        data: {
          order: '-createdAt',
          limit: 20
        },
        dataType: 'json',
        success: function (data){
          // fetch will be called in setInterval so on each call the chats will be cleared
          $('.chat').empty();
          // new messages will be appended to the .chat div

          //its checking if friend added to friend list is already a friend and will highlight their texts
          _.each(data.results, function(message) {
            if (app.friends[message.username] === message.username) {
              message.friend = true;
            }
            app.addMessage(message);
            });
        },
        error: function(response) {
          console.log("chatterbox: Failed to fetch messages:", response);
        }
      });
      // if fetch is invoked with a roomName parameter
    } else {
      $.ajax({
        type: 'GET',
        url: "http://127.0.0.1:3000/classes/chatterbox/",
        data: {
          // query parse.com for messages with a matching roomname key ONLY
          where: JSON.stringify({roomname: roomName}),
          order: '-createdAt',
          limit: 20
        },
        dataType: 'json',
        success: function (data){
          $('.chat').empty();
          _.each(data.results, function(message) {
            if (app.friends[message.username] === message.username) {
              message.friend = true;
            }
            app.addMessage(message);
          });
        },
        error: function(response) {
          console.log("chatterbox: Failed to fetch messages:", response);
        }
      });
    }
  },

  clearMessages: function(){
    $('.chat').empty();
  },

  addMessage: function(message){
    // html escaping
    message.text = escape(message.text) || escape(message.message);
    // clean up escaped chars before appending
    // downside is no numbers will be displayed in chat
    if (message.text.match(/%|[0-9]+/)) {
      message.text = message.text.replace(/%|[0-9]+/g, ' ');
    }
    // timestamp formatting
    var timeStamp = new Date(message.createdAt);
    var date = timeStamp.getDate();
    var month = ' ' + (timeStamp.getMonth() + 1) + '/';
    var time = timeStamp.toLocaleTimeString();
    if (message.friend) {
      $(".chat").append('<div class="messages"><a href="#" class="username">' + message.username + '</a> ' + month + date + ' at ' + time + '<br><strong>' + message.text + '</strong></div>');
    } else {
      $(".chat").append('<div class="messages"><a href="#" class="username">' + message.username + '</a> ' + month + date + ' at ' + time + '<br>' + message.text + '</div>');
    }
  },

  addRoom: function(roomName){
    $("#roomSelect").append('<option>' + roomName + '</option>');
  },

  // called when page is first loaded on line 192 and fills room dropdown menu
  populateRoomList: function() {
    $.ajax({
      type: 'GET',
      url: app.server,
      // without limit set, default is 100 message objects retrieved
      data: {
        order: '-createdAt',
      },
      dataType: 'json',
      success: function (data){
        var room;
        _.each(data.results, function(msgObj) {
          room = msgObj.roomname;
          // if room hasn't already been added to list
          if (!app.roomList[room]) {
            // it's added and marked
            app.roomList[room] = true;
            // then appended to list
            app.addRoom(room);
          }
        });
      },
      error: function(response){
        console.log("chatterbox: Failed to fetch messages:", response);
      }
    });
  },

  addFriend: function(name){
    if (!app.friends[name]) {
      app.friends[name] = name;
      $(".friends").append('<div>' + name + '</div>');
    }
  },

  handleSubmit: function(message){
    app.send(message);
  }
};

$(document).ready(function() {
  //ADD FRIEND BUTTON
  //This allows us to click on username and add them to
  //our friends array.
  $("body").on('click', '.username', function(e){
    app.addFriend(this.innerHTML);
  });

  //USER SUBMIT MESSAGE BUTTON!
  //this will allow a user to write and submit a message to the chat
  $("body").on('click', '.submitButton', function(e){
    var msg = $('input.submit').val();
    var message = {
      username: app.username,
      text: msg,
      roomname: app.room
    };
    app.handleSubmit(message);
    $('input.submit').val('');
  });

  //NEW ROOM SUBMIT BUTTON
  //this is the button, that allows us to create a new
  //room in the room form and add it to roomSelect
  $("body").on('click', '.addRoom', function(e){
    var room = $('input.roomField').val();
    app.addRoom(room);
    $('input.roomField').val("");
  });

  //SELECT ROOM BUTTON
  $("select").change(function() {
    $('.chat').empty();
    app.room = $(this).val();
    // not sure if code below is working as intended but it's working so ha!
    clearInterval(interval1);
    interval1 = setInterval(function() {
      app.fetch(app.room);
    }, 3000);
  });

  app.populateRoomList();

  // not sure if storing setInterval function in interval1 makes a diff
  // but without storing it and clearing it above (line 185), there would be
  // two setIntervals running when switching to a new room
  var interval1 = setInterval(function() {
    app.fetch();
  }, 3000);
});