# Product Requirements Document (PRD)

## DotPilot
AI-Powered DeFi Navigator for Polkadot Hub

**Document Status:** Draft  
**Product Name:** DotPilot  
**Last Updated:** March 11, 2026

## Hackathon Alignment

- Primary Track: Track 1 - EVM Smart Contract
- Category Focus: AI-powered dapp and DeFi use case
- Additional Target: OpenZeppelin Sponsor Track

## 1. Product Overview

DotPilot is an AI-powered DeFi assistant designed to help users navigate the Polkadot ecosystem and make better financial decisions when interacting with decentralized finance protocols.

The platform simplifies complex DeFi activities such as:

- Staking
- Yield farming
- Asset management
- DeFi strategy discovery

DotPilot combines AI insights, portfolio tracking, and smart contract automation to provide a user-friendly interface where users can discover and execute DeFi strategies directly.

The application will be deployed on Polkadot Hub using EVM-compatible Solidity smart contracts.

## 2. Problem Statement

The DeFi ecosystem continues to expand rapidly, but users often face several challenges:

- Difficulty identifying profitable DeFi opportunities
- Lack of clear guidance for staking or yield strategies
- Fragmented interfaces across multiple protocols
- Complex interactions that discourage new users from participating

As a result, many users:

- Miss profitable opportunities
- Struggle to understand risk levels
- Avoid interacting with advanced DeFi protocols

There is a need for an intelligent system that simplifies DeFi decision-making.

## 3. Proposed Solution

DotPilot provides an AI-driven DeFi navigation platform that helps users:

- Analyze DeFi opportunities
- Receive strategy recommendations
- Manage their assets from a single interface
- Execute transactions directly through smart contracts

Users interact with DotPilot through a dashboard and AI assistant interface.

The system analyzes market conditions and provides actionable insights, allowing users to make informed decisions quickly.

## 4. Product Vision

The long-term vision of DotPilot is to become the intelligent navigation layer for DeFi in the Polkadot ecosystem.

Future developments may include:

- AI-driven portfolio management
- Automated yield optimization
- Cross-chain asset management
- Intelligent DeFi strategy execution

DotPilot aims to make DeFi more accessible, safer, and easier to understand.

## 5. Target Users

### Primary Users

- New Web3 users
- DeFi investors
- Crypto asset holders
- Polkadot ecosystem participants

### Secondary Users

- DAO treasury managers
- Web3 developers
- Crypto communities managing shared funds

## 6. Core Features

### 6.1 Wallet Integration

Users can connect their wallets to interact with the platform.

Features include:

- Wallet connection
- Viewing token balances
- Interacting with smart contracts
- Executing blockchain transactions

### 6.2 AI DeFi Assistant

DotPilot provides a conversational AI assistant that helps users explore DeFi opportunities.

Users can ask questions such as:

- "Where should I stake my DOT?"
- "What are the best yield opportunities today?"
- "How can I earn passive income in the Polkadot ecosystem?"

The assistant provides:

- Strategy recommendations
- Estimated yields
- Risk insights

### 6.3 Smart Contract Vault

A vault smart contract enables users to manage their assets securely.

Core functions include:

- Deposit assets
- Withdraw assets
- Stake tokens
- Claim rewards

The vault provides a simplified interface for executing DeFi strategies.

### 6.4 DeFi Opportunity Dashboard

The dashboard provides an overview of DeFi opportunities and user portfolio data.

Displayed information includes:

- Staking opportunities
- Yield rates
- Portfolio value
- Asset allocation
- Performance tracking

The interface focuses on clarity and simplicity.

### 6.5 Strategy Execution

Users can execute recommended strategies directly from the platform.

Example flow:

1. User asks the AI assistant for a staking recommendation.
2. The AI analyzes available options.
3. The system suggests an optimal strategy.
4. The user executes the strategy with one click.
5. The smart contract processes the transaction.

## 7. User Flow

1. User visits the DotPilot platform.
2. User connects their wallet.
3. The dashboard displays the user's portfolio and DeFi opportunities.
4. User interacts with the AI assistant.
5. The assistant recommends a strategy.
6. User executes the transaction.
7. Smart contracts process the transaction on Polkadot Hub.

