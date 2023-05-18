
type FsWithFileSystems = (typeof FS) & {
    filesystems: {
        'MEMFS': FilesystemType,
        'NODEFS': FilesystemType,
        'WORKERFS': FilesystemType,
    };
}

export type FfmpegOptions<TReturn> = {
    stdOut?: (output: string) => void;
    stdErr?: (output: string) => void;
    prepareFS: (fs: FsWithFileSystems) => void;
    gatherResults: (fs: FsWithFileSystems) => TReturn;
    arguments: string[];
};

export type FfmpegMain = <TReturn>(options: FfmpegOptions<TReturn>) => TReturn;

export const ffmpeg: FfmpegMain;