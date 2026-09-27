import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { RobotImporter } from "../../../RobotImporter";
import { useRobot } from "../../../robotStore";
import { CondensedButton } from "../../../styles";
import { GraphDisplay } from "./GraphDisplay";
import { MessagesDisplay } from "./MessagesDisplay";

type UUID = `${string}-${string}-${string}-${string}-${string}`;

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
`;

const GridHolder = styled.div`
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  background-color: white;
  border-radius: 8px;
  padding: 8px;
`;

const GridItemHolder = styled.div<{ $isFullWidth: boolean }>`
  flex-basis: ${({ $isFullWidth }) =>
    $isFullWidth ? "100%" : "calc(50% - 2px)"}; // to account for gap
  min-width: 0;
  height: 94dvh;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 8px;
  gap: 8px;

  @media (max-width: 700px) {
    flex-basis: 100%;
  }
`;

const RoundButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  border: none;
  width: 24px;
  height: 24px;
  padding: 16px;
  border-radius: 50%;
  color: #444;

  &:hover {
    background-color: #ccc;
  }
`;

const GraphWidthButton = styled(RoundButton)`
  @media (max-width: 700px) {
    display: none;
  }
`;

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ControlsButtons = styled.div`
  display: flex;
  gap: 8px;
`;

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

type GraphConfig = {
  id: UUID;
  isFullWidth: boolean;
};

type SyncPoint = {
  graph: number;
  video: number;
};

export const GraphGrid = () => {
  const robot = useRobot();
  const emptyGraph = {
    id: crypto.randomUUID(),
    isFullWidth: true,
  };
  const [graphConfigs, setGraphConfigs] = useState<GraphConfig[]>([emptyGraph]);
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(
    "https://nhrl-matches.us-east-1.linodeobjects.com/proxy/Cage-8-Overhead-High-2026-09-12_23-23-55.585_360p.mp4",
  );
  const [syncPointStart, setSyncPointStart] = useState<SyncPoint | null>(null);
  const [isSelectingSyncPointStart, setIsSelectingSyncPointStart] =
    useState<boolean>(false);
  const [syncPointEnd, setSyncPointEnd] = useState<SyncPoint | null>(null);
  const [isSelectingSyncPointEnd, setIsSelectingSyncPointEnd] =
    useState<boolean>(false);
  const [graphSelectedTime, setGraphSelectedTime] = useState<number>();
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>();

  const [isPlaybackActive, setIsPlaybackActive] = useState<boolean>(false);
  const [graphCurrentTime, setGraphCurrentTime] = useState<number>(0);
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

  if (!robot) {
    return <div>No robot</div>;
  }

  const deleteGraph = (index: number) =>
    setGraphConfigs(graphConfigs.filter((_, i) => i !== index));

  const addGraph = () =>
    setGraphConfigs([
      ...graphConfigs,
      {
        id: crypto.randomUUID(),
        isFullWidth: true,
      },
    ]);

  const toggleGraphWidth = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    updatedGraphs[index].isFullWidth = !updatedGraphs[index].isFullWidth;
    setGraphConfigs(updatedGraphs);
  };

  const moveGraphLeft = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    [updatedGraphs[index], updatedGraphs[index - 1]] = [
      updatedGraphs[index - 1],
      updatedGraphs[index],
    ];
    setGraphConfigs(updatedGraphs);
  };

  const moveGraphRight = (index: number) => {
    const updatedGraphs = [...graphConfigs];
    [updatedGraphs[index], updatedGraphs[index + 1]] = [
      updatedGraphs[index + 1],
      updatedGraphs[index],
    ];
    setGraphConfigs(updatedGraphs);
  };

  return (
    <Holder>
      <RobotImporter />
      <GridHolder>
        {graphConfigs.map((graph, index) => {
          const { id, isFullWidth } = graph;
          return (
            <GridItemHolder key={id} $isFullWidth={isFullWidth}>
              <ButtonsHolder>
                <RoundButton title="Delete" onClick={() => deleteGraph(index)}>
                  ✖
                </RoundButton>
                <ControlsButtons>
                  {index > 0 && (
                    <RoundButton
                      title="Move left"
                      onClick={() => moveGraphLeft(index)}
                    >
                      ←
                    </RoundButton>
                  )}
                  <GraphWidthButton
                    title={isFullWidth ? "Shrink" : "Expand"}
                    onClick={() => {
                      toggleGraphWidth(index);
                    }}
                  >
                    {isFullWidth ? "↦↤" : "⇤⇥"}
                  </GraphWidthButton>
                  <RoundButton title="Add graph" onClick={addGraph}>
                    ＋
                  </RoundButton>

                  {index < graphConfigs.length - 1 && (
                    <RoundButton
                      title="Move right"
                      onClick={() => moveGraphRight(index)}
                    >
                      →
                    </RoundButton>
                  )}
                </ControlsButtons>
              </ButtonsHolder>
              <GraphDisplay
                key={id}
                playbackTimestamp={
                  isPlaybackActive ? graphCurrentTime * 1000 : undefined
                }
                syncTimestamps={[syncPointStart?.graph, syncPointEnd?.graph]
                  .filter((value) => value !== undefined)
                  .map((value) => value * 1000)}
              />
            </GridItemHolder>
          );
        })}

        {showMessages && (
          <GridItemHolder $isFullWidth={false}>
            <RoundButton
              title="Hide messages"
              onClick={() => setShowMessages(false)}
            >
              ✖
            </RoundButton>
            <MessagesDisplay />
          </GridItemHolder>
        )}

        {showVideo && (
          <GridItemHolder $isFullWidth={false}>
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
                (isSelecting ? videoCurrentTime : point?.video)?.toFixed(2) ??
                "none";
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
            <CondensedButton
              onClick={() => setIsPlaybackActive((active) => !active)}
            >
              {isPlaybackActive ? "Disable" : "Enable"} playback
            </CondensedButton>
          </GridItemHolder>
        )}
      </GridHolder>
      {!showMessages && (
        <CondensedButton onClick={() => setShowMessages(true)}>
          Show messages
        </CondensedButton>
      )}
      {!showVideo && (
        <CondensedButton onClick={() => setShowVideo(true)}>
          Enable video playback
        </CondensedButton>
      )}
      {graphConfigs.length === 0 && (
        <CondensedButton onClick={addGraph}>Add graph</CondensedButton>
      )}
    </Holder>
  );
};
