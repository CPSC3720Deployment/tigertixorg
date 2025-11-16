/**
 * @file concurrency.test.js
 * @description Tests for concurrent operations and race conditions
 * Validates database consistency under concurrent access
 */

const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ============================================
// CRITICAL: SET ENV VARS *BEFORE* IMPORTING APP
// ============================================
const testDbPath = path.join(__dirname, 'concurrency-test.sqlite');
process.env.DATABASE_PATH = testDbPath;
process.env.JWT_SECRET = 'concurrency_test_secret';
process.env.NODE_ENV = 'test';

// NOW import app (after env vars are set)
const app = require('../loginServer');
const loginModel = require('../models/loginModel');

describe('Concurrency and Race Condition Tests', () => {
  
  // Setup: Create test database before all tests
  beforeAll(async () => {
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
        db.close();
        if (err) reject(err);
        else {
          console.log('✓ Concurrency test database ready');
          resolve();
        }
      });
    });
  });

  // Cleanup: Close database and delete file after all tests
  afterAll(async () => {
    await new Promise((resolve) => {
      loginModel.db.close((err) => {
        if (err) console.error('Error closing DB:', err);
        resolve();
      });
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log('✓ Concurrency test database cleaned up');
      }
    } catch (err) {
      console.log('⚠ Could not delete concurrency test DB');
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
  // CONCURRENT REGISTRATION TESTS
  // ==========================================

  describe('Concurrent Registration', () => {
    
    /**
     * @test Two identical registration requests
     * @precondition No user exists
     * @postcondition Only one user created, one request fails with 409
     * @contract Database UNIQUE constraint prevents duplicates
     */
    test('Should handle 2 concurrent identical registrations', async () => {
      const userData = {
        username: 'raceuser',
        email: 'race@example.com',
        password: 'password123'
      };

      const [result1, result2] = await Promise.all([
        request(app).post('/api/register').send(userData),
        request(app).post('/api/register').send(userData)
      ]);

      // One should succeed (201), one should fail (409)
      const statuses = [result1.status, result2.status].sort();
      expect(statuses).toEqual([201, 409]);

      // Verify only ONE user exists in database
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users WHERE email = ?', 
          ['race@example.com'], 
          (err, row) => resolve(row.count)
        );
      });
      
      expect(count).toBe(1);
    });

    /**
     * @test Multiple concurrent registrations with same email
     * @precondition No users exist
     * @postcondition Only one succeeds, all others fail with 409
     */
    test('Should handle 5 concurrent registrations with same email', async () => {
      const requests = Array(5).fill(null).map((_, i) => 
        request(app).post('/api/register').send({
          username: `user${i}`,
          email: 'shared@example.com',
          password: 'password123'
        })
      );

      const results = await Promise.all(requests);
      
      const successCount = results.filter(r => r.status === 201).length;
      const conflictCount = results.filter(r => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(4);

      // Verify only ONE user with that email
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users WHERE email = ?',
          ['shared@example.com'],
          (err, row) => resolve(row.count)
        );
      });

      expect(count).toBe(1);
    });

    /**
     * @test Multiple concurrent registrations with same username
     * @precondition No users exist
     * @postcondition Only one succeeds, all others fail with 409
     */
    test('Should handle 5 concurrent registrations with same username', async () => {
      const requests = Array(5).fill(null).map((_, i) => 
        request(app).post('/api/register').send({
          username: 'shareduser',
          email: `user${i}@example.com`,
          password: 'password123'
        })
      );

      const results = await Promise.all(requests);
      
      const successCount = results.filter(r => r.status === 201).length;
      const conflictCount = results.filter(r => r.status === 409).length;

      expect(successCount).toBe(1);
      expect(conflictCount).toBe(4);

      // Verify only ONE user with that username
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users WHERE username = ?',
          ['shareduser'],
          (err, row) => resolve(row.count)
        );
      });

      expect(count).toBe(1);
    });

    /**
     * @test Concurrent registrations with different data
     * @precondition No users exist
     * @postcondition All succeed, no conflicts
     */
    test('Should handle 10 concurrent unique registrations successfully', async () => {
      const requests = Array(10).fill(null).map((_, i) => 
        request(app).post('/api/register').send({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'password123'
        })
      );

      const results = await Promise.all(requests);
      
      // All should succeed
      const successCount = results.filter(r => r.status === 201).length;
      expect(successCount).toBe(10);

      // Verify all 10 users exist
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users',
          (err, row) => resolve(row.count)
        );
      });

      expect(count).toBe(10);
    });
  });

  // ==========================================
  // CONCURRENT LOGIN TESTS
  // ==========================================

  describe('Concurrent Login', () => {

    beforeEach(async () => {
      // Create test user
      await request(app).post('/api/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    /**
     * @test Multiple concurrent login attempts for same user
     * @precondition User exists
     * @postcondition All logins succeed with valid tokens
     */
    test('Should handle 10 concurrent logins for same user', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app).post('/api/login').send({
          identifier: 'test@example.com',
          password: 'password123'
        })
      );

      const results = await Promise.all(requests);
      
      // All should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBe(10);

      // All should have valid tokens
      results.forEach(result => {
        expect(result.body).toHaveProperty('token');
        expect(result.body.token.split('.')).toHaveLength(3); // JWT format
      });
    });

    /**
     * @test Concurrent login with wrong passwords
     * @precondition User exists
     * @postcondition All fail with 401
     */
    test('Should handle 5 concurrent failed login attempts', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).post('/api/login').send({
          identifier: 'test@example.com',
          password: 'wrongpassword'
        })
      );

      const results = await Promise.all(requests);
      
      // All should fail
      const failCount = results.filter(r => r.status === 401).length;
      expect(failCount).toBe(5);

      // None should have tokens
      results.forEach(result => {
        expect(result.body).not.toHaveProperty('token');
      });
    });
  });

  // ==========================================
  // CONCURRENT PROTECTED ROUTE ACCESS
  // ==========================================

  describe('Concurrent Protected Route Access', () => {

    let validToken;

    beforeEach(async () => {
      // Create user and get token
      await request(app).post('/api/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const loginResponse = await request(app).post('/api/login').send({
        identifier: 'test@example.com',
        password: 'password123'
      });

      validToken = loginResponse.body.token;
    });

    /**
     * @test Multiple concurrent requests to protected route
     * @precondition Valid token available
     * @postcondition All requests succeed with user data
     */
    test('Should handle 10 concurrent /me requests with same token', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app)
          .get('/api/login/me')
          .set('Authorization', `Bearer ${validToken}`)
      );

      const results = await Promise.all(requests);
      
      // All should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBe(10);

      // All should return same user data
      results.forEach(result => {
        expect(result.body.username).toBe('testuser');
        expect(result.body.email).toBe('test@example.com');
      });
    });

    /**
     * @test Concurrent verify requests
     * @precondition Valid token available
     * @postcondition All succeed with valid=true
     */
    test('Should handle 10 concurrent token verification requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app)
          .get('/api/login/verify')
          .set('Authorization', `Bearer ${validToken}`)
      );

      const results = await Promise.all(requests);
      
      // All should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBe(10);

      // All should return valid=true
      results.forEach(result => {
        expect(result.body.valid).toBe(true);
      });
    });
  });

  // ==========================================
  // MIXED CONCURRENT OPERATIONS
  // ==========================================

  describe('Mixed Concurrent Operations', () => {

    /**
     * @test Mix of registrations, logins, and profile requests
     * @precondition Empty database
     * @postcondition All operations complete correctly
     */
    test('Should handle mixed concurrent operations', async () => {
      // Register first user
      await request(app).post('/api/register').send({
        username: 'user0',
        email: 'user0@example.com',
        password: 'password123'
      });

      // Get token for existing user
      const loginResponse = await request(app).post('/api/login').send({
        identifier: 'user0@example.com',
        password: 'password123'
      });
      const token = loginResponse.body.token;

      // Mix of operations
      const operations = [
        // New registrations
        request(app).post('/api/register').send({
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123'
        }),
        request(app).post('/api/register').send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123'
        }),
        // Login attempts
        request(app).post('/api/login').send({
          identifier: 'user0@example.com',
          password: 'password123'
        }),
        request(app).post('/api/login').send({
          identifier: 'user0',
          password: 'password123'
        }),
        // Protected route access
        request(app).get('/api/login/me').set('Authorization', `Bearer ${token}`),
        request(app).get('/api/login/verify').set('Authorization', `Bearer ${token}`),
        // Duplicate registration (should fail)
        request(app).post('/api/register').send({
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123'
        }),
      ];

      const results = await Promise.all(operations);

      // Check expected results
      expect(results[0].status).toBe(201); // user1 registration
      expect(results[1].status).toBe(201); // user2 registration
      expect(results[2].status).toBe(200); // login with email
      expect(results[3].status).toBe(200); // login with username
      expect(results[4].status).toBe(200); // /me request
      expect(results[5].status).toBe(200); // /verify request
      expect(results[6].status).toBe(409); // duplicate registration

      // Verify final database state
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users',
          (err, row) => resolve(row.count)
        );
      });

      expect(count).toBe(3); // user0, user1, user2
    });
  });

  // ==========================================
  // DATABASE CONSISTENCY TESTS
  // ==========================================

  describe('Database Consistency', () => {

    /**
     * @test Verify UNIQUE constraints prevent duplicates
     * @precondition User exists
     * @postcondition Database maintains integrity
     */
    test('Should maintain database integrity under concurrent stress', async () => {
      // Create 20 concurrent operations with overlapping data
      const operations = [];
      
      // 10 attempts to register same email
      for (let i = 0; i < 10; i++) {
        operations.push(
          request(app).post('/api/register').send({
            username: `unique${i}`,
            email: 'duplicate@example.com',
            password: 'password123'
          })
        );
      }

      // 10 attempts to register same username
      for (let i = 0; i < 10; i++) {
        operations.push(
          request(app).post('/api/register').send({
            username: 'duplicateuser',
            email: `unique${i}@example.com`,
            password: 'password123'
          })
        );
      }

      const results = await Promise.all(operations);

      // Count successes
      const successCount = results.filter(r => r.status === 201).length;
      const conflictCount = results.filter(r => r.status === 409).length;

      // Exactly 2 should succeed (one for email, one for username)
      expect(successCount).toBe(2);
      expect(conflictCount).toBe(18);

      // Verify database has exactly 2 users
      const count = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(*) as count FROM users',
          (err, row) => resolve(row.count)
        );
      });

      expect(count).toBe(2);

      // Verify email uniqueness
      const emailCount = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(DISTINCT email) as count FROM users',
          (err, row) => resolve(row.count)
        );
      });
      expect(emailCount).toBe(2);

      // Verify username uniqueness
      const usernameCount = await new Promise((resolve) => {
        loginModel.db.get(
          'SELECT COUNT(DISTINCT username) as count FROM users',
          (err, row) => resolve(row.count)
        );
      });
      expect(usernameCount).toBe(2);
    });
  });
});