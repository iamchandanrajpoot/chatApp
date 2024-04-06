import {
  getGroups,
  postMessageInGroup,
  updatedGroupMessage,
  openTab,
} from "./util.js";

document.addEventListener("DOMContentLoaded", async () => {
  // display group dynamic
  try {
    const groupsWithUserCounts = await getGroups();
    if ( groupsWithUserCounts.length > 0) {
      const tabDiv = document.querySelector(".tab");
      tabDiv.innerHTML = "";
      groupsWithUserCounts.forEach((groupWithUserCount) => {
        const button = document.createElement("button");
        button.className = "tablinks";
        button.setAttribute("key", groupWithUserCount.group.id);
        button.textContent = `${groupWithUserCount.group.name}`;
        button.addEventListener("click", (e) => openTab(e, groupWithUserCount.group.id));
        tabDiv.appendChild(button);
      });

      // display tab content
      const tabcontentWrapper = document.getElementById("tabcontent-wrapper");
      tabcontentWrapper.innerHTML = "";
      groupsWithUserCounts.forEach((groupWithUserCount) => {
        const div = document.createElement("div");
        div.id = `${groupWithUserCount.group.id}`;
        div.className = "tabcontent";
        div.innerHTML = `
            <div class="group-header">
                <span>${groupWithUserCount.group.name}</span>
                <span>Member:${groupWithUserCount.userCount}</span>
            </div>
            <ul class="group-messages">
            </ul>
            <div class="send-message-wrapper">
                <input type="text" name="message" id="message" placeholder="Send text here..." required/>
                <button class="send-message-btn">Send</button>
             </div>
        `;
        tabcontentWrapper.appendChild(div);
      });
      // Retrieve last active tab from localStorage
      const lastActiveTabId = localStorage.getItem("lastActiveTabId");
      if (lastActiveTabId) {
        openTab(null, lastActiveTabId);
      }
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
      console.log("groupid", groupId)
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
    if(e.target.classList.contains("send-message-btn")){
      const inputElement = e.target.previousElementSibling

      const activeGroupButton = tabDiv.querySelector("button.active");
      console.log(activeGroupButton)
  
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
