import 'express-session';

declare module 'express-session' {
  interface SessionData {
    cart?: {
      roomId: string;
      quantity: number;
      price: number;
    }[];
  }
}
