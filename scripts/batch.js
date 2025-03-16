require("dotenv").config();
const fs = require("fs");
const hre = require("hardhat");
const chalk = require("chalk");
const inquirer = require("inquirer").default;

async function main() {
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

    const provider = new hre.ethers.JsonRpcProvider(MONAD_RPC_URL);
    const wallet = new hre.ethers.Wallet(PRIVATE_KEY, provider);
    console.log(chalk.yellow.bold("[+] Wallet Address:"), chalk.blue.bold(wallet.address));

    // Load the token contract
    const tokenAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public",
        "event BatchTransfer(address indexed sender, address[] recipients, uint256[] amounts)"
    ];
    const monPaws = new hre.ethers.Contract(TOKEN_CONTRACT, tokenAbi, wallet);

    // Parse airdrop.txt
    if (!fs.existsSync("airdrop.txt")) {
        console.error(chalk.red.bold("[-] Error: airdrop.txt file not found"));
        process.exit(1);
    }

    console.log(chalk.cyan("[+] Reading airdrop.txt..."));
    const recipients = [];
    const amounts = [];
    const data = fs.readFileSync("airdrop.txt", "utf8");

    data.split("\n").forEach((line) => {
        const [address, amount] = line.trim().split(",");
        if (address && amount) {
            recipients.push(address);
            amounts.push(Number(amount));
        }
    });

    console.log(chalk.yellow.bold("[+] Recipients and Amounts:"));
    recipients.forEach((recipient, index) => {
        console.log(`${chalk.blue(`[-] Address: ${recipient}`)}, ${chalk.green(`Amount: ${amounts[index]}`)}`);
    });

    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed?',
            default: true
        }
    ]);

    if (!answers.proceed) {
        console.log(chalk.red.bold("[-] Operation aborted by user."));
        process.exit(1);
    }

    const amountsInWei = amounts.map((amount) => hre.ethers.parseUnits(amount.toString(), 18));

    console.log(chalk.blue.bold("[+] Performing batch transfer..."));
    try {
        const tx = await monPaws.batchTransfer(recipients, amountsInWei);
        await tx.wait();
        console.log(chalk.green.bold("[+] Batch transfer completed!"));
        console.log(chalk.blue.bold("[+] Transaction hash:"), chalk.green(tx.hash));

        // // Check balances after transfer
        // for (let i = 0; i < recipients.length; i++) {
        //     const balance = await monPaws.balanceOf(recipients[i]);
        //     console.log(
        //         chalk.blue.bold(`[+] Balance ${recipients[i]}:`),
        //         chalk.green(`${hre.ethers.formatUnits(balance, 18)}`)
        //     );
        // }
    } catch (error) {
        console.error(chalk.red.bold("[-] Error during batch transfer:"), error);
        process.exit(1);
    }

}

main().catch((error) => {
    console.error(chalk.red.bold("[-] Error:"), error);
    process.exit(1);
});
