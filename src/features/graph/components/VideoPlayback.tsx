import { useCallback, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { EscId } from "../../../robot";
import { CondensedButton } from "../../../styles";
import {
  useIsPlaybackActive,
  useSetGraphCurrentTime,
  useSetIsPlaybackActive,
  useSetSyncPointEnd,
  useSetSyncPointStart,
  useSyncPointEnd,
  useSyncPointStart,
} from "../videoPlaybackStore";
import { DrivePlayback } from "./DrivePlayback";
import { InputPlayback } from "./InputPlayback";

const SyncPointHolder = styled.div<{ $isSelecting: boolean }>`
  display: flex;
  justify-content: center;
  gap: 8px;

  span {
    font-style: ${({ $isSelecting }) => ($isSelecting ? "italic" : "normal")};
    text-underline-offset: 4px;
    text-decoration: ${({ $isSelecting }) =>
      $isSelecting ? "underline dotted" : "none"};
  }
`;
const InputPlaybackHolder = styled.div`
  display: flex;
  gap: 24px;
  height: 200px;
`;

export const VideoPlayback = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined); // "https://nhrl-matches.us-east-1.linodeobjects.com/proxy/Cage-8-Overhead-High-2026-09-12_23-23-55.585_360p.mp4"
  const syncPointStart = useSyncPointStart();
  const setSyncPointStart = useSetSyncPointStart();
  const [isSelectingSyncPointStart, setIsSelectingSyncPointStart] =
    useState<boolean>(false);
  const syncPointEnd = useSyncPointEnd();
  const setSyncPointEnd = useSetSyncPointEnd();
  const [isSelectingSyncPointEnd, setIsSelectingSyncPointEnd] =
    useState<boolean>(false);
  const [graphSelectedTime, setGraphSelectedTime] = useState<number>();
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>();

  const isPlaybackActive = useIsPlaybackActive();
  const setIsPlaybackActive = useSetIsPlaybackActive();
  const setGraphCurrentTime = useSetGraphCurrentTime();
  const playbackAnimationFrameRef = useRef<number>(null);

  const handlePlayback = useCallback(() => {
    if (videoRef.current) {
      const videoCurrent = videoRef.current.currentTime;

      // TODO handle case where only have one sync point

      if (!syncPointStart || !syncPointEnd) {
        return;
      }
      const { video: videoStart, graph: graphStart } = syncPointStart;
      const { video: videoEnd, graph: graphEnd } = syncPointEnd;

      const videoRange = videoEnd - videoStart;
      const graphRange = graphEnd - graphStart;

      const graphCurrent =
        graphStart + ((videoCurrent - videoStart) * graphRange) / videoRange;
      setGraphCurrentTime(graphCurrent);

      playbackAnimationFrameRef.current = requestAnimationFrame(handlePlayback);
    }
  }, [syncPointStart, syncPointEnd]);

  useEffect(() => {
    if (isPlaybackActive) {
      playbackAnimationFrameRef.current = requestAnimationFrame(handlePlayback);
    }

    return () => {
      if (playbackAnimationFrameRef.current) {
        cancelAnimationFrame(playbackAnimationFrameRef.current);
      }
    };
  }, [isPlaybackActive]);

  useEffect(() => {
    const handleClickPoint = (event: Event) => {
      const clickPointEvent = event as CustomEvent;
      setGraphSelectedTime(clickPointEvent.detail.timestamp / 1000);
    };
    window.addEventListener("clickPoint", handleClickPoint);
    return () => {
      window.removeEventListener("clickPoint", handleClickPoint);
    };
  }, []);

  useEffect(() => {
    const handleVideoPlay = () => {
      if (!isSelectingSyncPointStart && !isSelectingSyncPointEnd) {
        setIsPlaybackActive(true);
      }
    };
    const handleVideoTimeUpdate = () => {
      setVideoCurrentTime(videoRef.current?.currentTime);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (videoRef.current) {
        const approxFrameMs = 16 / 1000;
        if (event.key === ",") {
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - approxFrameMs,
          );
        } else if (event.key === ".") {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration,
            videoRef.current.currentTime + approxFrameMs,
          );
        }
      }
    };

    videoRef.current?.addEventListener("play", handleVideoPlay);
    videoRef.current?.addEventListener("timeupdate", handleVideoTimeUpdate);
    window.addEventListener("keydown", handleKey, true);
    return () => {
      videoRef.current?.removeEventListener("play", handleVideoPlay);
      videoRef.current?.removeEventListener(
        "timeupdate",
        handleVideoTimeUpdate,
      );
      window.removeEventListener("keydown", handleKey, true);
    };
  }, [isSelectingSyncPointStart, isSelectingSyncPointEnd]);

  // TODO: make configurable
  const inputPlaybackEscIds: EscId[] = ["2", "3"];

  return (
    <>
      <h2>Video Playback</h2>
      <strong>Video URL</strong>
      <input
        value={videoSrc ?? ""}
        onChange={(e) => setVideoSrc(e.target.value)}
      />
      <strong>Sync Points</strong>

      {[
        {
          name: "START",
          point: syncPointStart,
          setter: setSyncPointStart,
          isSelecting: isSelectingSyncPointStart,
          setIsSelecting: setIsSelectingSyncPointStart,
        },
        {
          name: "END",
          point: syncPointEnd,
          setter: setSyncPointEnd,
          isSelecting: isSelectingSyncPointEnd,
          setIsSelecting: setIsSelectingSyncPointEnd,
        },
      ].map(({ name, point, setter, isSelecting, setIsSelecting }) => {
        const graphTime =
          (isSelecting ? graphSelectedTime : point?.graph)?.toFixed(2) ??
          "none";
        const videoTime =
          (isSelecting ? videoCurrentTime : point?.video)?.toFixed(2) ?? "none";
        return (
          <SyncPointHolder $isSelecting={isSelecting} key={name}>
            <span>{`${name}: 📈 ${graphTime} | 🎥 ${videoTime}`}</span>
            {point && !isSelecting && (
              <CondensedButton
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = point.video;
                    setIsPlaybackActive(true);
                    setGraphSelectedTime(point.graph);
                  }
                }}
              >
                Jump
              </CondensedButton>
            )}

            {isSelecting ? (
              <>
                <CondensedButton
                  onClick={() => {
                    if (graphSelectedTime && videoCurrentTime) {
                      setter({
                        graph: graphSelectedTime,
                        video: videoCurrentTime,
                      });
                      setIsSelecting(false);
                    }
                  }}
                >
                  Save
                </CondensedButton>
                <CondensedButton
                  onClick={() => {
                    setIsSelecting(false);
                  }}
                >
                  Cancel
                </CondensedButton>
              </>
            ) : (
              <CondensedButton
                onClick={() => {
                  setIsSelecting(true);
                  setIsPlaybackActive(false);
                }}
              >
                Edit
              </CondensedButton>
            )}
          </SyncPointHolder>
        );
      })}
      <video ref={videoRef} width="100%" src={videoSrc} controls />
      <CondensedButton onClick={() => setIsPlaybackActive(!isPlaybackActive)}>
        {isPlaybackActive ? "Disable" : "Enable"} playback
      </CondensedButton>
      <InputPlaybackHolder>
        <DrivePlayback />
        {inputPlaybackEscIds.map((id) => (
          <InputPlayback escId={id} />
        ))}
      </InputPlaybackHolder>
    </>
  );
};
