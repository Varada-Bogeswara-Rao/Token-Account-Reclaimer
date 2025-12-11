// app/utils/inspectTokenAccounts.ts
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export interface ParsedTokenAccountInspect {
  pubkey: string;
  mint: string;
  lamports: number;
  rawAmount: string | null;
  decimals: number | null;
  uiAmount: number | null;
  uiAmountString: string | null;
}

export async function inspectTokenAccounts(connection: Connection, owner: PublicKey): Promise<ParsedTokenAccountInspect[]> {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID });
  const out: ParsedTokenAccountInspect[] = [];

  for (const { pubkey, account } of resp.value) {
    const parsed = (account.data as any)?.parsed;
    const info = parsed?.info;
    out.push({
      pubkey: pubkey.toString(),
      mint: info?.mint ?? "unknown",
      lamports: account.lamports,
      rawAmount: info?.tokenAmount?.amount ?? null,
      decimals: info?.tokenAmount?.decimals ?? null,
      uiAmount: info?.tokenAmount?.uiAmount ?? null,
      uiAmountString: info?.tokenAmount?.uiAmountString ?? null,
    });
  }

  return out;
}
