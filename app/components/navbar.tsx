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
        <nav className="w-full h-14 flex items-center justify-between px-6 bg-gray-900 text-white">
            <div className="flex items-center gap-4">
                <Link href="/">SolSweep</Link>
                <Link href="/about">About</Link>
            </div>
            <div>
                <WalletMultiButton />
            </div>
        </nav>
    );
}
