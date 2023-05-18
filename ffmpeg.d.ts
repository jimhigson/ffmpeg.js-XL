

export type FfmpegOptions<TReturn> = {
    prepareFS: (fs: typeof FS) => void;
    gatherResults: (fs: typeof FS) => TReturn;
    arguments: string[];
};

export type FfmpegMain = <TReturn>(options: FfmpegOptions<TReturn>) => TReturn;

export const ffmpeg: FfmpegMain;