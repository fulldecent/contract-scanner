// node index.mjs
//
// Search blockchain for NFT contracts and save to database

import {ethers} from "ethers";
import Database from "better-sqlite3";

const infuraKey = "9d13" + "c078440c47f6bcf57329d6086c47";
const provider = new ethers.providers.InfuraProvider("mainnet", infuraKey);
const database = new Database("database.db");
database.exec("CREATE TABLE IF NOT EXISTS processed_blocks (number)");
database.exec("CREATE TABLE IF NOT EXISTS contracts (address, is_erc721)");

// Print out current block
let blockToSearch = await provider.getBlockNumber();

// ERC-165 ABI
const erc165Abi = ["function supportsInterface(bytes4 interfaceId) external view returns (bool)"];

// ERC-721 ID
const erc721Id = "0x80ac58cd";

// Search in blocks
while (blockToSearch > 0) {
    console.log("Searching block " + blockToSearch);

    // Check if we already processed this block
    const processedBlock = database.prepare("SELECT 1 FROM processed_blocks WHERE number = ?").get(blockToSearch);
    if (processedBlock) {
        console.log("Block already processed");
        blockToSearch--;
        continue;
    }

    // Get all transfer logs in this block, sleep one second for rate limit
    const logs = await provider.getLogs({
        fromBlock: blockToSearch,
        toBlock: blockToSearch,
        address: null,
        topics: [ethers.utils.id("Transfer(address,address,uint256)")],
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get distinct contract addresses
    const contractAddresses = logs.map((log) => log.address).filter((value, index, self) => self.indexOf(value) === index);

    // Check if any of these contracts are ERC-721
    for (const contractAddress of contractAddresses) {
        // Check if we already processed this contract
        const processedContract = database.prepare("SELECT 1 FROM contracts WHERE address = ?").get(contractAddress);
        if (processedContract) {
            console.log("Contract " + contractAddress + " already checked");
            continue;
        }

        // Use ERC-165 to check if contract is ERC-721, try/catch in case contract does not support ERC-165
        const contract = new ethers.Contract(contractAddress, erc165Abi, provider);
        let isErc721 = 0;
        try {
            isErc721 = await contract.supportsInterface(erc721Id) ? 1 : 0;
        } catch (error) {
            // Contract does not support ERC-165
        }

        // Save to database
        database.prepare("INSERT INTO contracts (address, is_erc721) VALUES (?, ?)").run(contractAddress, isErc721);
        console.log("Contract " + contractAddress + " " + (isErc721 ? "✅" : "❌"));
    }

    // Save block to database
    database.prepare("INSERT INTO processed_blocks (number) VALUES (?)").run(blockToSearch);
    console.log("Block " + blockToSearch + " processed\n");

    // Go to next block
    blockToSearch--;
}