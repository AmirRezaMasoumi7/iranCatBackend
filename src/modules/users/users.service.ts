import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { UserBodyInput } from "./users.schema.js";
import {
  expiryDateFromRemainingDays,
  getRemainingSubscriptionDays,
} from "./subscription.utils.js";

const userDbSelect = {
  id: true,
  fullName: true,
  username: true,
  phoneNumber: true,
  city: true,
  subscriptionExpiryDate: true,
  role: true,
  jwtToken: true,
  device: true,
  createdAt: true,
  updatedAt: true,
} as const;

type UserDbRecord = Prisma.UserGetPayload<{ select: typeof userDbSelect }>;
type UserDbRecordWithPassword = UserDbRecord & { password: string };

export type UserListItem = {
  id: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  city: string;
  remainingSubscriptionDays: number;
  role: string;
  jwtToken: string | null;
  device: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListedUser = UserListItem & {
  password: string;
};

function toUserResponse(user: UserDbRecord): UserListItem {
  const { subscriptionExpiryDate, ...rest } = user;

  return {
    ...rest,
    remainingSubscriptionDays: getRemainingSubscriptionDays(subscriptionExpiryDate),
  };
}

function toListedUserResponse(user: UserDbRecordWithPassword): ListedUser {
  const { subscriptionExpiryDate, password, ...rest } = user;

  return {
    ...rest,
    password,
    remainingSubscriptionDays: getRemainingSubscriptionDays(subscriptionExpiryDate),
  };
}

function toUserData(input: UserBodyInput, passwordHash: string) {
  return {
    fullName: input.fullName,
    username: input.username,
    phoneNumber: input.phoneNumber,
    city: input.city,
    subscriptionExpiryDate: expiryDateFromRemainingDays(input.remainingSubscriptionDays),
    role: input.role,
    password: input.password,
    passwordHash,
    jwtToken: input.jwtToken ?? null,
    device: input.device ?? null,
  };
}

export async function listUsers(): Promise<ListedUser[]> {
  const users = await prisma.user.findMany({
    select: { ...userDbSelect, password: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map(toListedUserResponse);
}

export async function addUser(input: UserBodyInput): Promise<UserListItem> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const user = await prisma.user.create({
      data: toUserData(input, passwordHash),
      select: userDbSelect,
    });

    return toUserResponse(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "Username already exists", "USERNAME_EXISTS");
    }

    throw error;
  }
}

export async function editUser(input: UserBodyInput): Promise<UserListItem> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const user = await prisma.user.update({
      where: { username: input.username },
      data: {
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        city: input.city,
        subscriptionExpiryDate: expiryDateFromRemainingDays(input.remainingSubscriptionDays),
        role: input.role,
        password: input.password,
        passwordHash,
        jwtToken: input.jwtToken ?? null,
        device: input.device ?? null,
      },
      select: userDbSelect,
    });

    return toUserResponse(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    throw error;
  }
}
