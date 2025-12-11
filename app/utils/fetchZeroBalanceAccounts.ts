// app/utils/fetchZeroBalanceAccounts.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

export interface ZeroBalanceAccount {
    pubkey: string;
    mint: string;
    rentSol: number;
    isATA: boolean;
}

export async function fetchZeroBalanceAccounts(connection: Connection, owner: PublicKey): Promise<ZeroBalanceAccount[]> {
    console.log("[fetchZeroBalanceAccounts] owner:", owner?.toBase58?.() ?? owner);
    const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
    console.log("[fetchZeroBalanceAccounts] RPC returned token accounts count:", resp?.value?.length ?? 0);
    const accounts: ZeroBalanceAccount[] = [];

    for (const { pubkey, account } of resp.value) {
        try {
            const lamports = account.lamports ?? 0;
            const parsed = (account.data as any)?.parsed;
            const parsedType = parsed?.type;
            const info = parsed?.info;
            const rawAmount = info?.tokenAmount?.amount ?? null;
            const mint = info?.mint ?? "unknown-mint";

            if (!parsed || parsedType !== "account") {
                continue;
            }
            if (rawAmount === null) continue;
            if (rawAmount !== "0") continue; // only zero-balance accounts

            const mintPub = new PublicKey(mint);
            const ata = await getAssociatedTokenAddress(mintPub, owner);
            const isATA = ata.equals(pubkey);

            accounts.push({
                pubkey: pubkey.toString(),
                mint: mintPub.toString(),
                rentSol: lamports / LAMPORTS_PER_SOL,
                isATA,
            });
        } catch (err) {
            console.error("[fetchZeroBalanceAccounts] error processing account", (pubkey as any)?.toString?.(), err);
            continue;
        }
    }

    console.log("[fetchZeroBalanceAccounts] final results length:", accounts.length);
    return accounts;
}
