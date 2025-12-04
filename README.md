Link to the website: https://tigertixorg.vercel.app/


Video: https://drive.google.com/file/d/18Ow2sjBPgeagffQPpoeRJgl5I8Kkr-Z2/view?usp=sharing


<img width="1238" height="852" alt="Screenshot 2025-12-03 222240" src="https://github.com/user-attachments/assets/02e6f0c2-5746-45e1-97de-b21c36399bf4" />

Project Overview
Tiger Tix is a web app that allows a customer to register for an account, login, and purchase tickets for special events. Tiger Tix is built using node.js, and react for the frontend. The backend of Tiger Tix is split into four microservices that are independent of each other, so if one goes down all will continue to function. The backends include an admin service, client service, login service, and llm service. Our admin server is for the purpose of inserting event tables into our shared database. Our client service handles the purchasing of tickets. Our login service handles registering for a new account, and logging into our website, by accessing usernames from a database. Finally, our llm service handles prompts that the user can ask our AI assistant. Our web app has an AI assistant that can give information on events held on a certain date,  help to purchase tickets, and confirm purchases.

Tech Stack
Our project was created using node.js, and written almost entirely in javascript. The frontend of our website was handled by react, and used small amounts of css. Our AI model uses an API key from Google Gemmini. Our project also used Axios to make requests from our node.js app to the browser.

Architecture summary
TigerTix uses a microservice-based architecture with four independent backend services and a React frontend. Each service handles its own domain and communicates through REST APIs.
Microservices
Admin Service – Manages event creation and updates. Writes directly to events.sqlite. Used only by admins via Postman/cURL.
Client Service – Provides event retrieval and ticket purchasing for the frontend. Reads/writes to events.sqlite and performs atomic ticket updates to prevent overselling.
LLM Service – Handles natural-language parsing, voice interactions, booking confirmation, and communicates with the Client Service to complete AI-driven ticket purchases.
login-service – Manages user registration, login, password hashing, and JWT-based authentication. Uses its own login.sqlite database.
Databases
events.sqlite (shared by Admin + Client): stores events and ticket availability.
login.sqlite (used only by login-service): stores user accounts and hashed passwords.
Frontend (React)
Fetches event data from the Client Service.
Sends ticket purchase requests to the Client Service.
Uses login-service for authentication and stores/validates JWT tokens.
Integrates with the LLM Service for AI-assisted booking, voice recognition, and narrator features.
Data Flow
Admins send event creation/update requests → Admin Service → events.sqlite.
Users browse events → React → Client Service → events.sqlite.
Ticket purchases → React → Client Service → atomic DB update.
AI bookings → React LLM UI → LLM Service → Client Service → events.sqlite.


Authentication → React → login-service → login.sqlite, with JWTs validated on protected requests.

Installation & Setup instructions
To run TigerTix, you need Node.js installed on your computer. Once you download the project, each microservice and the frontend must be set up individually. Start by cloning or downloading the project folder from your team’s repository and opening it on your computer. Each part of the system (Admin Service, Client Service, login-service, LLM service, and the React frontend) contains its own folder. Enter each folder and install its dependencies.

<img width="753" height="593" alt="Screenshot 2025-12-03 222157" src="https://github.com/user-attachments/assets/26d25e3e-1e85-4893-bc2b-a2cf24c9d495" />


Core Server & Web Tools
Express – handles server routes and API endpoints
Cors – allows communication between frontend and backend
Cookie-Parser – reads cookies from client requests
Dotenv – loads environment variables from .env files
Security & Authentication
Bcrypt – encrypts and compares passwords
Jsonwebtoken – creates and verifies login tokens (JWTs)
Database Tools
Mysql2 – lets the backend connect to a MySQL database
Sqlite3 – lightweight database support (used for testing or small services)
HTTP Requests
Axios – sends HTTP requests between services or to external APIs
AI / LLM Tools
@google/genai and @google/generative-ai – connect to Google Gemini AI services
Testing & Automation
selenium-webdriver – automates browser testing
chromedriver – required driver to run Selenium tests in Chrome
Project Utility
Concurrently – allows multiple backend services to run at the same time (during development)

Environment Variables:
Run node setup.js to create our base environment variables


How to run regression tests:
Cd into the test folder to run our automated tests and type node seleniumbooking.js
In the root directory run npm test and it will run each section of our tests. Front end will run first, then each backend test like admin, client, login, llm.


<img width="1116" height="655" alt="Screenshot 2025-12-03 222112" src="https://github.com/user-attachments/assets/aee0e9b0-f037-4982-9733-58f66b23f8f6" />



Team members, roles, instructors, roles and TA’s
Team Members:
Team member 1: Ronak Bhattal
Team member 2: David Misyuk
Team member 3: Rodrigo Villalobos
Roles:
 David Misyuk: Scrum master
Rodrigo Villalobos & Ronak Bhattal : Developers
TA’s:
Colt Doster & Atik Enam
Instructor:
Dr. Julian Brinkley

License:
Copyright (c) [2025] [Schizos Resurrection]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
