const users = [
    {name: "chandan"},
    {name: "mohit"},
    {name: "dipu"}
]

const usersChat = [
    {chat: "hello"},
    {chat: "wha"}
]

const usersUl = document.getElementById("users");

document.addEventListener("DOMContentLoaded", function displayJoinedUsers(){
 
    users.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `${user.name} joined`;
        usersUl.appendChild(li)
    })
})