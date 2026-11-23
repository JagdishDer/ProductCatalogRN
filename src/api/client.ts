
import type {Product, LoginResponse} from '../types/Product';

const BASE_URL = 'https://dummyjson.com';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, password}),
  });
}

export async function getProductById(
  id: number,
  token: string,
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
