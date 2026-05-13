import { appToast } from "@/utils/scaffold-stark/toast";

const mockOpenURL = jest.fn();
jest.mock("react-native", () => ({
  Linking: { openURL: (...args: any[]) => mockOpenURL(...args) },
}));
const mockShow = jest.fn();
const mockHide = jest.fn();
jest.mock("toastify-react-native", () => ({
  Toast: {
    show: (...args: any[]) => mockShow(...args),
    hide: () => mockHide(),
    error: (...args: any[]) => mockShow({ type: "error", text1: args[0] }),
  },
}));

describe("toast wrapper", () => {
  beforeEach(() => {
    mockShow.mockClear();
    mockHide.mockClear();
    mockOpenURL.mockClear();
  });

  test("showPersistentInfo passes correct options", () => {
    appToast.showPersistentInfo("title", "subtitle", { position: "center" });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        text1: "title",
        text2: "subtitle",
        position: "center",
        autoHide: false,
      }),
    );
  });

  test("showPersistentInfo uses default position", () => {
    appToast.showPersistentInfo("title");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        text1: "title",
        text2: undefined,
        position: "top",
        autoHide: false,
      }),
    );
  });

  test("showPersistentInfo passes useModal option", () => {
    appToast.showPersistentInfo("title", undefined, { useModal: true });
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        useModal: true,
      }),
    );
  });

  test("showWaiting includes explorer hint when url provided", () => {
    appToast.showWaiting("waiting", "https://explorer/tx");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        text1: "waiting",
        text2: "Tap to view in explorer",
        autoHide: false,
      }),
    );
  });

  test("showWaiting without url has no text2", () => {
    appToast.showWaiting("waiting");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
        text1: "waiting",
        text2: undefined,
        autoHide: false,
      }),
    );
  });

  test("showWaiting onPress opens url when provided", () => {
    appToast.showWaiting("waiting", "https://explorer/tx");
    const call = mockShow.mock.calls[0][0];
    call.onPress();
    expect(mockOpenURL).toHaveBeenCalledWith("https://explorer/tx");
  });

  test("showWaiting onPress does nothing without url", () => {
    appToast.showWaiting("waiting");
    const call = mockShow.mock.calls[0][0];
    call.onPress();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  test("showSuccess includes explorer hint when url provided", () => {
    appToast.showSuccess("success", "https://explorer/tx");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text2: "Tap to view in explorer",
      }),
    );
  });

  test("showSuccess without url has no text2", () => {
    appToast.showSuccess("success");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "success",
        text2: undefined,
      }),
    );
  });

  test("showSuccess onPress opens url when provided", () => {
    appToast.showSuccess("success", "https://explorer/tx");
    const call = mockShow.mock.calls[0][0];
    call.onPress();
    expect(mockOpenURL).toHaveBeenCalledWith("https://explorer/tx");
  });

  test("showSuccess onPress does nothing without url", () => {
    appToast.showSuccess("success");
    const call = mockShow.mock.calls[0][0];
    call.onPress();
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  test("showError calls error", () => {
    appToast.showError("oops");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", text1: "oops" }),
    );
  });

  test("hide delegates to Toast.hide", () => {
    appToast.hide();
    expect(mockHide).toHaveBeenCalled();
  });
});
