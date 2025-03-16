require("dotenv").config();
const chalk = require("chalk");
const { ethers } = require("ethers");
const inquirer = require("inquirer").default;

async function burnTokens() {
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

    const TOKEN_CONTRACT = process.env.TOKEN_CONTRACT;
    if (!TOKEN_CONTRACT) {
        console.error(chalk.red.bold("[-] Error: Contract Address not found in .env"));
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(chalk.yellow.bold("[+] Wallet Address:"), chalk.blue.bold(wallet.address));

    // Load the token contract
    const tokenAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)",
        "function burn(uint256)",
    ];
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT, tokenAbi, wallet);
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const tokenBalance = await tokenContract.balanceOf(wallet.address);

    console.log(chalk.blue.bold("\n[+] Token Name:"), chalk.cyan.bold(tokenName));
    console.log(chalk.blue.bold("[+] Token Symbol:"), chalk.cyan.bold(tokenSymbol));
    console.log(chalk.green.bold("[+] Token Balance:"), chalk.cyan.bold(`${ethers.formatUnits(tokenBalance, 18)} ${tokenSymbol}`));

    const { amount } = await inquirer.prompt([
        {
            type: "input",
            name: "amount",
            message: chalk.yellow(`Amount of ${tokenSymbol} to burn:`),
            validate: (input) => {
                const isValid = !isNaN(input) && Number(input) > 0;
                return isValid || chalk.red("Amount must be a positive number");
            },
        },
    ]);

    const amountInWei = ethers.parseUnits(amount, 18);
    if (tokenBalance < amountInWei) {
        console.error(chalk.red.bold(`[-] Error: Insufficient balance. You have ${ethers.formatUnits(tokenBalance, 18)} ${tokenSymbol}`));
        process.exit(1);
    }

    // Burn
    console.log(chalk.blue.bold(`[+] Burning ${amount} ${tokenSymbol}...`));
    const tx = await tokenContract.burn(amountInWei);
    await tx.wait();

    console.log(chalk.green.bold(`[+] Tokens burned successfully!`));
    console.log(chalk.blue.bold("[+] Transaction hash:"), chalk.yellow(tx.hash));
}

burnTokens().catch((error) => {
    console.error(chalk.red.bold("[-] Error:"), error);
    process.exit(1);
});