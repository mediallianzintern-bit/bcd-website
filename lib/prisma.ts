import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? ""
  // Aiven MySQL requires SSL — append sslaccept if not already present
  const datasourceUrl =
    url.includes("aivencloud.com") && !url.includes("ssl")
      ? url + (url.includes("?") ? "&" : "?") + "sslaccept=accept_invalid_certs"
      : url
  return new PrismaClient({ datasources: { db: { url: datasourceUrl } } })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
