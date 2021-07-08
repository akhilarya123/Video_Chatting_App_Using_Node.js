const express =require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server)
const {v4:uuidV4}=require('uuid');// for geting random urls


app.set('view engine','ejs');//taking support from ejs library
app.use(express.static('./public'));

app.get('/',(req,res)=>{
	//const user_name=prompt("Please enter your name");
	
	res.redirect('/'+uuidV4());//redirecting to random urls
	console.log("redirected");
})

app.get('/goodbye.html',(req,res)=>{
	//res.send("got to the room");
	res.sendFile("goodbye.html");
})


app.get('/:room',(req,res)=>{
	//res.send("got to the room");
	console.log(req.params.room);
	console.log("redirected got");
	res.render('room',{roomID:req.params.room});//geting the room id
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
	socket.on('message',message=>{
		io.to(roomId).emit('createMessage',message);
		
	})

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})



server.listen(process.env.PORT||3000,()=>{
	console.log('server at port 3000...');
});


