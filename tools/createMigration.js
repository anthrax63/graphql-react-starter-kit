import fs from 'fs-extra';
import path from 'path';

const pathToMigrations = path.join(__dirname, '../src/migrate/migrations');
const pathToMigrationList = path.join(pathToMigrations, 'index.js');

async function createMigration() {
  if (process.argv.length < 4) {
    console.log('Migration should have a name');
    console.log('Correct command: \n\tnpm run createMigration [name]');
    process.exit();
  }
  const migrationName = `${Date.now()}-${process.argv.pop()}`;
  const migrationFile = path.join(pathToMigrations, `/${migrationName}.js`);
  await fs.outputFile(migrationFile, getDataFromTemplate(migrationName));

  let migrations = await fs.readdir(pathToMigrations);
  migrations = migrations.filter((m) => m !== 'index.js').map((m) => m.substr(0, m.length - 3));
  await fs.outputFile(pathToMigrationList, getListData(migrations));

  console.log(`\nMigration ${migrationName.split('-').pop()} is successfully created`);
  console.log(`Find them in to ${migrationFile}\n`);
}

export default createMigration;

function getDataFromTemplate(migrationName) {
  return `import mongoose from 'mongoose';

export const name = '${migrationName}.js';
export const description = '';

export const up = async () => {

};

export const down = async () => {

};

export default { name, description, up, down };
`;
}

function getListData(migrations) {
  let result = migrations.map((m) => `import ${m.split('-').pop()} from './${m}.js';`).join('\n');
  result += '\n\nexport default [\n';
  result += migrations.map((m) => `\t${m.split('-').pop()},`).join('\n');
  result += '\n];\n';
  return result;
}
