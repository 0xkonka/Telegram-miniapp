document.addEventListener("DOMContentLoaded", async () => {
  console.log("Farm JS code here");

  const BE_URL = window.config.BE_URL;
  const TG_TOKEN = window.config.TG_TOKEN;

  console.log("BE_URL", BE_URL);

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
          userStatus.farmingPoint.toFixed(6) || "0.000000";
        document.getElementById("referrers-count").textContent =
          userStatus.referrers.length || "0";
        document.getElementById("referral-points").textContent =
          userStatus.referralPoint || "0";

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
        25 * 8
      ).toFixed(6);
    } else {
      const additionalPoints = 25 / 3600;
      userStatus.farmingPoint = userStatus.farmingPoint + additionalPoints;
      document.getElementById("farming-points").textContent = (
        (25 / 3600) * elapsedTime +
        userStatus.farmingPoint
      ).toFixed(6);
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
