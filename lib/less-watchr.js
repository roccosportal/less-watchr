// Require
var watchr = require('watchr');
var exec = require('child_process').exec;
var colors = require('colors');
var path = require('path');
var argv = require('optimist')
    .default('path', '.')
    .default('outputFilename', '$1.css')
    .default('fileToCompile', null)
    .default('configFile', null)
    .default('options', null)
    .argv
;


var workingPath = path.relative(__dirname, process.cwd()) + path.sep;

var config = {};
if(argv.configFile != null){
    // load config file
    config = require(path.normalize(workingPath  + argv.configFile));
	
    // set defaults
    if(typeof(config.fileToCompile) === 'undefined'){
        config.fileToCompile = null;
    }
    if(typeof(config.outputFilename) === 'undefined'){
        config.outputFilename = '$1.css';
    }
}
else {
    // map from arguments into config
    config.path = argv.path;
    config.outputFilename = argv.outputFilename;
    config.fileToCompile = argv.fileToCompile;
    config.fileToCompileMap = null;
    config.options = argv.options;
}

// make path to array
if(!(config.path instanceof  Array)){
    config.path = [config.path];
}

// map path to current working directory
for (var j = 0; j < config.path.length; j++) {
	config.path[j] = path.normalize(process.cwd() +  path.sep  + config.path[j]);
}


if(typeof(config.options) ===  'undefined' || config.options === null){
    config.options = '';
}

var suffix = '.less';

// define a simple listener
var lessWatchrListener = {
    log: function(logLevel){},
    error: function(err){
        lessWatchr.logError('an error occured:' + err);
    },
    watching: function(err,watcherInstance,isWatching){
      if (err) {
          lessWatchr.lessWatchr("watching the path " + watcherInstance.path + " failed with error" + err);
      } else {
          lessWatchr.logInfo('watching path: ' + watcherInstance.path);
      }
    },
    change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
        lessWatchr.fileChanged(filePath);
    }
};

// define the basic function of lessWatchr
var lessWatchr = {
    // gets called when a file was changed
    fileChanged : function(filePath){
         // check if this was a .less file
         if(filePath.indexOf(suffix, filePath.length - suffix.length) !== -1 ){
             // trigger less file changed
             lessWatchr.logInfo('----------------------------');
             lessWatchr.logInfo('file changed: ' + filePath);
             lessWatchr.lessFileChanged(filePath);
         }
    },
    // return the current date as string
    getNow : function(){
          var now = new Date();
          return now.toJSON();
    },
    // logs an info message
    logInfo : function(message){
        console.log('[' + lessWatchr.getNow() + '][INFO   ]\t' + message);
    },
    // logs an error message
    logError : function(message){
        console.log('[' + lessWatchr.getNow() + '][' + 'ERROR'.red + '  ]\t' + message);
    },
    // logs an success message
    logSuccess : function(message){
        console.log('[' + lessWatchr.getNow() + '][' + 'SUCCESS'.green + ']\t' + message);
    },
    // tries to find the .less file that needs to be compiled for the changed .less file
    lessFileChanged : function(filePath){
          var filesToCompile = null;
          var outputFilename = config.outputFilename;
          if(config.fileToCompileMap!=null){
             // try to find the current filepath in the fileToCompileMappings
             for (var j = 0; j < config.fileToCompileMap.length; j++) {
                  if(filePath.indexOf(config.fileToCompileMap[j].path) !== -1){
                      lessWatchr.logInfo('matching map path: ' + config.fileToCompileMap[j].path);
                      filesToCompile = config.fileToCompileMap[j].fileToCompile;
                      if(!(filesToCompile instanceof  Array)){
                          // if it is not an array make it to an array
                          filesToCompile = [filesToCompile];
                      }
                      break;
                  }
             }
          }
          // no file found in the mapping array
          if(filesToCompile==null){
              if(config.fileToCompile!==null){
                  // use the given compile file as file to compile
                  filesToCompile = [config.fileToCompile];
              }
              else {
                  filesToCompile = [filePath];
              }
          }

          // start recompiling
          lessWatchr.logInfo('start recompiling... ');
          for ( var i = 0; i < filesToCompile.length; i++) {

              outputFile = filesToCompile[i].replace(/([^\/\\]+)\.less/, outputFilename);
              lessWatchr.recompile(filesToCompile[i], outputFile);
          }



    },
    recompile : function (fileToCompile, outputFile){
         child = exec('lessc ' + config.options + ' ' + fileToCompile + ' ' + outputFile, function (error, stdout, stderr) {
             lessWatchr.logInfo('recompiled file: ' + fileToCompile);
             if(stdout !== null && stdout!='' ){
                 console.log(stdout);
             }
             else if(stderr!==null && stderr!=''){
                 console.log(stderr);
             }

             if (error !== null) {
                 lessWatchr.logError('recompiling done');
             }
             else {
                 lessWatchr.logSuccess('recompiling done');
                 lessWatchr.logInfo('outputFile: '+  outputFile);

             }

         });
    }
};
// start watching
watchr.watch({
    paths: config.path,
    listener: lessWatchrListener,
    next: function(err,watchers){
        if (err) {
            return console.log("watching everything failed with error", err);
        }
    }
});
