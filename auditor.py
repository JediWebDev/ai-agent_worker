import os
import sys
import requests
import ollama

# Paste your Etherscan API key here
ETHERSCAN_API_KEY = "4GZA25SXQD2TBDY75QIHXNKWU3IYFMVXWK"

def fetch_contract_code(address):
    """Fetches the verified source code from Etherscan V2."""
    # Updated to V2 endpoint with chainid=1 for Ethereum
    url = f"https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&address={address}&apikey={ETHERSCAN_API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data['status'] == '1':
            source_code = data['result'][0]['SourceCode']
            if source_code == "":
                return "Error: Contract source code is not verified on Etherscan."
            return source_code
        else:
            return f"Error fetching contract: {data.get('result', 'Unknown error')}"
    except Exception as e:
        return f"API Error: {str(e)}"

def audit_contract(contract_code):
    """Sends the code to the local Llama 3 model."""
    system_prompt = """
    You are a highly precise Web3 security auditor. You must accurately classify smart contracts based on actual logic, not assumptions.
    
    STRICT RULES:
    1. Do NOT flag standard ERC-20 setup logic (e.g., initializing total supply with decimals) as a trap. This is normal and SAFE.
    2. If a contract allows the owner to arbitrarily blacklist addresses from transferring, it is a HONEYPOT. The Verdict MUST be SCAM. The Risk Level MUST be Extreme.
    3. If a contract imposes a massive fee (e.g., 99%) on transfers for non-owners, it is a hidden tax honeypot. The Verdict MUST be SCAM. The Risk Level MUST be Extreme.
    4. You are forbidden from using "WARNING" or "Medium" for a honeypot. A honeypot is ALWAYS a SCAM.
    5. If there are no transfer restrictions, blacklists, or malicious taxes, the Verdict MUST be SAFE.
    
    Output exactly this format and absolutely no other text:
    **Verdict:** [SAFE or SCAM]
    **The Trap:** [Explain exactly how the malicious logic works in 1-2 sentences. If safe, state "None detected".]
    **Risk Level:** [Low or Extreme]
    """

    response = ollama.chat(model='llama3', messages=[
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': f"Audit this code:\n\n{contract_code}\n\nCRITICAL REMINDER: You MUST output ONLY the strict 3-line format (**Verdict:**, **The Trap:**, **Risk Level:**). Do not include any introductory text, disclaimers, or recommendations. Output nothing else."}
    ])
    
    return response['message']['content']

if __name__ == "__main__":
    # Check if Node.js passed a contract address as an argument
    if len(sys.argv) > 1:
        target_address = sys.argv[1]
        
        # 1. Fetch the live code
        code = fetch_contract_code(target_address)
        
        if "Error" in code:
            print(code)
        else:
            # 2. Run the audit and print for Node.js to capture
            result = audit_contract(code)
            print(result)
    else:
        print("Error: No contract address provided to the neural cortex.")