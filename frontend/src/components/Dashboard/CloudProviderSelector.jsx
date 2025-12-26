import { Cloud } from "lucide-react";

const providers = [
  { value: "AWS", label: "Amazon Web Services" },
  { value: "GCP", label: "Google Cloud Platform" },
  { value: "Azure", label: "Microsoft Azure" },
];

function CloudProviderSelector({ value, onChange }) {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Cloud Provider
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-brand-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-700 font-medium appearance-none"
        >
          <option value="">Select Provider</option>
          {providers.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Cloud className="w-5 h-5 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

export default CloudProviderSelector;
