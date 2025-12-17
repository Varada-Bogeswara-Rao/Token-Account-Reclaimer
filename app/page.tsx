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
import { DottedSurface } from "@/components/ui/dotted-surface";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Wallet, Search, Coins, AlertCircle, CheckCircle2 } from "lucide-react";

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
      // Logic missing in original snippet for actual transfer? 
      // Assuming handleScan is a placeholder for post-action refresh
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-hidden font-sans selection:bg-blue-500/30">
      <DottedSurface className="fixed inset-0 z-0 pointer-events-none opacity-50" />

      {/* Ambient Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow flex flex-col items-center p-6 space-y-8 container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mt-8"
          >
            <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-full mb-4 ring-1 ring-blue-500/20">
              <Wallet className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-300">Solana Account Manager</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Sol Sweep
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Scan your wallet for unused SPL token accounts and recover locked SOL rent with a single click.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-4 w-full"
          >
            <motion.button
              variants={itemVariants}
              onClick={handleScan}
              disabled={!connected || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-center gap-2 relative z-10">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>{loading ? "Scanning..." : "Scan Unused Accounts"}</span>
              </div>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={handleCreateTestAta}
              disabled={!connected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              <span>Create Test ATA</span>
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {msg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {msg}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  All Token Accounts
                </h2>
                <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                  {inspected.length} found
                </span>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[300px] max-h-[500px] flex flex-col">
                <div className="overflow-auto p-2 space-y-2 custom-scrollbar flex-grow">
                  {inspected.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 min-h-[200px]">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No accounts scanned yet</p>
                    </div>
                  ) : (
                    inspected.map((a, i) => (
                      <motion.div
                        key={a.pubkey}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex flex-col sm:flex-row justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="overflow-hidden">
                          <div className="font-mono text-sm text-zinc-300 truncate" title={a.pubkey}>{a.pubkey}</div>
                          <div className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-1">
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">MINT</span>
                            {a.mint}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-medium text-white/90">{a.uiAmountString ?? a.uiAmount ?? a.rawAmount ?? "0"}</div>
                          <div className="text-xs text-zinc-500 font-mono">{(a.lamports / 1e9).toFixed(5)} SOL rent</div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-yellow-500" />
                  Zero-Balance Accounts
                </h2>
                <span className="text-xs font-mono bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">
                  {results.length} eligible
                </span>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[300px] max-h-[500px] flex flex-col">
                <div className="overflow-auto p-2 space-y-2 custom-scrollbar flex-grow">
                  {results.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 min-h-[200px]">
                      <CheckCircle2 className="w-8 h-8 opacity-20" />
                      <p>No cleanable accounts found</p>
                    </div>
                  ) : (
                    results.map((acc, i) => (
                      <motion.div
                        key={acc.pubkey}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-4 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all group"
                      >
                        <div className="w-full sm:w-auto overflow-hidden">
                          <div className="font-mono text-sm text-zinc-200 truncate" title={acc.pubkey}>{acc.pubkey}</div>
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">{acc.isATA ? "ATA" : "NON-ATA"}</span>
                            <span className="truncate max-w-[150px]">{acc.mint}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-sm font-mono text-yellow-500/80 bg-yellow-500/5 px-2 py-1 rounded border border-yellow-500/10">
                            +{acc.rentSol.toFixed(6)} SOL
                          </div>
                          <button
                            onClick={() => handleCloseOnly(acc)}
                            className="px-3 py-1.5 bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-500 border border-yellow-600/20 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                          >
                            Reclaim
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
