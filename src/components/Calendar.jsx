import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";

const EventCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    time: "",
    description: "",
    recurrence: "",
    color: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
    setEvents(storedEvents.map((evt) => ({ ...evt, date: parseISO(evt.date) })));
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const renderHeader = () => (
    <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-t-md">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
      <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-indigo-700">
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 px-2 py-1">{days}</div>;
  };

  const openModal = (date, evt = null) => {
    setSelectedDate(date);
    if (evt) {
      // Editing existing event
      setFormData({
        id: evt.id,
        title: evt.title,
        time: evt.time,
        description: evt.description,
        recurrence: evt.recurrence,
        color: evt.color,
      });
    } else {
      // Adding new event
      setFormData({ id: null, title: "", time: "", description: "", recurrence: "", color: "" });
    }
    setModalOpen(true);
  };

  const saveEvent = () => {
    if (!formData.title) return;

    if (formData.id !== null) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === formData.id ? { ...formData, date: selectedDate } : evt
        )
      );
    } else {
      // Add new event
      const newEvent = {
        ...formData,
        id: Date.now(),
        date: selectedDate,
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }

    setFormData({ id: null, title: "", time: "", description: "", recurrence: "", color: "" });
    setModalOpen(false);
  };

  const deleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) => prevEvents.filter((evt) => evt.id !== id));
      setModalOpen(false);
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;

        const dayEvents = events.filter((e) => {
          const matchesDate = isSameDay(e.date, cloneDay);

          // Filter by search term on title or description
          const matchesSearch =
            e.title.toLowerCase().includes(searchTerm) ||
            e.description.toLowerCase().includes(searchTerm);

          // Filter by category if selected
          const matchesCategory = filterCategory ? e.color === filterCategory : true;

          return matchesDate && matchesSearch && matchesCategory;
        });

        days.push(
          <div
            className={`border rounded-lg p-1 min-h-[90px] cursor-pointer transition-all duration-200 hover:bg-indigo-100 ${
              !isSameMonth(day, monthStart) ? "bg-gray-100" : "bg-white"
            } ${isSameDay(day, new Date()) ? "border-4 border-indigo-500" : ""}`}
            key={day}
            onClick={() => openModal(cloneDay)}
          >
            <div className="text-sm font-semibold text-indigo-700">{format(day, "d")}</div>
            {dayEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                layout
                className={`text-xs mt-1 rounded px-1 py-0.5 ${evt.color || "bg-pink-300"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(cloneDay, evt);
                }}
                title={`${evt.title} - ${evt.time}`}
              >
                <div className="flex justify-between items-center">
                  <span>{evt.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEvent(evt.id);
                    }}
                    className="ml-1 text-red-600 font-bold hover:text-red-800"
                    title="Delete event"
                  >
                    &times;
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="px-2 py-2 space-y-1">{rows}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Search and Filter */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
  type="text"
  placeholder="Search events by title or description..."
  className="
    flex-grow
    p-3
    rounded-full
    border-2
    border-transparent
    bg-white
    text-gray-900
    placeholder-gray-400
    shadow-lg
    focus:outline-none
    focus:ring-4
    focus:ring-pink-400
    focus:ring-opacity-75
    transition
    duration-300
    ease-in-out
    hover:shadow-pink-400/70
    hover:scale-105
    text-sm
  "
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
/>

        <select
          className="border rounded p-2 text-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Filter by category</option>
          <option value="bg-pink-300">Pink</option>
          <option value="bg-indigo-300">Indigo</option>
          <option value="bg-green-300">Green</option>
          <option value="bg-yellow-300">Yellow</option>
          <option value="bg-red-300">Red</option>
        </select>
      </div>

      <div className="shadow-2xl rounded-lg overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-3">
            <Dialog.Title className="text-xl font-bold text-indigo-700">
              {formData.id ? "Edit Event" : "Add Event"}
            </Dialog.Title>
            <input
              type="text"
              placeholder="Event Title"
              className="w-full border rounded p-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              type="time"
              className="w-full border rounded p-2"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border rounded p-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <select
              className="w-full border rounded p-2"
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
            >
              <option value="">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="color"
              className="w-full border rounded p-2 h-10"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              title="Pick event color"
            />

            <div className="flex justify-end gap-2">
              {formData.id && (
                <button
                  onClick={() => deleteEvent(formData.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveEvent}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default function App() {
  return (
     
      <EventCalendar />
 
  );
}
