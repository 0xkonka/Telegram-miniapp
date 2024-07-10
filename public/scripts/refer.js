document.addEventListener("DOMContentLoaded", async () => {
  console.log("Refer JS code here");

  const BE_URL = window.config.BE_URL;
  const TG_TOKEN = window.config.TG_TOKEN;

  console.log("BE_URL", BE_URL);

  // Initialize Telegram Web App
  const tg = window.Telegram.WebApp;
  tg.expand(); // Expand the app to the maximum available height

  // Get userId from local storage or default to "cym1020"
  const userId = localStorage.getItem("userId") || "cym1020";

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

        const referralBonuses = [
          { count: 5, points: 2500 },
          { count: 10, points: 5000 },
          { count: 25, points: 125000 },
        ];

        referralBonuses.forEach((bonus) => {
          // if (userStatus.referrers.length >= bonus.count) {
            const referrerElement = document.createElement("div");
            referrerElement.className =
              "w-full border border-[#393939] rounded-md p-3 flex justify-between items-center gap-3";
            referrerElement.innerHTML = `
              <div class="flex flex-col gap-1">
                <p class="text-white font-semibold leading-tight">${bonus.count} referrals bonus</p>
              </div>
              <div class="flex gap-2 items-center">
                <p class="font-britanica text-white text-2xl">${bonus.points}</p>
                <p class="text-white">Points</p>
              </div>
            `;
            referralsList.appendChild(referrerElement);
          // }
        });

        const fetchReferrerStatus = async (referrer) => {
          try {
            const referrerStatusResponse = await fetch(
              `${BE_URL}/status/${referrer.referrerId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${TG_TOKEN}`,
                },
              }
            );

            if (referrerStatusResponse.ok) {
              const referrerStatus = (await referrerStatusResponse.json()).data;
              // const totalPoints =
              //   referrerStatus.farmingPoint + referrerStatus.referralPoint;

              const referrerElement = document.createElement("div");
              referrerElement.className =
                "w-full border border-[#393939] rounded-md p-3 flex justify-between items-center gap-3";
              referrerElement.innerHTML = `
                <div class="flex flex-col gap-1">
                  <p class="text-white font-semibold leading-tight">${referrerStatus.userName}</p>
                </div>
                <div class="flex gap-2 items-center">
                  <p class="font-britanica text-white text-2xl">2000</p>
                  <p class="text-white">Points</p>
                </div>
              `;
              referralsList.appendChild(referrerElement);
            } else {
              console.error(
                "Error getting referrer status:",
                referrerStatusResponse.statusText
              );
            }
          } catch (error) {
            console.error("Error:", error);
          }
        };

        userStatus.referrers.forEach(fetchReferrerStatus);
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

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Referral link copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Handle "Copy Link" button click
  document.getElementById("copy-link").addEventListener("click", () => {
    const referralLink = `https://t.me/trenfinance_bot?start=${userId}`;
    copyToClipboard(referralLink);
  });

  // Handle "Refer a Friend" button click
  document.getElementById("refer-friend").addEventListener("click", () => {
    const referralLink = `https://t.me/trenfinance_bot?start=${userId}`;
    const message =
      "\nTren Finance is a DeFi protocol launching soon, and they are inviting you to start farming points in their new mini game.\n\n";
    const comment =
      "Get 2,000 bonus points when you start farming Tren Finance points using a referral link!\n\nClick the link above to open the Telegram bot and claim your bonus:";
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(message + comment)}`;
    window.open(url, "_blank");
  });
});
