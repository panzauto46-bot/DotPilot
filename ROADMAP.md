# DotPilot Hackathon Roadmap

**Based on:** [PRD.md](/media/pandudargah/New%20Volume/Dotpilot/PRD.md)  
**Status:** Execution Draft  
**Current Date:** March 11, 2026  
**Submission Deadline:** March 20, 2026  
**Demo Days:** March 24-25, 2026  
**Primary Track:** Track 1 - EVM Smart Contract  
**Submission Angle:** AI-powered DeFi dapp on Polkadot Hub  
**Additional Target:** OpenZeppelin Sponsor Track

## 1. Roadmap Purpose

This roadmap translates the DotPilot PRD into a detailed execution plan for the DoraHacks Polkadot Solidity Hackathon.

The purpose of this document is to make execution easier by answering five practical questions:

1. What exactly are we building for the hackathon?
2. What are we not building?
3. What must be completed before March 20, 2026?
4. What is the critical demo flow?
5. How should the team prioritize work each day?

This is a hackathon roadmap, not a long-term startup roadmap. It is intentionally biased toward fast delivery, clear judging value, and demo reliability.

## 1.1 Execution Status

### Updated: March 11, 2026

Frontend MVP progress completed in the current codebase:

- Shared app state for wallet connection, selected strategy, vault positions, and activity feed
- Wallet modal updated for MetaMask and demo-wallet flow
- Dashboard, strategy explorer, AI assistant, vault, and portfolio now use connected state
- New animated landing page added for the disconnected entry experience
- Landing page now includes a 3D-style hero, running background flow, and professional hackathon positioning
- Sidebar now clearly locks assistant, strategies, portfolio, and vault features until wallet connection
- AI assistant recommendations now route into a real strategy selection flow
- Deposit and withdraw actions now update portfolio and vault state in-app
- Portfolio and vault access are now gated behind wallet connection
- Header notifications now reflect in-app wallet and vault activity

Still remaining for full hackathon completion:

- Solidity vault contract implementation
- Frontend to real contract integration
- Contract deployment proof
- README polish
- Hosted deployment
- Demo video and pitch deck

## 2. Submission Strategy

### Primary Positioning

DotPilot should be presented as:

**An AI-powered DeFi navigation dapp on Polkadot Hub that helps users discover, understand, and execute DeFi strategies through a Solidity-based smart contract vault.**

### Why This Positioning Fits

- It clearly matches Track 1 - EVM Smart Contract
- It uses Solidity on Polkadot Hub
- It fits the AI-powered dapp category
- It also has a strong DeFi use case
- It gives judges a simple story to remember
- It can qualify for the OpenZeppelin sponsor track with secure contract composition

### What We Need to Prove to Judges

By the end of the hackathon, the project should clearly demonstrate:

- Real use of Solidity smart contracts
- Real relevance to Polkadot Hub
- A clear DeFi use case
- A meaningful AI layer, not just a chat UI
- A clean and usable product experience

## 3. Hackathon Constraints

The roadmap is built around the following constraints:

- The submission deadline is March 20, 2026
- The demo days are March 24-25, 2026
- The project must be open-source
- The repository must show valid hackathon-era commit history
- The team must provide a demo video or screenshots
- The project must be testable via hosted deployment or local setup instructions

This means we should optimize for:

- One reliable end-to-end flow
- Small but real contract logic
- Clear documentation
- Stable demo experience

We should avoid:

- Overbuilding
- Too many half-working features
- Fake interactions that look real but do not connect to actual logic

## 4. Product Goal for the Hackathon

The hackathon version of DotPilot should prove one polished use case:

**A user connects a wallet, explores opportunities, asks the AI assistant for guidance, receives a strategy recommendation, and executes that strategy through the vault flow.**

This is the product story the entire roadmap supports.

## 5. MVP Demo Narrative

The final demo should be easy to explain in under 3 minutes.

### Target Demo Flow

1. Open DotPilot.
2. Connect wallet on Polkadot Hub testnet or compatible environment.
3. View dashboard with wallet assets and curated DeFi opportunities.
4. Ask the AI assistant something like:
   - "Where should I stake my DOT?"
   - "What is the best low-risk yield strategy?"
5. Receive a grounded recommendation with:
   - strategy name
   - expected yield
   - risk level
   - short rationale
6. Click into the recommended strategy.
7. Deposit through the vault interface.
8. Show transaction feedback and updated user position.

