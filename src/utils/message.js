const generateMessage = (text,username)=>{
    return {
        text,
        username,
        createdAt:new Date()
    }

}

const generateLocationMessage =(url,username)=>{
    return {
        url,
        username,
        createdAt: new Date()
    }

}
module.exports={
    generateMessage,
    generateLocationMessage
}