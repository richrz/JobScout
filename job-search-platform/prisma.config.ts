import "dotenv/config";

type PrismaConfig = {
  schema: string;
  migrations: {
    path: string;
  };
};

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
} satisfies PrismaConfig;
