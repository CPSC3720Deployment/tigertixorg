/**
 * @file auth.test.js
 * @description Comprehensive tests for authentication service
 */

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ============================================
// CRITICAL: SET ENV VARS *BEFORE* IMPORTING APP
// ============================================
const testDbPath = path.join(__dirname, 'test.sqlite');
process.env.DATABASE_PATH = testDbPath;
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.NODE_ENV = 'test';

// NOW import app (after env vars are set)
const app = require('../loginServer');
const loginModel = require('../models/loginModel');

describe('Authentication Service Tests', () => {
  
  // Setup: Create test database before all tests
  beforeAll(async () => {
    // Don't try to delete the file - just ensure table exists
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
        db.close(); // Close this temporary connection
        if (err) reject(err);
        else {
          console.log('✓ Test database ready');
          resolve();
        }
      });
    });
  });

  // Cleanup: Close database and delete file after all tests
  afterAll(async () => {
    // Close the connection from loginModel
    await new Promise((resolve) => {
      loginModel.db.close((err) => {
        if (err) console.error('Error closing DB:', err);
        resolve();
      });
    });

    // Wait a bit for file locks to release (Windows issue)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now try to delete
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log('✓ Test database cleaned up');
      }
    } catch (err) {
      console.log('⚠ Could not delete test DB (file may be locked)');
    }
  });

  // Clear users table before each test
  beforeEach(async () => {
    await new Promise((resolve) => {
      loginModel.db.run('DELETE FROM users', () => {
        resolve();
      });
    });
  });

  // ==========================================
  // REGISTRATION TESTS
  // ==========================================

  describe('POST /api/register', () => {
    
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

    test('Should reject duplicate email', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'password123'
        });

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

    test('Should hash password before storing', async () => {
      const password = 'mySecretPassword123';
      
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: password
        });

      const user = await new Promise((resolve) => {
        loginModel.db.get('SELECT password FROM users WHERE username = ?', ['testuser'], (err, row) => {
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
    
    beforeEach(async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
    });

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
      expect(response.body.token.split('.')).toHaveLength(3);
    });

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

    test('Should reject login without identifier', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Identifier and password are required');
    });

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

    test('Should reject request without token', async () => {
      const response = await request(app)
        .get('/api/login/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });

    test('Should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/login/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    test('JWT token should have 30 minute expiration', () => {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(validToken);
      
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(1800);
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

    test('Should reject verification without token', async () => {
      const response = await request(app)
        .get('/api/login/verify');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  // ==========================================
  // EDGE CASES
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

      const count = await new Promise((resolve) => {
        loginModel.db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', 
          ['race@example.com'], 
          (err, row) => {
            resolve(row.count);
          }
        );
      });
      
      expect(count).toBe(1);
    });

    test('Should reject expired token', async () => {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET;

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

      console.log('✓ Logout is client-side. Token expires after 30 minutes.');
    });
  });
});