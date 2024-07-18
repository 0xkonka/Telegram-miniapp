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
  console.log("Tasks JS code here");
  Telegram.WebApp.setHeaderColor("#101010");
  Telegram.WebApp.setBackgroundColor("#101010");
  Telegram.WebApp.expand();
  checkHeight()
  Telegram.WebApp.ready();

  const BE_URL = window.config.BE_URL;
  

  console.log('BE_URL', BE_URL);

  // Get userId from local storage
  const userId = localStorage.getItem("userId")

  if (userId) {
    console.log("userId", userId);

    try {
      const userStatusResponse = await fetch(`${BE_URL}/status/${userId}`, {
        method: "GET",
        headers: {
          
        },
      });

      if (userStatusResponse.ok) {
        const userStatus = (await userStatusResponse.json()).data;
        console.log("User Status:", userStatus);
        
        // Update UI based on social task status
        if (userStatus.socialTaskStatus.telegram) {
          document.getElementById("start-telegram").textContent = "Completed";
          document.getElementById("start-telegram").disabled = true;
          document.getElementById("start-telegram").classList.add("bg-gray-500");
        }
        if (userStatus.socialTaskStatus.discord) {
          document.getElementById("start-discord").textContent = "Completed";
          document.getElementById("start-discord").disabled = true;
          document.getElementById("start-discord").classList.add("bg-gray-500");
        }
        if (userStatus.socialTaskStatus.twitter) {
          document.getElementById("start-twitter").textContent = "Completed";
          document.getElementById("start-twitter").disabled = true;
          document.getElementById("start-twitter").classList.add("bg-gray-500");
        }

        // Update task progression
        const completedTasks = ["telegram", "discord", "twitter"].filter(social => userStatus.socialTaskStatus[social]).length;
        document.getElementById("task-count").textContent = `${completedTasks}/3`;

        if(completedTasks != 0) {
          document.getElementById("progress").style.width = `${(completedTasks / 3) * 100}%`;
          document.getElementById("progress-label").classList.remove('hidden');
          document.getElementById("progress-label").style.left = `calc(${(completedTasks / 3) * 100}% - 20px)`;
          document.getElementById("progress-comment").classList.remove('hidden');
          document.getElementById("progress-comment").style.left = `calc(${(completedTasks / 3) * 100}% - 25px)`;
          document.getElementById("progress-indicator").classList.remove('hidden');
          document.getElementById("progress-indicator").style.left = `calc(${(completedTasks / 3) * 100}% - 15px)`;
  
          // Hide bubble, label, indicator when the completed task count is 0.
          // document.getElementById("progress-comment").style.display = completedTasks == 0 ? 'none' : 'block';
          // document.getElementById("progress-label").style.display = completedTasks == 0 ? 'none' : 'block';
          // document.getElementById("progress-indicator").style.display = completedTasks == 0 ? 'none' : 'block';
          document.getElementById("progress-label").innerHTML = `${parseInt((completedTasks / 3) * 100)}%`;
        }

        document.getElementById("tasks-badge").innerHTML = 3 - completedTasks;
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

  // Handle social task start button click
  const handleTaskStart = async (social) => {
    try {
      const response = await fetch(`${BE_URL}/social/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({ userId, social }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`${social} task started:`, result);
        // Update button and progression
        setTimeout(async() => {
          document.getElementById(`start-${social}`).textContent = "Completed";
          document.getElementById(`start-${social}`).disabled = true;
          document.getElementById(`start-${social}`).classList.add("bg-gray-500");

          const userStatusResponse = await fetch(`${BE_URL}/status/${userId}`, {
            method: "GET",
            headers: {
              
            },
          });
    
          if (userStatusResponse.ok) {
            const userStatus = (await userStatusResponse.json()).data;
            const completedTasks = ["telegram", "discord", "twitter"].filter(social => userStatus.socialTaskStatus[social]).length;
            document.getElementById("task-count").textContent = `${completedTasks}/3`;

            document.getElementById("progress").style.width = `${(completedTasks / 3) * 100}%`;
            document.getElementById("progress-label").style.left = `calc(${(completedTasks / 3) * 100}% - 20px)`;
            document.getElementById("progress-comment").style.left = `calc(${(completedTasks / 3) * 100}% - 25px)`;
            document.getElementById("progress-indicator").style.left = `calc(${(completedTasks / 3) * 100}% - 15px)`;
    
            // Hide bubble, label, indicator when the completed task count is 0.
            document.getElementById("progress-comment").style.display = completedTasks == 0 ? 'none' : 'block';  
            document.getElementById("progress-label").style.display = completedTasks == 0 ? 'none' : 'block';  
            document.getElementById("progress-indicator").style.display = completedTasks == 0 ? 'none' : 'block';          
            document.getElementById("progress-label").innerHTML = `${parseInt((completedTasks / 3) * 100)}%`;

            document.getElementById("tasks-badge").innerHTML = 3 - completedTasks;
          }
        }, 10000)
      } else {
        console.error(`Error starting ${social} task:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error starting ${social} task:`, error);
    }
  };

  document.getElementById("start-telegram").addEventListener("click", () => handleTaskStart("telegram"));
  document.getElementById("start-discord").addEventListener("click", () => handleTaskStart("discord"));
  document.getElementById("start-twitter").addEventListener("click", () => handleTaskStart("twitter"));
});
