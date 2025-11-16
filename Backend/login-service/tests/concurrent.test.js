/**
 * @test Concurrent registration attempts
 * @precondition Two users try to register with same email simultaneously
 * @postcondition Only one succeeds, database remains consistent
 * @contract Database transactions prevent race conditions
 */
test('Should handle concurrent registration attempts safely', async () => {
  const userData = {
    username: 'raceuser',
    email: 'race@example.com',
    password: 'password123'
  };

  // Simulate concurrent requests
  const [result1, result2] = await Promise.all([
    request(app).post('/api/register').send(userData),
    request(app).post('/api/register').send(userData)
  ]);

  // One should succeed (201), one should fail (409)
  const statuses = [result1.status, result2.status].sort();
  expect(statuses).toEqual([201, 409]);

  // Verify only ONE user exists in database
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