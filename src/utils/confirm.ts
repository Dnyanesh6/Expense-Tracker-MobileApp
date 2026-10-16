import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
}

/**
 * Cross-platform confirmation dialog.
 *
 * `Alert.alert` on React Native Web only shows the message and never invokes the
 * button `onPress` callbacks, so on web we fall back to the browser's confirm().
 */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const { title, message, confirmLabel, destructive = false } = options;

  if (Platform.OS === 'web') {
    const confirmFn = (globalThis as { confirm?: (text?: string) => boolean }).confirm;
    const accepted = typeof confirmFn === 'function' ? confirmFn(`${title}\n\n${message}`) : true;
    return Promise.resolve(accepted);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
