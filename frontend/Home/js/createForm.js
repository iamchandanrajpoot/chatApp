import { getAllUsers, socket } from "./util.js";

document.addEventListener(
  "DOMContentLoaded",
  async function displayDynamicForm() {
    const users = await getAllUsers();
    users.forEach((user) => {
      const referenceElm = document.getElementById("reference-element");
      const div = document.createElement("div");
      div.innerHTML = `
       <input
          type="checkbox"
          id="${user.name}${user.id}"
          name="checkboxGroup"
          value="${user.id}"
        />
        <label for="${user.name}${user.id}">${user.name}</label>
        `;

      referenceElm.parentElement.insertBefore(
        div,
        referenceElm.nextElementSibling
      );
    });
  }
);

const createGroupForm = document.getElementById("create-group-form");
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target.name.value;
  const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
  const userIds = [];
  // Loop through each checkbox
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      userIds.push(checkbox.value);
    }
  });
  const groupData = {
    name: name,
    userIds: userIds,
  };
  console.log(groupData);
  socket.emit("create_group", groupData);
  socket.on("group_created", (data) => {
    if (data.success) {
      alert(data.message);
      window.location.href = "../Home/index.html";
    } else {
      alert(data.message);
    }
  });
});
