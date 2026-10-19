"use client";

import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { LocateFixed } from "lucide-react";
import { AddressParams } from "@/shared.types";
import { createAddress } from "@/utils/actions/address.action";
import {
  addressValidationSchema,
  type AddressInput,
} from "@/utils/zodvalidations/form-validations";

interface AddressFormProps {
  onSaved: (address: AddressParams) => void;
  onCancel: () => void;
}

// Subset of the OpenStreetMap Nominatim reverse-geocoding response we read
interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
}

const EMPTY_FORM: AddressInput = {
  address: "",
  city: "",
  state: "",
  additional_info: "",
  phone: "",
  latitude: null,
  longitude: null,
};

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
    }),
  );

const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<NominatimAddress | null> => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
  }).toString();

  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!response.ok) return null;
  const result: { address?: NominatimAddress } = await response.json();
  return result.address ?? null;
};

const geolocationErrorMessage = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. You can type your address instead.";
    case error.TIMEOUT:
      return "Finding your location took too long. Please try again.";
    default:
      return "We couldn't find your location. Please type your address.";
  }
};

const inputClassName =
  "w-full px-3 py-2.5 text-sm text-zinc-900 border border-zinc-200 rounded-md outline-none focus:border-zinc-900 transition-colors";

const AddressForm = ({ onSaved, onCancel }: AddressFormProps) => {
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const updateField =
    (field: keyof AddressInput) =>
    (
      e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    ) =>
      setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleUseCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser doesn't support location access.");
      return;
    }

    setError(null);
    setIsLocating(true);

    try {
      const { coords } = await getCurrentPosition();
      const { latitude, longitude } = coords;
      setForm((current) => ({ ...current, latitude, longitude }));

      const place = await reverseGeocode(latitude, longitude).catch(() => null);
      if (!place) {
        toast(
          "We saved your coordinates but couldn't look up the street. Please type it in.",
        );
        return;
      }

      // Only fill fields we found something for, and leave the rest for the user to edit
      const street = [place.house_number, place.road].filter(Boolean).join(" ");
      const area = place.neighbourhood ?? place.suburb;
      const city = place.city ?? place.town ?? place.village ?? place.county;

      setForm((current) => ({
        ...current,
        address:
          [street, area].filter(Boolean).join(", ") || current.address,
        city: city ?? current.city,
        state: place.state ?? current.state,
      }));
      toast.success("Location found. Check the details and add anything missing.");
    } catch (geoError) {
      toast.error(
        geoError instanceof GeolocationPositionError
          ? geolocationErrorMessage(geoError)
          : "We couldn't find your location. Please type your address.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = addressValidationSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    startSaving(async () => {
      const result = await createAddress(parsed.data);
      if (result.error || !result.address) {
        setError(result.error ?? "We couldn't save your address.");
        return;
      }
      toast.success("Address saved");
      onSaved(result.address);
    });
  };

  const isBusy = isLocating || isSaving;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 border border-zinc-200 hover:border-zinc-400 rounded-md transition-colors disabled:opacity-50"
      >
        <LocateFixed className="w-4 h-4" />
        {isLocating ? "Finding your location..." : "Use Current Location"}
      </button>
      {form.latitude !== null && form.longitude !== null && (
        <p className="text-[11px] text-zinc-400 -mt-2">
          Pinned at {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
        </p>
      )}

      <div>
        <label
          htmlFor="address"
          className="block text-xs font-medium text-zinc-500 mb-2"
        >
          Street address
        </label>
        <input
          id="address"
          autoComplete="street-address"
          required
          value={form.address}
          onChange={updateField("address")}
          placeholder="12 Adeola Odeku Street"
          className={inputClassName}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-xs font-medium text-zinc-500 mb-2"
          >
            City
          </label>
          <input
            id="city"
            autoComplete="address-level2"
            required
            value={form.city}
            onChange={updateField("city")}
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="block text-xs font-medium text-zinc-500 mb-2"
          >
            State
          </label>
          <input
            id="state"
            autoComplete="address-level1"
            required
            value={form.state}
            onChange={updateField("state")}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-medium text-zinc-500 mb-2"
        >
          Phone number <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={updateField("phone")}
          placeholder="+234 801 234 5678"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="additional_info"
          className="block text-xs font-medium text-zinc-500 mb-2"
        >
          Extra details <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="additional_info"
          rows={2}
          value={form.additional_info}
          onChange={updateField("additional_info")}
          placeholder="Apartment number, nearest landmark..."
          className={`${inputClassName} resize-none`}
        />
      </div>

      {error && (
        <p aria-live="polite" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-black rounded-md transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save address"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
