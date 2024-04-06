async function getGroupMessages(groupId) {
    const lastMsgIdObjArr = JSON.parse(localStorage.getItem("lastMessageIdObjArr")) || [];
    const lastMsgIdObj = lastMsgIdObjArr.find(lastMsgIdObj => lastMsgIdObj.id === groupId);
    // If the lastMsgIdObj is found, assign its lastMsgId, otherwise, assign 0
    const lastMsgId = lastMsgIdObj ? lastMsgIdObj.lastMsgId : 0;
    

  console.log("lastmsg id", lastMsgId);
  try {
    const response = await fetch(
      `http://localhost:3000/groups/${groupId}/messages/?lastMessageId=${lastMsgId}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authToken"),
        },
      }
    );
    const result = await response.json();
    return result.groupMessages;
  } catch (error) {
    console.log(error);
  }
}

async function postMessageInGroup(data, groupId) {
  try {
    const response = await fetch(
      `http://localhost:3000/groups/${groupId}/messages`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authToken"),
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function getGroups() {
  try {
    const response = await fetch(`http://localhost:3000/groups/`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
    });
    const result = await response.json();
    console.log(result.groupsWithUserCounts)
    return result.groupsWithUserCounts;
  } catch (error) {
    console.log(error);
  }
}

async function createGroup(data) {
  try {
    const response = await fetch("http://localhost:3000/groups/", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function updatedGroupMessage(groupId) {
  try {
    const newGroupMessages = await getGroupMessages(groupId);
    console.log(newGroupMessages);
    // local customize local storage data;
    if (newGroupMessages.length > 0) {
      let messagesStoreInlocal =
        JSON.parse(localStorage.getItem("messages")) || [];
      let localGroupMessages = messagesStoreInlocal.find(
        (message) => message.id === groupId
      );

      if (localGroupMessages && localGroupMessages.groupMessages.length > 0) {
        localGroupMessages.groupMessages =
          localGroupMessages.groupMessages.concat(newGroupMessages);
      } else {
        localGroupMessages = {
          id: groupId,
          groupMessages: newGroupMessages,
        };
        messagesStoreInlocal.push(localGroupMessages);
      }
      // Store the latest messages and last message ID in local storage
      localStorage.setItem(
        "messages",
        JSON.stringify(
          messagesStoreInlocal.map((message) => ({
            id: message.id,
            groupMessages: message.groupMessages.slice(-10),
          }))
        )
      );
      let lastMessageIdObjArr =
        JSON.parse(localStorage.getItem("lastMessageIdObjArr")) || [];
      let localLastMessageObj = lastMessageIdObjArr.find(
        (lastMessageIdObj) => lastMessageIdObj.id === groupId
      );
      if (localLastMessageObj) {
        localLastMessageObj.lastMsgId =
          newGroupMessages[newGroupMessages.length - 1].id;
      } else {
        lastMessageIdObjArr.push({
          id: groupId,
          lastMsgId: newGroupMessages[newGroupMessages.length - 1].id,
        });
      }

      localStorage.setItem(
        "lastMessageIdObjArr",
        JSON.stringify(lastMessageIdObjArr)
      );
    }

    const messages = JSON.parse(localStorage.getItem("messages"));
    const localGroupMessages = messages.find(
      (message) => message.id === groupId
    );

    // update message on dom
    if (localGroupMessages && localGroupMessages.groupMessages.length > 0) {
      const mainDiv = document.getElementById(groupId);
      const mainUl = mainDiv.querySelector(".group-messages");
      mainUl.innerHTML = "";
      localGroupMessages.groupMessages.forEach((groupMessage) => {
        const li = document.createElement("li");
        li.className = "group-message";
        li.innerHTML = `${groupMessage.message}`;
        mainUl.appendChild(li);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function getAllUsers() {
  try {
    const response = await fetch("http://localhost:3000/user/", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
    });
    const result = await response.json();
    return result.users;
  } catch (error) {
    console.log(error);
  }
}

function openTab(evt, groupId) {
  console.log(groupId);
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(groupId).style.display = "block";
  if (evt) {
    evt.currentTarget.className += " active";
  } else {
    document.querySelector(`button[key="${groupId}"]`).className += " active";
  }
  localStorage.setItem("lastActiveTabId", groupId);
}
export {
  getGroupMessages,
  postMessageInGroup,
  getGroups,
  createGroup,
  updatedGroupMessage,
  getAllUsers,
  openTab,
};
