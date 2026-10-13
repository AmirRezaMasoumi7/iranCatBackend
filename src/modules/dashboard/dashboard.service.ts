import { prisma } from "../../lib/prisma.js";

export type DashboardSearchDetail = {
  username: string;
  oemCode: string;
  carBrand: string | null;
  description: string | null;
  requestedAt: Date;
};

export type DashboardOverview = {
  totalUsers: number;
  activeToday: number;
  activeUsernames: string[];
  todaySearches: number;
  searches: DashboardSearchDetail[];
  avgSearchesPerActiveUser: number;
};

export type ActivityTrendItem = {
  date: string;
  activeUsers: number;
  activeUsernames: string[];
  countSearch: number;
  searches: DashboardSearchDetail[];
};

type SearchLogRow = {
  username: string;
  oemCode: string;
  requestedAt: Date;
};

type CatName = {
  carBrand: string | null;
  description: string | null;
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

function sortedUsernames(usernames: Iterable<string>): string[] {
  return [...new Set(usernames)].sort((left, right) => left.localeCompare(right));
}

function addUsername(
  usersByDate: Map<string, Set<string>>,
  dateKey: string,
  username: string,
): void {
  let users = usersByDate.get(dateKey);
  if (!users) {
    users = new Set();
    usersByDate.set(dateKey, users);
  }
  users.add(username);
}

async function loadCatNames(oemCodes: string[]): Promise<Map<string, CatName>> {
  const uniqueOemCodes = [...new Set(oemCodes)];
  if (uniqueOemCodes.length === 0) {
    return new Map();
  }

  const cats = await prisma.cat.findMany({
    where: { oemCode: { in: uniqueOemCodes } },
    select: { oemCode: true, carBrand: true, description: true },
  });

  return new Map(
    cats.map((cat) => [
      cat.oemCode,
      { carBrand: cat.carBrand, description: cat.description },
    ]),
  );
}

function toSearchDetails(
  logs: SearchLogRow[],
  catNames: Map<string, CatName>,
): DashboardSearchDetail[] {
  return logs.map((log) => {
    const cat = catNames.get(log.oemCode);

    return {
      username: log.username,
      oemCode: log.oemCode,
      carBrand: cat?.carBrand ?? null,
      description: cat?.description ?? null,
      requestedAt: log.requestedAt,
    };
  });
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { start, end } = getTodayUtcRange();
  const todayFilter = { gte: start, lte: end };

  const [totalUsers, loginUsers, searchLogs] = await Promise.all([
    prisma.user.count(),
    prisma.userLoginLog.findMany({
      where: { loggedInAt: todayFilter },
      distinct: ["username"],
      select: { username: true },
    }),
    prisma.logUserCat.findMany({
      where: { requestedAt: todayFilter },
      select: { username: true, oemCode: true, requestedAt: true },
      orderBy: { requestedAt: "asc" },
    }),
  ]);

  const activeUsernames = sortedUsernames([
    ...loginUsers.map((row) => row.username),
    ...searchLogs.map((row) => row.username),
  ]);
  const activeToday = activeUsernames.length;
  const todaySearches = searchLogs.length;
  const catNames = await loadCatNames(searchLogs.map((row) => row.oemCode));

  const avgSearchesPerActiveUser =
    activeToday === 0
      ? 0
      : Math.round((todaySearches / activeToday) * 100) / 100;

  return {
    totalUsers,
    activeToday,
    activeUsernames,
    todaySearches,
    searches: toSearchDetails(searchLogs, catNames),
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
      select: { username: true, oemCode: true, requestedAt: true },
      orderBy: { requestedAt: "asc" },
    }),
  ]);

  const activeUsersByDate = new Map<string, Set<string>>();
  const searchesByDate = new Map<string, SearchLogRow[]>();

  for (const log of loginLogs) {
    addUsername(activeUsersByDate, toUtcDateKey(log.loggedInAt), log.username);
  }

  for (const log of searchLogs) {
    const dateKey = toUtcDateKey(log.requestedAt);
    addUsername(activeUsersByDate, dateKey, log.username);

    const searches = searchesByDate.get(dateKey) ?? [];
    searches.push(log);
    searchesByDate.set(dateKey, searches);
  }

  const catNames = await loadCatNames(searchLogs.map((row) => row.oemCode));

  return buildUtcDateKeys(start, ACTIVITY_TREND_DAYS).map((date) => {
    const searches = searchesByDate.get(date) ?? [];
    const activeUsernames = sortedUsernames(activeUsersByDate.get(date) ?? []);

    return {
      date,
      activeUsers: activeUsernames.length,
      activeUsernames,
      countSearch: searches.length,
      searches: toSearchDetails(searches, catNames),
    };
  });
}
