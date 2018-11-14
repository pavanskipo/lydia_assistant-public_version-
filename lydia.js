
var shell;
var fs;
var readine;

init()

function init(){
  let packages = 'shelljs fs readline-sync';
  let error = false;
  try{  
    shell = require('shelljs');
    fs = require('fs');
    readline = require('readline-sync');
  } catch (error) {
    if(shell.exec('npm install -g '+packages).code !== 0){
      console.log("oh no....! Error while instaling packages =(");
      error = true;
    };
  } finally {
      if(!error){
        begin();
      } else {
        process.exit()
      }
  }
  
}

function setPaths(){
 let angularPath = readline.question("Where is your angular app located at?");
 let djangoPath = readline.question("Where is your Django app located at?");
 let paths = {
   'angularPath': angularPath,
   'djangoPath': djangoPath
 };
 let data = JSON.stringify(paths);
 fs.writeFile('saradomin.json', data, (err) => {
   if(err) throw err;
   console.log('Paths have been updated!');
 })

}

function begin(){
  fs.readFile('saradomin.json', function(err, data) {
    if(err){
    shell.exec('touch saradominPath.json').code; 
    setPaths();
    } else {
      let paths = JSON.parse(data);
      console.log(paths);
    }
  });

}
