const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
require("chromedriver");



/**
 * Runs end to end Selenium test for LLM driven booking
 * 
 * @async
 * @function runTest
 * @description Tests the complete user journey for booking tickets via the LLM chatbot:
 * It first Opens TigerTix application then opens chatbot interface. Then it Inputs natural language booking request
 *  and waits for LLM to propose booking. Finally it verifies the confirm button appears
 * 
 * @requires Frontend running on localhost:5000
 * @requires LLM service running on localhost:7001
 * @requires Client service running on localhost:6001
 * 
 * @throws error If chatbot toggle button not found
 * @throws error If input box doesn't appear within 10 seconds
 * @throws error If confirm button doesn't appear within 15 seconds
 * 
 */
async function runTest() {
  let options = new chrome.Options();
  //options.addArguments("--headless=new");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");
  options.addArguments("--remote-allow-origins=*")
  .addArguments("--disable-web-security")
  .addArguments("--allow-running-insecure-content")
  .addArguments("--ignore-certificate-errors")
  .addArguments("--disable-features=BlockInsecurePrivateNetworkRequests")
  .addArguments("--no-sandbox")
  .addArguments("--disable-dev-shm-usage")
  .addArguments("--start-maximized");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    const BASE_URL = "http://localhost:5000";

    console.log("Opening application...");
    await driver.get(BASE_URL);
    await driver.sleep(1000);

    console.log("Checking if already logged in...");

try {
  // Look for logout button
  await driver.wait(
    until.elementLocated(By.xpath("//button[text()='Logout']")),
    3000
  );
  console.log("User already logged in. Logging out...");
  const logoutBtn = await driver.findElement(By.xpath("//button[text()='Logout']"));
  await logoutBtn.click();

  // Small delay for UI update
  await driver.sleep(1000);

} catch (_) {
  console.log("User is not logged in.");
}

console.log("Registering a new user...");

// Click the "Register" button that switches the form mode
const toggleToRegister = await driver.wait(
  until.elementLocated(By.xpath("//button[contains(text(), 'Register')]")),
  3000
);

// Ensure it is actually interactive
await driver.wait(until.elementIsVisible(toggleToRegister), 3000);
await driver.wait(until.elementIsEnabled(toggleToRegister), 3000);

await toggleToRegister.click();
await driver.sleep(500); // small pause so React updates UI

// Generate user credentials
const username = "testuser" + Date.now();
const email = `test_${Date.now()}@example.com`;
const password = "Password123!";

// Wait for register form fields
await driver.wait(until.elementLocated(By.css("input[name='username']")), 5000);

// Fill fields
await driver.findElement(By.css("input[name='username']")).sendKeys(username);
await driver.findElement(By.css("input[name='email']")).sendKeys(email);
await driver.findElement(By.css("input[name='password']")).sendKeys(password);

// Submit registration
await driver.findElement(By.css("button.submit-btn")).click();

// Wait for success alert
try {
  await driver.wait(until.alertIsPresent(), 5000);
  const alert = await driver.switchTo().alert();
  console.log("Dismissing alert:", await alert.getText());
  await alert.accept();
} catch (e) {
  console.log("No registration alert appeared.");
}



await driver.sleep(1000); // let login screen load


// =================
// LOGIN AFTER SIGNUP
// =================
console.log("Logging in with new account...");

// Now login with identifier + password
await driver.findElement(By.css("input[name='identifier']")).sendKeys(email);
await driver.findElement(By.css("input[name='password']")).sendKeys(password);

// Submit login
await driver.findElement(By.css("button.submit-btn")).click();

// Wait for main app UI to appear (header with greeting)
await driver.wait(
  until.elementLocated(By.xpath("//span[contains(text(), 'Hi,')]")),
  8000
);

console.log("✅ Login successful!");

    console.log("Opening chatbot...");
    const toggleBtn = await driver.findElement(By.css("button.chatbot-toggle"));
    await toggleBtn.click();

    console.log("Waiting for input box...");
    const inputBox = await driver.wait(
      until.elementLocated(
        By.css("input[placeholder='Type your message...']")
      ),
      10000
    );

    console.log("Typing booking request...");
    await inputBox.sendKeys("Book 2 tickets for Tiger Football Game", Key.RETURN);

    console.log("Waiting for confirm button...");
    const confirmBtn = await driver.wait(
      until.elementLocated(By.css("button.confirm-btn")),
      15000 // allows backend + LLM time
    );

    console.log("✅ Confirm button found!");
  } catch (err) {
    console.error("❌ Test failed:", err);

    // Debug page dump on failure
    try {
      const html = await driver.getPageSource();
      fs.writeFileSync("selenium_dump.html", html);
      console.log("✅ Saved selenium_dump.html");
    } catch {}

  } finally {
    console.log("Closing browser...");
    await driver.quit();
  }
}

runTest();
