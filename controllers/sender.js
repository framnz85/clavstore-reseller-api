exports.addingSubscriber = (email) => {
  try {
    const url = new URL("https://api.sender.net/v2/subscribers/groups/bYZ9nW");
    const senderToken = process.env.SENDER_TOKEN;

    let headers = {
      Authorization: `Bearer ${senderToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let bodyContent = {
      subscribers: [email],
      trigger_automation: false,
    };

    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  } catch (error) {
    console.error("Adding subscriber fails. " + error.message);
  }
};

exports.removeSubscriber = (email) => {
  try {
    const url = new URL("https://api.sender.net/v2/subscribers/groups/e3VOn4");
    const senderToken = process.env.SENDER_TOKEN;

    let headers = {
      Authorization: `Bearer ${senderToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let bodyContent = {
      subscribers: [email],
    };

    fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  } catch (error) {
    console.error("Removing subscriber fails. " + error.message);
  }
};

exports.updateSubscriber = (email) => {
  try {
    const url = new URL(`https://api.sender.net/v2/subscribers/${email}`);
    const senderToken = process.env.SENDER_TOKEN;

    let headers = {
      Authorization: `Bearer ${senderToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let bodyContent = {
      fields: {
        "upgrade ": 1,
      },
    };

    fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  } catch (error) {
    console.error("Updating subscriber fails. " + error.message);
  }
};
