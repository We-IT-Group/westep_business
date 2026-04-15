import {
    MediaPlayer, MediaProvider, Poster
} from '@vidstack/react';
import {DefaultVideoLayout} from '@vidstack/react/player/layouts/default';
import {
    FullScreen,
    Mute,
    Play,
    RotateLeft,
    RotateRight,
    Setting,
    VolumeHigh,
    VolumeLow,
    Pause, ExitFullScreen, Replay
} from "../../../icons";
import {SeekButton} from "@vidstack/react";

import type {DefaultLayoutIcons} from '@vidstack/react/player/layouts/default';

// Icon should be: `() => ReactNode`
const None = () => null;

// All icons are optional, replace only what you want.
const customIcons: Partial<DefaultLayoutIcons> = {
    AirPlayButton: {
        Default: () => <Play width={28} height={28}/>,
        Connecting: None,
        Connected: None,
    },
    GoogleCastButton: {
        Default: None,
        Connecting: None,
        Connected: None,
    },
    PlayButton: {
        Play: () => <Play width={28} height={28}/>,
        Pause: () => <Pause width={28} height={28}/>,
        Replay: () => <Replay width={28} height={28}/>,
    },
    MuteButton: {
        Mute: () => <Mute width={28} height={28}/>,
        VolumeLow: () => <VolumeLow width={28} height={28}/>,
        VolumeHigh: () => <VolumeHigh width={28} height={28}/>,
    },
    CaptionButton: {
        On: None,
        Off: None,
    },
    PIPButton: {
        Enter: None,
        Exit: None,
    },
    FullscreenButton: {
        Enter: () => <FullScreen width={28} height={28}/>,
        Exit: () => <ExitFullScreen width={28} height={28}/>,
    },
    SeekButton: {
        Backward: () => <RotateLeft width={28} height={28}/>,
        Forward: () => <RotateRight width={28} height={28}/>,
    },
    DownloadButton: {
        Default: None,
    },
    Menu: {
        Accessibility: None,
        ArrowLeft: None,
        ArrowRight: None,
        Audio: None,
        AudioBoostUp: None,
        AudioBoostDown: None,
        Chapters: None,
        Captions: None,
        Playback: None,
        Settings: () => <Setting width={28} height={28}/>,
        SpeedUp: () => <RotateLeft width={28} height={28}/>,
        SpeedDown: () => <RotateRight width={28} height={28}/>,
        QualityUp: None,
        QualityDown: None,
        FontSizeUp: None,
        FontSizeDown: None,
        OpacityUp: None,
        OpacityDown: None,
        RadioCheck: None,
    },
    KeyboardDisplay: {
        Play: None,
        Pause: None,
        Mute: None,
        VolumeUp: None,
        VolumeDown: None,
        EnterFullscreen: None,
        ExitFullscreen: None,
        EnterPiP: None,
        ExitPiP: None,
        CaptionsOn: None,
        CaptionsOff: None,
        SeekForward: () => <RotateRight width={32} height={32}/>,
        SeekBackward: () => <RotateLeft width={32} height={32}/>,
    },
};


const VideoPlayer = ({videoUrl}: { videoUrl: string }) => {
    const getYoutubeThumbnail = (srcLink: string) => {
        let videoId = "";
        try {
            const url = new URL(srcLink);
            if (url.hostname.includes("youtu.be")) {
                // short link: youtu.be/VIDEOID
                videoId = url.pathname.slice(1);
            } else if (url.hostname.includes("youtube.com")) {
                videoId = url.searchParams.get("v") || "";
            }
        } catch (e) {
            console.error("Invalid URL");
        }

        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    };

    const thumbnail = getYoutubeThumbnail(videoUrl)

    console.log(thumbnail)
    return (
        <MediaPlayer
            title="Sprite Fight" src={videoUrl} poster={thumbnail}>
            <MediaProvider>
                <Poster className="vds-poster"/>
                <SeekButton className="vds-button" seconds={10}>
                    10
                </SeekButton>
            </MediaProvider>
            <DefaultVideoLayout
                icons={customIcons as DefaultLayoutIcons}
                slots={{
                    // Kichik ekran (mobile) uchun
                    smallLayout: {
                        seekBackwardButton: <SeekButton seconds={-5}/>,
                        seekForwardButton: <SeekButton seconds={5}/>
                    },
                    // Katta ekran (desktop) uchun
                    largeLayout: {
                        seekBackwardButton: <SeekButton seconds={-5}/>,
                        seekForwardButton: <SeekButton seconds={5}/>
                    }
                }}
            />
        </MediaPlayer>
    );
};

export default VideoPlayer;