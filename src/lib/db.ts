import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient;
}

export let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {                        //when we are in development mode , if there is no cachedPrisma then we create a new PrismaClient and assign it to cachedPrisma
  if (!global.cachedPrisma) {   //if there is a cachedPrisma then we assign it to prisma
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;  //now we can use prisma client anywhere in our application
}