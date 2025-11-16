/**
 * @test Expired token rejected
 * @precondition Token with past expiration date
 * @postcondition Access denied with 403
 * @contract Expired tokens cannot access protected routes
 */
test('Should reject expired token', async () => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'vino_della_bella_gnocca';

  // Create token that expired 1 hour ago
  const expiredToken = jwt.sign(
    { id: 1, username: 'testuser', email: 'test@example.com' },
    JWT_SECRET,
    { expiresIn: '-1h' } // Negative time = already expired
  );

  const response = await request(app)
    .get('/api/login/me')
    .set('Authorization', `Bearer ${expiredToken}`);

  expect(response.status).toBe(403);
  expect(response.body.message).toBe('Invalid or expired token');
});