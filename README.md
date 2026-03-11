# DotPilot

DotPilot is an AI-powered DeFi navigation dapp built for the Polkadot Solidity Hackathon.

The project is designed for **Track 1 - EVM Smart Contract** and positions itself as an **AI-powered DeFi product on Polkadot Hub**. The current MVP focuses on one clear flow:

1. connect wallet
2. discover opportunities
3. ask the AI assistant for a strategy
4. continue into the vault flow
5. execute the strategy

## Table of Contents

- [Overview](#overview)
- [Hackathon Alignment](#hackathon-alignment)
- [Problem and Solution](#problem-and-solution)
- [Core MVP Features](#core-mvp-features)
- [Demo Flow](#demo-flow)
- [Tech Stack](#tech-stack)
- [Product Architecture](#product-architecture)
- [System Architecture Flow](#system-architecture-flow)
- [Current Project Architecture Direction](#current-project-architecture-direction)
- [Project Structure](#project-structure)
- [Engineering Direction](#engineering-direction)
- [Current Build Status](#current-build-status)
- [Roadmap Summary](#roadmap-summary)
- [Local Development](#local-development)
- [Build and Verification](#build-and-verification)
- [Deployment Note](#deployment-note)
- [Project Documents](#project-documents)

## Overview

DotPilot helps users navigate DeFi opportunities in the Polkadot ecosystem through a guided product experience.

Instead of forcing users to jump between disconnected tools, DotPilot combines:

- wallet connection
- DeFi opportunity discovery
- AI-guided recommendations
- vault-style execution flow
- portfolio and activity feedback

The current implementation is optimized for hackathon delivery and demo clarity, with a strong focus on product usability and clean architecture.

## Hackathon Alignment

DotPilot is aligned to the following submission direction:

- **Primary Track:** Track 1 - EVM Smart Contract
- **Product Category:** AI-powered dapp
- **Use Case:** DeFi strategy discovery and execution
- **Target Environment:** Polkadot Hub / compatible test environment

Why this matters:

- the product uses a Solidity-oriented execution story
- the UX is built around a real DeFi flow
- the AI layer is tied to product actions, not just a standalone chatbot
- the roadmap is scoped around hackathon MVP delivery

## Problem and Solution

### Problem

DeFi users often face:

- fragmented protocol interfaces
- unclear strategy selection
- difficulty understanding risk
- weak guidance for new users

### Solution

DotPilot gives users one guided flow:

- discover relevant opportunities
- ask for AI guidance
- understand risk and yield
- continue into a vault execution path

This makes DeFi interactions easier to understand, easier to demo, and easier to extend into a more complete product later.

## Core MVP Features

The current hackathon MVP focuses on the following capabilities:

### 1. Wallet Connection

- connect wallet from the main interface
- support connected and disconnected states
- lock wallet-required features until connection

### 2. Animated Landing Experience

- landing page for disconnected users
- motion-heavy presentation layer
- 3D-style hero treatment
- animated background flow and running UI effects

### 3. Dashboard

- overview of the product promise
- portfolio summary
- curated DeFi opportunities
- navigation into deeper flows

### 4. Strategy Explorer

- compare strategies
- review APY and risk level
- continue into execution flow

### 5. AI Assistant

- ask staking, yield, and passive income questions
- receive grounded recommendation output
- jump from assistant response into a selected strategy

### 6. Vault Flow

- choose strategy
- enter amount
- deposit into selected flow
- withdraw from active position
- receive transaction-style feedback

### 7. Portfolio View

- wallet allocation
- managed vault positions
- activity tracking

## Demo Flow

The intended hackathon demo path is:

1. User opens DotPilot.
2. User connects wallet.
3. User sees the dashboard and curated DeFi strategies.
4. User asks the AI assistant for guidance.
5. The assistant recommends a strategy.
6. The user opens the vault flow for that strategy.
7. The user performs a deposit.
8. The app updates position and portfolio state.

This flow is the center of the current product implementation.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

## Product Architecture

DotPilot is organized into four main layers:

### 1. Presentation Layer

Responsible for everything the user sees and interacts with:

- dashboard
- landing page
- AI assistant UI
- strategy explorer
- vault interface
- portfolio view

### 2. Application Layer

Responsible for product flow and shared state:

- wallet connection state
- selected strategy flow
- vault position state
- portfolio state
- transaction feedback state
- activity and notification state

### 3. Intelligence Layer

Responsible for making recommendations useful and contextual:

- curated opportunity data
- AI recommendation logic
- risk explanation
- prompt-to-action flow

### 4. Blockchain Layer

Responsible for on-chain interaction direction:

- wallet provider integration
- Solidity vault contract
- transaction execution
- future on-chain state synchronization

## System Architecture Flow

The intended system flow is:

1. **User enters the product**
   - landing page introduces the value proposition
   - wallet-required sections stay locked until connection

2. **Wallet state is initialized**
   - user connects wallet
   - wallet address becomes available to the app
   - restricted flows become accessible

3. **Opportunity and recommendation flow starts**
   - dashboard and strategy explorer show curated options
   - AI assistant maps user intent to visible strategies

4. **Execution flow begins**
   - selected strategy is passed into vault flow
   - user enters amount
   - deposit or withdraw action is triggered

5. **State and feedback update**
   - portfolio state updates
   - vault positions update
   - activity feed and notifications update

This keeps the application easy to reason about and easy to demo.

## Current Project Architecture Direction

The project should continue to evolve in a modular and professional direction.

The current architecture direction is:

- keep top-level product flow centralized
- keep page components focused on rendering and interaction
- move reusable logic into utilities
- keep shared contracts in typed models
- isolate future blockchain integration cleanly

This prevents the app from becoming a tangled demo codebase and makes it easier to extend after the hackathon.

## Project Structure

```text
src/
  components/
    AIAssistant.tsx
    Dashboard.tsx
    Header.tsx
    LandingPage.tsx
    Portfolio.tsx
    Sidebar.tsx
    Strategies.tsx
    VaultPage.tsx
    WalletModal.tsx
  data/
    mockData.ts
  utils/
    cn.ts
    portfolio.ts
  App.tsx
  index.css
  main.tsx
  types.ts

PRD.md
ROADMAP.md
README.md
package.json
vite.config.ts
tsconfig.json
```

### Folder Responsibilities

#### `src/components`

Contains page-level and interface-level UI:

- visual layout
- section rendering
- interaction controls
- screen-specific product flows

#### `src/data`

Contains curated and mock data used by the current MVP:

- DeFi opportunities
- token balances
- portfolio history
- assistant defaults

#### `src/utils`

Contains reusable helpers:

- formatting logic
- portfolio calculations
- class merging helpers

#### `src/types.ts`

Contains shared TypeScript contracts used across the app:

- token models
- strategy models
- chat message models
- vault position models
- wallet and notification models

#### `src/App.tsx`

Acts as the application orchestration layer:

- shared state owner
- page switching logic
- wallet gating
- strategy handoff
- vault and portfolio synchronization

## Engineering Direction

To keep the project clean, scalable, and professional:

### State Management

- keep shared product state centralized
- avoid duplicating flow state across multiple page components
- treat wallet, strategy, vault, and activity as top-level product concerns

### Component Design

- keep components focused on UI and interaction
- avoid putting too much shared business logic into leaf components
- prefer clear prop contracts over hidden coupling

### Utility Design

- repeated logic should move into `src/utils`
- calculation helpers should stay outside render-heavy components
- formatting rules should be reused consistently

### Type Safety

- keep shared data contracts in `src/types.ts`
- expand type definitions before expanding implementation complexity
- prefer explicit app models over loose object shapes

### Future Contract Integration

When Solidity integration is added:

- keep contract interaction logic in a separate integration layer
- avoid mixing direct blockchain calls into presentation-only components
- document contract flow and transaction states clearly

## Current Build Status

The current repository already includes:

- animated landing page for the disconnected state
- sidebar feature locking before wallet connection
- AI-to-strategy handoff flow
- in-app vault deposit and withdraw state updates
- portfolio and activity updates after actions

The current frontend build has been verified with:

```bash
./node_modules/.bin/tsc --noEmit
npm run build
```

## Roadmap Summary

The roadmap is focused on hackathon-first delivery.

### Current priorities

- keep the MVP flow small and reliable
- finish Solidity vault implementation
- connect frontend to real contract logic
- complete submission assets for hackathon judging

### Current hackathon flow priority

1. connect wallet
2. discover strategy
3. ask the AI assistant
4. open vault flow
5. execute strategy
6. show updated state

For the full execution plan, see [ROADMAP.md](./ROADMAP.md).

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run with host exposed for local network testing:

```bash
npm run dev -- --host 0.0.0.0
```

## Build and Verification

Type-check the app:

```bash
./node_modules/.bin/tsc --noEmit
```

Build the app:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Deployment Note

This project is suitable for deployment on Vercel as a Vite frontend.

Recommended deployment flow:

1. push to GitHub
2. import repository into Vercel
3. use default Vite build settings
4. configure future environment variables if blockchain integrations are added

## Project Documents

### Product Requirement Document

See [PRD.md](./PRD.md) for:

- product overview
- problem statement
- product vision
- core features
- system architecture flow
- current project architecture direction

### Roadmap

See [ROADMAP.md](./ROADMAP.md) for:

- hackathon execution plan
- MVP scope
- timeline to submission
- workstreams
- delivery priorities
- risk register

## Notes

This repository is intentionally being shaped to stay:

- clean enough for collaborators
- understandable for hackathon judges
- structured enough for future agent-based development
