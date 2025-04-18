import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DB_Path = fileURLToPath(
  new URL("../persistence/wishes.json", import.meta.url)
);

export const getDB = async () => {
  const database = await fs.readFile(DB_Path, "utf-8");
  return JSON.parse(database);
};

export const saveDB = async (database) => {
  await fs.writeFile(DB_Path, JSON.stringify(database, null, 2));
  return database;
};

export const insert = async (data) => {
  const database = await getDB();
  database.wishes.push(data);
  await saveDB(database);
  return data;
};

export const remove = async (id) => {
  const database = await getDB();

  const index = database.wishes.findIndex((wish) => wish.id == id);

  if (index === -1) {
    throw new Error("\nWish not found with the provided ID\n");
  }

  database.wishes.splice(index, 1);
  await saveDB(database);

  return { message: "\nWish Deleted Successfully!\n" };
};
