require("dotenv").config();
const fs = require("fs");
const hre = require("hardhat");
const chalk = require("chalk");
const inquirer = require("inquirer").default;

async function mintToken() {
    console.log(chalk.blue.bold("[+] Deploying Token..."));

    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) {
        console.error(chalk.red.bold("[-] Error: Private key not found in .env"));
        process.exit(1);
    }

    const MONAD_RPC_URL = process.env.MONAD_RPC_URL;
    if (!MONAD_RPC_URL) {
        console.error(chalk.red.bold("[-] Error: RPC not found in .env"));
        process.exit(1);
    }

    // Prompt for token details
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter token name:",
            validate: (input) => input.trim() !== "" || "Token name cannot be empty",
        },
        {
            type: "input",
            name: "symbol",
            message: "Enter token symbol:",
            validate: (input) => input.trim() !== "" || "Token symbol cannot be empty",
        },
        {
            type: "input",
            name: "supply",
            message: "Enter total supply (e.g., 100):",
            validate: (input) => {
                const isValid = !isNaN(input) && Number(input) > 0;
                return isValid || "Supply must be a positive number";
            },
        },
    ]);

    const { name, symbol, supply } = answers;

    const provider = new hre.ethers.JsonRpcProvider(MONAD_RPC_URL);
    const wallet = new hre.ethers.Wallet(PRIVATE_KEY, provider);
    console.log(chalk.green.bold(`\n[+] Using Wallet: ${wallet.address}`));

    // Deploy the contract
    const Token = await hre.ethers.getContractFactory("MonPaws", wallet);
    console.log(chalk.blue.bold("[+] Deploying contract..."));
    const token = await Token.deploy(name, symbol, supply);
    await token.waitForDeployment();

    const contractAddress = await token.getAddress();
    console.log(chalk.green.bold(`[+] Token deployed at: ${contractAddress}`));

    // Save contract address to .env file
    saveContract(contractAddress);

    // Verify the contract
    await verifyContract(contractAddress, name, symbol, supply);
}

function saveContract(contractAddress) {
    const envPath = ".env";
    let envContent = fs.readFileSync(envPath, "utf8");

    if (envContent.includes("TOKEN_CONTRACT=")) {
        envContent = envContent.replace(
            /TOKEN_CONTRACT=.*/,
            `TOKEN_CONTRACT=${contractAddress}`
        );
    } else {
        envContent += `\nTOKEN_CONTRACT=${contractAddress}`;
    }
    fs.writeFileSync(envPath, envContent);
}

async function verifyContract(contractAddress, name, symbol, supply) {
    console.log(chalk.blue.bold(`[+] Verifying contract: ${contractAddress}`));

    const originalConsoleLog = console.log;
    console.log = () => { };

    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [name, symbol, supply],
        });
        console.log = originalConsoleLog;
        console.log(chalk.green.bold("[+] Contract verified successfully!"));
        console.log(chalk.yellow.bold(`\n[+] Address: https://testnet.monadexplorer.com/token/${contractAddress}`));
    } catch (error) {
        console.log = originalConsoleLog;
        console.error(chalk.red.bold(`[-] Verification failed for ${contractAddress}:`), error.message);
        console.error(chalk.yellow.bold(`[-] To verify manually, run:`));
        console.error(chalk.yellow.bold(`[~] npx hardhat verify --network monadtestnet ${contractAddress} "${name}" "${symbol}" ${supply}`));
    }
}

mintToken().catch((error) => {
    console.error(chalk.red.bold("\n[-] Token Deploy failed:"), error);
    process.exit(1);
});
