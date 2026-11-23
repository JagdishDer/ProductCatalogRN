import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type LoginScreenProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
};

export default function LoginScreen({
  onLogin,
  loading,
  error,
  onClearError,
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (loading) {
      return;
    }

    void onLogin(username.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>📦</Text>

            <Text style={styles.title}>Product Catalog</Text>

            <Text style={styles.subtitle}>Sign in to manage your products</Text>
          </View>

          <Text style={styles.label}>Username</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={value => {
              setUsername(value);
              onClearError();
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            editable={!loading}
            returnKeyType="next"
            testID="username-input"
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={value => {
                setPassword(value);
                onClearError();
              }}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
              testID="password-input"
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <Text style={styles.showPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            testID="login-button"
            style={[styles.loginButton, loading && styles.disabledButton]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>

            <Text style={styles.demoText}>Username: emilys</Text>

            <Text style={styles.demoText}>Password: emilyspass</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    color: '#111827',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    height: 52,
    flex: 1,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 16,
  },
  showPassword: {
    color: '#2563EB',
    fontWeight: '600',
    paddingHorizontal: 14,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  loginButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoBox: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 7,
  },
  demoText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 21,
  },
});
