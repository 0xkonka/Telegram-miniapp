// Configure
const BE_URL = window.config.BE_URL;
const TG_TOKEN = window.config.TG_TOKEN;

// === Get Telegram userid and name in my web app without passing param.
function getUserInfo () {
  const tg = window.Telegram.WebApp;
  // console.log('tg', tg)
  // const initData = Telegram.WebApp.initData || window.location.search;
  // console.log('initData', initData)
  // alert(tg.initDataUnsafe.start_param)
  // Check if user data is available
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

// async function checkUserStatus(userId) {
//   try {
//     const userStatusResponse = await fetch(`${BE_URL}/status/${userId}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${TG_TOKEN}`,
//       },
//     });

//     if (userStatusResponse.ok) {
//       userExist = (await userStatusResponse.json()).result;
//       if(userExist == true) {
//         localStorage.setItem("userId", userId);
//         // Redirect or perform any additional actions here
//         window.location.href = `./farm.html`;
//       }
//       // }
//     } else {
//       console.error(
//         "Error getting user status:",
//         userStatusResponse.statusText
//       );
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS code here", BE_URL);

  // === Open the TG App in big screen === //
  Telegram.WebApp.onEvent('init', function(){
    Telegram.WebApp.setHeaderColor('bg_color', '#101010');
  });
  // Initialize the Telegram Mini App
  Telegram.WebApp.ready();

  Telegram.WebApp.onEvent('viewportChanged', function(height){
      if (height == window.innerHeight) {
          return;
      }
      Telegram.WebApp.expand();
  });
  // Immediately attempt to expand
  Telegram.WebApp.expand();

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
      registerUser(userId, usernameInput.value, referralIdParam);
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
