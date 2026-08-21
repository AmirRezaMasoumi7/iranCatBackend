import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { ListUserLogInput } from "./user-logs.schema.js";

export type LoginLogItem = {
  username: string;
  loginTimestamp: Date;
  device: string;
};

export async function listUserLoginLogs(
  input: ListUserLogInput,
): Promise<LoginLogItem[]> {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
    select: { username: true },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const logs = await prisma.userLoginLog.findMany({
    where: { username: input.username },
    orderBy: { loggedInAt: "desc" },
    select: {
      username: true,
      loggedInAt: true,
      device: true,
    },
  });

  return logs.map((log) => ({
    username: log.username,
    loginTimestamp: log.loggedInAt,
    device: log.device,
  }));
}
