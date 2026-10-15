"use client";

import React, { useState } from "react";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import HamX from "./HamX";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    setIsAccountOpen(false);
    setIsOpen(false);
    await signOut();
  };

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
          {user ? (
            <div className="relative flex items-center">
              <button
                aria-label="Account"
                aria-expanded={isAccountOpen}
                onClick={() => setIsAccountOpen((open) => !open)}
                className="text-white transition-colors"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white text-zinc-900 border border-zinc-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-zinc-100">
                    {profile?.full_name && (
                      <p className="text-sm font-medium line-clamp-1">
                        {profile.full_name}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-b-md transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Sign in"
              aria-disabled={isLoading}
              className={`hover:text-white transition-colors ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          )}

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
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-left hover:text-white transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="hover:text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
