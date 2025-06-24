const socket=io();
$('#chat-box').hide()


$('#send-btn').on('click',()=>{
    const msg=$('#inp').val()
    if(!msg)
    {
        return
    }
    const time = new Date().toLocaleTimeString(); // <-- move it here
    socket.emit('send',{msg,time})
    $('#inp').val("")
})

socket.on('receive',(data)=>{
    $('#chat').append(`<li class="border p-3 ms-0 mb-0 rounded-pill"><span class="text-muted small">${data.time}</span>  <span class="fw-bold">${data.username}</span> <span>${data.msg}</span> </li>`)
    
})

$('#login-btn').on('click',()=>{
    const username=$("#username").val()
    if (!username.trim()) {
    alert("Please enter a valid name");
    return
    }
    socket.emit('login',{username})
    $('#chat-box').show()
    $('#login').hide()
    $("#username").val("")
})




