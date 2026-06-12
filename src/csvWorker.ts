const initCSV = async () => {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle("data.csv", { create: true });
  const writable = await fileHandle.createWritable({ keepExistingData: false });
  await writable.close();
};

initCSV();

self.onmessage = async (e: MessageEvent<string[]>) => {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle("data.csv");
    const writable = await fileHandle.createWritable({
      keepExistingData: true,
    });
    const file = await fileHandle.getFile();

    await writable.write({
      type: "write",
      position: file.size,
      data: e.data
        .map((message) => {
          return message + "\n";
        })
        .join(""),
    });
    await writable.close();
  } catch (e) {
    console.log("error writing to CSV", e);
  }
};
