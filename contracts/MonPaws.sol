// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MonPaws is ERC20 {
    // Events
    event TokensBurned(address indexed burner, uint256 amount);
    event BatchTransfer(address indexed sender, address[] recipients, uint256[] amounts);

    // Constructor
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    /// @notice Burns `amount` tokens from the caller's balance.
    /// @param amount The amount of tokens to burn.
    function burn(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "ERR: Insufficient balance to burn");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /// @notice Transfers tokens to multiple recipients in a single transaction.
    /// @param recipients The list of recipient addresses.
    /// @param amounts The list of amounts to transfer to each recipient.
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) public {
        require(recipients.length == amounts.length, "ERR: Recipients and amounts length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "ERR: Invalid recipient address");
            totalAmount += amounts[i];
        }

        require(balanceOf(msg.sender) >= totalAmount, "ERR: Insufficient balance for batch transfer");

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }

        emit BatchTransfer(msg.sender, recipients, amounts);
    }

    /// @notice Returns the balance of a specific holder.
    /// @param holder The address of the holder.
    /// @return The balance of the holder.
    function getHolderBalance(address holder) public view returns (uint256) {
        return balanceOf(holder);
    }
}
