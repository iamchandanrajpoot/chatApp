const loginForm = document.getElementById("login-form");

loginForm.onsubmit = async (e) => {
  try {
    e.preventDefault();
    const userData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };
    console.log(userData);
    const response = await fetch("http://localhost:3000/user/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    console.log(response);
    const userResult = await response.json();
    if (userResult.success) {
      e.target.email.value = "";
      e.target.password.value = "";
      localStorage.setItem("authToken", userResult.token);
      alert(userResult.message);
      window.location.href = "../Home/index.html";
    } else {
      alert(userResult.message);
    }
    console.log(userResult);
  } catch (error) {
    console.log(error);
  }
};
