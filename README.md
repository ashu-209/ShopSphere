
# ShopSphere – Project Setup Guide

## Step 1: Install frontend dependencies

In the first terminal, make sure you are in the main ShopSphere project folder, where the root `package.json` is located.

Run:

```bash
npm install
```

Wait until the installation finishes.

## Step 2: Install backend dependencies

Open a second terminal in VS Code.

Navigate to the backend folder:

```bash
cd server
```

Install the backend dependencies:

```bash
npm install
```

Wait for the installation to finish.

## Step 3: Start the backend server

In the second terminal, make sure you are inside the `server` folder.

Run:

```bash
npm run dev
```

Keep this terminal open. The backend should start on:

`http://localhost:5000`

Do not close this terminal while using the application.

## Step 4: Start the frontend

Return to the first terminal, which should be in the main ShopSphere project folder.

Run:

```bash
npm run dev
```

Vite should display a local URL, usually:

`http://localhost:5173`

Open that URL in Chrome to use ShopSphere.

## Step 5: Test the project

Try the following features:

1. Browse the product catalog.
2. Add products to the cart and wishlist.
3. Create a customer account.
4. Log in and log out.
5. Place a demo order.
6. Open your account menu and check your order history.

## Important notes

- Keep both terminal windows running while using ShopSphere.
- Use `Ctrl + C` in the relevant terminal to stop a server.
- To start the project again later, open the project in VS Code and repeat Steps 5 and 6. You do not normally need to run `npm install` again unless dependencies change or `node_modules` is missing.
- The current project uses local JSON files for its demo products, customers and orders. MongoDB is not required.
- Customer accounts and demo orders are stored locally in the backend project files. This is a demonstration setup, not a production deployment.
- If a command fails, check that you are in the correct folder and that Node.js is installed correctly.
