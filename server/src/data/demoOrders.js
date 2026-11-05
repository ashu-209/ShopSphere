
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const ordersFile = path.join(
    currentDirectory,
    'demoOrders.json'
);

if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(
        ordersFile,
        '[]',
        'utf8'
    );
}

const savedData = fs.readFileSync(
    ordersFile,
    'utf8'
);

const orders = JSON.parse(savedData);

export const saveOrders = () => {
    fs.writeFileSync(
        ordersFile,
        JSON.stringify(orders, null, 2),
        'utf8'
    );
};

export default orders;
