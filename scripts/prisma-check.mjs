import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const schemaPath = path.join(cwd, "prisma", "schema.prisma");
const migrationsDir = path.join(cwd, "prisma", "migrations");
const clientCandidates = [
  path.join(cwd, "node_modules", ".prisma", "client", "index.d.ts"),
  path.join(cwd, "node_modules", "@prisma", "client", "index.d.ts"),
];

function getMtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function findLatestMigrationMtime(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let latest = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const sqlPath = path.join(dirPath, entry.name, "migration.sql");
    latest = Math.max(latest, getMtime(sqlPath));
  }

  return latest;
}

function findClientMtime() {
  let latest = 0;
  for (const candidate of clientCandidates) {
    latest = Math.max(latest, getMtime(candidate));
  }
  return latest;
}

const schemaMtime = getMtime(schemaPath);

if (!schemaMtime) {
  process.exit(0);
}

const latestMigrationMtime = findLatestMigrationMtime(migrationsDir);
const clientMtime = findClientMtime();

const needsMigration = latestMigrationMtime > 0 && schemaMtime > latestMigrationMtime;
const missingMigration = latestMigrationMtime === 0;
const needsGenerate = clientMtime === 0 || schemaMtime > clientMtime;

if (needsMigration || missingMigration || needsGenerate) {
  console.warn("\n[AVISO PRISMA] Detectamos possivel divergencia entre schema, migration e client.");

  if (needsMigration || missingMigration) {
    console.warn("- Rode: npx prisma migrate dev --name <nome_da_migration>");
  }

  if (needsGenerate) {
    console.warn("- Rode: npx prisma generate");
  }

  console.warn("- Depois, execute novamente seu comando (dev/build).\n");
}
