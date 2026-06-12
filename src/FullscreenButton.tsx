export const FullscreenButton = () => {
  return (
    <button
      onClick={async () => {
        await document.documentElement.requestFullscreen();
      }}
    >
      Fullscreen
    </button>
  );
};
