// const rpmAlertAudioRef = useRef<HTMLAudioElement>(null);

//   useEffect(() => {
//     const rpm = esc.measurements[RPM];
//     if (!rpm || !rpm.highlightThreshold) {
//       return;
//     }
//     const rpmValue = rpm.values.at(-1) ?? 0;
//     if (rpmValue >= rpm.highlightThreshold) {
//       rpmAlertAudioRef.current?.play();
//     } else {
//       rpmAlertAudioRef.current?.pause();
//     }
//   }, [esc]);

// {esc.measurements[RPM].shouldShow && shouldPlayRPMAlert && (
//           <audio ref={rpmAlertAudioRef} src={beepAudio} autoPlay loop></audio>
//         )}
