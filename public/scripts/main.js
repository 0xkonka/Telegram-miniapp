// Configure
const BE_URL = window.config.BE_URL;


// === Get Telegram userid and name in my web app without passing param.
function getUserInfo () {
  const tg = window.Telegram.WebApp;
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const user = tg.initDataUnsafe.user;
      // You now have access to the user data
      return {
          userid: user.id,
          username: user.username,
      }
      // Do something with this data (e.g., send it to your server)
  } else {
      // Handle case where user data is not available
      console.log('No user data available');
      return {
          userid: 0,
          username: ''
      }
  }
}

async function registerUser(userId, userName) {
  try {
    const response = await fetch(`${BE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify({ userId, userName }),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("userId", userId);
    } else {
      console.error("Error:", await response.json());
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function referralSuccess(referenceId) {
  const data = { reference_id: referenceId };
  await fetch('https://telegram.tren.finance/referral-success', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch((error) => console.error('Error:', error));
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS code here", BE_URL);
  Telegram.WebApp.setHeaderColor("#101010");
  Telegram.WebApp.setBackgroundColor("#101010");
  Telegram.WebApp.expand();
  Telegram.WebApp.ready();

  // ==== Register User === //
  const launchButton = document.getElementById("launch-app");
  const usernameInput = document.getElementById("username");

  const urlParams = new URLSearchParams(window.location.search);
  
  const user = getUserInfo()
  const userIdParam = user.userid
  const usernameParam = user.username
  const referralIdParam = urlParams.get("referralId");
  
  usernameInput.value = usernameParam;

  launchButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default link behavior
    let userId = userIdParam;

    if (!userId) userId = Math.round(Math.random() * 1000000);

    if(usernameInput.value !== usernameParam) {
      usernameInput.classList.remove('border-[#787978]')
      usernameInput.classList.add('border-[#F97171]')
      document.getElementById("login-fail").classList.remove('hidden')
    } else {
      await registerUser(userId, usernameInput.value);
      if(referralIdParam)
        await referralSuccess(referralIdParam)

      // Redirect or perform any additional actions here
      window.location.href = `./farm.html`;
    }
  });

  usernameInput.addEventListener("keyup", (event) => {
    if(event.target.value === usernameParam) {
      usernameInput.classList.remove('border-[#F97171]')
      usernameInput.classList.add('border-[#787978]')
      document.getElementById("login-fail").classList.add('hidden')
    }
    console.log(event.target.value)
  })
});
