var shell;
var fs;
var readine;

// Text variables
const affirmative_text = ['y', 'yes', 'yup'];
const exit_text = ['exit', 'quit', 'close', 'bye'];
const keywords_Text = ['new', 'create', 'server', 'run', 'list', 'show', 'modify', 'change', 'update'];
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
// -------------------------------------------------------------------------------------------------------------------------------

function setNewConfig(type) {
  console.log("\nOkay, lets create a new server configuration");
  console.log(seperator_Text);

  let serverName = readline.question("What to name this server? ->");
  let serverNameError = validateServerName(serverName);
  while (serverNameError !== '') {
    serverName = readline.question(serverNameError);
    serverNameError = validateServerName(serverName);
  }

  let serverPath = readline.question("Where is the \'" + serverName + "\' app located at? ->");
  let serverExec = readline.question("How do i run this server?($IP = IP address, $PORT = port) \n Example: \"ng serve --host $IP --port $PORT\" \t\t->");
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

function updateConfig(serverName) {
  let serverIndex = -1;
  for (let index in g_serverNames) {
    if (serverName.has(g_serverNames[index])) {
      serverIndex = index;
    }
  }

  if (serverIndex === -1) {
    console.log("I didn't find any server with that name ")
  } else {
    let data = g_servers.servers[serverIndex];
    let serverName = readline.question("What to rename this server?( Current name - " + data.serverName + " ) ->");
    let serverNameError;
    if(serverName.trim() === ''){
      serverNameError = '';
      serverName = data.serverName;
    }else{
      serverName = serverName;
      serverNameError = validateServerName(serverName);
    } 
    while (serverNameError !== '') {
      serverName = readline.question("Please provide another name ->");
      serverNameError = validateServerName(serverName);
    }

    let serverPath = readline.question("What is the \'" + serverName + "\' app's new location?( Current Location - " + data.serverPath + " ) ->");
    serverPath = (serverPath.trim() === '') ? data.serverPath : serverPath;
    let serverExec = readline.question("How do i run this server?($IP = IP address, $PORT = port) \n ( Currently -" + data.serverExec + ") ->");
    serverExec = (serverExec.trim() === '') ? data.serverExec : serverExec;

    let paths = g_servers;
    paths.servers[serverIndex] = {
      'serverName': serverName.toLowerCase(),
      'serverPath': serverPath,
      'serverExec': serverExec
    };
    try {
      fs.writeFileSync('config/paths.json', JSON.stringify(paths), 'utf-8');
      console.log('Configuration has been updated!');
      updateFromPaths();
    } catch (err) {
      console.log("Couldn't update the server configuration, try again... ");
    }

  }
}

function readConfigurations(serverName){
  let serverIndex = -1;
  let servers = [];
  for (let index in g_serverNames) {
    if (serverName.has(g_serverNames[index])) {
      serverIndex = index;
      servers.push(serverIndex);
    }
  }
  console.log(seperator_Text);
  if(g_servers.servers.length <= 0){
    let confirmation = readline.question("We don't have any servers... Do you want to configure a new one?(y/n) ");
      if (affirmative_text.indexOf(confirmation.toLowerCase()) > -1) {
        setNewConfig('first');
      } else {
        console.log("Okay, If you change your mind...let me know \n");
      }
  } else if(serverIndex === -1){
    console.log("Our servers -> ( Name | Path | command)")
    g_servers['servers'].forEach(function (server) {
      console.log(server.serverName+" | "+server.serverPath+" | "+server.serverExec);
    });
  } else {
    servers.forEach(function(serverIndex){
      let server = g_servers.servers[serverIndex];
      console.log("Server Name : "+server.serverName);
      console.log("Server Path : "+server.serverPath);
      console.log("Execution   : "+server.serverExec);
      console.log("\n");
    });    
  }

  console.log("\n");
}

function deleteConfiguration(serverName) {
  let serverIndex = -1;
  let servers = [];
  for (let index in g_serverNames) {
    if (serverName.has(g_serverNames[index])) {
      serverIndex = index;
      servers.push(serverIndex);
    }
  }
  if (serverIndex === -1) {
    console.log("I didn't find any server with that name ");
    readConfigurations(serverName);
  } else {
    console.log(seperator_Text);
    let paths = g_servers;
    servers.forEach(function(serverIndex){
      paths.servers[serverIndex] = '-1';
    });
    removedIndx = paths.servers.indexOf('-1');
    while(removedIndx > -1) {
      paths.servers.splice(removedIndx,1);
      removedIndx = paths.servers.indexOf('-1');
    }
    try {
      fs.writeFileSync('config/paths.json', JSON.stringify(paths), 'utf-8');
      console.log('Configuration has been deleted!');
      updateFromPaths();
    } catch (err) {
      console.log("Couldn't delete the server configuration, try again... ");
    }
  }
}

// -------------------------------------------------------------------------------------------------------------------------------


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

function runTheServer(serverName){

}

function decipherCommand(command) {
  let c = command.split(" ");
  if (c.indexOf("run") > -1) {
    let serverName = new Set(c);
    runTheServer(serverName);
    return 'run existing server';
  } else if ((c.indexOf("new") > -1 || c.indexOf("create") > -1) && c.indexOf("server") > -1) {
    setNewConfig('add');
    return 'new server config';

  } else if (c.indexOf("list") > -1 || c.indexOf("show") > -1 || c.indexOf("detail") > -1) {
    let serverName = new Set(c);
    readConfigurations(serverName);
    return 'list servers';
  } else if (c.indexOf("modify") > -1 || c.indexOf("change") > -1 || c.indexOf("update") > -1) {
    let serverName = new Set(c);
    updateConfig(serverName);
    return 'update a config';

  } else if (c.indexOf("delete") > -1 || c.indexOf("remove") > -1){
    let serverName = new Set(c);
    deleteConfiguration(serverName);
    return 'delete a config';
  }
  else {
    console.log("Sorry, I didn't get that...");
    return 'nota';
  }
}

function updateFromPaths() {
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
      console.log(seperator_Text);
      shell.exec('mkdir config', { silent: true });
      shell.exec('touch config/paths.json', { silent: true });
      console.log("No Servers found...")
      let confirmation = readline.question("Do you want to configure a new server?(y/n) ");
      if (affirmative_text.indexOf(confirmation.toLowerCase()) > -1) {
        setNewConfig('first');
        resolve();
      } else {
        console.log("Okay, If you change your mind...let me know \n");
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
    console.log(seperator_Text);
    console.log("What can i do for you? ");
    do {
      command = readline.question("\n>>> Lydia, ");
      command_result = decipherCommand(command.toLowerCase());
    } while (command_result != 'quit');
  });

}

// Main
init()