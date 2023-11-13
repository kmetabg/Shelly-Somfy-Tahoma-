// this script can control multiple devices connected to Somfy TaHoma hub
// for deviceURL you need to execute curl -k -X GET "https://TahomaHubIP:port/enduser-mobile-web/1/enduserAPI/setup/devices" \
//     -H "Authorization: Bearer xxxxxxxx" \ // replace xxxxx with your token
//     -H "Content-Type: application/json"
// and found your deviceURL in json file. 

let CONFIG = {
  token: "Token", // Replace with your actual token
  ip: "TaHoma local IP:Port", // Replace with the IP of your TaHoma Hub
  deviceURLs: [".....", "....."], // Replace it with deviceURL
  command: "close", // Can be 'open', 'close', or 'setPercentage'
  percentage: 50 // Used only if command is 'setPercentage'
};

function sendCommandsToDeviceURLs() {
  let commandUrl = "https://" + CONFIG.ip + "/enduser-mobile-web/1/enduserAPI/exec/apply";

  for (let i = 0; i < CONFIG.deviceURLs.length; i++) {
    let deviceURL = CONFIG.deviceURLs[i];
    let commandObj = { name: CONFIG.command };
    if (CONFIG.command === "setPercentage") {
      commandObj.parameters = [CONFIG.percentage];
    } else {
      commandObj.parameters = [];
    }

    let payload = {
      method: "POST",
      ssl_ca: "*",
      headers: {
        "Authorization": "Bearer " + CONFIG.token,
        "Content-Type": "application/json"
      },
      url: commandUrl,
      body: JSON.stringify({ actions: [{ deviceURL: deviceURL, commands: [commandObj] }] })
    };

    Shelly.call("HTTP.REQUEST", payload, function(res, err_code, err_msg) {
      if (err_code) {
        console.log("Error sending command to device " + deviceURL + ": ", err_msg);
        return;
      }

      console.log("Command sent successfully to device " + deviceURL);
    });
  }
}

sendCommandsToDeviceURLs();
