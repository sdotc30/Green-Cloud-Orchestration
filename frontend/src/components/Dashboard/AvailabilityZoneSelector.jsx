import { Globe, X, ChevronDown, Check } from "lucide-react";
import { fetchCarbonIntensity } from "../../services/api";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { useEffect, useRef } from "react";

const zones = [
  { value: "us-east-2", label: "Ohio" },
  { value: "us-east-1", label: "Virginia" },
  { value: "us-west-1", label: "California" },
];

function AvailabilityZoneSelector({ value, onChange, disabled }) {
  
  // 1. Safety Check: Ensure value is always an array to prevent crashes
  const selectedValues = Array.isArray(value) ? value : [];
  const prevSelect = useRef([]);

  // 2. Restore the API Call Side Effect
  useEffect(() => {
    // Only fetch if there is actually a value selected
    const newSelect = selectedValues.filter((value) => !prevSelect.current.includes(value));
    if (newSelect.length > 0) {
      fetchCarbonIntensity(newSelect);
    }
    prevSelect.current = [...prevSelect.current, ...newSelect];
  }, [selectedValues]); // Re-run whenever the selection array changes

  // Helper to remove a tag
  const removeZone = (e, zoneValue) => {
    e.preventDefault(); 
    e.stopPropagation(); // Double safety to prevent menu opening
    onChange(selectedValues.filter((v) => v !== zoneValue));
  };

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Availability Zone
      </label>

      <Listbox 
        value={selectedValues} 
        onChange={onChange} 
        multiple 
        disabled={disabled}
      >
        <div className="relative">
          <ListboxButton className={`
            relative w-full min-h-[3.5rem] pl-12 pr-10 py-2 text-left 
            rounded-xl border bg-white shadow-sm cursor-pointer 
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            ${disabled ? "opacity-50 cursor-not-allowed" : "border-brand-200 hover:border-brand-400"}
          `}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-600">
              <Globe className="w-5 h-5" />
            </span>

            <span className="flex flex-wrap gap-2">
              {selectedValues.length === 0 ? (
                <span className="text-gray-400">Select Zone</span>
              ) : (
                selectedValues.map((val) => (
                  <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-100">
                    {zones.find((z) => z.value === val)?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                      onClick={(e) => removeZone(e, val)}
                    />
                  </span>
                ))
              )}
            </span>

            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </span>
          </ListboxButton>

          <ListboxOptions className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none z-50 p-1">
            {zones.map((zone) => (
              <ListboxOption
                key={zone.value}
                value={zone.value}
                className={({ active, selected }) => `
                  cursor-pointer select-none relative py-2 pl-3 pr-9 rounded-lg
                  ${active ? "bg-brand-50 text-brand-900" : "text-gray-900"}
                  ${selected ? "bg-blue-50 font-medium" : ""}
                `}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {zone.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-600">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : null}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
}

export default AvailabilityZoneSelector;