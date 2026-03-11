import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contractsDir = path.join(rootDir, 'contracts');
const artifactsDir = path.join(rootDir, 'artifacts', 'contracts');

function normalizePath(value) {
  return value.replaceAll(path.sep, '/');
}

async function listSolidityFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSolidityFiles(resolved);
      }
      return entry.name.endsWith('.sol') ? [resolved] : [];
    })
  );

  return files.flat();
}

function findImports(importPath) {
  const candidates = [
    path.join(rootDir, importPath),
    path.join(rootDir, 'node_modules', importPath),
  ];

  for (const candidate of candidates) {
    try {
      return { contents: readFileSync(candidate, 'utf8') };
    } catch {
      continue;
    }
  }

  return {
    error: `File not found: ${importPath}`,
  };
}

function buildArtifact(contractName, contractOutput, sourceName) {
  return {
    contractName,
    sourceName,
    abi: contractOutput.abi,
    bytecode: `0x${contractOutput.evm.bytecode.object}`,
    deployedBytecode: `0x${contractOutput.evm.deployedBytecode.object}`,
  };
}

export async function compileContracts({ writeArtifacts = true } = {}) {
  const sourceFiles = await listSolidityFiles(contractsDir);
  if (sourceFiles.length === 0) {
    throw new Error('No Solidity files found in contracts/.');
  }

  const sources = Object.fromEntries(
    await Promise.all(
      sourceFiles.map(async (filePath) => {
        const sourceName = normalizePath(path.relative(rootDir, filePath));
        const content = await readFile(filePath, 'utf8');
        return [sourceName, { content }];
      })
    )
  );

  const input = {
    language: 'Solidity',
    sources,
    settings: {
      evmVersion: 'paris',
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  const errors = output.errors || [];
  const fatalErrors = errors.filter((entry) => entry.severity === 'error');

  if (fatalErrors.length > 0) {
    throw new Error(fatalErrors.map((entry) => entry.formattedMessage).join('\n\n'));
  }

  if (writeArtifacts) {
    await mkdir(artifactsDir, { recursive: true });
  }

  const artifacts = {};
  for (const [sourceName, contracts] of Object.entries(output.contracts || {})) {
    for (const [contractName, contractOutput] of Object.entries(contracts)) {
      const artifact = buildArtifact(contractName, contractOutput, sourceName);
      artifacts[contractName] = artifact;

      if (writeArtifacts) {
        const targetDirectory = path.join(artifactsDir, sourceName);
        await mkdir(targetDirectory, { recursive: true });
        await writeFile(
          path.join(targetDirectory, `${contractName}.json`),
          JSON.stringify(artifact, null, 2)
        );
      }
    }
  }

  return {
    artifacts,
    warnings: errors.filter((entry) => entry.severity === 'warning'),
  };
}

const executedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (executedDirectly) {
  compileContracts()
    .then(({ artifacts, warnings }) => {
      const compiledNames = Object.keys(artifacts);
      if (warnings.length > 0) {
        for (const warning of warnings) {
          console.warn(warning.formattedMessage);
        }
      }
      console.log(`Compiled ${compiledNames.length} contract(s): ${compiledNames.join(', ')}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
