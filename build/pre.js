
// -----------------------------------  
// ---------- START OF pre.js --------
// -----------------------------------  
// compiled from code at https://github.com/jimhigson/ffmpeg.js-myhack


export const ffmpeg = (ffmpegOptions) => {

  var ffmpegjsReturn;

  function ffmpegSetup({ prepareFS, gatherResults, arguments: argv, stdIn, stdErr }) {

    if (!prepareFS || !gatherResults) {
      throw new Error("do not have prepareFS and gatherResults");
    }

    console.log('ffmpeg.js is running like', 'ffmpeg ' + JSON.stringify(argv.join(' ')));

    ffmpegOptions = ffmpegOptions || {};
    Module.arguments = argv;
    Module.print = stdIn;
    Module.printErr = stdErr;

    Module.preRun = () => {
      prepareFS(FS);
    };

    Module.postRun = function () {
      ffmpegjsReturn = gatherResults(FS);
    };

  }

  ffmpegSetup(ffmpegOptions);

  console.log('finished preparing Module', Module);

// -----------------------------------  
// ---------- END OF pre.js ----------
// -----------------------------------
// pre.js should error in editor with "'}' expected"
