const registerForm = document.getElementById("sign-up-form");

registerForm.onsubmit = async (e) => {
  try {
    e.preventDefault();
    const userData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      password: e.target.password.value,
    };
    console.log(userData);
    const response = await fetch("http://localhost:3000/user/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    console.log(response);
    const userResult = await response.json();
    if (userResult.success) {
      e.target.name.value = "";
      e.target.email.value = "";
      e.target.phone.value = "";
      e.target.password.value = "";
      alert(userResult.message)
      window.location.href = "../Login/login.html"
    }else{
        alert(userResult.message)
    }
    console.log(userResult);
  } catch (error) {
    console.log(error);
  }
};
