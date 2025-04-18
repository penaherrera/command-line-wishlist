import { insert, getDB, remove, saveDB } from "../database/database.js";

export const getWishes = async () => {
  console.log("List of Wishes:");
  const fetchWishes = await getDB();

  return console.log(fetchWishes.wishes);
};

export const createWish = async (name, price, store) => {
  const data = {
    id: await generateId(),
    name: name,
    price: Number(price),
    store: store,
  };

  await insert(data);
  return data;
};

export const updateWish = async (id, updates) => {
  const database = await getDB();
  const index = database.wishes.findIndex((wish) => wish.id == id);

  if (index === -1) {
    throw new Error("Wish not found with the provided ID");
  }

  const updatedWish = {
    ...database.wishes[index],
    ...updates,
  };

  if (updates.price && isNaN(updates.price)) {
    throw new Error("Price must be a number");
  }

  database.wishes[index] = updatedWish;
  await saveDB(database);

  return {
    success: true,
    message: "Wish updated successfully",
    wish: updatedWish,
  };
};

export const getWishById = async (id) => {
  const database = await getDB();
  const wish = database.wishes.find((w) => w.id == id);
  if (!wish) throw new Error(`Wish with ID ${id} not found`);
  return wish;
};
export const deleteWish = async (id) => {
  try {
    const result = await remove(id);
    console.log(result.message);
  } catch (error) {
    console.error("Error deleting wish:", error.message);
  }
};

export const getSummary = async () => {
  const database = await getDB();
  const numberOfItems = database.wishes.length;
  let costsArray = [];

  let totalCost = 0;

  for (let i = 0; i < numberOfItems; i++) {
    totalCost += database.wishes[i].price;
    costsArray.push(database.wishes[i].price);
  }

  const expensiveItem = Math.max(...costsArray);
  const priceAverage = totalCost / numberOfItems;

  console.log(`\n***** Total Cost: ${totalCost} *****`);
  console.log(`***** Most Expensive Item: ${expensiveItem} *****`);
  console.log(`***** Number of wishes: ${numberOfItems} *****`);
  console.log(`***** Price Average: ${priceAverage} *****\n`);
};

const generateId = async () => {
  const fetchWishes = await getDB();
  const arrayLength = fetchWishes.wishes.length;

  let lastWish;
  if (arrayLength == 1) {
    lastWish = fetchWishes.wishes[0];
  } else {
    lastWish = fetchWishes.wishes[arrayLength - 1];
  }

  return Number(lastWish.id) + 1;
};
