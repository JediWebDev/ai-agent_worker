require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { exec } = require('child_process');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Connect to Solana Devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const AGENT_WALLET = new PublicKey(process.env.AGENT_WALLET);

client.once('clientReady', () => {
    console.log(`🤖 Agent online as ${client.user.tag}`);
    console.log(`💼 Monitoring Devnet Wallet: ${AGENT_WALLET.toBase58()}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!audit')) {
        // 1. Extract the contract address from the message
        // This splits the message by spaces and ignores extra spaces
        const args = message.content.trim().split(/ +/);
        
        // 2. Enforce the required format
        if (args.length < 2) {
            return message.reply("⚠️ Please provide a contract address. Usage: `!audit 0xYourContractAddressHere`");
        }
        
        const contractAddress = args[1];

        // 3. Update the prompt to show the target address
        await message.reply(`Awaiting funds. Please send **0.1 SOL** (Devnet) to \`${AGENT_WALLET.toBase58()}\` to begin the audit for target: \`${contractAddress}\`.`);

        const initialBalance = await connection.getBalance(AGENT_WALLET);

        const subscriptionId = connection.onAccountChange(
            AGENT_WALLET,
            (updatedAccountInfo) => {
                const newBalance = updatedAccountInfo.lamports;
                
                if (newBalance > initialBalance) {
                    connection.removeAccountChangeListener(subscriptionId);
                    
                    message.channel.send(`✅ Payment verified on-chain. Neural cortex engaged. Fetching code for \`${contractAddress}\`...`);

                    // 4. Inject the contract address as an argument to the Python script
                    exec(`python auditor.py ${contractAddress}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Execution error: ${error.message}`);
                            message.channel.send("Critical failure in the neural cortex.");
                            return;
                        }
                        message.channel.send(`**Audit Complete:**\n${stdout}`);
                    });
                }
            },
            'confirmed'
        );
        
        setTimeout(() => {
            connection.removeAccountChangeListener(subscriptionId);
        }, 5 * 60 * 1000); 
    }
});

client.login(process.env.DISCORD_TOKEN);