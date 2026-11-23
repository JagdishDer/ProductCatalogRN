
export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};
