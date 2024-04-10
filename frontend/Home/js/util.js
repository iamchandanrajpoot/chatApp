function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
// remove user from group

const makeUserAdmin = async (data) => {
  try {
    const response = await fetch(
      `http://15.206.195.100:3000/groups/make-admin`,
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
  } catch {
    console.log(error);
  }
};

const removeUserFromGroup = async (data) => {
  try {
    const response = await fetch(
      `http://15.206.195.100:3000/groups/remove-user`,
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
    if (result.success) {
      return result;
    } else {
      return { error: result.message, success: false };
    }
  } catch {
    console.log(error);
  }
};
// add user to group using API
const addUserToGroupApi = async (data) => {
  console.log(data);
  try {
    const response = await fetch("http://15.206.195.100:3000/groups/add-user", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
      return result;
    } else {
      return { error: result.message, success: false };
    }
  } catch (error) {
    console.log(error);
    return { error: "internal server errro", success: false };
  }
};

const getRemainingUsers = async (groupId) => {
  try {
    const response = await fetch(
      `http://15.206.195.100:3000/groups/${groupId}/remaining-users`,
      {
        method: "get",
        headers: {
          Authorization: localStorage.getItem("authToken"),
        },
      }
    );
    const data = await response.json();
    if (data.success) {
      console.log(data);
      return data.users;
    } else {
      console.log(data.message);
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

async function getGroupUsersApi(groupId) {
  const response = await fetch(
    `http://15.206.195.100:3000/groups/${groupId}/members`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `${localStorage.getItem("authToken")}`,
      }),
    }
  );

  const result = await response.json();
  // console.log("group users", result);
  return result.users;
}

async function getGroupMessages(groupId) {
  const lastMsgIdObjArr =
    JSON.parse(localStorage.getItem("lastMessageIdObjArr")) || [];
  const lastMsgIdObj = lastMsgIdObjArr.find(
    (lastMsgIdObj) => lastMsgIdObj.id === groupId
  );
  // If the lastMsgIdObj is found, assign its lastMsgId, otherwise, assign 0
  const lastMsgId = lastMsgIdObj ? lastMsgIdObj.lastMsgId : 0;

  console.log("lastmsg id", lastMsgId);
  try {
    const response = await fetch(
      `http://15.206.195.100:3000/groups/${groupId}/messages/?lastMessageId=${lastMsgId}`,
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
      `http://15.206.195.100:3000/groups/${groupId}/messages`,
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
    const response = await fetch(`http://15.206.195.100:3000/groups/`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"),
      },
    });
    const result = await response.json();
    console.log(result.groupsWithUserCounts);
    return result.groupsWithUserCounts;
  } catch (error) {
    console.log(error);
  }
}

async function createGroup(data) {
  try {
    const response = await fetch("http://15.206.195.100:3000/groups/", {
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
        console.log(groupMessage);
        const li = document.createElement("li");
        const userStoredInLocal = parseJwt(localStorage.getItem("authToken"));
        console.log(userStoredInLocal);
        if (userStoredInLocal.id == groupMessage.userId) {
          console.log("right");
          li.classList.add("right");
          li.innerHTML = `
         <div>
         <span>You</span>
         <p> ${groupMessage.message} </p>
         </div>
          `;
        } else {
          console.log("left");
          li.classList.add("left");
          li.innerHTML = `
          <div>
          <span>${groupMessage.userName}</span>
          <p> ${groupMessage.message} </p>
          </div>
          `;
        }
        mainUl.append(li);
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function getAllUsers() {
  try {
    const response = await fetch("http://15.206.195.100:3000/user/", {
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
  evt.currentTarget.className += " active";
}
export {
  getGroupMessages,
  postMessageInGroup,
  getGroups,
  createGroup,
  updatedGroupMessage,
  getAllUsers,
  openTab,
  parseJwt,
  getGroupUsersApi,
  getRemainingUsers,
  addUserToGroupApi,
  removeUserFromGroup,
  makeUserAdmin,
};
