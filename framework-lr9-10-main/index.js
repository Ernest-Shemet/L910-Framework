const Application = require('./framework');
const { readData, writeData } = require('./db');

const app = new Application();
const PORT = 3000;

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Генератор для новых солдат
const generateId = (items) => {
    if (items.length === 0) return "1";
    return String(Math.max(...items.map(i => Number(i.id))) + 1);
};

const genSoldier = () => ({
    name: "Unknown Soldier",
    rank: Math.floor(Math.random() * 10) + 1,
    isActive: true,
    enlistmentDate: new Date().toISOString(),
    skills: ["recruit"]
});

// Маршруты для программистских сущностей (только GET)
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

// Маршруты для солдат (GET и POST)
app.get('/soldiers', async (req, res) => {
    const items = await readData('soldiers.json');
    res.json(items);
});

app.get('/soldiers/:id', async (req, res) => {
    const items = await readData('soldiers.json');
    const item = items.find(i => i.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.post('/soldiers', async (req, res) => {
    const items = await readData('soldiers.json');

    const rawData = genSoldier();
    const newItem = {
        ...rawData,
        ...req.body,
        id: generateId(items)
    };

    items.push(newItem);
    await writeData('soldiers.json', items);
    res.status(201).json(newItem);
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Multi-Domain API Server</h1>
        <ul>
            <li><a href="/patterns">/patterns</a> (Programming Patterns)</li>
            <li><a href="/antipatterns">/antipatterns</a> (Programming Anti-patterns)</li>
            <li><a href="/soldiers">/soldiers</a> (Army Soldiers - GET and POST)</li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Available endpoints: 3 entities loaded (2 with GET only, 1 with GET and POST).`);
});
