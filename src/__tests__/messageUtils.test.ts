import { describe, expect, it } from "vitest";
import {
  convertHexStrToNum,
  getUnknownMessageReason,
  mergeBytes,
  parseMessage,
  validateChecksum,
  type EscDataMessage,
  type EscErrorMessage,
  type EscInputMessage,
  type UnknownMessage,
} from "../messageUtils";
import { CONSUMPTION, CURRENT, RPM, TEMPERATURE, VOLTAGE } from "../robot";

describe("mergeBytes", () => {
  it("combines high and low bytes", () => {
    expect(mergeBytes(0x12, 0x34)).toBe(0x1234);
  });
  it("handles zeroes", () => {
    expect(mergeBytes(0x00, 0x00)).toBe(0x0000);
  });
  it("handles start with zeroes", () => {
    expect(mergeBytes(0x01, 0x02)).toBe(0x0102);
  });
  it("handles end with zeroes", () => {
    expect(mergeBytes(0x10, 0x20)).toBe(0x1020);
  });
});

describe("convertHexStrToNum", () => {
  it("converts 0", () => {
    expect(convertHexStrToNum("0")).toBe(0);
  });
});

describe("getUnknownMessageReason", () => {
  describe("catches invalid messages", () => {
    it("catches invalid empty message", () => {
      expect(getUnknownMessageReason("")).not.toBeNull();
    });
    it("catches invalid formatted message", () => {
      expect(getUnknownMessageReason("1 2 3")).not.toBeNull();
    });
  });

  describe("returns null for valid messages", () => {
    it("ESC data message", () => {
      expect(
        getUnknownMessageReason("<c 1F 5 E1 0 19 0 4 0 0 20 5C4D>"),
      ).toBeNull();
    });
    it("pong", () => {
      expect(getUnknownMessageReason("pong")).toBeNull();
    });
    it("error message", () => {
      expect(getUnknownMessageReason("<a ! 2 100>")).toBeNull();
    });
  });
});

describe("validateChecksum", () => {
  it("returns true for valid checksums (copied real messages)", () => {
    // <c 1F 3 A0 0 16 0 4 0 0 E0 5D24>
    const data = [0x1f, 0x3, 0xa0, 0x0, 0x16, 0x0, 0x4, 0x0, 0x0];
    expect(validateChecksum(data, 0xe0)).toBe(true);

    // <c 1A 5 E9 0 1C 0 0 0 0 16 475>
    const data2 = [0x1a, 0x5, 0xe9, 0x0, 0x1c, 0x0, 0x0, 0x0, 0x0];
    expect(validateChecksum(data2, 0x16)).toBe(true);

    // <c 1E 5 D6 0 4A 0 3 1 50 D0 3BA8>
    const data3 = [0x1e, 0x5, 0xd6, 0x0, 0x4a, 0x0, 0x3, 0x1, 0x50];
    expect(validateChecksum(data3, 0xd0)).toBe(true);
  });
});

describe("parseMessage", () => {
  it("parses ESC data", () => {
    const message = parseMessage(
      "<c 1F 3 A0 0 16 0 4 0 0 E0 5D24>",
    ) as EscDataMessage;
    expect(message.messageType).toBe("data");
    expect(message.escName).toBe("Weapon");
    expect(message.escData[TEMPERATURE]).toBe(31); // 0x1F
    expect(message.escData[VOLTAGE]).toBe(9.28); // 0x03A0
    expect(message.escData[CURRENT]).toBe(0.22); // 0x0016
    expect(message.escData[CONSUMPTION]).toBe(4); // 0x4
    expect(message.escData[RPM]).toBe(0); // 0x0
    expect(message.timestamp).toBe(23844); // 0x5D24
  });

  it("parses ESC error", () => {
    const message = parseMessage("<a ! 2 529>") as EscErrorMessage;
    expect(message.messageType).toBe("error");
    expect(message.escName).toBe("DriveLeft");
    expect(message.code).toBe(2);
  });

  it("parses ESC input", () => {
    const message = parseMessage("<y 5DD 4C5>") as EscInputMessage;
    expect(message.messageType).toBe("input");
  });

  it("parses unknown message", () => {
    const message = parseMessage("") as UnknownMessage;
    expect(message.messageType).toBe("unknown");
  });

  it("parses message with invalid checksum", () => {
    const message = parseMessage(
      "<c 1F 3 A0 0 16 0 4 0 0 123 5D24>",
    ) as UnknownMessage;
    expect(message.messageType).toBe("unknown");
    expect(message.reason).toBe("invalid checksum");
  });
});
