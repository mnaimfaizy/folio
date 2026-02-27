---
title: Getting Started
---

# Getting Started

This page walks you through everything you need to install **before** you can run Folio. Set these up once and you're good to go.

---

## What you will need

You need three free programs installed on your computer:

### 1. Docker Desktop

Docker runs the database (PostgreSQL) inside a container so you don't have to install or configure a database manually.

- Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- Install the version for your operating system (Windows / Mac / Linux).
- After install, open Docker Desktop and leave it running in the background.

::: tip Windows users
Make sure **"WSL 2 backend"** is enabled in Docker Desktop settings. This is the default for most installs on Windows 11.
:::

### 2. Node.js 22.x

Node.js is what runs the backend server (the API).

- Download: [https://nodejs.org](https://nodejs.org)
- Choose the **22.x LTS** version.
- Run the installer and accept all defaults.

Verify it worked by opening a terminal and typing:

```sh
node --version
```

You should see something like `v22.x.x`.

### 3. Yarn

Yarn is a tool that installs and manages the project's code dependencies.

After Node.js is installed, open a terminal and run:

```sh
npm install -g yarn
```

Verify it worked:

```sh
yarn --version
```

You should see a version number (e.g. `1.22.x`).

---

## How to open a terminal

- **Windows**: Press `Win + R`, type `cmd`, press Enter. Or search for "Terminal" in the Start menu.
- **Mac**: Press `Cmd + Space`, type "Terminal", press Enter.
- **Linux**: Look for "Terminal" in your applications menu.

---

## Download Folio

### Option A: Download as a ZIP (simplest)

1. Go to the Folio GitHub page.
2. Click the green **Code** button.
3. Click **Download ZIP**.
4. Unzip the folder to a location you'll remember (e.g. `C:\Projects\Folio` or `~/Projects/Folio`).

### Option B: Clone with Git

If you have Git installed:

```sh
git clone https://github.com/yourusername/folio.git
cd folio
```

---

## Install project dependencies

Open a terminal, navigate to the Folio folder, and run:

```sh
yarn
```

This installs all the code libraries the project needs. It may take a few minutes the first time.

---

## Next: start the app

Once the above steps are done, move on to [Your First Login](./first-use).
