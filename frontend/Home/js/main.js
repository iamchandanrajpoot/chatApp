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
      const inputTextElement = e.target.previousElementSibling;
      const filInputElement = inputTextElement.previousElementSibling;

      const activeGroupButton = tabDiv.querySelector("button.active");
      if (activeGroupButton) {
        const groupId = activeGroupButton.getAttribute("key");
        const groupMembers = await getGroupUsersApi(groupId);

        if (inputTextElement.value.trim().length > 0) {
          // Send text message
          const dataMessage = {
            message: inputTextElement.value.trim(),
            groupId: groupId,
            groupMembers: groupMembers,
          };
          console.log(dataMessage);
          socket.emit("post_message", dataMessage);
          inputTextElement.value = "";
        } else if (filInputElement.files.length > 0) {
          // Send file
          const file = filInputElement.files[0];
          console.log("file:", file);

          const formData = new FormData();
          formData.append("uploaded_file", file);

          try {
            const response = await fetch("http://localhost:3000/upload", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              console.log(response);
              const result = await response.json();
              console.log("Upload successful:", result.response.url);

              const dataMessage = {
                mediaUrl: result.response.url,
                groupId: groupId,
                groupMembers: groupMembers,
              };
              console.log(dataMessage);
              socket.emit("post_message", dataMessage);
              filInputElement.value = "";
            } else {
              console.error("Upload failed:", response.statusText);
            }
          } catch (error) {
            console.error("Error uploading file:", error);
          }

          // Clear the file input after uploading
          filInputElement.value = "";
        } else {
          console.log("No message or file selected");
        }
      }
    }
  });
});
