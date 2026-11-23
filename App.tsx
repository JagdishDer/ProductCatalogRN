import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import ProductScreen from './src/screens/ProductScreen';
import { login } from './src/api/client';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [loginLoading, setLoginLoading] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin(
    username: string,
    password: string,
  ): Promise<void> {
    setLoginError(null);

    if (!username.trim() || !password) {
      setLoginError('Please enter your username and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const session = await login(username.trim(), password);

      if (!session.accessToken) {
        throw new Error('Authentication response did not contain a token.');
      }

      setAccessToken(session.accessToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown login error';

      if (/API request failed: (400|401)\b/.test(message)) {
        setLoginError('Invalid username or password. Please try again.');
      } else if (message.includes('Network request failed')) {
        setLoginError('Network error. Check your internet connection.');
      } else {
        setLoginError(message);
      }
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setAccessToken(null);
    setLoginError(null);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {accessToken ? (
        <ProductScreen accessToken={accessToken} onLogout={handleLogout} />
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
});
