import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.model";

interface AuthPayload {
  userId: string;
  email: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const generateToken = (payload: AuthPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError("JWT_SECRET is not configured.", 500);
  }

  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const register = async ({
  name,
  email,
  password
}: RegisterInput): Promise<{ token: string }> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError("User with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken({ userId: user._id.toString(), email: user.email });
  return { token };
};

const login = async ({ email, password }: LoginInput): Promise<{ token: string }> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new HttpError("Invalid email or password.", 401);
  }

  const token = generateToken({ userId: user._id.toString(), email: user.email });
  return { token };
};

const authService = {
  register,
  login
};

export { AuthPayload, HttpError };
export default authService;
