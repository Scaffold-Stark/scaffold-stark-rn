import { Linking } from "react-native";
import { Toast } from "toastify-react-native";

type ToastPosition = "top" | "center" | "bottom";

type ShowOptions = {
  position?: ToastPosition;
  useModal?: boolean;
};

function showPersistentInfo(
  text1: string,
  text2?: string,
  options?: ShowOptions,
) {
  Toast.show({
    type: "info",
    text1,
    text2,
    autoHide: false,
    position: options?.position ?? "top",
    useModal: options?.useModal,
  });
}

function showWaiting(message: string, explorerUrl?: string) {
  Toast.show({
    type: "info",
    text1: message,
    text2: explorerUrl ? "Tap to view in explorer" : undefined,
    autoHide: false,
    position: "top",
    onPress: () => {
      if (explorerUrl) {
        Linking.openURL(explorerUrl);
      }
    },
  });
}

function showSuccess(message: string, explorerUrl?: string) {
  Toast.show({
    type: "success",
    text1: message,
    text2: explorerUrl ? "Tap to view in explorer" : undefined,
    position: "top",
    onPress: () => {
      if (explorerUrl) {
        Linking.openURL(explorerUrl);
      }
    },
  });
}

function showError(message: string) {
  Toast.error(message);
}

function hide() {
  Toast.hide();
}

export const appToast = {
  showPersistentInfo,
  showWaiting,
  showSuccess,
  showError,
  hide,
};

export type AppToast = typeof appToast;
