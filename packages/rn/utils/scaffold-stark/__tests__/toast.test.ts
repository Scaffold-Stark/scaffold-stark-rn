import { appToast } from "@/services/utils/scaffold-stark/toast";

jest.mock("react-native", () => ({ Linking: { openURL: jest.fn() } }));
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

  test("showSuccess includes explorer hint when url provided", () => {
    appToast.showSuccess("success", "https://explorer/tx");
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text2: "Tap to view in explorer",
      }),
    );
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
