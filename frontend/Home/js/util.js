// configuring socket in frontend
const token = localStorage.getItem("authToken");
const socket = io("http://15.206.195.100:3000", {
  auth: {
    token: token,
  },
});

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
        // li.style.overflow = "hidden";
        // li.style.whiteSpace = "pre-wrap";
        const userStoredInLocal = parseJwt(localStorage.getItem("authToken"));

        const isCurrentUser = userStoredInLocal.id === groupMessage.userId;
        const positionClass = isCurrentUser ? "right" : "left";

        const messageContent = groupMessage.message
          ? `<p>${groupMessage.message}</p>`
          : "";
        let mediaContent = "";
        if (groupMessage.mediaUrl) {
          if (
            groupMessage.mediaUrl.endsWith(".mp4") ||
            groupMessage.mediaUrl.endsWith(".mov")
          ) {
            mediaContent = `<video controls style="max-width: 100%; max-height: 100%; height: auto;"><source src="${groupMessage.mediaUrl}" type="video/mp4"></video>`;
          } else {
            mediaContent = `<img style="max-width: 100%; max-height: 100%; height: auto;" src="${groupMessage.mediaUrl}" alt="image">
            `;
          }
        }

        li.classList.add(positionClass);
        li.innerHTML = `
          <div>
            <span>${isCurrentUser ? "You" : groupMessage.userName}</span>
            ${messageContent}
            ${mediaContent}
          </div>
        `;

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

