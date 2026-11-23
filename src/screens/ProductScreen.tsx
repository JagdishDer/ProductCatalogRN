import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getProductById } from '../api/client';
import { capturePhoto } from '../native/Camera';
import type { Product } from '../types/Product';

type ProductScreenProps = {
  accessToken: string;
  onLogout: () => void;
};

export default function ProductScreen({
  accessToken,
  onLogout,
}: ProductScreenProps) {
  const [product, setProduct] = useState<Product | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const result = await getProductById(1, accessToken);

        if (active) {
          setProduct(result);
        }
      } catch (e) {
        if (active) {
          setProduct(null);
          setError(e instanceof Error ? e.message : 'Failed to load product');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [accessToken, retryCount]);

  async function onCapture() {
    if (capturing) {
      return;
    }

    setCapturing(true);

    try {
      const uri = await capturePhoto();
      setPhotoUri(uri);
    } catch (e) {
      Alert.alert(
        'Camera',
        e instanceof Error ? e.message : 'Unable to capture photo',
      );
    } finally {
      setCapturing(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Catalog</Text>

        <Pressable
          onPress={onLogout}
          accessibilityRole="button"
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      ) : error || !product ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setRetryCount(value => value + 1);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.productCard}>
            <Image
              source={{ uri: product.thumbnail }}
              style={styles.productImage}
              resizeMode="contain"
            />

            <Text style={styles.productTitle}>{product.title}</Text>

            <Text style={styles.category}>Category: {product.category}</Text>

            <Text style={styles.price}>${product.price}</Text>

            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.cameraSection}>
            <Text style={styles.sectionTitle}>Product Photo</Text>

            <Text style={styles.sectionSubtitle}>
              Capture a new photo using the native device camera.
            </Text>

            <Pressable
              style={[styles.cameraButton, capturing && styles.disabledButton]}
              onPress={onCapture}
              disabled={capturing}
              accessibilityRole="button"
              testID="capture-photo-button"
            >
              {capturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.cameraButtonText}>📷 Capture Photo</Text>
              )}
            </Pressable>

            {photoUri && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Captured Photo</Text>

                <Image
                  source={{ uri: photoUri }}
                  style={styles.capturedImage}
                  resizeMode="contain"
                />

                <Text style={styles.successText}>
                  Photo captured successfully!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F6FB',
    paddingTop: 45,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 18,
    color: '#111827',
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
    marginTop: 12,
  },
  description: {
    marginTop: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  cameraSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionSubtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#6B7280',
    lineHeight: 21,
  },
  cameraButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  previewContainer: {
    marginTop: 24,
  },
  previewTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  capturedImage: {
    height: 260,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  successText: {
    color: '#16A34A',
    marginTop: 12,
    textAlign: 'center',
  },
});
