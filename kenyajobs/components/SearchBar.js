import { useState } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search jobs worldwide..." }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto shadow-lg rounded-2xl overflow-hidden">
      <div className="flex-1 flex items-center bg-white px-4 gap-2">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 py-3.5 text-gray-700 text-sm focus:outline-none bg-transparent"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3.5 font-medium text-sm transition-colors duration-200 flex items-center gap-2"
      >
        Search
      </button>
    </form>
  );
}
