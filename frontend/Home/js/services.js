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