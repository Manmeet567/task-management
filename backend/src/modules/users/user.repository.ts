import type { IUser } from "./user.model.js";
import { User } from "./user.model.js";

type CreateUserData = Pick<IUser, "email" | "password_hash">;

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string) {
    return User.findOne({ email }).select("+password_hash").exec();
  }

  async create(data: CreateUserData) {
    return User.create(data);
  }
}

export const userRepository = new UserRepository();
