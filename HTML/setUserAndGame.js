var config = {
  apiKey: "AIzaSyBjxttr82927G5x1_C-MPvJRQMYKmQ4d3g",
  authDomain: "spies-dcdf2.firebaseapp.com",
  databaseURL: "https://spies-dcdf2.firebaseio.com",
  projectId: "spies-dcdf2",
  storageBucket: "spies-dcdf2.appspot.com",
  messagingSenderId: "989041921995"
};
firebase.initializeApp(config);
const auth = firebase.auth();
var currUser;
var uid;
var alias;
var currRoom;
var email;
var isHost;
var dbRef = firebase.database().ref().child('rooms');

// currUser = firebase.auth().currentUser;
// uid = currUser.uid;
// alert(uid);

//everything is inside auth listener because all the code relies on knowing what
//user is signed in
auth.onAuthStateChanged(function(user){
  //alert("auth");
  if (user && user != null) {
    uid = user.uid;
    email = user.email;
    $('#currUser').text(user.displayName);
    currUser = user;
  }else{
    //alert("Please sign in first!");
    window.location.href='index.html';
  }
  findRoom();
  makeUserList();

  function findRoom(){
    all = getJson();
    for(i in all.rooms){
      for(x in all.rooms[i].players){
        if(currUser.uid == x){
          currRoom = i;
          alias = all.rooms[i].players[currUser.uid].name;
          isHost = all.rooms[i].players[currUser.uid].isHost;
          $('#currRoom').text("Welcome, "+alias+" you are in room "+i);
        }
      }
    }
    updateAlias();
  }



  function makeUserList(){
    var all = getJson();
    var room = returnRoom();
    for(x in all.rooms[room].players){
      $('#playerList .list').append('<li>'+all.rooms[room].players[x].name+'</li>');
      $('#dayList').append('<input type="radio" name="player">'+all.rooms[room].players[x].name);
      $('#dayList').hide();
    }
    updateAlias();
  }

  updateAlias();

  currRoom = returnRoom();
  alert(currRoom);

  var stateRef = firebase.database().ref('rooms/'+currRoom+'/state');
  //alert("Room is now: "+currRoom);
  stateRef.once('value', function(snapshot){
    //alert(snapshot.val()+", "+currRoom);
    if(snapshot.val()=="waiting"){
      //show waiting elements
      alert("waiting");
      $('#waitingRoom').show();
      $('#dayList').hide();
    }else{
      //hide waiting elements
      $('#waitingRoom').hide();
      $('#dayList').show();
    }
  });

});
function startGame(){
  //TODO: this should set state of game to ongoing
  var room = returnRoom();
  firebase.database().ref('rooms/'+room).update({
    state: "ongoing"
  });
  alert("starting game");
  $('#waitingRoom').hide();
  $('#dayList').show();
}

function setName(){
  var alias = $('#aliasInput').val();
  firebase.database().ref('rooms/'+currRoom+'/players/'+uid).update({
    name: alias
  });
  updateAlias();
}

//This function makes users pick an alias to identify them to other users
function updateAlias(){
  if (alias == email){
    $('#currRoom').hide();
    $('.nameInput').show();
    $('#hostStartButton').hide();
  }else{
    $('.nameInput').hide();
    $('#currRoom').show();
    //only the host should be able to start the game once everyone has joined,
    //so this hides the button for all other users
    if(isHost){
      $('#hostStartButton').show();
    }else{
      $('#hostStartButton').hide();
    }
  }
}

function returnRoom(){
  all = getJson();
  //alert(1);
  for(i in all.rooms){
    //alert(2);
    //alert(uid);
    for(x in all.rooms[i].players){
      //alert(uid+", "+x);
      if(uid == x){
        //alert("Room is: "+i);
        return i;
      }
    }
  }
  alert("BAD!!!!!");
}

function getJson(){
  var xhttp = new XMLHttpRequest();

  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET","https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  return response;
}

function signOut(){
  alert("signOut");
  firebase.auth().signOut();
}




//uses REST api to get the whole firebase database and make it an object, which is returned
