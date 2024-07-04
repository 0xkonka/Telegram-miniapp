document.addEventListener("DOMContentLoaded", async () => {
  console.log("Farm JS code here");

  const BE_URL = window.config.BE_URL;
  const TG_TOKEN = window.config.TG_TOKEN;

  console.log("BE_URL", BE_URL);

  // Get userId from query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId") || "cym1020"; // Default to "cym1020" if not found

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
        const userStatus = (await userStatusResponse.json()).data;
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
        } else {
          const now = Math.floor(new Date().getTime() / 1000);
          console.log("now", now);
          const remainingTime = userStatus.farmStartingTime + 8 * 60 * 60 - now;
          console.log("remainingTime", remainingTime);
          if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / (60 * 60));
            const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
            const seconds = Math.floor(remainingTime % 60);
            document.getElementById(
              "remaining-time"
            ).textContent = `${hours}h : ${minutes}m : ${seconds}s`;
          } else {
            document.getElementById("remaining-time").textContent =
              "0h : 0m : 0s";
          }
        }
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
    console.error("No userId found in query parameters");
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
          const result = await response.json();
          console.log("Farming started:", result);
          // Optionally update the farmStartingTime or display a success message
          const now = new Date().getTime();
          const remainingTime = now - result.farmStartingTime;
          if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor(
              (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            document.getElementById(
              "remaining-time"
            ).textContent = `${hours}h : ${minutes}m : ${seconds}s`;
          } else {
            document.getElementById("remaining-time").textContent =
              "0h : 0m : 0s";
          }
        } else {
          console.log("error: ", (await response.json()).message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
});
