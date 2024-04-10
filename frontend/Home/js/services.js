function openPopup() {
  document.getElementById("overlay").style.display = "flex";
}

function closePopup() {
  document.getElementById("overlay").style.display = "none";
}


const logoutBtn = document.getElementById("logout")
logoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem("authToken");
  window.location.href = "../Login/login.html"
})


function filterAddUser(e) {
  var input, filter, ul, li, a, i, txtValue;
  // input = document.querySelector(".user-input ");
  input = e.target;
  filter = input.value.toUpperCase();
  ul = document.querySelector(".user-list");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
      } else {
          li[i].style.display = "none";
      }
  }
}