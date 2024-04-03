const path = require("path");
const express = require("express");
const config = require("./config");
// const connectDB = require('./config/db');
const configureMiddleware = require("./middleware");
const configureRoutes = require("./routes");
const socketio = require("socket.io");
const gameSocket = require("./socket/index");
// import { ethers } from "ethers";
const { ethers } = require("ethers");

// You should replace these values with your actual data
const tokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const providerURL = "https://eth.llamarpc.com"; // For example, Infura or Alchemy URL
const walletAddress = "0x46340b20830761efd32832A74d7169B29FEB9758"; // Address you want to check the balance of

// Standard ERC-20 ABI for functions we're going to use
const erc20Abi = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

// Setting up a provider and the token contract
const provider = new ethers.JsonRpcProvider(providerURL);
const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

async function fetchTokenDetails() {
  try {
    // Fetch total supply of the token
    const totalSupply = await tokenContract.totalSupply();
    const decimals = await tokenContract.decimals();
    console.log(`Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`); // Assuming 18 decimal places

    // Fetch balance of a specific address
    const balance = await tokenContract.balanceOf(walletAddress);
    console.log(
      `Balance of ${walletAddress}: ${ethers.formatUnits(balance, decimals)}`
    ); // Assuming 18 decimal places
  } catch (error) {
    console.error(`Failed to fetch token details: ${error}`);
  }
}
// Connect and get reference to mongodb instance
// let db;

// (async function () {
//   db = await connectDB();
// })();

// Init express app
const app = express();

// Config Express-Middleware
configureMiddleware(app);

// Set-up Routes
configureRoutes(app);

// Start server and listen for connections
const server = app.listen(config.PORT, () => {
  console.log(
    `Server is running in ${config.NODE_ENV} mode and is listening on port ${config.PORT}...`
  );
  console.log(`getting token details...`);

  fetchTokenDetails();
});

//  Handle real-time poker game logic with socket.io
const io = socketio(server);

io.on("connect", (socket) => gameSocket.init(socket, io));

// Error handling - close server
process.on("unhandledRejection", (err) => {
  // db.disconnect();

  console.error(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
