var shell;
var fs;
var readine;

// Text variables
const affirmative_text = ['y', 'yes', 'yup'];
const exit_text = ['exit', 'quit', 'close', 'bye'];
const keywords_Text = ['run', 'new', '']
const seperator_Text = "-----------";

// System variables
var g_servers = [];
var g_serverNames = [];



// Validations

function validateServerName(name) {
  if (g_serverNames.indexOf(name) > -1) {
    return "We already have this server, lets rename the new server... ";
  } else if (keywords_Text.indexOf(name) > -1) {
    return "Invalid servername, give another name... ";
  } else {
    return "";
  }
}

// Server CRUD

function setNewConfig(type) {
  console.log("\nOkay, lets create a new server configuration");
  console.log(seperator_Text);

  let serverName = readline.question("What to name this server? ");
  let serverNameError = validateServerName(serverName);
  while (serverNameError !== '') {
    serverName = readline.question(serverNameError);
    serverNameError = validateServerName(serverName);
  }

  let serverPath = readline.question("Where is the \'" + serverName + "\' app located at? ");
  let serverExec = readline.question("How do i run this server?($IP = IP address, $PORT = port) \n Example: \"ng serve --host $IP --port $PORT\" \t");
  let paths;

  if (type === 'first') {
    paths = {
      "servers": []
    };
  } else {
    paths = g_servers;
  }

  paths.servers.push({
    'serverName': serverName.toLowerCase(),
    'serverPath': serverPath,
    'serverExec': serverExec
  });




  try {
    fs.writeFileSync('config/paths.json', JSON.stringify(paths), 'utf-8');
    console.log('Paths have been updated!');
    updateFromPaths();
  } catch (err) {
    console.log("Couldn't add the server configuration, try again... ");
  }
}


// Application Core

function init() {
  try {
    shell = require('shelljs');
    fs = require('fs');
    readline = require('readline-sync');
    begin();
  } catch (error) {
    console.log("oh no....! It seems some packages are missing =(");
    process.exit()
  }
}

function decipherCommand(command) {
  let c = command.split(" ");
  if ((c.indexOf("new") > -1 || c.indexOf("create") > -1) && c.indexOf("server") > -1) {
    setNewConfig('add');
    return 'new server config';

  } else if (c.indexOf("run") > -1) {
    if (runTheServer());
    return 'run existing server';
  } else if (c.indexOf("list") > -1 || c.indexOf("show") > -1) {
    console.log(seperator_Text);
    g_serverNames.forEach(function (server) {
      console.log(server);
    });
    console.log("\n");
    return 'list servers';
  } else {
    console.log("Sorry, I didn't get that...");
    return 'nota';
  }
}

function updateFromPaths() {
  console.log("update from paths");
  return new Promise(function (resolve, reject) {
    try {
      var data = fs.readFileSync('config/paths.json');
      g_serverNames = [];
      g_servers = JSON.parse(data);
      for (let server of g_servers.servers) {
        g_serverNames.push(server['serverName']);
      }
      resolve();
    } catch (err) {
      console.log(err);

      shell.exec('mkdir config').code;
      shell.exec('touch config/paths.json').code;
      console.log("No Servers found...")
      let confirmation = readline.question("Do you want to configure a new server?(y/n) ");
      if (affirmative_text.indexOf(confirmation.toLowerCase()) > -1) {
        setNewConfig('first');

        resolve();

      }
    }

  });


}

function begin() {
  let command;
  let command_result = 'begin';
  var update = updateFromPaths();
  update.then(function () {
    console.log("What can i do for you? ");
    do {
      command = readline.question("Lydia, ");
      command_result = decipherCommand(command.toLowerCase());
    } while (command_result != 'quit');
  });

}

// Main
init()