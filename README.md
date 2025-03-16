# Monpaws - DEMO ERC-20 Token for Monad Testnet

## Overview
This is an ERC-20 token demo deployed on the Monad Testnet. This project provides scripts to deploy, batch transfer, and burn tokens using Hardhat.

<a href="#"><img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fhtr-tech%2FMonPaws-Monad&title=Visitors&count_bg=%230073EB"></a>

## Requirements
Before using this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- A Monad Testnet wallet with testnet funds

#

## Installation
1. Clone this repository:
   ```sh
   git clone https://github.com/htr-tech/MonPaws-Monad.git
   cd MonPaws-Monad
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   - There is an `.env` file in the project root.
   - Add your wallet private key in the  variables:
     ```env
     PRIVATE_KEY=0x...
     ```

## Usage

### 1. Compile the Token Contract
Run the following command to compile the contract:
```sh
npm run compile
```

### 2. Deploy the Token
To deploy the token to the Monad Testnet:
```sh
npm run mint
```
After deployment, the contract address will be saved in the `.env` file.

### 3. Burn Tokens
Burn a specified amount of tokens:
```sh
npm run burn
```
You will be prompted to enter the amount of tokens to burn.


### 4. Airdrop Tokens (Batch Transfer)
Batch transfer tokens to multiple addresses specified in `airdrop.txt`:
```sh
npm run drop
```
Format `airdrop.txt` as follows:
```
0xRecipientAddress1, amount1
0xRecipientAddress2, amount2
```

#

### Credits: [Monad Docs](https://docs.monad.xyz/getting-started/deploy-a-subgraph/ghost#deploying-cattoken-on-monad-testnet)

