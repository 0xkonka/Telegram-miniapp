// Configure
const BE_URL = window.config.BE_URL;
const TG_TOKEN = window.config.TG_TOKEN;

async function registerUser(userId) {
  try {
    const response = await fetch(`${BE_URL}/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TG_TOKEN}`,
      },
      body: JSON.stringify({ userId }),
    });

    console.log("response", response);

    if (response.ok) {
      const result = await response.json();
      console.log("Success:", result);
      // Redirect or perform any additional actions here
      window.location.href = "./farm.html";
    } else {
      console.error("Error:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS code here");
  const launchButton = document.getElementById("launch-app");
  const usernameInput = document.getElementById("username");

   // Parse the query string
   const urlParams = new URLSearchParams(window.location.search);
   // Get individual parameters
   const usernameParam = urlParams.get('username');
   const idParam = urlParams.get('id');

  if(!usernameParam) {  // If username doesn't exist (Didn't pass from URL param), we create new user based on input name.
    launchButton.addEventListener("click", async (event) => {
      event.preventDefault(); // Prevent the default link behavior
      const userName = usernameInput.value;
      const userId = Math.round(Math.random() * 1000000);
      registerUser(userId, userName)
    });
  } else {  // If the username already exist, we pass Signup page.
    usernameInput.value = usernameParam
    registerUser(idParam, usernameParam)
  }
  
  // const app = document.getElementById('app');

  // // Example of calling a 3rd party API
  // fetch('https://api.example.com/data')
  //   .then(response => response.json())
  //   .then(data => {
  //     app.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  //   })
  //   .catch(error => {
  //     console.error('Error fetching data:', error);
  //     app.innerHTML = "<p>Error fetching data.</p>";
  //   });
});
