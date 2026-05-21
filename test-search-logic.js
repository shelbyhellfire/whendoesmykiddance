// Simulate the search logic
const dancers = ["Lotus Maclver", "Adelaide Anderson"];
const routineEntry = {
  dancerName: "Lotus Maclver",
  routineNumber: "379",
  routineName: "All Shook Up",
  day: "Wednesday",
  time: "08:51 PM",
  room: "Room A"
};

const searchNames = dancers
  .map((name) => name.trim().toLowerCase())
  .filter((name) => name.length > 0);

const dancerNames = routineEntry.dancerName?.toLowerCase() || "";

console.log("Searching for:", searchNames);
console.log("Entry dancer name:", dancerNames);

const matches = searchNames.filter(searchName => dancerNames.includes(searchName));
console.log("Matches found:", matches);
