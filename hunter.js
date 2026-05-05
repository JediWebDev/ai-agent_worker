require('dotenv').config();
const { exec } = require('child_process');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendToDiscord(tokenName, contractAddress, auditResult) {
    if (!WEBHOOK_URL) {
        console.error("Missing Webhook URL in .env file");
        return;
    }

    const payload = {
        username: "Sentinel Prime",
        embeds: [{
            title: `🚨 TRENCH TARGET ACQUIRED: ${tokenName} 🚨`,
            description: `**Contract:** \`${contractAddress}\`\n\n${auditResult}`,
            color: 0xff0000,
            footer: { text: "Automated Web3 Security Sweep | Terminal Zero Exclusive" }
        }]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("🟢 Discord transmission successful.");
    } catch (error) {
        console.error("🔴 Discord transmission failed:", error.message);
    }
}

async function hunt() {
    console.log("\n🐺 Hunter waking up. Scanning the trenches...");

    try {
        const keywords = ['pepe', 'doge', 'cat', 'ai', 'inu', 'moon', 'trump', 'based', 'sonic'];
        const searchTerm = keywords[Math.floor(Math.random() * keywords.length)];
        
        console.log(`🔍 Searching DexScreener for keyword: ${searchTerm}`);

        const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${searchTerm}`);
        const data = await response.json();
        const ethPairs = data.pairs.filter(pair => pair.chainId === 'ethereum');

        if (ethPairs.length === 0) {
            console.log(`No Ethereum targets found for "${searchTerm}". Going back to sleep.`);
            return;
        }

        const randomPair = ethPairs[Math.floor(Math.random() * ethPairs.length)];
        const targetToken = randomPair.baseToken.address;
        const tokenName = randomPair.baseToken.name;

        console.log(`🎯 Target acquired: ${tokenName} (${targetToken})`);
        console.log("🧠 Engaging neural cortex for automated audit...");

        exec(`python auditor.py ${targetToken}`, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
                return;
            }

            console.log(`\n=== Raw Audit Complete for ${tokenName} ===`);
            
            // Regex filter to extract ONLY the strict 3-line verdict from Llama 3
            const cleanAuditMatch = stdout.match(/\*\*Verdict:\*\*[\s\S]*?\*\*Risk Level:\*\*.*/i);
            const finalOutput = cleanAuditMatch 
                ? cleanAuditMatch[0] 
                : "**Verdict:** Error\n**The Trap:** Neural cortex failed to format output.\n**Risk Level:** Unknown";

            console.log(finalOutput);

            // Execute Discord-Only Broadcast
            await sendToDiscord(tokenName, targetToken, finalOutput);
        });

    } catch (error) {
        console.error("Hunter encountered a critical error:", error.message);
    }
}

// Fire once immediately on startup
hunt();

// Loop every 10 minutes for aggressive hunting
setInterval(hunt, 10 * 60 * 1000);