## 8. Technical Architecture

### Frontend

- React or Next.js
- Responsive dashboard interface
- AI chat interface

### Smart Contracts

- Solidity
- Deployed on Polkadot Hub (EVM compatible)
- Built using OpenZeppelin contract libraries where appropriate

### Backend Services

- AI recommendation engine
- Market data aggregator
- Strategy analysis module

### Blockchain Integration

- Wallet interaction
- Smart contract transactions
- On-chain asset management

### System Architecture Flow

DotPilot is designed as a layered product:

1. Presentation Layer
   - Dashboard
   - AI assistant
   - Strategy explorer
   - Vault execution interface
2. Application Layer
   - Wallet state management
   - Strategy selection flow
   - Portfolio and position state
   - Transaction feedback handling
3. Intelligence Layer
   - AI recommendation logic
   - Risk explanation
   - Curated opportunity analysis
4. Blockchain Layer
   - Wallet provider connection
   - Solidity vault contract
   - On-chain execution and event handling

### Current Project Architecture Direction

The project should be kept modular and professional with the following structure:

- `src/components`
  - presentation components and page-level UI
- `src/data`
  - curated mock or static strategy datasets
- `src/types`
  - shared TypeScript models
- `src/utils`
  - reusable helper functions and formatting logic
- `src/App.tsx`
  - top-level app flow and shared state orchestration

Architecture principles:

- Keep business flow centralized at the app level
- Keep components focused on presentation and user interaction
- Keep shared types explicit and reusable
- Keep utility logic outside component files when reused
- Separate future blockchain integration logic cleanly from UI rendering

## 9. Polkadot Ecosystem Integration

DotPilot leverages several features of the Polkadot ecosystem:

### Polkadot Hub EVM Compatibility

Allows developers to deploy Solidity smart contracts directly on Polkadot.

### Shared Security Model

Ensures reliable and secure execution of smart contracts.

### Cross-Chain Interoperability

Enables potential integration with other parachains in the ecosystem.

### Native Asset Support

Allows management of DOT and other Polkadot-based assets.

## 10. UI/UX Design Principles

The interface is designed to be:

- Simple
- Intuitive
- Beginner-friendly
- Transparent

Main interface sections include:

- Portfolio dashboard
- AI assistant panel
- Strategy explorer
- Transaction execution interface

The goal is to make DeFi interactions accessible even for new users.

## 11. Security Considerations

Security is a core component of the system design.

Measures include:

- Secure smart contract architecture
- Limited privilege contract permissions
- Transparent transaction confirmations
- Clear risk disclosures for DeFi strategies
- OpenZeppelin-based contract components for safer Solidity development

Smart contracts will follow best practices to reduce vulnerabilities.

For the hackathon submission, the vault contract should use meaningful OpenZeppelin components such as access control, token-safe transfer utilities, and security guards rather than only basic boilerplate contracts.

## 12. Development Roadmap

### Phase 1 - Hackathon MVP

- Wallet integration
- Smart contract vault
- DeFi opportunity dashboard
- AI assistant prototype
- Basic strategy execution

### Phase 2 - Post Hackathon

- Integration with multiple DeFi protocols
- Advanced analytics
- Improved AI recommendation engine

### Phase 3 - Long Term

- Cross-chain asset management
- Automated DeFi strategies
- DAO treasury management tools

## 13. Demo Plan

The hackathon demonstration will include:

- Connecting a wallet
- Viewing portfolio assets
- Asking the AI assistant for DeFi recommendations
- Executing a staking strategy
- Tracking rewards through the dashboard

The demo will include:

- A video demonstration
- A deployed frontend interface
- Documentation explaining the system architecture

## 14. Success Metrics

The success of the platform will be evaluated based on:

- Usability of the interface
- Clarity of AI recommendations
- Successful smart contract execution
- Overall user experience

## 15. Long-Term Impact

DotPilot aims to contribute to the Polkadot ecosystem by:

- Simplifying DeFi adoption
- Improving accessibility for new users
- Providing intelligent tools for financial decision-making
- Encouraging more users to participate in the Polkadot network
