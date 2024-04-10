import { createGroup, getAllUsers } from "./util.js";

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
  try {
    const result = await createGroup(groupData);
    if (result.success) {
      e.target.name.value = "";
      const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      window.alert("group created succussfully!");
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.log(error);
  }
});
