// app/page.tsx
"use client";
import React, { useState } from "react";
import Navbar from "./components/navbar";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { fetchZeroBalanceAccounts } from "./utils/fetchZeroBalanceAccounts";
import { inspectTokenAccounts } from "./utils/inspectTokenAccounts";
import { createEmptyAtaBrowser } from "./utils/createEmptyAta";

import { closeTokenAccountBrowser } from "./utils/closeTokenAccount";



export default function HomePage() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const wallet = { publicKey, signTransaction, sendTransaction } as any;

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [inspected, setInspected] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TEST_MINT = "4NF1qt3NqCN6NQHd2BY8GHFg4p9uLubX8oszuYyoUx6u";

  const handleScan = async () => {
    setError(null);
    if (!connected || !publicKey) {
      setError("Connect wallet first.");
      return;
    }
    setLoading(true);
    try {
      const z = await fetchZeroBalanceAccounts(connection, publicKey as PublicKey);
      setResults(z);
      // also inspect all token accounts to show balances
      const all = await inspectTokenAccounts(connection, publicKey as PublicKey);
      setInspected(all);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };





  const handleCreateTestAta = async () => {
    setError(null);
    setMsg(null);
    if (!connected || !publicKey) return setError("Connect wallet first.");
    try {
      const ata = await createEmptyAtaBrowser(connection, wallet, TEST_MINT, publicKey as PublicKey);
      setMsg(`Created ATA: ${ata}`);
      await handleScan();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const handleSweep = async (acct: any) => {
    setError(null);
    setMsg(null);
    if (!connected || !publicKey) return setError("Connect wallet first.");
    try {
      // find parsed info for this pubkey to get rawAmount and decimals
      const parsed = inspected.find((i) => i.pubkey === acct.pubkey);
      if (!parsed) throw new Error("Parsed account info not found");
      const raw = parsed.rawAmount ?? "0";
      const decimals = parsed.decimals ?? 0;
      // transfer all to self and close
      await handleScan();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  const handleCloseOnly = async (acct: any) => {
    setError(null);
    setMsg(null);
    if (!connected || !publicKey) return setError("Connect wallet first.");
    try {
      const sig = await closeTokenAccountBrowser(connection, wallet, acct.pubkey, publicKey as PublicKey);
      setMsg(`Closed ${acct.pubkey} - sig ${sig}`);
      await handleScan();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-[70vh] p-6 space-y-4">
        <h1 className="text-3xl font-bold mt-6">Sol Sweep</h1>
        <p>Scan your wallet for unused SPL token accounts and recover locked SOL rent.</p>

        <div className="flex gap-3">
          <button onClick={handleScan} disabled={!connected || loading} className="px-6 py-2 bg-blue-600 text-white rounded">
            {loading ? "Scanning..." : "Scan Unused Accounts"}
          </button>
          <button onClick={handleCreateTestAta} disabled={!connected} className="px-4 py-2 bg-green-600 text-white rounded">
            Create test ATA (empty)
          </button>
        </div>

        {msg && <div className="text-green-400">{msg}</div>}
        {error && <div className="text-red-400">{error}</div>}

        <div className="w-full max-w-3xl mt-4">
          <h2 className="font-semibold">All Token Accounts (parsed)</h2>
          <div className="bg-gray-800 p-3 rounded max-h-48 overflow-auto">
            {inspected.map((a) => (
              <div key={a.pubkey} className="flex justify-between gap-4 text-sm text-gray-200 border-b border-gray-700 py-1">
                <div>
                  <div className="font-mono">{a.pubkey}</div>
                  <div className="text-xs text-gray-400">mint: {a.mint}</div>
                </div>
                <div className="text-right">
                  <div>{a.uiAmountString ?? a.uiAmount ?? a.rawAmount ?? "0"}</div>
                  <div className="text-xs text-gray-500">{a.lamports / 1e9} SOL (acct lamports)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-3xl mt-4">
          <h2 className="font-semibold">Zero-balance token accounts (eligible to close)</h2>
          <div className="bg-gray-800 p-3 rounded max-h-48 overflow-auto">
            {results.length === 0 && <div className="text-gray-400">No unused accounts found.</div>}
            {results.map((acc) => (
              <div key={acc.pubkey} className="flex items-center justify-between gap-4 text-sm text-gray-200 border-b border-gray-700 py-2">
                <div>
                  <div className="font-mono">{acc.pubkey}</div>
                  <div className="text-xs text-gray-400">mint: {acc.mint} — ATA: {acc.isATA ? "Yes" : "No"}</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs text-gray-300">{acc.rentSol.toFixed(6)} SOL</div>
                  <button onClick={() => handleCloseOnly(acc)} className="px-3 py-1 bg-yellow-600 rounded">Close (reclaim)</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
