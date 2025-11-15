const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/llmRoute');

const app = express();
const PORT = 8001;

app.use(cors());
app.use(express.json());

app.use('/api/login', authRoutes);

app.listen(PORT, () =>
{
    console.log('Login service running on http://localhost:${PORT');
});

