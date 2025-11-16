/**
 * @file auth.test.js
 * @description Comprehensive tests for authentication service
 * Tests registration, login, JWT tokens, and protected routes
 */

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import app
const app = require('../loginServer');

// Test database path
const testDbPath = path.join(__dirname, 'test.sqlite');

describe('Authentication Service Tests', () => {
  
  // Setup: Create test database before all tests
  beforeAll(async () => {
    // Create test database
    const db = new sqlite3.Database(testDbPath);
    
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    db.close();
  });

  // Cleanup: Delete test database after all tests
  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // Clear users table before each test
  beforeEach(async () => {
    const db = new sqlite3.Database(testDbPath);
    await new Promise((resolve) => {
      db.run('DELETE FROM users', () => {
        db.close();
        resolve();
      });
    });
  });

  // ==========================================
  // REGISTRATION TESTS
  // ==========================================

  describe('POST /api/register', () => {
    
    /**
     * @test Register new user with valid credentials
     * @precondition No user exists with given email/username
     * @postcondition User created in database with hashed password
     * @contract Response includes user object without password
     */
    test('Should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    /**
     * @test Register with duplicate email
     * @precondition User already exists with same email
     * @postcondition Registration fails with 409 conflict
     * @contract No duplicate users in database
     */
    test('Should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/register')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'password123'
        });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'user2',
          email: 'test@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Username or email already exists');
    });

    /**
     * @test Register with duplicate username
     * @precondition User already exists with same username
     * @postcondition Registration fails with 409 conflict
     */
    test('Should reject duplicate username', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'user1@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'user2@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Username or email already exists');
    });

    /**
     * @test Register without required fields
     * @precondition Missing username, email, or password
     * @postcondition Registration fails with 400 bad request
     * @contract All three fields are required
     */
    test('Should reject registration without username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username, email, and password are required');
    });

    test('Should reject registration without email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username, email, and password are required');
    });

    test('Should reject registration without password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username, email, and password are required');
    });

    /**
     * @test Password is hashed before storage
     * @precondition User registers with plaintext password
     * @postcondition Password stored as bcrypt hash
     * @contract Plaintext passwords never stored
     */
    test('Should hash password before storing', async () => {
      const password = 'mySecretPassword123';
      
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: password
        });

      // Check database directly
      const db = new sqlite3.Database(testDbPath);
      const user = await new Promise((resolve) => {
        db.get('SELECT password FROM users WHERE username = ?', ['testuser'], (err, row) => {
          db.close();
          resolve(row);
        });
      });

      expect(user.password).not.toBe(password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================

  describe('POST /api/login', () => {
    
    // Create test user before each login test
    beforeEach(async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    /**
     * @test Login with valid email
     * @precondition User exists with correct credentials
     * @postcondition JWT token returned
     * @contract Token contains user id, username, email
     */
    test('Should login with valid email and password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3); // JWT format
    });

    /**
     * @test Login with valid username
     * @precondition User exists
     * @postcondition JWT token returned
     */
    test('Should login with valid username and password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          identifier: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    /**
     * @test Login with wrong password
     * @precondition User exists but password incorrect
     * @postcondition Login fails with 401 unauthorized
     * @contract No token issued for invalid credentials
     */
    test('Should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          identifier: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    /**
     * @test Login with nonexistent user
     * @precondition User does not exist
     * @postcondition Login fails with 401
     */
    test('Should reject login for nonexistent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          identifier: 'nobody@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    /**
     * @test Login without identifier
     * @precondition Missing identifier field
     * @postcondition Login fails with 400
     */
    test('Should reject login without identifier', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Identifier and password are required');
    });

    /**
     * @test Login without password
     * @precondition Missing password field
     * @postcondition Login fails with 400
     */
    test('Should reject login without password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          identifier: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Identifier and password are required');
    });
  });

  // ==========================================
  // PROTECTED ROUTE TESTS
  // ==========================================

  describe('GET /api/login/me', () => {
    
    let validToken;

    // Create user and get token before each test
    beforeEach(async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        });

      validToken = loginResponse.body.token;
    });

    /**
     * @test Access protected route with valid token
     * @precondition Valid JWT token in Authorization header
     * @postcondition User profile returned
     * @contract Token verified before data access
     */
    test('Should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/login/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    /**
     * @test Access protected route without token
     * @precondition No Authorization header
     * @postcondition Access denied with 401
     */
    test('Should reject request without token', async () => {
      const response = await request(app)
        .get('/api/login/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });

    /**
     * @test Access protected route with invalid token
     * @precondition Malformed JWT token
     * @postcondition Access denied with 403
     */
    test('Should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/login/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    /**
     * @test Token expiration
     * @precondition Token set to expire in 30 minutes
     * @postcondition Expired tokens rejected
     * @note This test would require mocking time or waiting 30 minutes
     */
    test('JWT token should have 30 minute expiration', () => {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(validToken);
      
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(1800); // 30 minutes in seconds
    });
  });

  // ==========================================
  // TOKEN VERIFICATION TESTS
  // ==========================================

  describe('GET /api/login/verify', () => {
    
    let validToken;

    beforeEach(async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        });

      validToken = loginResponse.body.token;
    });

    /**
     * @test Verify valid token
     * @precondition Valid JWT token provided
     * @postcondition Token confirmed as valid
     */
    test('Should verify valid token', async () => {
      const response = await request(app)
        .get('/api/login/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('email');
    });

    /**
     * @test Verify without token
     * @precondition No token provided
     * @postcondition Verification fails
     */
    test('Should reject verification without token', async () => {
      const response = await request(app)
        .get('/api/login/verify');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  // Add to the end of your test file, before the closing });

// ==========================================
// CONCURRENCY & EDGE CASE TESTS
// ==========================================

describe('Concurrency and Edge Cases', () => {

  test('Should handle concurrent registration attempts safely', async () => {
    const userData = {
      username: 'raceuser',
      email: 'race@example.com',
      password: 'password123'
    };

    const [result1, result2] = await Promise.all([
      request(app).post('/api/register').send(userData),
      request(app).post('/api/register').send(userData)
    ]);

    const statuses = [result1.status, result2.status].sort();
    expect(statuses).toEqual([201, 409]);

    const db = new sqlite3.Database(testDbPath);
    const count = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', 
        ['race@example.com'], 
        (err, row) => {
          db.close();
          resolve(row.count);
        }
      );
    });
    
    expect(count).toBe(1);
  });

  test('Should reject expired token', async () => {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'vino_della_bella_gnocca';

    const expiredToken = jwt.sign(
      { id: 1, username: 'testuser', email: 'test@example.com' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const response = await request(app)
      .get('/api/login/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  test('Should document logout behavior (client-side)', async () => {
    await request(app).post('/api/register').send({
      username: 'logouttest',
      email: 'logout@example.com',
      password: 'password123'
    });

    const loginRes = await request(app).post('/api/login').send({
      identifier: 'logout@example.com',
      password: 'password123'
    });

    const token = loginRes.body.token;

    const beforeLogout = await request(app)
      .get('/api/login/me')
      .set('Authorization', `Bearer ${token}`);
    expect(beforeLogout.status).toBe(200);

    // Logout is client-side (remove token from localStorage)
    // Server validates based on 30-minute expiry
    console.log('✓ Logout is client-side. Token expires after 30 minutes.');
  });
});
});