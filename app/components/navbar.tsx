// app/components/navbar.tsx
import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";

const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
    { ssr: false }
);

export default function Navbar() {
    return (
        <nav className="w-full h-16 flex items-center justify-between px-6 border-b border-border/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                    SolSweep
                </Link>
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    About
                </Link>
            </div>
            <div>
                <WalletMultiButton style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', height: '40px', fontSize: '14px', borderRadius: '8px' }} />
            </div>
        </nav>
    );
}
