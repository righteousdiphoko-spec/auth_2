import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";
import { seedDemoUser } from "./config/store.js";

await prisma.$connect();
await seedDemoUser();

const server = app.listen(env.PORT, () => console.log(`Auth2 API listening on ${env.PORT}`));
const shutdown = () => { server.close(() => process.exit(0)); };
process.on("SIGTERM", shutdown); process.on("SIGINT", shutdown);
