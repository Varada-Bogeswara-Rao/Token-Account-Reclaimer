// app/utils/createEmptyAta.ts
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export async function createEmptyAtaBrowser(connection: Connection, wallet: WalletContextState, mint: string | PublicKey, ownerPubkey: PublicKey): Promise<string> {
  if (!wallet || !wallet.publicKey) throw new Error("Wallet not connected");
  const mintPub: PublicKey = typeof mint === "string" ? new PublicKey(mint) : mint;
  const ata = await getAssociatedTokenAddress(mintPub, ownerPubkey);
  const acct = await connection.getAccountInfo(ata);
  if (acct) return ata.toBase58();

  const ix = createAssociatedTokenAccountInstruction(wallet.publicKey!, ata, ownerPubkey, mintPub, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey!;
  if (wallet.sendTransaction) {
    const sig = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    return ata.toBase58();
  }
  if (wallet.signTransaction) {
    const signed = await wallet.signTransaction(tx);
    const raw = signed.serialize();
    const sig = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(sig, "confirmed");
    return ata.toBase58();
  }
  throw new Error("Wallet adapter missing sendTransaction/signTransaction");
}