async function displayGroupAndContentDynamic() {
  try {
    const groupsWithUserCounts = await getGroups();
    if (groupsWithUserCounts.length > 0) {
      const tabDiv = document.querySelector(".tab");
      tabDiv.innerHTML = "";
      groupsWithUserCounts.forEach((groupWithUserCount) => {
        const button = document.createElement("button");
        button.className = "tablinks";
        button.setAttribute("key", groupWithUserCount.group.id);
        button.textContent = `${groupWithUserCount.group.name}`;
        button.addEventListener("click", (e) =>
          openTab(e, groupWithUserCount.group.id)
        );
        tabDiv.appendChild(button);
      });

      // display tab content of group
      const tabcontentWrapper = document.getElementById("tabcontent-wrapper");
      tabcontentWrapper.innerHTML = "";
      groupsWithUserCounts.forEach((groupWithUserCount) => {
        const tabcontentDiv = document.createElement("div");
        tabcontentDiv.id = `${groupWithUserCount.group.id}`;
        tabcontentDiv.className = "tabcontent";

        const groupHeader = document.createElement("div");
        groupHeader.className = "group-header";
        const span1 = document.createElement("span");
        span1.innerText = `${groupWithUserCount.group.name}`;
        groupHeader.appendChild(span1);

        if (groupWithUserCount.group.UserGroup.isAdmin) {
          const addUserdiv = document.createElement("div");
          addUserdiv.className = "add-user-btn-container";
          const addUserBtn = document.createElement("button");
          addUserBtn.className = "add-user-btn";
          addUserBtn.innerText = "Add User";

          addUserdiv.appendChild(addUserBtn);

          addUserBtn.removeEventListener("click", addUserDropdownShow);
          addUserBtn.addEventListener("click", addUserDropdownShow);

          const addUserDropdown = document.createElement("div");
          addUserDropdown.className = "dropdown";
          addUserdiv.appendChild(addUserDropdown);
          groupHeader.appendChild(addUserdiv);

          async function addUserDropdownShow() {
            // alert("ckisdjkd")
            addUserDropdown.classList.toggle("show");
            const remaingUsers = await getRemainingUsers(
              groupWithUserCount.group.id
            );
            addUserDropdown.innerHTML = "";
            const remainingUserList = document.createElement("ul");
            remainingUserList.innerHTML = "";
            remainingUserList.className = "updating-user-list";
            remaingUsers.forEach((user) => {
              const li = document.createElement("li");
              li.setAttribute("key", user.id);
              li.textContent = `${user.name}`;
              const btn = document.createElement("button");
              btn.className = "add-user-btn";
              btn.innerText = "Add User";
              li.appendChild(btn);
              remainingUserList.appendChild(li);
              addUserDropdown.appendChild(remainingUserList);

              btn.removeEventListener("click", addUserToGroup);
              btn.addEventListener("click", addUserToGroup);

              async function addUserToGroup(e) {
                const userId = e.target.parentElement.getAttribute("key");
                const groupId = groupWithUserCount.group.id;
                const data = {
                  userId,
                  groupId,
                };

                const result = await addUserToGroupApi(data);
                console.log(result);

                if (result.success) {
                  e.target.parentElement.remove();
                  window.alert(`${user.name} ${result.message}`);
                }
              }
            });
          }
        }
        const showMemberBtnContainer = document.createElement("div");
        showMemberBtnContainer.className = "show-user-btn-container";
        const showMemberBtn = document.createElement("button");
        showMemberBtn.className = "show-member-btn";
        showMemberBtn.id = "show-member-btn";
        showMemberBtn.innerText = `Members(${groupWithUserCount.userCount})`;

        showMemberBtnContainer.appendChild(showMemberBtn);

        showMemberBtn.removeEventListener("click", userDropdownShow);
        showMemberBtn.addEventListener("click", userDropdownShow);

        const showUserDropdown = document.createElement("div");
        showUserDropdown.id = "show-member-dropdown";

        showMemberBtnContainer.appendChild(showUserDropdown);
        groupHeader.appendChild(showMemberBtnContainer);

        async function userDropdownShow() {
          showUserDropdown.classList.toggle("show");
          const groupUsers = await getGroupUsersApi(
            groupWithUserCount.group.id
          );
          // console.log(groupUsers);
          showUserDropdown.innerHTML = "";

          const userList = document.createElement("ul");
          userList.innerHTML = "";
          userList.className = "updating-user-list";
          const userDetails = parseJwt(localStorage.getItem("authToken"));
          console.log(
            "groupWithUserCount.group.UserGroup.UserId",
            groupWithUserCount.group.UserGroup.UserId
          );

          groupUsers.forEach((user) => {
            const userLi = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${user.name}`;
            userLi.appendChild(span);
            userLi.setAttribute("key", user.id);
            let removeUserBtn;
            let makeAdminBtn;
            if (
              groupWithUserCount.group.UserGroup.isAdmin &&
              user.id !== groupWithUserCount.group.UserGroup.UserId
            ) {
              removeUserBtn = document.createElement("button");
              removeUserBtn.textContent = "remove";
              userLi.appendChild(removeUserBtn);

              makeAdminBtn = document.createElement("button");
              makeAdminBtn.textContent = "make admin";
              userLi.appendChild(makeAdminBtn);

              async function removeUser(e) {
                const userId = e.target.parentElement.getAttribute("key");
                const groupId = groupWithUserCount.group.id;
                const result = await removeUserFromGroup({ userId, groupId });
                if (result.success) {
                  e.target.parentElement.remove();
                  alert("user removed successfully");
                }
              }
              removeUserBtn.removeEventListener("click", (e) => {
                removeUser(e);
              });
              removeUserBtn.addEventListener("click", (e) => {
                removeUser(e);
              });

              async function makeAdmin(e) {
                const userId = e.target.parentElement.getAttribute("key");
                const groupId = groupWithUserCount.group.id;
                const result = await makeUserAdmin({ userId, groupId });
                if (result.success) {
                  alert("successfully user is made admin");
                }
              }
              makeAdminBtn.removeEventListener("click", (e) => {
                makeAdmin(e);
              });
              makeAdminBtn.addEventListener("click", (e) => {
                console.log("clicked");
                makeAdmin(e);
              });
            }
            userList.appendChild(userLi);
          });
          showUserDropdown.appendChild(userList);
        }
        // ---------------------send message ui------------------
        tabcontentDiv.appendChild(groupHeader);

        const ul = document.createElement("ul");
        ul.className = "group-messages";
        tabcontentDiv.appendChild(ul);

        const sendMessageWrapper = document.createElement("div");
        sendMessageWrapper.className = "send-message-wrapper";

        sendMessageWrapper.innerHTML = `
         <form onsubmit="return false;" enctype="multipart/form-data" >
          <input type="file" class="file-input" name="uploaded_file" />
          <input type="text" class="text-input" placeholder="Type your message..." />
          <button class="send-message-btn">Send</button>
         </form>
        `;
        tabcontentDiv.appendChild(sendMessageWrapper);
        tabcontentWrapper.appendChild(tabcontentDiv);
      });
    }
  } catch (error) {
    console.error(error);
  }
}
export {
  updatedGroupMessage,
  getAllUsers,
  socket,
  displayGroupAndContentDynamic,
  getGroupUsersApi,
  getGroupMessages,
};
