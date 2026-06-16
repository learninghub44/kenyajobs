// components/SearchBar.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function SearchBar({ placeholder = "Search jobs in Kenya..." }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-5 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-gray-700 text-sm"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl font-medium text-sm transition-colors duration-200"
      >
        🔍 Search
      </button>
    </form>
  );
}