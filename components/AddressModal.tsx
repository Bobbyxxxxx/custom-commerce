"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { AddressParams } from "@/shared.types";
import AddressForm from "./AddressForm";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: AddressParams[];
  isLoading: boolean;
  hasError: boolean;
  selectedAddressId: string | null;
  onSelect: (address: AddressParams) => void;
  onAddressSaved: (address: AddressParams) => void;
}

export const formatAddress = (address: AddressParams) =>
  [address.address, address.city, address.state]
    .filter(Boolean)
    .join(", ");

const AddressModal = ({
  isOpen,
  onClose,
  addresses,
  isLoading,
  hasError,
  selectedAddressId,
  onSelect,
  onAddressSaved,
}: AddressModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Keep the native dialog in sync with the isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleClose = () => {
    setIsAddingNew(false);
    onClose();
  };

  // Jump straight to the form when there is nothing to pick from
  const showForm = isAddingNew || (!isLoading && !hasError && addresses.length === 0);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        // Clicking the backdrop closes the modal
        if (e.target === e.currentTarget) handleClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90vh] rounded-md p-0 backdrop:bg-black/50"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-zinc-900">
            {showForm ? "Add a delivery address" : "Select delivery address"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showForm ? (
          <AddressForm
            onSaved={(address) => {
              setIsAddingNew(false);
              onAddressSaved(address);
            }}
            onCancel={() =>
              addresses.length > 0 ? setIsAddingNew(false) : handleClose()
            }
          />
        ) : (
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-xs text-zinc-400">Loading addresses...</p>
            ) : hasError ? (
              <p className="text-xs text-red-600">
                We couldn&apos;t load your saved addresses. You can still add a
                new one.
              </p>
            ) : (
              <div className="space-y-2" role="radiogroup">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;
                  return (
                    <button
                      key={address.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSelect(address)}
                      className={`w-full text-left p-3 border rounded-md transition-colors ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span className="block text-sm text-zinc-900">
                        {formatAddress(address)}
                      </span>
                      {address.additional_info && (
                        <span className="block text-xs text-zinc-500 mt-0.5">
                          {address.additional_info}
                        </span>
                      )}
                      {address.phone && (
                        <span className="block text-xs text-zinc-500 mt-0.5">
                          {address.phone}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add new address
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default AddressModal;
