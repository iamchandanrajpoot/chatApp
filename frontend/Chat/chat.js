const users = [{ name: "chandan" }, { name: "mohit" }, { name: "dipu" }];

async function getMessages() {
  try {
    const lastMsgId = localStorage.getItem("lastMessageId") || 0;
    console.log("lastMessageid", lastMsgId);
    const response = await fetch(
      `http://localhost:3000/message/?lastMessageId=${lastMsgId}`,
      {
        method: "get",
        headers: {
          Authorization: localStorage.getItem("authToken"),
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

// dispaly users
const usersUl = document.getElementById("users");
let setintervalId;

document.addEventListener(
  "DOMContentLoaded",
  async function displayJoinedUsers() {
    users.forEach((user) => {
      const li = document.createElement("li");
      li.innerHTML = `${user.name} joined`;
      usersUl.appendChild(li);
    });

    clearInterval(setintervalId);

    //show messages
    setintervalId = setInterval(async () => {
      const messageResult = await getMessages();
      console.log("fetch new message data");
      console.log(messageResult);

      // Set messages data to local storage
      const newMessages = messageResult.messages;
      console.log(newMessages)
      if (newMessages.length > 0) {
        const messagesStoreInlocal = JSON.parse(
          localStorage.getItem("messages")
        );
        if (messagesStoreInlocal) {
          const newMessagesWithLocal = messagesStoreInlocal.concat(newMessages);
          if (newMessagesWithLocal.length > 10) {
            const latestMessages10 = newMessagesWithLocal.slice(-10);
            localStorage.setItem("messages", JSON.stringify(latestMessages10));
          } else {
            localStorage.setItem("messages", JSON.stringify(newMessagesWithLocal));
          }
        }else{
          if(newMessages.length > 10){
            const latestMessages10 = newMessages.slice(-10);
            localStorage.setItem("messages", JSON.stringify(latestMessages10))
          }else{
            localStorage.setItem("messages", JSON.stringify(newMessages))
          }
        }
        localStorage.setItem("lastMessageId", newMessages[newMessages.length-1].id)
      }

      // Update messages in the DOM
      const messages = JSON.parse(localStorage.getItem("messages"));
      console.log("message in local storage", messages);
      const messagesUl = document.getElementById("messages");
      messagesUl.innerHTML = "";

      if (messages && messages.length > 0) {
        messages.forEach((message) => {
          const li = document.createElement("li");
          li.innerHTML = `${message.text}`;
          messagesUl.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.innerHTML = "No message found!";
        messagesUl.appendChild(li);
      }
    }, 1000);
  }
);

// send messages
const sendMsgBtn = document.getElementById("send-message");
sendMsgBtn.onclick = async () => {
  try {
    const message = document.getElementById("message").value;
    const response = await fetch("http://localhost:3000/message/send", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
      body: JSON.stringify({ message: message }),
    });
    console.log(response);
    const messageResult = await response.json();
    document.getElementById("message").value = "";

    console.log(messageResult);
  } catch (error) {
    console.log(error);
  }
};
