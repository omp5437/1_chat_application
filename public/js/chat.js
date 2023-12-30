
const socket=io ()

const $messageform= document.querySelector('form')
const $messageformInput=$messageform.querySelector('input')
const $messageformButton=$messageform.querySelector('button')
const $location=document.querySelector('#location')
const $messages=document.querySelector('#messages')


const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll =()=>{

    const  $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight
    const scrollOffSet=$messages.scrollTop+visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffSet){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.emit('join',{username,room},(error)=>{
    if(error){
    alert(error)
    location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.on('message',(msg)=>{
    console.log(msg)
    const html=Mustache.render(messageTemplate,{
        message: msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a'),
        username: msg.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
    
    })

    socket.on('locationMessage',(url)=>{
        console.log(url)
        const html=Mustache.render(locationTemplate,{
            locationUrl:url.url,
            createdAt: moment(url.createdAt).format('h:mm a'),
            username:url.username
        })
        $messages.insertAdjacentHTML('beforeend',html)
        autoScroll()
    })
    const userMsg=document.querySelector('input')
   
    $messageform.addEventListener('submit',(e)=>{
        e.preventDefault()
        $messageformButton.setAttribute('disabled','disabled')

      socket.emit('sendMessage',userMsg.value,(error)=>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value=''
        $messageformInput.focus()

        if(error){
           return console.log(error)
        }
        console.log('Message Delivered!')
      })
    })


    $location.addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert('Geolocation is not supported by your browser.')
        }
    
        $location.setAttribute('disabled', 'disabled')
    
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $location.removeAttribute('disabled')
                console.log('Location shared!')  
            })
        })
    })
