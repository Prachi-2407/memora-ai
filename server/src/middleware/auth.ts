import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

export interface AuthRequest
  extends Request {
  userId?: number;
}

interface TokenPayload {
  userId: number;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      message:
        "Authentication required",
    });
  }

  const token =
    authorization.split(" ")[1];

  try {
    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is missing"
      );
    }

    const payload = jwt.verify(
      token,
      secret
    ) as TokenPayload;

    req.userId =
      payload.userId;

    next();
  } catch {
    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
}