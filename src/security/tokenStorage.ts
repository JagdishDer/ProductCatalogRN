
import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.productcatalogrn.auth.accessToken';

const options = {
  service: SERVICE,
};

export async function saveAccessToken(
  token: string,
): Promise<void> {
  if (!token) {
    throw new Error('Cannot save an empty access token');
  }

  const result = await Keychain.setGenericPassword(
    'session',
    token,
    options,
  );

  if (!result) {
    throw new Error('Secure token storage failed');
  }
}

export async function getAccessToken():
  Promise<string | null> {
  const credentials =
    await Keychain.getGenericPassword(options);

  if (!credentials) {
    return null;
  }

  return credentials.password;
}

export async function removeAccessToken():
  Promise<void> {
  const removed =
    await Keychain.resetGenericPassword(options);

  if (!removed) {
    throw new Error('Unable to clear saved session');
  }
}
