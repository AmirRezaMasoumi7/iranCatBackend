import { prisma } from "../../lib/prisma.js";

export type DashboardOverview = {
  totalUsers: number;
  activeToday: number;
  todaySearches: number;
  avgSearchesPerActiveUser: number;
};

export type ActivityTrendItem = {
  date: string;
  activeUsers: number;
  countSearch: number;
};

const ACTIVITY_TREND_DAYS = 30;

function getTodayUtcRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

function getLastNDaysUtcRange(days: number): { start: Date; end: Date } {
  const { start: todayStart, end } = getTodayUtcRange();
  const start = new Date(todayStart);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start, end };
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildUtcDateKeys(start: Date, days: number): string[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return toUtcDateKey(date);
  });
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { start, end } = getTodayUtcRange();
  const todayFilter = { gte: start, lte: end };

  const [totalUsers, todaySearches, loginUsers, searchUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.logUserCat.count({
        where: { requestedAt: todayFilter },
      }),
      prisma.userLoginLog.findMany({
        where: { loggedInAt: todayFilter },
        distinct: ["username"],
        select: { username: true },
      }),
      prisma.logUserCat.findMany({
        where: { requestedAt: todayFilter },
        distinct: ["username"],
        select: { username: true },
      }),
    ]);

  const activeUsernames = new Set([
    ...loginUsers.map((row) => row.username),
    ...searchUsers.map((row) => row.username),
  ]);
  const activeToday = activeUsernames.size;

  const avgSearchesPerActiveUser =
    activeToday === 0
      ? 0
      : Math.round((todaySearches / activeToday) * 100) / 100;

  return {
    totalUsers,
    activeToday,
    todaySearches,
    avgSearchesPerActiveUser,
  };
}

export async function getActivityTrend(): Promise<ActivityTrendItem[]> {
  const { start, end } = getLastNDaysUtcRange(ACTIVITY_TREND_DAYS);
  const rangeFilter = { gte: start, lte: end };

  const [loginLogs, searchLogs] = await Promise.all([
    prisma.userLoginLog.findMany({
      where: { loggedInAt: rangeFilter },
      select: { username: true, loggedInAt: true },
    }),
    prisma.logUserCat.findMany({
      where: { requestedAt: rangeFilter },
      select: { username: true, requestedAt: true },
    }),
  ]);

  const activeUsersByDate = new Map<string, Set<string>>();
  const searchCountByDate = new Map<string, number>();

  for (const log of loginLogs) {
    const dateKey = toUtcDateKey(log.loggedInAt);
    let users = activeUsersByDate.get(dateKey);
    if (!users) {
      users = new Set();
      activeUsersByDate.set(dateKey, users);
    }
    users.add(log.username);
  }

  for (const log of searchLogs) {
    const dateKey = toUtcDateKey(log.requestedAt);

    let users = activeUsersByDate.get(dateKey);
    if (!users) {
      users = new Set();
      activeUsersByDate.set(dateKey, users);
    }
    users.add(log.username);

    searchCountByDate.set(dateKey, (searchCountByDate.get(dateKey) ?? 0) + 1);
  }

  return buildUtcDateKeys(start, ACTIVITY_TREND_DAYS).map((date) => ({
    date,
    activeUsers: activeUsersByDate.get(date)?.size ?? 0,
    countSearch: searchCountByDate.get(date) ?? 0,
  }));
}
