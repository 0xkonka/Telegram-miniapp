// Configure
const BE_URL = window.config.BE_URL;
const TG_TOKEN = window.config.TG_TOKEN;

async function registerUser(userId, userName, referrerId) {
  try {
    const response = await fetch(`${BE_URL}/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TG_TOKEN}`,
      },
      body: JSON.stringify({ userId, userName, referrerId }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Success:", result);
      // Store userId in local storage
      localStorage.setItem("userId", userId);

      // Redirect or perform any additional actions here
      window.location.href = `./farm.html`;
    } else {
      console.error("Error:", await response.json());
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS code here", BE_URL);
  const launchButton = document.getElementById("launch-app");
  const usernameInput = document.getElementById("username");

  // Parse the query string
  const urlParams = new URLSearchParams(window.location.search);
  // Get individual parameters
  const userIdParam = urlParams.get("userId");
  const usernameParam = urlParams.get("username");
  const referralIdParam = urlParams.get("referralId");

  usernameInput.value = usernameParam;

  launchButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default link behavior

    let userId = userIdParam;

    if (!userId) userId = Math.round(Math.random() * 1000000);

    if(usernameInput.value !== usernameParam) {
      usernameInput.classList.remove('border-[#787978]')
      usernameInput.classList.add('border-[#7b3838]')
      document.getElementById("login-fail").classList.remove('hidden')
    } else {
      registerUser(userId, usernameInput.value, referralIdParam);
    }
  });

  usernameInput.addEventListener("keyup", (event) => {
    if(event.target.value === usernameParam) {
      usernameInput.classList.remove('border-[#7b3838]')
      usernameInput.classList.add('border-[#787978]')
      document.getElementById("login-fail").classList.add('hidden')
    }
    console.log(event.target.value)
  })
});
