import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function SmartSearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [senders, setSenders] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const addSender = () => {
    const trimmed = input.trim();
    if (trimmed && !senders.includes(trimmed)) {
      setSenders([...senders, trimmed]);
    }
    setInput("");
  };

  const removeSender = (index) => {
    const newSenders = [...senders];
    newSenders.splice(index, 1);
    setSenders(newSenders);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSender();
    }
  };

  const handleSearch = () => {
    const formattedAfter = startDate ? startDate.toISOString().split("T")[0] : null;
    const formattedBefore = endDate ? endDate.toISOString().split("T")[0] : null;

    onSearch({
      senders,
      after: formattedAfter,
      before: formattedBefore,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sender(s)</label>
          <div className="w-full border border-gray-300 rounded px-2 py-1 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
            {senders.map((s, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-800 text-sm px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {s}
                <button
                  onClick={() => removeSender(idx)}
                  className="text-indigo-500 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type and press Enter or comma"
              className="flex-1 border-none focus:outline-none text-sm py-1"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date Range</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Choose a time range"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          🔍 Search
        </button>
      </div>
    </div>
  );
}

export default SmartSearchBar;
