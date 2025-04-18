#!/usr/bin/env node
import readline from "readline";
import process from "process";
import {
  getWishes,
  createWish,
  deleteWish,
  updateWish,
  getWishById,
  getSummary,
} from "./src/wishes/methods.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Command Line Wishlist> ",
});

const pattern = /[a-zA-Z]/g;
let currentAction = null;
let currentWishId = null;

console.log("\n***** Welcome to your wishlist *****\n");
menu();
rl.prompt();

rl.on("line", async (input) => {
  input = input.trim();

  if (currentAction) {
    await handleAction(input);
    return;
  }

  switch (input) {
    case "1":
      await getWishes();
      break;

    case input.match(pattern) ? input : null:
      await handleCreateWish(input);
      break;

    case "2":
      await getWishes();
      console.log(
        "\nEnter the ID of the wish you want to update (or 'cancel' to go back):"
      );
      currentAction = "update";
      break;

    case "3":
      await getWishes();
      console.log(
        "\nEnter the ID of the wish you want to delete (or 'cancel' to go back):"
      );
      currentAction = "delete";
      break;

    case "4":
      await getSummary();
      break;

    case "0":
      rl.close();
      return;
    default:
      console.log("\nOption Not Recognized");
  }

  rl.prompt();
});

async function handleAction(input) {
  if (input.toLowerCase() === "cancel") {
    console.log(`\n${currentAction} operation cancelled.\n`);
    resetActionState();
    return;
  }

  if (currentAction === "update" && !currentWishId) {
    const id = Number(input.trim());
    if (isNaN(id)) {
      console.log("Please enter a valid number for the ID");
      rl.prompt();
      return;
    }

    try {
      const wish = await getWishById(id);
      currentWishId = id;

      console.log(
        "\nEnter the new values (format: name price store) or 'cancel':"
      );
      console.log("Use '-' to keep current value");
      console.log(
        `\nCurrent values: \n"${wish.name}" ${wish.price} "${wish.store}"`
      );

      rl.prompt();
    } catch (error) {
      console.error("\nError:", error.message);
      resetActionState();
    }
    return;
  }

  if (currentAction === "update" && currentWishId) {
    try {
      const wish = await getWishById(currentWishId);
      const updates = parseUpdateInput(input, wish);

      if (Object.keys(updates).length > 0) {
        await updateWish(currentWishId, updates);
        console.log("\nWish updated successfully!");
      } else {
        console.log("\nNo changes were made.");
      }
    } catch (error) {
      console.error("\nError updating wish:", error.message);
    }
    resetActionState();
    return;
  }

  if (currentAction === "delete") {
    const id = Number(input.trim());
    if (isNaN(id)) {
      console.log("Please enter a valid number for the ID");
      rl.prompt();
      return;
    }

    try {
      await deleteWish(id);
    } catch (error) {
      console.error("\nError deleting wish:", error.message);
    }
    resetActionState();
    return;
  }
}

function resetActionState() {
  currentAction = null;
  currentWishId = null;
  menu();
  rl.prompt();
}

function parseUpdateInput(input, currentWish) {
  const parts = input.trim().split(/\s+/);
  const updates = {};

  if (parts[0] && parts[0] !== "-") {
    updates.name = parts[0].includes("-")
      ? parts[0].split("-").join(" ")
      : parts[0];
  }

  if (parts[1] && parts[1] !== "-") {
    const price = Number(parts[1]);
    if (isNaN(price)) {
      throw new Error("Price must be a number");
    }
    updates.price = price;
  }

  if (parts[2] && parts[2] !== "-") {
    updates.store = parts[2].includes("-")
      ? parts[2].split("-").join(" ")
      : parts[2];
  }

  return updates;
}

async function handleCreateWish(input) {
  const args = input.trim().split(/\s+/);
  if (args.length < 3) {
    console.log(
      "\nError: Missing arguments. Format: name-of-wish price name-of-store"
    );
    console.log("Example: Metallica-t-shirt 500 Urban-madness\n");
    return;
  }

  const [nameStr, priceStr, storeStr] = args;
  const price = parseFloat(priceStr);
  const name = nameStr.split("-").join(" ");
  const store = storeStr.split("-").join(" ");

  if (isNaN(price)) {
    console.error("\nError: Price must be a number");
    return;
  }

  try {
    await createWish(name, price, store);
    console.log("\nWish created successfully!");
  } catch (error) {
    console.log("\nError creating wish:", error.message);
  }
}

function menu() {
  console.log("\n***** Press 1 to show wishes *****");
  console.log("***** Press 2 to update a wish *****");
  console.log("***** Press 3 to delete a wish *****");
  console.log("***** Press 4 to show summary of the wishes *****\n");
  console.log(
    "***** To create a wish, write it with the following format: name-of-wish price store *****"
  );
  console.log("***** Example: Metallica-shirt 500 Urban-madness *****\n");
  console.log("***** Press 0 or CTRL + C to close *****\n");
}

rl.on("close", () => {
  console.log("\nSee you soon.");
  process.exit(0);
});
