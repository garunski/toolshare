"use client";

import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

interface AttributeOption {
  value: string;
  label: string;
}

interface Props {
  options: AttributeOption[];
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  placeholder?: string;
  maxSelections?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  error,
  placeholder,
  maxSelections,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );
  const availableOptions = filteredOptions.filter(
    (option) => !value.includes(option.value),
  );

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max reached
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`min-h-[40px] cursor-pointer rounded-md border px-3 py-2 transition-colors ${
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">
                {placeholder || "Select options..."}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    color="blue"
                    className="flex items-center space-x-1"
                  >
                    <span>{option.label}</span>
                    <button
                      onClick={(e) => handleRemoveOption(option.value, e)}
                      className="ml-1 rounded-full p-0.5 hover:bg-blue-300"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedOptions.length > 0 && (
              <Button
                plain
                onClick={handleClearAll}
                className="h-6 px-2 text-sm"
              >
                Clear
              </Button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {maxSelections && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length} / {maxSelections} selected
        </p>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="border-b p-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {availableOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm
                  ? "No options match your search"
                  : "No more options available"}
              </div>
            ) : (
              availableOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-100"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                  {maxSelections && value.length >= maxSelections && (
                    <span className="text-xs text-gray-400">Max reached</span>
                  )}
                </div>
              ))
            )}
          </div>

          {selectedOptions.length > 0 && (
            <div className="border-t bg-gray-50 p-2">
              <div className="mb-1 text-xs text-gray-600">Selected:</div>
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 3).map((option) => (
                  <Badge key={option.value} color="blue">
                    {option.label}
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge color="blue">+{selectedOptions.length - 3} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
