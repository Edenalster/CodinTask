"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const codeblock_model_1 = __importDefault(require("./models/codeblock_model"));
const index_1 = require("./index");
dotenv_1.default.config();
const seedCodeBlocks = [
    {
        name: "Async Example",
        initialCode: `// TODO: Fetch data from the API and log it to the console
async function getData() {
  // Your code here
}`,
        solution: `async function getData() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  console.log(data);
}`,
    },
    {
        name: "Closure Example",
        initialCode: `// TODO: Complete the closure to count how many times inner() is called
function outer() {
  // Your code here
}`,
        solution: `function outer() {
  let count = 0;
  return function inner() {
    count++;
    console.log(count);
  };
}`,
    },
    {
        name: "Array Map",
        initialCode: `// TODO: Use map to double the numbers in the array
const numbers = [1, 2, 3];
// Your code here`,
        solution: `const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`,
    },
    {
        name: "Event Listener",
        initialCode: `// TODO: Add a click event listener that shows an alert
// Hint: use document.getElementById and addEventListener
// Your code here`,
        solution: `document.getElementById("btn").addEventListener("click", () => {
  alert("Button clicked!");
});`,
    },
];
// Asynchronous function to seed the database
async function seed() {
    await (0, index_1.connectDB)();
    try {
        await codeblock_model_1.default.deleteMany(); // Clear old ones
        await codeblock_model_1.default.insertMany(seedCodeBlocks); // Add new
        console.log("Seeded successfully");
    }
    catch (error) {
        console.error("Error seeding:", error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
}
seed();
