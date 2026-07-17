declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      role: {
        id: string;
        code: string;
      };
      permissions: string[];
    };
  }
}
