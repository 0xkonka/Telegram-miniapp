document.addEventListener("DOMContentLoaded", () => {
  console.log("JS code here");

  //   const BE_URL = "http://localhost:8000/api/telegram";
  //   //   const BE_URL = "https://be-express-lime.vercel.app/api/telegram";
  //   const TG_TOKEN =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiJ0cmVuIiwicm9sZSI6InRlbGVncmFtIiwiaWF0IjoxNzE5OTM2MTI5fQ.H6jyqpfVwb2aAOWTozuyUzX5zjJauegqUWWAY0y9RXY";

  const BE_URL = window.config.BE_URL;
  const TG_TOKEN = window.config.TG_TOKEN;

  const launchButton = document.getElementById("launch-app");
  const usernameInput = document.getElementById("username");

  launchButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default link behavior

    const userId = usernameInput.value;

    console.log("userId", userId);

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
  });
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
