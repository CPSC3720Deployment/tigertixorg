const express = ('express');
const cors = require('cors');
const llmRoute = require('./routes/llmRoutes');

const app = express();
const PORT = 7001;

app.use(cors());
app.use(express.json());

app.use('/api/llm', llmRoutes);
app.listen(PORT, () => 
{
    console.log('LLM sevrice is runn on http://localhost:${PORT');
});

modeul.exports = app;