const fs = require("fs");
const path = require("path");

console.log("Creating .env files for microservices...");

// Helper function to safely write .env files
function createEnv(servicePath, content) {
  const fullPath = path.join(__dirname, servicePath, ".env");

  if (fs.existsSync(fullPath)) {
    console.log(`Skipped: ${servicePath}/.env already exists`);
    return;
  }

  fs.writeFileSync(fullPath, content.trim() + "\n");
  console.log(`Created: ${servicePath}/.env`);
}

// -----------------------------
// LOGIN SERVICE (.env)
// -----------------------------
createEnv("Backend/login-service", `
PORT=8001
JWT_SECRET=vino_della_bella_gnocca
DATABASE_PATH=./db/login.sqlite
`);

// -----------------------------
// CLIENT SERVICE (.env)
// -----------------------------
createEnv("Backend/client-service", `
PORT=6001
JWT_SECRET=vino_della_bella_gnocca
DATABASE_PATH=./client.sqlite
`);

// -----------------------------
// LLM SERVICE (.env)
// -----------------------------
createEnv("Backend/llm-service", `
PORT=7001
GEMINI_API_KEY=AIzaSyBrGzToNCENjJz-maYY3-yu07NhW8_f_7A
DATABASE_PATH=./llm.sqlite
`);

console.log("\nAll .env files created!");