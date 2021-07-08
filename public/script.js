const socket=io('/');
const videoGrid = document.getElementById('video-grid');


//const myPeer= new Peer({host:'peerjs-server.herokuapp.com', secure:true, port:443});

const myPeer = new Peer(undefined, {
  host: '/',
  port: '443'
  
})

const myVideo = document.createElement('video')
myVideo.muted = true

let myVideoStream;

const peers = {}

function fix_message(text_val){
	text_val="<p><b>"+user_name+"</p></b>"+text_val;
	return text_val;
}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream =stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
	let text=$('input');
	$('html').keydown((e)=>{
		if (e.which == 13 && text.val().length !== 0) {
		  console.log(text.val());
		  text.val(fix_message(text.val()));
		  socket.emit('message', text.val());
		  text.val('')
		}
		
	})

	socket.on('createMessage',message=>{
		//console.log('This is server message',message);
		$("ul").append(`<p></p><li class="message">${message}</li>`);
		scrollCorrection();
	})

})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
} 
 
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}


function scrollCorrection(){
  var d = $('.chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


function muteUnmute(){
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

function setMuteButton() {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.mute_button').innerHTML = html;
}

function setUnmuteButton(){
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.mute_button').innerHTML = html;
}

function playStop(){
  let check = myVideoStream.getVideoTracks()[0].enabled;
  if (check) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

function setStopVideo(){
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.video_button').innerHTML = html;
}

function setPlayVideo(){
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.video_button').innerHTML = html;
}
