import test from 'node:test';
import assert from 'node:assert/strict';
import ganache from 'ganache';
import { BrowserProvider, ContractFactory, parseEther, encodeBytes32String } from 'ethers';
import { compileContracts } from '../scripts/compile-contracts.mjs';

let provider;
let admin;
let user;
let outsider;
let vault;
let token;

async function deployFixture() {
  const ganacheProvider = ganache.provider({
    logging: { quiet: true },
    wallet: { totalAccounts: 4 },
  });

  provider = new BrowserProvider(ganacheProvider);
  admin = await provider.getSigner(0);
  user = await provider.getSigner(1);
  outsider = await provider.getSigner(2);

  const { artifacts } = await compileContracts({ writeArtifacts: false });
  const vaultFactory = new ContractFactory(
    artifacts.DotPilotVault.abi,
    artifacts.DotPilotVault.bytecode,
    admin
  );
  vault = await vaultFactory.deploy(await admin.getAddress());
  await vault.waitForDeployment();

  const tokenFactory = new ContractFactory(
    artifacts.MockERC20.abi,
    artifacts.MockERC20.bytecode,
    admin
  );
  token = await tokenFactory.deploy('Mock DOT', 'mDOT');
  await token.waitForDeployment();

  await (await token.mint(await user.getAddress(), 1_000_000n)).wait();
  await (await token.mint(await admin.getAddress(), 1_000_000n)).wait();
}

test('native strategy deposit and withdraw works', async () => {
  await deployFixture();

  await (await vault.createStrategy(encodeBytes32String('native-dot'), '0x0000000000000000000000000000000000000000', true, 1)).wait();
  const depositAmount = parseEther('1');
  const rewardAmount = parseEther('0.25');

  const depositReceipt = await (await vault.connect(user).deposit(1, { value: depositAmount })).wait();
  const depositLog = depositReceipt.logs
    .map((entry) => {
      try {
        return vault.interface.parseLog(entry);
      } catch {
        return null;
      }
    })
    .find((entry) => entry?.name === 'Deposited');

  assert.equal(depositLog?.args.strategyId, 1n);
  assert.equal(depositLog?.args.amount, depositAmount);

  const positions = await vault.getPosition(await user.getAddress());
  assert.equal(positions.length, 1);
  assert.equal(positions[0].deposited, depositAmount);
  assert.equal(positions[0].active, true);

  await (await vault.creditRewards(1, rewardAmount, { value: rewardAmount })).wait();
  const withdrawReceipt = await (await vault.connect(user).withdraw(1)).wait();
  const withdrawLog = withdrawReceipt.logs
    .map((entry) => {
      try {
        return vault.interface.parseLog(entry);
      } catch {
        return null;
      }
    })
    .find((entry) => entry?.name === 'Withdrawn');

  assert.equal(withdrawLog?.args.positionId, 1n);
  assert.equal(withdrawLog?.args.amount, depositAmount + rewardAmount);

  const updatedPosition = await vault.getPositionById(1);
  assert.equal(updatedPosition.active, false);
});

test('erc20 strategy deposit and withdraw works', async () => {
  await deployFixture();

  await (await vault.createStrategy(
    encodeBytes32String('hydration-dot'),
    await token.getAddress(),
    false,
    2
  )).wait();

  await (await token.connect(user).approve(await vault.getAddress(), 500_000n)).wait();
  await (await vault.connect(user).depositToken(1, 500_000n)).wait();

  await (await token.connect(admin).approve(await vault.getAddress(), 25_000n)).wait();
  await (await vault.creditRewards(1, 25_000n)).wait();

  const beforeBalance = await token.balanceOf(await user.getAddress());
  await (await vault.connect(user).withdraw(1)).wait();
  const afterBalance = await token.balanceOf(await user.getAddress());

  assert.equal(afterBalance - beforeBalance, 525_000n);
});

test('only strategy managers can create strategies', async () => {
  await deployFixture();

  await assert.rejects(async () => {
    await vault.connect(outsider).createStrategy(
      encodeBytes32String('blocked'),
      '0x0000000000000000000000000000000000000000',
      true,
      1
    );
  });
});

test('pause blocks deposits until unpaused', async () => {
  await deployFixture();

  await (await vault.createStrategy(encodeBytes32String('native-dot'), '0x0000000000000000000000000000000000000000', true, 1)).wait();
  await (await vault.pause()).wait();

  await assert.rejects(async () => {
    await vault.connect(user).deposit(1, { value: parseEther('0.5') });
  });

  await deployFixture();
  await (await vault.createStrategy(encodeBytes32String('native-dot'), '0x0000000000000000000000000000000000000000', true, 1)).wait();
  await (await vault.pause()).wait();
  await (await vault.unpause()).wait();
  const depositTx = await vault.connect(user).deposit(1, { value: parseEther('0.5') });
  await depositTx.wait();
});