### Demo Promise

At the end of the demo, a judge should understand:

- what problem DotPilot solves
- why AI matters here
- why Polkadot Hub is the right place to build it
- what part of the system is real today

## 6. Scope Freeze

### Must-Have Features

These items must be finished before submission:

- Wallet connection
- Portfolio dashboard
- Strategy explorer
- AI assistant with grounded recommendations
- Solidity vault contract
- Deposit flow
- Withdraw flow
- Position or vault status display
- Hosted frontend
- README with setup instructions
- Demo video

### Recommended Features if Time Allows

- Claim rewards flow
- Better transaction history
- Better risk explanations
- More polished loading states
- One or two additional curated strategies

### Explicitly Out of Scope

These items should not consume core delivery time:

- Cross-chain asset management
- DAO treasury workflows
- Automated yield optimization
- On-chain portfolio rebalancing
- Production-grade backend infra
- Many protocol integrations
- Mainnet release

## 7. MVP Feature Breakdown

### 7.1 Wallet Integration

Goal:

- Let the user connect a supported wallet and unlock the app experience

Requirements:

- Connect button in header or modal
- Connected state
- Disconnected state
- Basic wallet address display
- Basic network awareness

Acceptance criteria:

- User can connect wallet from the UI
- Connected state persists for the current session
- Portfolio and vault views are gated appropriately

### 7.2 Dashboard

Goal:

- Show users the value of DotPilot in one glance

Requirements:

- Portfolio summary
- Curated opportunities list
- Navigation to strategy explorer
- Navigation to vault flow

Acceptance criteria:

- Dashboard clearly answers:
  - what assets the user has
  - what opportunities are available
  - what action to take next

### 7.3 Strategy Explorer

Goal:

- Help users compare available DeFi strategies

Requirements:

- Strategy cards or list view
- APY shown
- Risk level shown
- Asset and protocol shown
- Action button to continue to vault

Acceptance criteria:

- User can compare at least 2-3 strategies
- Every strategy shown in the UI has consistent supporting data

### 7.4 AI Assistant

Goal:

- Give a recommendation that feels useful and related to the displayed data

Requirements:

- Chat input
- Suggested questions
- Responses grounded in curated strategy data
- Risk and yield explanation
- Clear action path from assistant to strategy execution

Acceptance criteria:

- AI does not answer in a way that contradicts the shown strategy list
- At least 3 common prompts produce reliable outputs
- AI recommendation can lead user to a real next action

### 7.5 Vault Interface

Goal:

- Let the user execute the core DeFi action

Requirements:

- Select strategy
- Enter amount
- Deposit action
- Withdraw action
- Transaction feedback
- Position state or summary after action

Acceptance criteria:

- User can complete at least one real contract-backed action
- The UI clearly shows whether the action succeeded, failed, or is pending

### 7.6 Smart Contract Vault

Goal:

- Provide the on-chain logic that powers the main strategy flow

Requirements:

- Solidity contract
- Deposit function
- Withdraw function
- Event emission
- Basic permission structure
- OpenZeppelin-based security components
- Deployment to the hackathon-accepted environment

Acceptance criteria:

- Contract can be deployed successfully
- Frontend can call the contract
- A transaction hash or proof of execution can be shown in submission material
- OpenZeppelin usage is clearly documented and meaningful

## 8. Technical Scope for MVP

### Frontend

Recommended scope:

- React frontend
- Responsive layout
- Wallet connection state management
- Strategy and portfolio presentation
- AI assistant interface
- Contract interaction UI

### Smart Contracts

Recommended scope:

- One primary vault contract
- Minimal public functions
- Clean event model
- Narrow permissions
- OpenZeppelin modules such as `AccessControl` or `Ownable`, `ReentrancyGuard`, `Pausable`, and token-safe transfer utilities where relevant

### AI Layer

Recommended scope:

- Curated data plus prompt logic
- Recommendation templates
- Lightweight risk scoring
- Explanation-first outputs

### Data Layer

Recommended scope:

- Curated strategy dataset
- Mock or semi-static protocol data if live integration is too risky
- Clean mapping between UI and AI responses

## 9. Workstreams

## 9.1 Product and UX Workstream

### Main Objective

Turn the concept into a clean, easy-to-demo product flow.

### Tasks

