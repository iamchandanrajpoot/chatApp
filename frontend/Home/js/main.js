import {
  updatedGroupMessage,
  socket,
  displayGroupAndContentDynamic,
  getGroupUsersApi,
} from "./util.js";

socket.on("new_message", (data) => {
  console.log("new_message", data);
  updatedGroupMessage(data.groupId);
});

document.addEventListener("DOMContentLoaded", async () => {
  // display group dynamic
  displayGroupAndContentDynamic();

  //dispaly and  upadate group message
  const tabDiv = document.querySelector(".tab");

  // display group messages
  // let setIntervalId;
  tabDiv.addEventListener("click", function displayGroupMessages(e) {
    if (e.target.classList.contains("tablinks")) {
      const groupId = e.target.getAttribute("key");
      console.log("groupid", groupId);
      const buttonElements = tabDiv.querySelectorAll("button.tablinks");
      buttonElements.forEach((button) => {
        button.classList.remove("active");
      });
      e.target.classList.add("active");
      updatedGroupMessage(groupId);
    }
  });

  // adding event listener to sendMessageBtn and post message on clicking
  const tabcontentWrapper = document.querySelector("#tabcontent-wrapper");

  tabcontentWrapper.addEventListener("click", async function postMessage(e) {
    if (e.target.classList.contains("send-message-btn")) {
      const inputElement = e.target.previousElementSibling;
      const activeGroupButton = tabDiv.querySelector("button.active");
      if (activeGroupButton) {
        const groupId = activeGroupButton.getAttribute("key");
        if (inputElement.value.trim().length > 0) {
          const groupMembers = await getGroupUsersApi(groupId);
          socket.emit("post_message", {
            message: inputElement.value.trim(),
            groupId: groupId,
            groupMembers: groupMembers,
          });
          inputElement.value = "";
        }
      }
    }
  });
});
