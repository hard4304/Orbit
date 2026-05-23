import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { IUser } from "@/types";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email }).lean<IUser>();
  }

  async findByUsername(username: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ username }).lean<IUser>();
  }

  async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).lean<IUser>();
  }

  async create(data: { username: string; email: string; password: string }): Promise<IUser> {
    await connectDB();
    const user = await User.create(data);
    return user.toObject() as IUser;
  }

  async updateTelegramChatId(userId: string, chatId: string): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(
      userId,
      { $set: { telegramChatId: chatId, telegramLinked: true } },
      { new: true }
    ).lean<IUser>();
  }

  async unlinkTelegram(userId: string): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(
      userId,
      { $unset: { telegramChatId: "" }, $set: { telegramLinked: false } },
      { new: true }
    ).lean<IUser>();
  }

  async findTelegramLinkedUsers(): Promise<IUser[]> {
    await connectDB();
    return User.find({ telegramLinked: true }).lean<IUser[]>();
  }
}

export const userRepository = new UserRepository();
