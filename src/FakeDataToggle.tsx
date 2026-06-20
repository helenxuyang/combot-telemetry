import { useIsFakeData, useToggleFakeData } from "./store";

export const FakeDataToggle = () => {
  const isFakeData = useIsFakeData();
  const toggleFakeData = useToggleFakeData();

  return (
    <div>
      <h2>App Controls</h2>
      <button onClick={toggleFakeData}>
        Use {isFakeData ? "real" : "fake"} data
      </button>
    </div>
  );
};