- Freeze the main demo path
- Define what happens on each page
- Remove non-essential interactions
- Prepare UX copy for:
  - wallet connection
  - transaction confirmation
  - success state
  - error state
  - risk disclosure
- Prepare pitch story and demo script

### Deliverables

- Final user flow
- Screen inventory
- UX copy sheet
- Demo script outline

### Done Criteria

- No page exists without a purpose in the main demo
- Every main action has clear copy and user feedback

## 9.2 Frontend Workstream

### Main Objective

Make the product feel real and navigable from start to finish.

### Tasks

- Refactor state management so pages share the same app flow
- Add connected and disconnected states
- Ensure strategy selection passes correctly into vault flow
- Gate portfolio and vault access based on wallet state
- Replace fake success states with connected state transitions
- Make layout work properly on mobile and desktop
- Add error and loading UI

### Deliverables

- Working dashboard
- Working strategy explorer
- Working assistant UI
- Working vault page
- Stable navigation

### Done Criteria

- User can complete the main journey without broken transitions
- UI no longer relies on misleading static states for the core flow

## 9.3 Smart Contract Workstream

### Main Objective

Deliver a simple, credible Solidity contract that is central to the product.

### Tasks

- Define vault contract interface
- Implement deposit
- Implement withdraw
- Decide whether claim is included or deferred
- Lock the exact OpenZeppelin modules used by the vault
- Add tests for core flows
- Deploy contract
- Document contract address and ABI

### Deliverables

- Solidity source code
- Tests
- Deployment record
- Contract interface documentation
- OpenZeppelin dependency and customization notes

### Done Criteria

- Contract is deployed successfully
- At least one happy-path interaction is proven
- The frontend integration works for the primary action
- The contract shows meaningful OpenZeppelin usage beyond a trivial template

## 9.4 AI and Data Workstream

### Main Objective

Make the AI layer useful, grounded, and directly tied to the product.

### Tasks

- Finalize supported strategy dataset
- Define risk levels and explanation rules
- Create response logic for:
  - staking question
  - yield question
  - passive income question
- Tie recommendation output to visible strategies
- Ensure AI output suggests a next action

### Deliverables

- Curated strategy dataset
- AI response map
- Risk explanation framework
- Prompt examples for demo use

### Done Criteria

- AI responses are consistent
- AI suggestions line up with the vault and strategy explorer
- The AI adds product value beyond static content

## 9.5 Submission and Demo Workstream

### Main Objective

Make the project easy for judges to understand and verify.

### Tasks

- Clean and structure the repository
- Ensure the project is open-source
- Prepare README
- Prepare hosted deployment
- Record demo video
- Prepare screenshots
- Prepare pitch deck
- Write architecture summary
- Record contract address and deployment proof

### Deliverables

- Public repo
- README
- Demo video
- Hosted app
- Pitch deck
- Submission copy

### Done Criteria

- A judge can open the repo and understand the project in minutes
- A judge can run or inspect the project without needing extra support

## 10. Timeline and Daily Execution Plan

## March 11, 2026

Focus:

- Freeze scope
- Finalize track positioning
- Confirm primary demo flow

Outputs:

- Final roadmap
- MVP scope list
- First task board

## March 12, 2026

Focus:

- Clean architecture and repo structure
- Define contract interface
- Confirm supported strategies

Outputs:

- Contract function list
- Screen map
- Strategy dataset draft

## March 13, 2026

Focus:

- Build wallet and dashboard baseline

Outputs:

- Wallet state in app
- Dashboard shell
- Opportunity cards wired to data

## March 14, 2026

Focus:

- Build strategy explorer and assistant baseline

Outputs:

- Strategy explorer working
- AI assistant screen working
- Quick prompt support

## March 15, 2026

Focus:

- Build vault contract and vault page baseline

Outputs:

- First vault contract version
- Deposit UI
- Strategy selection passed into vault page

## March 16, 2026

Focus:

- Connect frontend to contract

Outputs:

- Wallet to contract flow working
- Deposit flow partially or fully working
- Initial transaction state UI

## March 17, 2026

Focus:

- Complete the end-to-end product flow

Outputs:

- AI recommendation to strategy to vault flow works
- Withdraw flow implemented or stubbed clearly
- Position state shown in UI

## March 18, 2026

Focus:

- Stability, cleanup, and UX polish

Outputs:

- Broken actions removed
- Better loading and empty states
- Mobile fixes
- Critical bug fixes

