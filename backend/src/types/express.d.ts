declare global {
  namespace Express {
    interface Request {
      auth?: {
        user_id: string;
      };
    }
  }
}

export {};
