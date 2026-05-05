const { Keypair } = require('@solana/web3.js');

const newWallet = Keypair.generate();

console.log("=== AGENT WALLET GENERATED ===");
console.log(`Public Key (Address): ${newWallet.publicKey.toBase58()}`);
console.log(`Secret Key (SAVE THIS LATER): [${newWallet.secretKey.toString()}]`);