## March 19, 2026

Focus:

- Submission packaging

Outputs:

- README completed
- Hosted deployment ready
- Demo video recorded
- Pitch deck completed
- Contract deployment proof captured

## March 20, 2026

Focus:

- Final verification and submission

Outputs:

- Public repository ready
- DoraHacks form completed
- All links verified
- Submission sent

## March 21-23, 2026

Focus:

- Demo day prep

Outputs:

- Short presentation script
- Backup screenshots
- Backup local demo plan

## March 24-25, 2026

Focus:

- Demo day execution

Outputs:

- Clean presentation
- Strong explanation of Polkadot Hub relevance

## 11. Priority Order

If time becomes limited, build in this order:

1. Contract deployment
2. Wallet connection
3. Deposit flow from frontend to contract
4. AI recommendation tied to a real strategy
5. Dashboard and strategy explorer
6. Withdraw flow
7. Position tracking
8. UI polish
9. Extra analytics

This order protects the technical core and keeps the demo credible.

## 12. Critical Path

The project is blocked if any of these fail:

- The contract is not deployed
- Wallet is not connected properly
- The vault UI cannot call the contract
- The AI recommendation does not map to a real strategy
- README and demo assets are not ready in time

These should receive the most team attention.

## 13. Definition of Done for the Hackathon MVP

DotPilot is ready for submission when all of the following are true:

- The project clearly fits Track 1 - EVM Smart Contract
- The repository is public and open-source
- The commit history reflects active hackathon work
- The app can run locally from the README
- A hosted version is available
- Wallet connection works
- The user can view strategies
- The AI assistant can recommend at least one usable strategy
- The user can complete at least one contract-backed action
- The project can be shown in a clean 2-3 minute demo
- Demo video and screenshots are prepared

## 14. Submission Checklist

### Required

- Public GitHub repository
- Project description
- Clean README with setup instructions
- Hosted frontend or local install guide
- Demo video or screenshots
- Contract address

### Strongly Recommended

- Pitch deck
- Architecture overview
- Transaction proof
- Screenshots for fallback demo
- Polkadot wallet with on-chain identity for winner readiness
- OpenZeppelin library usage documentation

### Internal Team Check

- All placeholder text removed
- No obviously fake critical actions in the demo path
- All links open correctly
- Environment variables documented
- Build command works

## 15. Risk Register

### Risk: Scope keeps growing

Impact:

- Team loses focus and misses submission quality

Mitigation:

- Freeze the MVP now
- Add all future ideas to a post-hackathon list only

### Risk: Demo looks like a static prototype

Impact:

- Judges may not trust the product depth

Mitigation:

- Make at least one real contract interaction work
- Remove fake transaction states from the main path

### Risk: AI feels generic

Impact:

- Product loses differentiation

Mitigation:

- Ground responses in curated strategy data
- Make AI outputs actionable and specific

### Risk: Contract integration slips too late

Impact:

- The strongest technical story collapses

Mitigation:

- Start contract work early
- Treat frontend-contract integration as a critical path item

### Risk: Submission package is incomplete

Impact:

- Strong project loses points or risks disqualification

Mitigation:

- Finish README, video, and links before the last day

## 16. Team Roles

For a small team, responsibilities can be split like this:

- Product and design
  - scope
  - UX flow
  - copy
  - pitch deck
  - demo script
- Frontend
  - app state
  - dashboard
  - AI UI
  - vault UI
  - responsive fixes
- Smart contracts
  - vault contract
  - tests
  - deployment
  - integration support
- AI and data
  - strategy dataset
  - prompt flow
  - recommendation logic
  - explanation layer

## 17. Post-Hackathon Parking Lot

These items are intentionally deferred and should not disturb MVP execution:

- Cross-chain support
- DAO treasury features
- Multi-protocol automation
- Portfolio rebalancing
- Advanced analytics
- Production security hardening beyond hackathon scope

## 18. Immediate Next Actions

1. Confirm DotPilot will be submitted to Track 1 - EVM Smart Contract.
2. Freeze the final MVP scope from Section 6.
3. Initialize or fix the Git repository so commit history is valid.
4. Define the first supported strategy and vault contract interface.
5. Lock the exact OpenZeppelin modules that will be used in the vault contract.
6. Convert Sections 9 and 10 into a daily task board.
7. Decide the exact demo script now, before adding more features.
