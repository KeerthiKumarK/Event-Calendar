import React from "react";
import Calendar from "./components/Calendar";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
  <div className="flex justify-center mt-8">
    <button
      className="
        relative
        px-8 py-4
        text-white
        font-extrabold
        text-3xl
        rounded-full
        bg-gradient-to-r
        from-pink-500 via-purple-600 to-blue-500
        shadow-lg
        animate-gradient-x
        focus:outline-none
        focus:ring-4
        focus:ring-pink-400
        before:absolute
        before:-inset-1
        before:rounded-full
        before:bg-gradient-to-r
        before:from-pink-500
        before:via-purple-600
        before:to-blue-500
        before:opacity-75
        before:blur-xl
        before:animate-gradient-x
        before:z-[-1]
      "
    >
      🌈 Event Calendar 🌈
    </button>
  </div>
  <Calendar></Calendar>
</div>

  );
}
