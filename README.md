# DotPilot

DotPilot is an AI-powered DeFi navigation dapp built for the Polkadot Solidity Hackathon.

The product combines:

- wallet connection
- DeFi opportunity discovery
- AI-guided strategy recommendations
- vault-style execution flow

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Product Architecture

DotPilot is organized into four main layers:

1. Presentation layer
   - dashboard
   - AI assistant
   - strategy explorer
   - vault interface
2. Application layer
   - wallet connection state
   - selected strategy flow
   - vault position state
   - transaction feedback
3. Intelligence layer
   - AI recommendation logic
   - curated opportunity data
   - risk explanation
4. Blockchain layer
   - wallet provider integration
   - Solidity vault contract
   - transaction execution

## Project Structure

```text
src/
  components/     UI sections and page-level components
  data/           Curated mock and strategy data
  utils/          Shared helpers and formatting logic
  App.tsx         Main application flow and shared state
  main.tsx        App entry point
  types.ts        Shared TypeScript types
```

## Engineering Direction

To keep the project clean and professional:

- shared state should stay centralized in `App.tsx` or a dedicated state layer later
- UI components should stay focused on rendering and user interaction
- repeated logic should move into `src/utils`
- shared data contracts should stay in `src/types.ts`
- future smart contract integration should be added as a separate service or integration layer

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Docs

- [PRD.md](./PRD.md)
- [ROADMAP.md](./ROADMAP.md)
