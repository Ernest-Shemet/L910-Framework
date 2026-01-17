const Application = require('./framework');
const { readData } = require('./db');

const app = new Application();
const PORT = 3000;

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Прямая регистрация маршрутов вместо функции
app.get('/patterns', async (req, res) => {
    const items = await readData('patterns.json');
    res.json(items);
});

app.get('/patterns/:id', async (req, res) => {
    const items = await readData('patterns.json');
    const item = items.find(i => i.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.get('/antipatterns', async (req, res) => {
    const items = await readData('antipatterns.json');
    res.json(items);
});

app.get('/antipatterns/:id', async (req, res) => {
    const items = await readData('antipatterns.json');
    const item = items.find(i => i.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Programming API Server</h1>
        <ul>
            <li><a href="/patterns">/patterns</a> (Programming Patterns)</li>
            <li><a href="/antipatterns">/antipatterns</a> (Programming Anti-patterns)</li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Available endpoints: 2 programming entities loaded.`);
});
