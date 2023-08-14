
// -----------------------------------  
// ---------- START OF pre.js --------
// -----------------------------------  
// compiled from code at https://github.com/jimhigson/ffmpeg.js-XL


export const ffmpeg = (ffmpegOptions) => {

  var ffmpegjsReturn;

  function ffmpegSetup({ prepareFS, gatherResults, arguments: argv, stdIn, stdErr }) {

    if (!prepareFS || !gatherResults) {
      throw new Error("do not have prepareFS and gatherResults");
    }

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

// -----------------------------------  
// ---------- END OF pre.js ----------
// -----------------------------------
// pre.js should error in editor with "'}' expected"
