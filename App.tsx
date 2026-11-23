import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import ProductScreen from './src/screens/ProductScreen';

import { login, getCurrentUser } from './src/api/client';

import {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
} from './src/security/tokenStorage';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [restoring, setRestoring] = useState(true);

  const [restoreError, setRestoreError] = useState<string | null>(null);

  const [restoreAttempt, setRestoreAttempt] = useState(0);

  const [loginLoading, setLoginLoading] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);

  // Restore and validate the saved token.
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      setRestoring(true);
      setRestoreError(null);

      try {
        const savedToken = await getAccessToken();

        if (!savedToken) {
          if (mounted) {
            setAccessToken(null);
          }
          return;
        }

        try {
          await getCurrentUser(savedToken);

          if (mounted) {
            setAccessToken(savedToken);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : '';

          if (/^API request failed: (401|403)\b/.test(message)) {
            await removeAccessToken();

            if (mounted) {
              setAccessToken(null);
            }
          } else {
            throw error;
          }
        }
      } catch {
        if (mounted) {
          setRestoreError(
            'Could not verify your saved session. ' +
              'Check your connection and try again.',
          );
        }
      } finally {
        if (mounted) {
          setRestoring(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [restoreAttempt]);

  async function handleLogin(
    username: string,
    password: string,
  ): Promise<void> {
    if (loginLoading) {
      return;
    }

    setLoginError(null);

    if (!username.trim() || !password) {
      setLoginError('Please enter your username and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const session = await login(username.trim(), password);

      if (!session.accessToken) {
        throw new Error('No access token returned by the server');
      }

      // Save securely before opening ProductScreen.
      await saveAccessToken(session.accessToken);

      setAccessToken(session.accessToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';

      if (/^API request failed: (400|401)\b/.test(message)) {
        setLoginError('Invalid username or password.');
      } else if (message.includes('Network request failed')) {
        setLoginError('Network error. Check your internet connection.');
      } else {
        setLoginError(message);
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await removeAccessToken();

      setAccessToken(null);
      setLoginError(null);
      setRestoreError(null);
    } catch {
      Alert.alert(
        'Logout failed',
        'Unable to clear the secure session. Please retry.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {restoring ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.message}>Restoring secure session...</Text>
        </View>
      ) : restoreError ? (
        <View style={styles.center}>
          <Text style={styles.message}>{restoreError}</Text>

          <Button
            title="Retry"
            onPress={() => setRestoreAttempt(value => value + 1)}
          />

          <View style={styles.spacing}>
            <Button
              title="Clear Session and Sign In"
              onPress={() => void handleLogout()}
            />
          </View>
        </View>
      ) : accessToken ? (
        <ProductScreen
          accessToken={accessToken}
          onLogout={() => void handleLogout()}
        />
      ) : (
        <LoginScreen
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
          onClearError={() => setLoginError(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 15,
    color: '#374151',
    marginVertical: 20,
    textAlign: 'center',
  },
  spacing: {
    marginTop: 16,
  },
});
