// app/utils/closeTokenAccount.ts
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createCloseAccountInstruction } from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export async function closeTokenAccountBrowser(connection: Connection, wallet: WalletContextState, tokenAccountPubkey: string, destinationPubkey: PublicKey) {
  if (!wallet || !wallet.publicKey) throw new Error("Wallet not connected");
  const tokenAcct = new PublicKey(tokenAccountPubkey);
  const ix = createCloseAccountInstruction(tokenAcct, destinationPubkey, wallet.publicKey!, []);
  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey!;
  if (wallet.sendTransaction) {
    const sig = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }
  if (wallet.signTransaction) {
    const signed = await wallet.signTransaction(tx);
    const raw = signed.serialize();
    const sig = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  }
  throw new Error("Wallet adapter missing sendTransaction/signTransaction");
}
