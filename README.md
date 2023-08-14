# ffmpeg.js-XL

fork of [ffmpeg.js](https://github.com/Kagami/ffmpeg.js/) modified for:

* reading **huge** files by sidestepping Uint8Array size limits. Uses [WORKERFS](https://emscripten.org/docs/api_reference/Filesystem-API.html#filesystem-api-workerfs) so whole videos files don't get read into memory. *otherwise, limits are: (Chrome 2Gb, Safari 4Gb, Firefox 8Gb)*.
* typescript types by default
* keeps syntactic sugar and hand-holding at a minimum. You are given the [emscripten Filesystem API](https://emscripten.org/docs/api_reference/Filesystem-API.html) to work with directly in any way you wish.
* no minification in the `emcc` build. This allows debugging while developing. For prod builds, modern tools like Vite will minify at build time, so it is ok if libraries are not pre-minified. If you use this and need these files to be minified you can do that yourself.
* no worker-specific builds. Use [comlink](https://github.com/GoogleChromeLabs/comlink) instead.

## Caveats

* The limits on maximum typed array size size still apply if you put the results in a `Uint8Array`. It is possible to circumvent this limit if you need to by not reading the whole output into a single Uint8Array.
* With great power comes great responsibility. Unlike `ffmpeg.js`, I don't try to stop you from breaking things.
* I built this fork because I needed it for the browser. It should work but isn't tested in node.
* Inherited from `ffmepeg.js`, `emcc` is passed `WASM=0`. My requirements are quite light processing-wise so this is ok for me, but wasm would be faster and I may change this in future.

## Builds

Currently available builds (additional builds may be added in future):
* `ffmpeg-webm.js` - WebM encoding (VP8 & Opus encoders, popular decoders).
* `ffmpeg-mp4.js` - MP4 encoding (H.264 & AAC & MP3 encoders, popular decoders).

Note: only NPM releases contain abovementioned files.

## Version scheme

ffmpeg.js uses the following version pattern: `major.minor.9ddd`, where:
* **major** - FFmpeg's major version number used in the builds.
* **minor** - FFmpeg's minor version.
* **ddd** - ffmpeg.js own patch version. Should not be confused with FFmpeg's patch version number.

Example: `2.7.9005`

## Usage

See documentation on [Module object](https://emscripten.org/docs/api_reference/module.html#affecting-execution) for the list of options that you can pass.

### API - running ffmpeg in your app

```ts
import { ffmpeg } from "ffmpeg.js-XL";

// Print FFmpeg's version.
const output = ffmpeg({
  arguments: [/* ffmpeg cli arguments */],
  prepareFS(fs) {
    // fs is emscripten's FS - write any files to the file system that you want ffmpeg to read
    // this will run before the ffmpeg binary.
    // see @types/emscripten/index.d.ts
  },
  gatherResults(fs) {
    // this will run after the ffmpeg binary
    // look in the filesystem here for the results of running ffmpeg, and return the file
    // you are interested in. The return value returned here will be returned by ffmpeg
  },
  stdErr(output) {
    console.warn(`stdErr: ${output}`);
  },
  stdOut(output) {
    console.log(`stdOut: ${output}`);
  },
});
```

### Encoding huge files in the browser

Files bigger than the Uint8Array limit require `WORKERFS`. Set up code like this inside your worker:

```ts

// create a file like ffmpegWorker.ts
import { ffmpeg } from "ffmpeg.js-XL";

export const runFfmpeg = (inputFile: File) => ffmpeg({

  // these arguments clip out a 2 minute clip
  arguments: ["-ss", "02:00", "-i", "/input/test.mp4", "-t", "02:00", "-c", "copy", "-avoid_negative_ts", "1",  "/output/out.mp4"],
  prepareFS(fs) {

    // dir to mount blobs onto for ffmpeg to read from:
    fs.mkdir("/input");

    // dir for ffmpeg to put the output into
    fs.mkdir("/output");

    // WORKERFS does not require reading the file into memory, so we are not subject to
    // file size limits
    fs.mount(fs.filesystems.WORKERFS, { files: [inputFile] }, "/input");
  },
  gatherResults(fs) {
    // Nb - assuming non-huge output can be read into a single uint8array.
    // If you need huge output don't do this.
    const fileContents: Uint8Array = fs.readFile("/output/out.mp4");

    // clean up a bit:
    fs.unmount(inputDir);
    fs.unlink(outputFilePath);

    return fileContents;
  },
  stdErr(output) {
    console.warn(`stdErr: ${output}`);
  },
  stdOut(output) {
    console.log(`stdOut: ${output}`);
  },
});  
```

You can then call your worker (in this example via `vite-plugin-comlink`):

```ts
// get inputFile from <input type="file" or somewhere else. This file can be any size.
const inputFile File = /*...*/;

const ffmpegWorker = new ComlinkWorker<
  typeof import("./ffmpegWorker")
>(new URL("./ffmpegWorker.ts", import.meta.url), {
  name: "ffmpeg",
});

const edited = await runFfmpeg(inputFile);
// edited is a Uint8Array with a 2 minute clip taken from inputFile
```

Note that:
* in the above example, the file is never read entirely into memory. Ffmpeg will read it a little bit at a time to do the
conversion. Only the output is written to `MEMFS`.
* you can't put `ffmpeg` into your worker without wrapping it in a file like `ffmpegWorker.ts` since you need to pass it non-serialisable callback functions

## Build instructions

It's recommended to use [Docker](https://www.docker.com/) to build ffmpeg.js.

1.  Clone ffmpeg.js repository with submodules:
    ```bash
    git clone https://github.com/jimhigson/ffmpeg.js-XL.git --recurse-submodules
    ```

2.  Modify Makefile and/or patches if you wish to make a custom build.

3.  Build everything:
    ```bash
    cd ffmpeg.js-XL.git

    # start docker, mounting host pwd in the container:
    docker run --rm -it -v `pwd`:/mnt -w /opt kagamihi/ffmpeg.js

    # inside docker run: 1) copy files in from host fs; 2) build it; 3) copy result back to host fs
    cp -a /mnt/{.git,build,Makefile} . && source /root/emsdk/emsdk_env.sh && make && cp ffmpeg*.js /mnt

    # the build result should now be in the root of the repo on the host

    # to efficiently rebuild after changing only Makefile and/or pre/post js:
    cp /mnt/Makefile . && cp -a /mnt/build/*.js build && make clean-js ffmpeg-mp4.js && cp ffmpeg*.js /mnt
    ```

## Build without Docker

I've never done this. See the upstream docs at ffmpeg.js if you need to for some reason.

## Credits

[ffmpeg.js](https://github.com/Kagami/ffmpeg.js/), which this repo is forked from.

Thanks to [videoconverter.js](https://bgrins.github.io/videoconverter.js/) for inspiration. And of course to all great projects which made this library possible: FFmpeg, Emscripten, asm.js, node.js and many others.

## License

Own library code licensed under LGPL 2.1 or later.

### WebM build

This build uses LGPL version of FFmpeg and thus available under LGPL 2.1 or later. See [here](https://www.ffmpeg.org/legal.html) for more details and FFmpeg's license information.

Included libraries:
* libopus [licensed under BSD](https://git.xiph.org/?p=opus.git;a=blob;f=COPYING).
* libvpx [licensed under BSD](https://chromium.googlesource.com/webm/libvpx/+/master/LICENSE).

See [LICENSE.WEBM](https://github.com/Kagami/ffmpeg.js/blob/master/LICENSE.WEBM) for the full text of software licenses used in this build.

### MP4 build

This build uses GPL version of FFmpeg and thus available under GPL 2.0. It also includes patent encumbered H.264, AAC and MP3 encoders. Make sure to contact lawyer before using it in your country.

Included libraries:
* x264 [licensed under GPL](https://git.videolan.org/?p=x264.git;a=blob;f=COPYING).
* LAME [licensed under LGPL](https://github.com/rbrito/lame/blob/origin/COPYING).

See [LICENSE.MP4](https://github.com/Kagami/ffmpeg.js/blob/master/LICENSE.MP4) for the full text of software licenses used in this build.
