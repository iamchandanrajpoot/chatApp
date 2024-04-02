const users = [{ name: "chandan" }, { name: "mohit" }, { name: "dipu" }];

const usersChat = [{ chat: "hello" }, { chat: "wha" }];

const usersUl = document.getElementById("users");

document.addEventListener("DOMContentLoaded", function displayJoinedUsers() {
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerHTML = `${user.name} joined`;
    usersUl.appendChild(li);
  });
});

const sendMsgBtn = document.getElementById("send-message");
sendMsgBtn.onclick = async () => {
  try {
    const message = document.getElementById("message").value;
    const response = await fetch("http://localhost:3000/user/send", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("authToken")
      },
      body: JSON.stringify({message: message}),
    });
    console.log(response);
    const messageResult = await response.json();
    console.log(messageResult)
  } catch (error) {
    console.log(error);
  }
};
