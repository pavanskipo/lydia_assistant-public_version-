var shell;
var fs;
var readine;
var cliTable;

// Text variables
const affirmative_text = ['y', 'yes', 'yup'];
const exit_text = ['exit', 'quit', 'close', 'bye'];
const keywords_Text = ['run','runserver','port','ports','new',
'create','server','add','list','show','detail','modify',
'change','update','delete','remove','help','bye'];
const seperator_Text = "-----------";

// System variables
var g_servers = [];
var g_serverNames = [];
var g_appPath;

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

  let serverName = readline.question("\nWhat to name this server? ->");
  let serverNameError = validateServerName(serverName);
  while (serverNameError !== '') {
    serverName = readline.question(serverNameError);
    serverNameError = validateServerName(serverName);
  }

  let serverPath = readline.question("\nWhere is the \'" + serverName + "\' app located at?\n( Press \"ENTER\" to use current directory )->");
  if (serverPath.trim() === '') {
    serverPath = shell.pwd().stdout
  }
  let serverExec = readline.question("\nHow do i run this server?($IP = IP address, $PORT = port) \n( Example: \"ng serve --host $IP --port $PORT\" )\t\t->");
  let serverDefaultPort = readline.question("\nAny default port number?( Defaults to 8080 ) ->");
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
    'serverExec': serverExec,
    'serverDefaultPort': serverDefaultPort
  });

  try {
    fs.writeFileSync(g_appPath + '/config/paths.json', JSON.stringify(paths), 'utf-8');
    console.log('Paths have been updated!');
    var table = new cliTable({
      head: ['Name', 'Path', 'Command']
    });
    table.push([serverName.toLowerCase(), serverPath, serverExec]);
    console.log(table.toString());
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
    let serverName = readline.question("\nWhat to rename this server?( Current name - " + data.serverName + " ) ->");
    let serverNameError;
    if (serverName.trim() === '') {
      serverNameError = '';
      serverName = data.serverName;
    } else {
      serverName = serverName;
      serverNameError = validateServerName(serverName);
    }
    while (serverNameError !== '') {
      serverName = readline.question("Please provide another name ->");
      serverNameError = validateServerName(serverName);
    }

    let serverPath = readline.question("\nWhat is the \'" + serverName + "\' app's new location?( Current Location - " + data.serverPath + " ) ->");
    serverPath = (serverPath.trim() === '') ? data.serverPath : serverPath;
    let serverExec = readline.question("\nHow do i run this server?($IP = IP address, $PORT = port) \n ( Currently -" + data.serverExec + ") ->");
    serverExec = (serverExec.trim() === '') ? data.serverExec : serverExec;
    let serverDefaultPort = readline.question("\nChange default port number?")
    let paths = g_servers;
    paths.servers[serverIndex] = {
      'serverName': serverName.toLowerCase(),
      'serverPath': serverPath,
      'serverExec': serverExec,
      'serverDefaultPort': serverDefaultPort
    };
    try {
      fs.writeFileSync(g_appPath + '/config/paths.json', JSON.stringify(paths), 'utf-8');
      console.log('Configuration has been updated!');
      var table = new cliTable({
        head: ['Name', 'Path', 'Command']
      });
      table.push([serverName.toLowerCase(), serverPath, serverExec]);
      console.log(table.toString());
      updateFromPaths();
    } catch (err) {
      console.log("Couldn't update the server configuration, try again... ");
    }

  }
}

