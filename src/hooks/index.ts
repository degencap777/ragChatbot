import { WalletContextState } from '@solana/wallet-adapter-react';
import {
    Connection,
    PublicKey,
    VersionedTransaction,
} from '@solana/web3.js'

// @ts-ignore
import { Metaplex } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { AccountLayout, getMint } from "@solana/spl-token";

export const getBuyTxWithJupiter = async (wallet: WalletContextState, baseMint: PublicKey, amount: number, connection: Connection) => {
    try {
        const lamports = Math.floor(amount * 10 ** 9)
        const quoteResponse = await (
            await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${baseMint.toBase58()}&amount=${lamports}&slippageBps=100`
            )
        ).json();
        // get serialized transactions for the swap
        const { swapTransaction } = await (
            await fetch("https://quote-api.jup.ag/v6/swap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey: wallet.publicKey!.toString(),
                    wrapAndUnwrapSol: true,
                    dynamicComputeUnitLimit: true,
                    prioritizationFeeLamports: 52000
                }),
            })
        ).json();
        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        // sign the transaction
        //   transaction.sign([wallet]);
        console.log("simulation => ", await connection.simulateTransaction(transaction))
        console.log("transaction", transaction)
        await wallet.signTransaction!(transaction);
        return transaction
    } catch (error) {
        console.log("Failed to get buy transaction")
        return null
    }
};

export async function getTokenData(mint: string, connection: Connection): Promise<any> {
    const metaplex = Metaplex.make(connection);
    const mintAddress = new PublicKey(mint);
    let tokenName;
    let tokenSymbol;
    const metadataAccount = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: mintAddress });
    const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);
    if (metadataAccountInfo) {
        const token: any = await metaplex.nfts().findByMint({ mintAddress: mintAddress });
        tokenName = token.name;
        tokenSymbol = token.symbol;
        // tokenLogo = token.json.image? token.json.image: "";
    }
    return {
        name: tokenName,
        symbol: tokenSymbol,
        // uri: tokenLogo
    }
}

export const getMyTokens = async (walletPubKey: PublicKey, connection: Connection) => {
    console.log("calling getMyTokens...");
    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubKey, { programId: TOKEN_PROGRAM_ID });
        const tokensData = await Promise.all(tokenAccounts.value.map(async (account) => {
            const accountInfo = AccountLayout.decode(account.account.data);
            const mintAddress = new PublicKey(accountInfo.mint);
            let price: number;
            const mintInfo = await getMint(connection, mintAddress);
            // const tokenInfo = await getTokenInfo(connection, mintAddress)
            const tokenInfo = await getTokenData(accountInfo.mint.toBase58(), connection)
            // Exclude tokens with a supply of 1 (NFTs)
            if (mintInfo.supply.toString() === "1") {
                return null;
            }
            // const res = await axios.get(`https://price.jup.ag/v6/price?ids=${walletPubKey.toBase58()}&vsToken=So11111111111111111111111111111111111111112`)
            // console.log("res------------------------>", res.data.data)
            const response = await fetch(
                `https://price.jup.ag/v6/price?ids=${mintAddress.toBase58()}&vsToken=So11111111111111111111111111111111111111112`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data: any = await response.json();
            if (Object.keys(data.data).length === 0) {
                price = 0;
            } else {
                price = data.data[mintAddress.toBase58()].price;
            }
            return {
                mintAddress: accountInfo.mint.toBase58(),
                decimals: mintInfo.decimals,
                supply: parseInt((BigInt(mintInfo.supply) / BigInt(10 ** mintInfo.decimals)).toString()), // Assuming supply is a BigInt, convert it to string for better handling in JS.
                balance: parseInt((BigInt(accountInfo.amount) / BigInt(10 ** mintInfo.decimals)).toString()), // Same as supply, handle big numbers as strings.
                // @ts-ignore
                name: tokenInfo.name,
                // @ts-ignore
                symbol: tokenInfo.symbol,
                price: price
            };
        }));
        let txt = '';
        const tokens = tokensData.filter(token => token !== null);
        for (let i = 0; i < (tokens?.length > 15 ? 15 : tokens?.length); i++) {
            txt += `
            CA: ${tokens[i].mintAddress}
            name: ${tokens[i].name}
            symbol: $${tokens[i].symbol}
            decimals: ${tokens[i].decimals}
            supply: ${tokens[i].supply}
            balance: ${tokens[i].balance}
            value: ${tokens[i].price * tokens[i].balance}
            `
        }
        return txt
    } catch (error) {
        console.error("Error fetching tokens:", error);
        return "Can't fetch wallet assets, there is something's wrong."
    }
};