//TODO: HUGE bug when creating a game -> game wont load, page needs to be closed


var ref = firebase.database().ref("/rooms");
var STATE = {OPEN: 1, JOINED: 2, CLOSED: 3};  //not sure what state does
gameList = document.querySelector("#gameList ul");
var user;

//need this function because if you put auth stuff outside a function,
//it gets called right when the page loads which makes it not work
function getUser(){
  user = firebase.auth().currentUser;
}

//Creates all the firebase values to what they should be for when a room is
//started.  firebase docs are in the readme
function createGame(){
    getUser();
    var joinName = $('#roomName').val();
    var userId = user.uid;
    var userEmail = user.email;
    firebase.database().ref('rooms/' + joinName).set({
      hostuid: userId,
      roomName: joinName,
      //room state can be either waiting (if in waiting room) or ongoing
      state: "waiting"
    });
    firebase.database().ref('rooms/'+joinName+'/players/'+userId).set({
      role: "unassigned",
      uid: userId,
      name: userEmail,
      isHost: true,
      isAlive: true,
      dayKillVote: "none",
      usedAbility: true,
      guarded: false
    });
    //redirects to main after everything is initalized
    window.location.href='main.html';
}

//helper function for joinGameList
function gameListGen(s){
  var gameList = document.getElementById('gameList');
  for(x in s){
    var item = document.createElement("li");
    item.innerHTML = '<button id = "gameList">' +JSON.stringify(x)+'</button>';
    gameList.appendChild(item);
  }
}

//not currently in use, but would like to inclued buttons to join rooms
//the player is already in so they dont have to memorize room names.
function joinGameList(){
  var dbRef = firebase.database().ref().child('rooms');
  dbRef.on('value', function(snapshot){
    gameListGen(snapshot.val());
  });
  var item = document.createElement("li");
}

//creates a list with all the names of rooms, helper function for joinGame
function listOfNames(s){
  var r = [];
  for(x in s){
    r.push(JSON.stringify(x).substring(1,JSON.stringify(x).length-1));
  }
  return r;
}

//uses REST API to return the json file with all of firebase in it
function getJson(){
  var xhttp = new XMLHttpRequest();

  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET","https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  return response;
}

//gets called by join game button.
function joinGame(){
  getUser();
  //a reference to all the cildren of rooms (the different rooms)
  var dbRef = firebase.database().ref().child('rooms');
  var l = [];
  var input = $('#joinGameTextfield').val();
  var all = getJson();
  //not using listener proproties, this should just be called every time it runs
  //through the method
  dbRef.on('value', function(snapshot){
    l = listOfNames(snapshot.val());
    if(l.indexOf(input)<0){
      //cant find room in list
      console.log(l.indexOf(input));
      $('#nonexistingRoom').text("This room does not exist");
    }else{
      //TODO: check if user is in users, add them if they are not
      //make current room their room
      alert("set");
      firebase.database().ref('users/'+user.uid).update({
        room: input
      });

      if(all.users[user.uid].alias == null){
        userAlias = $('#nameForm').val();
        firebase.database().ref('users/'+user.uid).update({
          alias: userAlias
        });
      }
      //this else checks if a player is already in the room, and adds them
      //if the user isn't

      var found = false;
      for(i in all.rooms[input].players){
        if(user.uid == all.rooms[input].players[i].uid){
          found = true;
          alert("already member");
          console.log("already member of room");
          window.location.href='main.html';
        }
      }
      if(!found){
        //didnt find player, add them to room
        if(all.rooms[input].state == "waiting"){
          firebase.database().ref('rooms/'+input+'/players/'+user.uid).set({
            role: "unassigned",
            uid: user.uid,
            name: user.email,
            isHost: false,
            isAlive: true,
            dayKillVote: "none",
            usedAbility: true,
            guarded: false
          });
          window.location.href='main.html';
        }else{
          $('#nonexistingRoom').text("Can't join a room when the game is in session");
        }

      }


    }
  });
}
