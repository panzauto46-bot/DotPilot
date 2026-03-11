import { JsonRpcProvider, Wallet, ContractFactory } from 'ethers';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileContracts } from './compile-contracts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  const rpcUrl = process.env.POLKADOT_HUB_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('POLKADOT_HUB_RPC_URL and DEPLOYER_PRIVATE_KEY must be set.');
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);
  const admin = process.env.VAULT_ADMIN_ADDRESS || signer.address;

  const { artifacts } = await compileContracts();
  const vaultArtifact = artifacts.DotPilotVault;
  if (!vaultArtifact) {
    throw new Error('DotPilotVault artifact was not generated.');
  }

  const factory = new ContractFactory(vaultArtifact.abi, vaultArtifact.bytecode, signer);
  const contract = await factory.deploy(admin);
  await contract.waitForDeployment();

  const deploymentReceipt = await provider.getTransactionReceipt(contract.deploymentTransaction().hash);
  const deployment = {
    contractName: 'DotPilotVault',
    address: await contract.getAddress(),
    admin,
    chainId: Number((await provider.getNetwork()).chainId),
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: deploymentReceipt?.blockNumber ?? null,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(rootDir, 'deployments');
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, 'dotpilot-vault.latest.json'),
    JSON.stringify(deployment, null, 2)
  );

  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
