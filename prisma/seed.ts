import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { expiryDateFromRemainingDays } from "../src/modules/users/subscription.utils.js";
const prisma = new PrismaClient();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      password: ADMIN_PASSWORD,
      passwordHash,
      subscriptionExpiryDate: expiryDateFromRemainingDays(30),
    },
    create: {
      fullName: "Admin",
      username: ADMIN_USERNAME,
      phoneNumber: "09123456789",
      city: "Tehran",
      subscriptionExpiryDate: expiryDateFromRemainingDays(30),
      role: UserRole.admin,
      password: ADMIN_PASSWORD,
      passwordHash,
      device: "web",
    },
  });

  console.log(`Admin user ready: ${admin.username} (${admin.id})`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
