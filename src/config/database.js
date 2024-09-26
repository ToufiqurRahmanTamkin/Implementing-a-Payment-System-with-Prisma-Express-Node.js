const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

checkDatabaseConnection();

module.exports = prisma;
