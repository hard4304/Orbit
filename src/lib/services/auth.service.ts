import bcrypt from "bcryptjs";
import { userRepository } from "@/lib/repositories/user.repository";
import { registerSchema } from "@/lib/validators/auth.validator";
import { RegisterDTO, IUser } from "@/types";

export class AuthService {
  async register(data: RegisterDTO): Promise<Omit<IUser, "password">> {
    const parsed = registerSchema.parse(data);

    const existingEmail = await userRepository.findByEmail(parsed.email);
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingUsername = await userRepository.findByUsername(parsed.username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await userRepository.create({
      username: parsed.username,
      email: parsed.email,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = user;
    void _;
    return userWithoutPassword;
  }

  async validateCredentials(email: string, password: string): Promise<Omit<IUser, "password"> | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const { password: _, ...userWithoutPassword } = user;
    void _;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
