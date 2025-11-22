# LR Parser Generator

## Overview

The LR Parser Generator is a web-based tool designed to visualize the process of parsing context-free grammars using various LR parsing techniques. It provides an interactive interface for users to input grammars, generate parse tables, and visualize the parsing process step-by-step.

## Project Motivation

This project aims to address the shortcomings of existing bottom-up parser simulators available on the web. While there are some parser visualizers and simulators online, they often suffer from the following issues:

- Lack of user-friendly interfaces
- Unclean and cluttered UI designs

This web application was developed to make learning the process of bottom-up parsers more intuitive. It provides a clean and interactive user interface, making it easier for students and professionals to understand and work with parsers. Additionally, it serves as a practical tool for anyone working with parsers and compilers.

## Features

- **Grammar Input**: Enter context-free grammars in a user-friendly format.
- **Grammar Analysis**: View productions, terminals, non-terminals, and their properties (nullable, first, follow).
- **Parser Tables**: Generate and display LR parsing tables (LR(0), SLR(1), LALR(1), LR(1)).
- **Automata Visualization**: Visualize DFA states and transitions.
- **Parsing Simulation**: Step through the parsing process or run it entirely to see the parse tree and stack changes.

## Technologies Used

- **Frontend**: React, TypeScript
- **Styling**: CSS Modules
- **Build Tool**: Vite
- **Linting**: ESLint, Prettier

## Design Decisions

### Immutability in App Logic

All classes and modules in this project are designed to avoid exposing mutability. This decision is based on the following reasons:

1. **Bug Prevention**: Mutability can be a source of many bugs and makes debugging significantly harder. By enforcing immutability, the code becomes more predictable and easier to maintain.
2. **Side Effect Elimination**: Immutability ensures that there are no unintended side effects, making the application logic closer to a mathematical model. This leads to more reliable and testable code.
3. **React Compatibility**: The frontend framework used in this project is React, which discourages mutability as it can make rendering unpredictable. By adhering to immutability, the app aligns with React's best practices and ensures consistent rendering behavior.

## Project Structure

```
src/
  components/       # React components for UI
  contexts/         # React context for state management
  dfa/              # DFA generation and related logic
  grammar/          # Grammar analysis and production handling
  hooks/            # Custom React hooks
  parser/           # Parsing logic (LL(1), LR(1), etc.)
  styles/           # CSS Modules for styling
  util/             # Utility functions and initial data
```

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- npm (>= 8.x)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd LRParserGenerator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Build

To create a production build:

```bash
npm run build
```

## Usage

1. Enter your grammar in the **Grammar Input** section.
2. Click "Generate Tables" to create the parse tables.
3. Use the **Parser Section** to simulate parsing with your input.
4. Explore the **Automata Section** to visualize DFA states and transitions.

## Deployment

This project is configured to deploy to GitHub Pages.

## Academic Context and Acknowledgments

This project was developed as the final project for the course **Compiler Design Principles** at Semnan University.

- Inspired by Princeton University's LL(1) Parser Visualizer.
- Created by Emad Kheyroddin at Semnan University.
