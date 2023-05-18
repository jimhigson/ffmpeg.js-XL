

export type FfmpegOptions = {
    prepareFS: (fs: typeof FS) => void;
    arguments: string[];
};

export type FfmpegMain = (options: FfmpegOptions) => Promise<FS>;

export const ffmpeg: FfmpegMain;