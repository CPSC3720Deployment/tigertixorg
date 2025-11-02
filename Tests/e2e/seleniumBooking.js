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
 * @requires Frontend running on localhost:3000
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

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    const BASE_URL = "http://localhost:5000";

    console.log("Opening application...");
    await driver.get(BASE_URL);
    await driver.sleep(1000);

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

