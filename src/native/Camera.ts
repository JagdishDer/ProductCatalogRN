
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

type CameraNativeModule = {
  capturePhoto(): Promise<string>;
};

export async function capturePhoto(): Promise<string> {
  if (Platform.OS === 'android') {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Allow this app to capture product photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Camera permission denied');
    }
  }

  const nativeCamera =
    NativeModules.CameraModule as CameraNativeModule | undefined;

  if (!nativeCamera) {
    throw new Error('Camera native module is not registered');
  }

  return nativeCamera.capturePhoto();
}
