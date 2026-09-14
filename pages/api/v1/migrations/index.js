import migrationRunner from "node-pg-migrate";
import { join } from "path";
import database from "infra/database.js";
import db from "node-pg-migrate/dist/db";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOpitions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method === "GET") {
      console.log("Received GET request");
      const pendingMigrations = await migrationRunner(defaultMigrationOpitions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      console.log("Received POST request");
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOpitions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
