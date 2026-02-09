# Diegesis

**Diegesis** is a text-based RPG engine built with React, TypeScript, and Vite. It is designed to create immersive interactive fiction experiences that can be distributed as a single HTML file.

## Features

- **Text RPG Engine**: A robust engine for managing game state, entities, and time.
- **Single-File Distribution**: helper scripts and plugins to bundle the entire game into a single `index.html` file for easy sharing.
- **Admin Panel**: Built-in tools for debugging and managing game state during development.
- **Modern Tech Stack**: Built with React 19, TypeScript, and Vite for a fast and type-safe development experience.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd diegesis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

### Building

Build the project for production. This will generate a single HTML file in the `dist` directory:

```bash
npm run build
```

### Linting

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Project Structure

- `src/engine`: Core game logic (entities, time, etc.).
- `src/store`: State management using React Context and Reducers.
- `src/components`: UI components including Layout, Sidebar, MainView, and AdminPanel.
- `src/data`: Initial game data and configuration.

## License

[License Information]
