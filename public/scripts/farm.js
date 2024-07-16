// === Get Telegram userid and name in my web app without passing param.
function getUserInfo() {
  const tg = window.Telegram.WebApp;
  // Check if user data is available
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    // You now have access to the user data
    return {
      userid: user.id,
      username: user.username,
    };
    // Do something with this data (e.g., send it to your server)
  } else {
    // Handle case where user data is not available
    console.log("No user data available");
    return {
      userid: 0,
      username: "",
    };
  }
}

// Completed Farming to send notification
function completedFarming() {
  const data = {};
  fetch('https://telegram.tren.finance/completed-farming', {
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

function checkHeight() {
  var rootHeight = window.innerHeight
  if(rootHeight < 750) {
    document.body.classList.remove('hidden')
    document.body.classList.add('scale-sm')
  } else {
    document.body.classList.remove('hidden')
    document.body.classList.remove('scale-sm')
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Farm JS code here");

  Telegram.WebApp.setHeaderColor("#101010");
  Telegram.WebApp.setBackgroundColor("#101010");
  Telegram.WebApp.expand();

  // Telegram.WebApp.onEvent("viewportChanged", function (height) {
  //   if (height == window.innerHeight) {
  //     return;
  //   }
  //   Telegram.WebApp.expand();
  // });
  // Immediately attempt to expand
  // Telegram.WebApp.expand();
  checkHeight()

  // ==================================== //
  // == If user navigated farm page directly (already registered user) == //
  const user = getUserInfo();
  const userIdParam = user.userid;
  localStorage.setItem("userId", userIdParam);
  // ==================================== //

  const BE_URL = window.config.BE_URL;
  const TG_TOKEN = window.config.TG_TOKEN;

  // Get userId from local storage
  const userId = localStorage.getItem("userId");

  let userStatus = null;

  if (userId) {
    console.log("userId", userId);

    try {
      const userStatusResponse = await fetch(`${BE_URL}/status/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TG_TOKEN}`,
        },
      });

      if (userStatusResponse.ok) {
        userStatus = (await userStatusResponse.json()).data;
        console.log("User Status:", userStatus);

        // Display user status
        document.getElementById("farming-points").textContent =
          (userStatus.farmingPoint + userStatus.referralPoint).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          ) || "0.00";
        document.getElementById("referrers-count").textContent =
          userStatus.referrers.length || "0";
        document.getElementById("referral-points").textContent =
          userStatus.referralPoint.toLocaleString() || "0";

        // Calculate and display remaining time
        if (userStatus.farmStartingTime == 0) {
          document.getElementById("remaining-time").textContent =
            "0h : 0m : 0s";
        }

        // Start interval to update points and time every second
        setInterval(() => {
          updateRemainingTime(userStatus.farmStartingTime);
          updateFarmingPoints();
          // }
        }, 1000);
        // }
      } else {
        console.error(
          "Error getting user status:",
          userStatusResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    console.error("No userId found in local storage");
  }

  // Function to update farming points
  function updateFarmingPoints() {
    if (userStatus.farmStartingTime == 0) return;
    const now = Math.floor(new Date().getTime() / 1000);
    const elapsedTime = now - userStatus.farmStartingTime; // Time elapsed in seconds 3600

    if (elapsedTime >= 8 * 3600) {
      // Cap at 8 hours
      document.getElementById("farming-points").textContent = (
        userStatus.farmingPoint +
        userStatus.referralPoint +
        25 * 8
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      const additionalPoints = 25 / 3600;
      userStatus.farmingPoint = userStatus.farmingPoint + additionalPoints;
      document.getElementById("farming-points").textContent = (
        (25 / 3600) * elapsedTime +
        userStatus.farmingPoint +
        userStatus.referralPoint
      ).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  // Function to update remaining time
  function updateRemainingTime(farmStartingTime) {
    if (userStatus.farmStartingTime == 0) return;
    const remainingTime = calculateRemainingTime(farmStartingTime);
    if (remainingTime > 0) {
      const hours = Math.floor(remainingTime / (60 * 60));
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);
      document.getElementById(
        "remaining-time"
      ).textContent = `${hours}h : ${minutes}m : ${seconds}s`;
      disableFarmingButton();
    } else {
      completedFarming();
      document.getElementById("remaining-time").textContent = "0h : 0m : 0s";
      enableFarmingButton();
    }
  }

  // Function to calculate remaining time in seconds
  function calculateRemainingTime(farmStartingTime) {
    const now = Math.floor(new Date().getTime() / 1000);
    return farmStartingTime + 8 * 60 * 60 - now;
  }

  // Function to disable the farming button
  function disableFarmingButton() {
    const button = document.getElementById("start-farming");
    button.disabled = true;
    button.classList.add("disabled");
  }

  // Function to enable the farming button
  function enableFarmingButton() {
    const button = document.getElementById("start-farming");
    button.disabled = false;
    button.classList.remove("disabled");
  }

  // Handle "Start Farming" button click
  document
    .getElementById("start-farming")
    .addEventListener("click", async () => {
      try {
        const response = await fetch(`${BE_URL}/farm/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TG_TOKEN}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const result = (await response.json()).data;
          console.log("Farming started:", result);
          userStatus.farmingPoint = result;
          userStatus.farmStartingTime = Math.floor(new Date().getTime() / 1000);
          updateRemainingTime(userStatus.farmStartingTime);
        } else {
          console.log("error: ", (await response.json()).message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
});
