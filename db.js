const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// безопасное создание папки
async function ensureDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
        // игнорируем, если уже существует
    }
}

// чтение данных
async function readData(filename) {
    await ensureDir();

    const filePath = path.join(DATA_DIR, filename);

    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(text);
    } catch (e) {
        // если файла нет или JSON битый — возвращаем пустой массив
        if (e.code === 'ENOENT' || e instanceof SyntaxError) {
            await writeData(filename, []);
            return [];
        }
        throw e;
    }
}

// запись данных
async function writeData(filename, data) {
    await ensureDir();

    const filePath = path.join(DATA_DIR, filename);

    try {
        await fs.writeFile(
            filePath,
            JSON.stringify(data, null, 2),
            'utf-8'
        );
    } catch (e) {
        console.error('Ошибка записи файла:', e);
    }
}

module.exports = {
    readData,
    writeData
};
