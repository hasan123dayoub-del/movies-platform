import { env } from "./lib/env.js";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

// On Ctrl+C or a deploy restart: finish open requests, close the database, then exit
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
