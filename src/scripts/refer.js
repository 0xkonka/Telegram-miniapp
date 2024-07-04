document.addEventListener("DOMContentLoaded", async () => {
  console.log("Refer JS code here");

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

        // Display referral points
        document.getElementById("referral-points").textContent =
          userStatus.referralPoint || "0";

        // Display referrals
        const referralsList = document.getElementById("referrals-list");
        referralsList.innerHTML = ""; // Clear any existing referrals

        userStatus.referrers.forEach(async (referrer) => {
          try {
            const referrerStatusResponse = await fetch(`${BE_URL}/status/${referrer.referrerId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${TG_TOKEN}`,
              },
            });

            if (referrerStatusResponse.ok) {
              const referrerStatus = (await referrerStatusResponse.json()).data;
              const totalPoints = referrerStatus.farmingPoint + referrerStatus.referralPoint;
              const timeSinceReferral = Math.floor(new Date().getTime() / 1000) - referrer.timestamp;

              const referrerElement = document.createElement("div");
              referrerElement.className =
                "w-full border border-[#393939] rounded-md p-3 flex justify-between items-center gap-3";
              referrerElement.innerHTML = `
                <div class="flex flex-col gap-1">
                  <p class="text-white font-semibold leading-tight">${referrer.referrerId}</p>
                  <p class="text-sm text-primary font-light">${timeSinceReferral} seconds ago</p>
                </div>
                <div class="flex gap-2 items-center">
                  <p class="font-britanica text-white text-2xl">${totalPoints}</p>
                  <p class="text-[#999]">Points</p>
                </div>
              `;
              referralsList.appendChild(referrerElement);
            } else {
              console.error("Error getting referrer status:", referrerStatusResponse.statusText);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        });
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

  // Handle "Copy Link" button click
  document.getElementById("copy-link").addEventListener("click", () => {
    const referralLink = `${window.location.origin}/refer.html?userId=${userId}`;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        alert("Referral link copied to clipboard");
      })
      .catch((err) => {
        console.error("Error copying link: ", err);
      });
  });

  // Handle "Refer a Friend" button click
  document.getElementById("refer-friend").addEventListener("click", () => {
    const referralLink = `${window.location.origin}/refer.html?userId=${userId}`;
    window.open(
      `mailto:?subject=Join me on Tren&body=Join me on Tren and earn points! Here's my referral link: ${referralLink}`,
      "_blank"
    );
  });
});
