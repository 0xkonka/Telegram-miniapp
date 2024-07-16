// Configure
const BE_URL = window.config.BE_URL;
const TG_TOKEN = window.config.TG_TOKEN;

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

async function referralBonus(referenceId, message) {
  const data = { reference_id: referenceId, message: message};
  await fetch('https://telegram.tren.finance/referral-bonus', {
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

  // === Open the TG App in big screen === //
  // Telegram.WebApp.onEvent('init', function(){
  //   Telegram.WebApp.setHeaderColor('bg_color', '#101010');
  // });
  // // Initialize the Telegram Mini App
  // Telegram.WebApp.ready();

  // Telegram.WebApp.onEvent('viewportChanged', function(height){
  //     if (height == window.innerHeight) {
  //         return;
  //     }
  //     Telegram.WebApp.expand();
  // });
  // // Immediately attempt to expand
  // Telegram.WebApp.expand();

  // ==== Register User === //
  const launchButton = document.getElementById("launch-app");
  const usernameInput = document.getElementById("username");

  const urlParams = new URLSearchParams(window.location.search);
  
  const user = getUserInfo()
  const userIdParam = user.userid
  const usernameParam = user.username
  // const userIdParam = 123456789
  // const usernameParam = "abcde"
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
      await registerUser(userId, usernameInput.value, referralIdParam);

      /*
      if(referralIdParam) { //Check the referral if he invited more than 5, 10, 25 friends.
        try {
          const referrerStatusResponse = await fetch(
            `${BE_URL}/status/${referralIdParam}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${TG_TOKEN}`,
              },
            }
          );

          if (referrerStatusResponse.ok) {
            const referrerStatus = (await referrerStatusResponse.json()).data;
            const referralCounts = referrerStatus?.referrers.length
            console.log('referralCounts: ', referralCounts)

            let bounsPoints, referralCountLimit
            if(referralCounts + 1 >= 25) {
              bounsPoints = 12500
              referralCountLimit = 25
            } else if(referralCounts + 1 >= 10) {
              bounsPoints = 5000
              referralCountLimit = 10
            } else if(referralCounts + 1 >= 5) {
              bounsPoints = 2500
              referralCountLimit = 5
            }
            const message = `You’ve got a ${bounsPoints.toLocaleString()} points bonus by successfully referring ${referralCountLimit} people. Keep up the good work!`

            await referralBonus(referralIdParam, message)
          } else {
            console.error(
              "Error getting referrer status:",
              referrerStatusResponse.statusText
            );
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
      */
      
      // If the referral succeed, give bonus 2000.
      console.log("You are receiving bonus now")
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
