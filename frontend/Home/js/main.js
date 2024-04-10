import {
  getGroups,
  postMessageInGroup,
  updatedGroupMessage,
  openTab,
  getGroupUsersApi,
  getRemainingUsers,
  addUserToGroupApi,
  removeUserFromGroup,
  parseJwt,
  makeUserAdmin,
} from "./util.js";

document.addEventListener("DOMContentLoaded", async () => {
  // display group dynamic
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
                // window.alert(userId);
                // window.alert(groupId);
                const result = await addUserToGroupApi(data);
                console.log(result);
                // window.alert(result);

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
          <input type="text" name="message" id="message" placeholder="Send text here..." required/>
          <button class="send-message-btn">Send</button>
        `;
        tabcontentDiv.appendChild(sendMessageWrapper);
        tabcontentWrapper.appendChild(tabcontentDiv);
      });
    }
  } catch (error) {
    console.error(error);
  }

  //dispaly and  upadate group message
  const tabDiv = document.querySelector(".tab");

  let setIntervalId;
  tabDiv.addEventListener("click", function displayGroupMessages(e) {
    if (e.target.classList.contains("tablinks")) {
      const groupId = e.target.getAttribute("key");
      console.log("groupid", groupId);
      const buttonElements = tabDiv.querySelectorAll("button.tablinks");
      buttonElements.forEach((button) => {
        button.classList.remove("active");
      });
      e.target.classList.add("active");

      clearInterval(setIntervalId);
      setIntervalId = setInterval(() => {
        updatedGroupMessage(groupId);
      }, 1000);
    }
  });
  // adding event listener to sendMessageBtn and post message on clicking
  const tabcontentWrapper = document.querySelector("#tabcontent-wrapper");

  tabcontentWrapper.addEventListener("click", async function postMessage(e) {
    if (e.target.classList.contains("send-message-btn")) {
      const inputElement = e.target.previousElementSibling;

      const activeGroupButton = tabDiv.querySelector("button.active");
      console.log(activeGroupButton);

      if (activeGroupButton) {
        const groupId = activeGroupButton.getAttribute("key");
        if (inputElement.value.trim().length > 0) {
          const result = await postMessageInGroup(
            { message: inputElement.value.trim() },
            groupId
          );
          if (result.success) {
            inputElement.value = "";
          }
        }
      } else {
        console.log("No active tablinks selected.");
      }
    }
  });
});
