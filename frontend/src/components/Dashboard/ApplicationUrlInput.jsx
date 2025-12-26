import { Link } from "lucide-react";

function ApplicationUrlInput({ value, onChange }) {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Application URL
      </label>

      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://myapp.com"
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-brand-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-700 font-medium placeholder:text-gray-400"
        />

        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Link className="w-5 h-5 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

export default ApplicationUrlInput;