function readConfigurations(serverName) {
  let serverIndex = -1;
  let servers = [];
  for (let index in g_serverNames) {
    serverName.forEach(function(serverName){
      if(g_serverNames[index].indexOf(serverName) > -1){
        serverIndex = index;
        servers.push(serverIndex);
      }
    });
  }
  console.log(seperator_Text);
  if (g_servers.length == 0 || g_servers.servers.length <= 0) {
    let confirmation = readline.question("We don't have any servers... Do you want to configure a new one?(y/n) ");
    if (affirmative_text.indexOf(confirmation.toLowerCase()) > -1) {
      setNewConfig('first');
    } else {
      console.log("Okay, If you change your mind...let me know \n");
    }
  } else if (serverIndex === -1) {
    var table = new cliTable({
      head: ['Name', 'Path', 'Command']
    });
    console.log("Our servers -> ( Name | Path | command)")
    g_servers['servers'].forEach(function (server) {
      table.push([server.serverName, server.serverPath, server.serverExec]);
    });
    console.log(table.toString());
  } else {
    var table = new cliTable({
      head: ['Name', 'Path', 'Command']
    });
    servers.forEach(function (serverIndex) {
      let server = g_servers.servers[serverIndex];
      table.push([server.serverName, server.serverPath, server.serverExec])
    });
    console.log(table.toString());
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
    servers.forEach(function (serverIndex) {
      paths.servers[serverIndex] = '-1';
    });
    removedIndx = paths.servers.indexOf('-1');
    while (removedIndx > -1) {
      paths.servers.splice(removedIndx, 1);
      removedIndx = paths.servers.indexOf('-1');
    }
    try {
      fs.writeFileSync(g_appPath + '/config/paths.json', JSON.stringify(paths), 'utf-8');
      console.log('Configuration/s has been deleted!');
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
    fs = require('file-system');
    readline = require('readline-sync');
    cliTable = require('cli-table');
    begin();
  } catch (error) {
    console.log("oh no....! It seems some packages are missing =(");
    console.log("Please reinstall");
    process.exit()
  }
}

function runTheServer(serverNameSet) {
  let serverIndex = -1;
  for (let index in g_serverNames) {
    if (serverNameSet.has(g_serverNames[index])) {
      serverIndex = index;
    }
  }
  let serverName = [...serverNameSet];
  let portExist = (serverName.indexOf("port") > -1) ? serverName.slice(serverName.indexOf("port"), serverName.length) : null;
  let ports = [];

  if (g_servers.servers.length <= 0) {
    let confirmation = readline.question("We don't have any servers... Do you want to configure a new one?(y/n) ");
    if (affirmative_text.indexOf(confirmation.toLowerCase()) > -1) {
      setNewConfig('first');
    } else {
      console.log("Okay, If you change your mind...let me know \n");
    }
  } else if (serverIndex === -1) {
    console.log("Didn't find a server with that name. ")
    console.log("Our servers -> ( Name | Path | command)")
    g_servers['servers'].forEach(function (server) {
      console.log(server.serverName + " | " + server.serverPath + " | " + server.serverExec);
    });
  } else {
    let server = g_servers.servers[serverIndex];
    let execCommand = server.serverExec;
    try {

      execCommand = 'gnome-terminal --tab -e \"' + execCommand + '\"';
      let ipAddr = shell.exec('hostname -I', {
        silent: true
      }).stdout.split(" ")[0];
      execCommand = execCommand.replace(/\$IP/g, ipAddr);

      if (portExist === null) {
        server.serverDefaultPort = (server.serverDefaultPort == '') ? 8080 : server.serverDefaultPort;
        execCommand = execCommand.replace(/\$PORT/g, server.serverDefaultPort);
        execCommand = "cd " + server.serverPath + ";" + execCommand;

        shell.exec(execCommand, {
          silent: true
        });
        console.log("Running " + server.serverName);
        // console.log(shell.pwd())
      } else {
        execCommand = "cd " + server.serverPath + ";" + execCommand;
        portExist.forEach(function (port) {

          if (Number.isInteger(parseInt(port))) {
            let command = execCommand.replace(/\$PORT/g, port);

            shell.exec(command, {
              silent: true
            });
            console.log(command);
          }
        });
        console.log("Running " + server.serverName + " on " + ipAddr + " : " + port);
      }
    } catch (err) {
      console.log("Couldn't run the server, try again...");
    }
  }
}

function showHelp(){
  console.log("\nMy primary purpose is to Manage Development servers.")
  var table = new cliTable({
    head: ['What i can do ->']
  });
  var help = [['Create a new server configuration'],
['Show details of existing configurations'],
['Modify or Delete existing configurations'],
['Run development servers ( I can automatically fetch system IP )']]
  help.forEach((helpData)=>{
    table.push(helpData);
  })
  console.log(table.toString());
  
}

function decipherCommand(command) {
  let c = command.split(" ");
  if (c.indexOf("run") > -1 || c.indexOf("runserver") > -1) {
    changedIndx = c.indexOf('ports');
    while (changedIndx > -1) {
      c[changedIndx] = 'port';
      changedIndx = c.indexOf('ports');
    }
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

  } else if (c.indexOf("delete") > -1 || c.indexOf("remove") > -1) {
    let serverName = new Set(c);
    deleteConfiguration(serverName);
    return 'delete a config';
  } else if(c.indexOf("help") > -1) {
    showHelp();
    return 'help';
  } else if (c.indexOf("bye") > -1){
    console.log("\nBye");
    console.log(seperator_Text);
    process.exit();
  }
    else {
    console.log("Sorry, I didn't get that...");
    return 'nota';
  }
}

function updateFromPaths() {
  return new Promise(function (resolve, reject) {
    try {
      var data = fs.readFileSync(g_appPath + '/config/paths.json');
      g_serverNames = [];
      g_servers = JSON.parse(data);
      for (let server of g_servers.servers) {
        g_serverNames.push(server['serverName']);
      }
      resolve();
    } catch (err) {
      console.log(seperator_Text);
      shell.exec('mkdir ' + g_appPath + '/config', {
        silent: true
      });
      shell.exec('touch ' + g_appPath + '/config/paths.json', {
        silent: true
      });
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
  let command = '';
  let command_result = 'begin';
  g_appPath = shell.exec('whereIsLydia.sh', {
    silent: true
  }).stdout
  if (g_appPath == '') {
    console.log("Missing location...");
    process.exit();
  } else {
    g_appPath = g_appPath.substring(0, g_appPath.length - 1);
  }
  var update = updateFromPaths();
  update.then(function () {
    let commandLine = process.argv.slice(2)
    if(commandLine.length === 0){
      console.log(seperator_Text);
      console.log("What can i do for you? ");
      do {
        command = readline.question("\n>>> Lydia, ");
        command_result = decipherCommand(command.toLowerCase());
      } while (command_result != 'quit');
    } else {
      console.log(seperator_Text);
      commandLine.forEach(function(data){
        command = command + ' ' + data;
      });
      command_result = decipherCommand(command.toLowerCase());
      do {
        command = readline.question("\n>>> Lydia, ");
        command_result = decipherCommand(command.toLowerCase());
      } while (command_result != 'quit');
    }    
  });

}

// Main
init()