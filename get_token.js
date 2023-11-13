// for more information https://github.com/Somfy-Developer/Somfy-TaHoma-Developer-Mode
// You need to enable developer access to your Somfly hub
// store this token you will need it to control devices

let CONFIG = {
  email: "your_email", // Replace with your Somfy TaHoma email address
  password: "your_pass", // Replace with your Somfy TaHoma password
  pin: "PIN_code" // Replace with your TaHoma gateway pin
};

function simpleEncodeForURI(str) {
  let encoded = '';
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if (char === ' ') {
      encoded += '%20';
    } else if (char === '@') {
      encoded += '%40';
    } else if (char === '#') {
      encoded += '%23';
    } else if (char === '$') {
      encoded += '%24';
    } else if (char === '%') {
      encoded += '%25';
    } else if (char === '&') {
      encoded += '%26';
    } else if (char === '+') {
      encoded += '%2B';
    } else if (char === '/') {
      encoded += '%2F';
    } else if (char === '?') {
      encoded += '%3F';
    } else if (char === '=') {
      encoded += '%3D';
    } else {
      encoded += char;
    }
  }
  return encoded;
}


function authenticate() {
  let loginUrl = "https://ha101-1.overkiz.com/enduser-mobile-web/enduserAPI/login";
  let payloadForLogin = {
    method: "POST",
    url: loginUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "userId=" + simpleEncodeForURI(CONFIG.email) + "&userPassword=" + simpleEncodeForURI(CONFIG.password)
  };

  Shelly.call("HTTP.REQUEST", payloadForLogin, function(res, err_code, err_msg) {
    if (err_code) {
      console.log("Login Error: ", err_msg);
      return;
    }

    // Extract JSESSIONID from response headers
    let jsessionid = res.headers['Set-Cookie'].split(';')[0]; // This might need adjustment based on the response format

    generateToken(jsessionid);
  });
}

function getAvailableTokens(jsessionid) {
  let tokensUrl = "https://ha101-1.overkiz.com/enduser-mobile-web/enduserAPI/config/" + CONFIG.pin + "/local/tokens/devmode";
  let payloadForTokens = {
    method: "GET",
    url: tokensUrl,
    headers: {
      "Content-Type": "application/json",
      "Cookie": jsessionid
    }
  };

  Shelly.call("HTTP.REQUEST", payloadForTokens, function(res, err_code, err_msg) {
    if (err_code) {
      console.log("Error getting available tokens: ", err_msg);
      return;
    }

    console.log("Available Tokens: ", res.body);
  });
}

function activateToken(jsessionid, token) {
  let activateUrl = "https://ha101-1.overkiz.com/enduser-mobile-web/enduserAPI/config/" + CONFIG.pin + "/local/tokens";
  let payloadForActivation = {
    method: "POST",
    url: activateUrl,
    headers: {
      "Content-Type": "application/json",
      "Cookie": jsessionid
    },
    body: JSON.stringify({
      label: "kmetaTok", // Replace with a label of your choice
      token: JSON.parse(token).token, // Parsing and using the token from the response
      scope: "devmode" 
    })
  };

  Shelly.call("HTTP.REQUEST", payloadForActivation, function(res, err_code, err_msg) {
    if (err_code) {
      console.log("Token Activation Error: ", err_msg);
      return;
    }

    console.log("Token activated successfully");
    getAvailableTokens(jsessionid); // Correct place to call getAvailableTokens
  });
}


function generateToken(jsessionid) {
  let tokenUrl = "https://ha101-1.overkiz.com/enduser-mobile-web/enduserAPI/config/" + CONFIG.pin + "/local/tokens/generate";
  let payloadForToken = {
    method: "GET",
    url: tokenUrl,
    headers: {
      "Content-Type": "application/json",
      "Cookie": jsessionid
    }
  };

  Shelly.call("HTTP.REQUEST", payloadForToken, function(res, err_code, err_msg) {
    if (err_code) {
      console.log("Token Generation Error: ", err_msg);
      return;
    }

    let token = res.body; // Adjust based on actual response format
    console.log("Token: ", token);
    activateToken(jsessionid, token); // Call activateToken here after getting the token
   
  });
}

// Start the authentication process
authenticate();
