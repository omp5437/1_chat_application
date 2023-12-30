const path=require('path')
const http=require('http')
const express= require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage}= require('./utils/message')
const {generateLocationMessage}= require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom}= require('./utils/users')

const app=express()
const port=process.env.PORT || 3000

const publicDirectoryPath= path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

const server=http.createServer(app)
const io=socketio(server)

let msg='Welcome!'

io.on('connection',(socket)=>{
    console.log('New websocket connection') 
    socket.emit('message',generateMessage(msg,'Admin'))
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id: socket.id,username,room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`,user.username))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
   
    socket.on('sendMessage',(message,callback)=>{
         const filter= new Filter()
         const user= getUser(socket.id)
         if(!user){
            return callback(undefined)
         }
         if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
         }
        io.to(user.room).emit('message',generateMessage(message,user.username))
        callback('Message Delivered!')
    })

    socket.on('sendLocation',(location,callback)=>{
        const user= getUser(socket.id)

        if(!user){
            return callback(undefined)
        }

        io.to(user.room).emit('locationMessage',generateLocationMessage(
                `https://google.com/maps?q=${location.latitude},${location.longitude}`,user.username))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
        io.to(user.room).emit('message',generateMessage(`${user.username} has left`,'Admin'))
        io.to(user.name).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
    })
    

    

})

server.listen(port,()=>{
    console.log(`Server is up and running ${port}`)
})
