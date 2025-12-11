// src/pages/CreateTicket.jsx
import React, { useState } from "react";
import Sidebar from '../components/layouts/Sidebar';
import { ticketService } from '../services/ticketService';

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const [isDarkMode, setIsDarkMode] = useState(false);
const PriorityDropdown = ({ value, onChange }) => {
const [isOpen, setIsOpen] = useState(false);
const handleSelect = (option) => {onChange(option);setIsOpen(false);};
const handleClear = () => {onChange(null);setIsOpen(false);};
const toggleTheme = () => {setIsDarkMode(!isDarkMode);};


  return (
    <div className="relative inline-block text-left">
       <Sidebar userRole="admin" />
      {/* Başlık + seçili değer */}
      <button
        type="button"
        className="w-72 h-11 px-4 bg-white outline outline-1 outline-zinc-300 rounded-[100px] flex items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-black text-xl font-medium font-['Inter']">
          Priority
        </span>
        <span className="text-sm font-['Roboto'] text-black/60">
          {value || "Select priority"}
        </span>
        <span className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-72 bg-white border border-zinc-300 rounded-md shadow-md z-10">
          {/* Clear */}
          <div
            className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-100"
            onClick={handleClear}
          >
            <input type="checkbox" readOnly checked={value === null} />
            <span className="text-teal-600 text-sm font-['Roboto']">
              Clear Selection
            </span>
          </div>

          {PRIORITY_OPTIONS.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-100"
              onClick={() => handleSelect(opt)}
            >
              <input type="checkbox" readOnly checked={value === opt} />
              <span className="text-sm font-['Roboto']">
                {opt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateTicket = ({ onCreate }) => {
  // TicketDetail ile uyumlu state’ler
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: Date.now(), // backend gelince API'den gelecek
      title,
      project,
      assignee,
      priority,
      dueDate,
      description,
      status: "OPEN",
    };

    console.log("Created Ticket:", newTicket);

    if (onCreate) onCreate(newTicket);
  };

 
  return (
<div>
      <div className="w-[1440px] h-[960px] relative bg-white">
  <div data-size="48" className="w-9 h-9 left-[332px] top-[64px] absolute overflow-hidden">
    <div className="w-6 h-6 left-[7.92px] top-[7.92px] absolute outline outline-4 outline-offset-[-2px] outline-cyan-800" />
  </div>
  <div className="left-[377px] top-[123px] absolute justify-center text-cyan-800 text-xl font-medium font-['Inter'] leading-8">NEW TİCKET</div>
<form
  onSubmit={handleSubmit}
  className="w-[1018px] h-[726px] left-[351px] top-[194px] absolute bg-white overflow-hidden"
>
  {/* TITLE */}
  <div className="left-[9px] top-[12px] absolute justify-center text-black text-xl font-medium font-['Inter'] leading-8 tracking-tight">
    Title:
  </div>
  <input
    type="text"
    className="w-96 h-9 left-[179px] top-[9px] absolute bg-zinc-100 rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)] px-3"
    placeholder="Enter title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
  />

  {/* PROJECT */}
  <div className="left-[9px] top-[79px] absolute justify-start text-black text-xl font-medium font-['Inter']">
    Project:
  </div>
  <input
    type="text"
    className="w-96 h-9 left-[179px] top-[73px] absolute bg-zinc-100 rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)] px-3"
    placeholder="Project name"
    value={project}
    onChange={(e) => setProject(e.target.value)}
  />

  {/* ASSIGNED TO */}
  <div className="left-[9px] top-[143px] absolute justify-start text-black text-xl font-medium font-['Inter']">
    Assigned to:
  </div>
  <input
    type="text"
    className="w-96 h-9 left-[183px] top-[137px] absolute bg-zinc-100 rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)] px-3"
    placeholder="Person / Team"
    value={assignee}
    onChange={(e) => setAssignee(e.target.value)}
  />

  {/* DUE DATE */}
  <div className="left-[9px] top-[268px] absolute text-center justify-center text-black text-xl font-medium font-['Inter'] leading-5">
    Due Date:
  </div>
  <input
    type="date"
    className="w-48 h-11 px-3 left-[183px] top-[263px] absolute bg-zinc-100 rounded-xl"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
  />

  {/* DESCRIPTION */}
  <div className="left-[12px] top-[379px] absolute text-center justify-center text-black text-xl font-medium font-['Inter'] leading-6 tracking-tight">
    Description:
  </div>
  <textarea
    className="w-[807px] h-40 left-[179px] top-[375px] absolute bg-zinc-100 rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08)] p-3 resize-none"
    placeholder="Describe the ticket..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  {/* PRIORITY DROPDOWN */}
  <div className="left-[690px] top-[0px] absolute">
    <PriorityDropdown value={priority} onChange={setPriority} />
  </div>

  {/* CREATE BUTTON */}
  <button
    type="submit"
    className="w-48 h-11 px-1.5 py-1.5 left-[794px] top-[609px] absolute bg-sky-600 rounded-xl inline-flex justify-center items-center gap-[5px]"
  >
    <div className="text-center justify-start text-white/95 text-base font-['SF_Pro'] leading-5">
      Create
    </div>
  </button>
</form>
  <div className="w-64 h-[960px] left-0 top-0 absolute bg-zinc-100 border-r border-zinc-300 overflow-hidden">
    <div className="left-[20px] top-[255px] absolute inline-flex flex-col justify-start items-start gap-1">
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Dashboard</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Active Tickets</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">All Tickets</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Performance</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Chat</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Excel Reports</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">AI Bot</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Calendar</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">CreateTicket</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-cyan-800 rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-white text-base font-medium font-['Inter'] leading-6 line-clamp-1">Admin Panel</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-white" />
        </div>
      </div>
      <div className="w-52 h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Settings</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
    </div>
    <div className="w-44 h-16 left-[30px] top-[143px] absolute justify-center text-cyan-800 text-2xl font-normal font-['Inter'] leading-9">      Enterprise <br/>  Ticket System</div>
    <img className="w-28 h-28 left-[68px] top-[23px] absolute border border-white" src="https://placehold.co/120x120" />
    <div className="w-8 h-8 left-[210px] top-[15px] absolute overflow-hidden">
      <div className="w-5 h-2.5 left-[6px] top-[11px] absolute outline outline-1 outline-offset-[-0.50px] outline-black" />
    </div>
    <div className="w-64 h-0 left-0 top-[233px] absolute outline outline-1 outline-offset-[-0.50px] outline-zinc-300"></div>
  </div>
  <div data-animation="false" data-checked="true" data-disabled="false" data-icon="true" data-loading="false" data-size="medium" data-text="false" className="p-0.5 left-[1387px] top-[49px] absolute origin-top-left rotate-180 bg-sky-600 rounded-2xl inline-flex justify-start items-center gap-1">
    <div className="py-0.5 flex justify-start items-center">
      <div className="flex justify-start items-center gap-2.5">
        <div className="w-1 h-1" />
      </div>
      <div className="w-3 h-3 relative" />
    </div>
    <div className="w-4 h-4 relative rounded-[77px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.20)] overflow-hidden">
      <div className="w-4 h-4 left-0 top-0 absolute bg-white rounded-2xl" />
    </div>
  </div>
  <div className="w-6 h-6 left-[1321px] top-[25px] absolute overflow-hidden">
    <div className="w-2.5 h-2.5 left-[7.28px] top-[7.28px] absolute outline outline-[0.50px] outline-offset-[-0.25px] outline-black" />
    <div className="w-5 h-5 left-[1.25px] top-[1.25px] absolute outline outline-[0.50px] outline-offset-[-0.25px] outline-black" />
  </div>
  <div className="w-6 h-6 left-[1387px] top-[26px] absolute overflow-hidden">
    <div className="w-5 h-5 left-[2.78px] top-[2.75px] absolute outline outline-[0.50px] outline-offset-[-0.25px] outline-black" />
  </div>
  <div className="w-2.5 h-2 left-[1369px] top-[34px] absolute bg-white" />
</div>
  </div>
  );
};



export default CreateTicket;
