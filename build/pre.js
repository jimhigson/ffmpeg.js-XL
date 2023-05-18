
// -----------------------------------  
// ---------- START OF pre.js --------
// -----------------------------------  
// compiled from code at https://github.com/jimhigson/ffmpeg.js-myhack


export const ffmpeg = (ffmpegOptions) => {

  const { prepareFS, gatherResults, arguments: ffmpegArguments } = ffmpegOptions;

  if (!prepareFS || !gatherResults) {
    throw new Error("do not have prepareFS and gatherResults");
  }

  var Module = {};

  console.log('ffmpeg.js is running like', 'ffmpeg ' + JSON.stringify(ffmpegArguments.join(' ')));

  ffmpegOptions = ffmpegOptions || {};
  var __ffmpegjs_abort = abort;
  var ffmpegjsReturn;
  Module.arguments = ffmpegArguments;

  function __ffmpegjs_toU8(data) {
    if (Array.isArray(data) || data instanceof ArrayBuffer) {
      data = new Uint8Array(data);
    } else if (!data) {
      // `null` for empty files.
      data = new Uint8Array(0);
    } else if (!(data instanceof Uint8Array)) {
      // Avoid unnecessary copying.
      data = new Uint8Array(data.buffer);
    }
    return data;
  }

  // Mute exception on unreachable.
  abort = function (what) {
    if (arguments.length) {
      __ffmpegjs_abort(what);
    } else {
      throw new ExitStatus(0);
    }
  };

  // Fix CR.
  function __ffmpegjs_out(cb) {
    var buf = [];
    return function (ch, flush) {
      if (flush && buf.length) return cb(UTF8ArrayToString(buf, 0));
      if (ch === 10 || ch === 13) {
        if (ENVIRONMENT_IS_NODE) buf.push(ch);
        cb(UTF8ArrayToString(buf, 0));
        buf = [];
      } else if (ch !== 0) {
        buf.push(ch);
      }
    };
  }
  Module["stdin"] = Module["stdin"] || function () { };
  Module["stdout"] = Module["stdout"] || __ffmpegjs_out(function (line) { out(line) });
  Module["stderr"] = Module["stderr"] || __ffmpegjs_out(function (line) { err(line) });
  if (typeof process === "object") {
    Module["print"] = Module["print"] || process.stdout.write.bind(process.stdout);
    Module["printErr"] = Module["printErr"] || process.stderr.write.bind(process.stderr);
  }

  // Disable process.exit in nodejs and don't call onExit twice.
  Module["quit"] = function (status) {
    Module["stdout"](0, true);
    Module["stderr"](0, true);
    if (ffmpegOptions["onExit"]) ffmpegOptions["onExit"](status);
  };

  Module["preRun"] = () => {
    prepareFS(FS);
  };

  Module["postRun"] = function () {
    ffmpegjsReturn = gatherResults(FS);
  };

  console.log('finished preparing Module', Module);

// -----------------------------------  
// ---------- END OF pre.js ----------
// -----------------------------------
// pre.js should error in editor with "'}' expected"
