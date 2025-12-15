import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { ticketService } from "../services/ticketService";

type Priority = "high" | "medium" | "low";
type Status = "new" | "in_progress" | "blocked" | "completed";

type CreateTicketPayload = {
    id?:string;
  title: string;
  description: string;
  project?: string;
  dueDate?: string; // "YYYY-MM-DD" ya da ISO
  priority: Priority;
  status?: Status;
  assignee?: string;
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const PriorityDropdown: React.FC<{
  value: Priority | null;
  onChange: (val: Priority | null) => void;
  isDarkMode: boolean;
}> = ({ value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!value) return "Select priority";
    return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? "Select priority";
  }, [value]);

  return (
    <div className="relative inline-block text-left w-72">
      <button
        type="button"
        className={`w-full h-11 px-4 rounded-[100px] flex items-center justify-between border ${
          isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-zinc-300 text-black"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-base font-medium font-['Inter']">Priority</span>
        <span className={`text-sm font-['Roboto'] ${isDarkMode ? "text-gray-300" : "text-black/60"}`}>
          {selectedLabel}
        </span>
        <span className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
      </button>

      {isOpen && (
        <div
          className={`absolute mt-1 w-full rounded-md shadow-md z-10 border ${
            isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-zinc-300"
          }`}
        >
          <button
            type="button"
            className={`w-full px-3 py-2 flex items-center gap-2 text-left ${
              isDarkMode ? "hover:bg-gray-600 text-gray-200" : "hover:bg-zinc-100 text-black"
            }`}
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            <input type="checkbox" readOnly checked={value === null} />
            <span className={`${isDarkMode ? "text-cyan-300" : "text-teal-600"} text-sm font-['Roboto']`}>
              Clear Selection
            </span>
          </button>

          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`w-full px-3 py-2 flex items-center gap-2 text-left ${
                isDarkMode ? "hover:bg-gray-600 text-gray-200" : "hover:bg-zinc-100 text-black"
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <input type="checkbox" readOnly checked={value === opt.value} />
              <span className="text-sm font-['Roboto']">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    priority !== null &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!priority) {
      setErrorMsg("Please select a priority.");
      return;
    }

    const payload: CreateTicketPayload = {
      title: title.trim(),
      description: description.trim(),
      project: project.trim() || undefined,
      assignee: assignee.trim() || undefined,
      priority,
      status: "new",
      dueDate: dueDate || undefined,
    };

    try {
      setIsSubmitting(true);
    } catch (err) {
      console.error("Create ticket failed:", err);
      setErrorMsg("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Sidebar  isDarkMode={isDarkMode} />
      <div className="flex-1 overflow-y-auto">
        <div
          className={`h-24 px-8 py-5 border-b flex items-center justify-between ${
            isDarkMode ? "border-gray-700" : "border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className={`text-2xl font-semibold font-['Inter'] ${isDarkMode ? "text-gray-200" : "text-cyan-800"}`}>
              Create Ticket
            </h1>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode ? "border-gray-600 bg-gray-800 text-gray-200" : "border-zinc-300 bg-white text-gray-700"
            }`}
          >
            Toggle Theme
          </button>
        </div>

        <div className="p-8 max-w-5xl">
          <form
            onSubmit={handleSubmit}
            className={`rounded-lg border p-6 space-y-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {errorMsg && (
              <div className={`p-3 rounded-lg text-sm ${isDarkMode ? "bg-red-900/30 text-red-200" : "bg-red-50 text-red-700"}`}>
                {errorMsg}
              </div>
            )}

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                Title *
              </label>
              <input
                type="text"
                className={`w-full h-11 px-4 rounded-lg border outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-zinc-50 border-zinc-300 text-gray-900"
                }`}
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Project
                </label>
                <input
                  type="text"
                  className={`w-full h-11 px-4 rounded-lg border outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-zinc-50 border-zinc-300 text-gray-900"
                  }`}
                  placeholder="Project name"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Assigned to
                </label>
                <input
                  type="text"
                  className={`w-full h-11 px-4 rounded-lg border outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-zinc-50 border-zinc-300 text-gray-900"
                  }`}
                  placeholder="Person / Team"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  className={`w-full h-11 px-4 rounded-lg border outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-zinc-50 border-zinc-300 text-gray-900"
                  }`}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Priority *
                </label>
                <PriorityDropdown value={priority} onChange={setPriority} isDarkMode={isDarkMode} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                Description *
              </label>
              <textarea
                className={`w-full min-h-[160px] px-4 py-3 rounded-lg border outline-none resize-none focus:ring-2 focus:ring-cyan-500 ${
                  isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-zinc-50 border-zinc-300 text-gray-900"
                }`}
                placeholder="Describe the ticket..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg border ${
                  isDarkMode ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600" : "border-zinc-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  !canSubmit ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-sky-600 text-white hover:bg-sky-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
