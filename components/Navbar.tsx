"use client";

import React, { useState } from "react";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import HamX from "./HamX";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white px-4 sm:px-8 py-4 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-lg font-medium tracking-wide hover:opacity-80 transition-opacity"
          >
            Eldics Store
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-normal text-zinc-300">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>

        {/* Action Icons & Mobile Menu Toggle */}
        <div className="flex items-center space-x-5 text-zinc-300">
          {/* Search Icon */}
          <button
            aria-label="Search"
            className="hover:text-white transition-colors"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Wishlist Icon */}
          <button
            aria-label="Wishlist"
            className="hidden md:block hover:text-white transition-colors"
          >
            <Heart className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Shopping Cart Icon */}
          <button
            aria-label="Cart"
            className="hover:text-white transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* User Profile Icon */}
          <button
            aria-label="Account"
            className="hover:text-white transition-colors"
          >
            <User className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Hamburger Icon - Hidden on desktop (md and wider), visible on mobile */}
          <div className="md:hidden">
            <HamX isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col space-y-4 pt-4 pb-2 text-sm font-normal text-zinc-300 border-t border-zinc-800 mt-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
