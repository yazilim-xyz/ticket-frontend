// src/pages/TicketsDetail.jsx

import React, { useState , useEffect } from "react";
import { ticketService } from '../services/ticketService';
import { useTickets } from '../hooks/useTickets';
import UpdateStatusModal from '../components/tickets/UpdateStatusModal';
import { Ticket } from '../types';


  const TicketDetail = ({ticket}) => {// içeriği dışarıdan alacak
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket?.status || "Not Started");
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const STATUS_OPTIONS = ["Not Started", "In Progress", "Blocked", "Done"];// dropdownda görünecek stateler
  const toggleStatusDropdown = () => setIsStatusOpen(prev => !prev);
  const getPriorityColor = (priority) => {
  switch (priority) {
    case "Low":
      return "bg-green-500";
    case "Medium":
      return "bg-yellow-500";
    case "High":
      return "bg-red-500";}};
  const handleSend = () => {console.log("Status saved:", currentStatus);};
  const openAttachments = () => setIsAttachmentsOpen(true);
  const closeAttachments = () => setIsAttachmentsOpen(false);
  const toggleTheme = () => {setIsDarkMode(!isDarkMode);};


  return (
    <div>
      <div Sidebar userRole="user"></div>
<div className="w-[1440px] h-[960px] relative bg-zinc-100 outline outline-1 outline-offset-[-1px] outline-zinc-100 overflow-hidden">     
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
  <div className="w-64 h-[960px] left-0 top-0 absolute bg-zinc-100 border-r border-zinc-300 overflow-hidden">
    <div className="w-52 left-[20px] top-[255px] absolute inline-flex flex-col justify-start items-start gap-1">
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Dashboard</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-cyan-800 rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-white text-base font-medium font-['Inter'] leading-6 line-clamp-1">Active Tickets</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-white" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">All Tickets</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Performance</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Chat</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Excel Reports</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">AI Bot</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Calendar</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
        <div className="w-6 h-6 bg-zinc-300 rounded-full" />
        <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Admin Panel</div>
        <div className="w-3 h-6 relative overflow-hidden">
          <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
        </div>
      </div>
      <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
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
    <div className="w-64 h-[960px] left-0 top-0 absolute bg-zinc-100 border-r border-zinc-300 overflow-hidden">
      <div className="w-52 left-[20px] top-[255px] absolute inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Dashboard</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-cyan-800 rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-white text-base font-medium font-['Inter'] leading-6 line-clamp-1">Active Tickets</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-white" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">All Tickets</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Performance</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Chat</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Excel Reports</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">AI Bot</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Calendar</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-zinc-300 rounded-full" />
          <div className="flex-1 justify-center text-black text-base font-medium font-['Inter'] leading-6 line-clamp-1">Admin Panel</div>
          <div className="w-3 h-6 relative overflow-hidden">
            <div className="w-2 h-3 left-[3.09px] top-[5.64px] absolute bg-cyan-800" />
          </div>
        </div>
        <div className="self-stretch h-10 px-4 bg-white rounded-lg inline-flex justify-start items-center gap-4">
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
    </div>
    <div className="w-64 h-0 left-0 top-[233px] absolute outline outline-1 outline-offset-[-0.50px] outline-zinc-300"></div>
  </div>
  <div className="w-[713px] h-6 left-[307px] top-[255px] absolute">
    <div className="w-[713px] h-6 left-0 top-0 absolute justify-center text-black text-xl font-medium font-['Inter'] leading-8">{ticket?.title || "-"}</div>
  </div>
  <div data-size="48" className="w-9 h-9 left-[332px] top-[64px] absolute overflow-hidden">
    <div className="w-6 h-6 left-[7.92px] top-[7.92px] absolute outline outline-4 outline-offset-[-2px] outline-cyan-800" />
  </div>
  <div className="w-[1102px] h-80 left-[297px] top-[304px] absolute">
    <div className="w-[1102px] h-80 left-0 top-0 absolute bg-zinc-100" />
    <div className="w-[892px] h-72 left-[19px] top-[-13px] absolute justify-center text-black text-lg font-normal font-['Inter'] leading-4">{ticket?.description || "-"}</div>
    <div data-has-icon-end="false" data-has-icon-start="false" data-size="Medium" data-state="Default" data-variant="Primary" className="w-40 h-9 p-3 left-[19px] top-[277px] absolute bg-cyan-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-500 inline-flex justify-center items-center gap-2 overflow-hidden">
<button
  type="button"
  onClick={openAttachments}
  // onClick: butona tıklanınca openAttachments fonksiyonunu çalıştırır.
  className="w-40 h-9 p-3 left-[19px] top-[277px] absolute bg-cyan-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-slate-500 inline-flex justify-center items-center gap-2 overflow-hidden"
>
  <span className="w-7 h-7 relative">
    <span className="w-4 h-6 left-[6.65px] top-[2.42px] absolute bg-white" />
  </span>
  <span className="justify-start text-white text-base font-normal font-['Inter'] leading-4">
    Attachments
  </span>
</button>
    </div>
    <div className="w-7 h-7 left-[29px] top-[281px] absolute overflow-hidden">
      <div className="w-4 h-6 left-[6.65px] top-[2.42px] absolute bg-white" />
    </div>
  </div>
  <div className="w-[1043px] h-7 left-[307px] top-[130px] absolute">
    <div className="w-[1043px] h-7 left-0 top-0 absolute bg-zinc-100" />
    <div className="left-[23px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-4">TİCKET ID</div>
    <div className="left-[647px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-4">PROJECT</div>
    <div className="left-[817px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-4">PRİORİTY</div>
    <div className="left-[957px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-4">STATUS</div>
    <div className="left-[205px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-6">CREATED DATE</div>
    <div className="left-[405px] top-[3px] absolute opacity-70 justify-center text-black text-base font-normal font-['Inter'] leading-6">DUE DATE</div>
  </div>
  <div className="w-[518px] h-48 left-[307px] top-[656px] absolute">
    <div className="left-[29px] top-[133px] absolute opacity-70 justify-center text-black text-lg font-normal font-['Inter'] leading-4">LAST UPDATE{ticket?.lastUpdate || "-"}</div>
    <div className="left-[27px] top-[28px] absolute opacity-70 justify-center text-black text-lg font-normal font-['Inter'] leading-4">FROM: {ticket?.from ||"-"}</div>
    <div className="left-[27px] top-[81px] absolute opacity-70 justify-center text-black text-lg font-normal font-['Inter'] leading-4">ASSIGNED TO:  {ticket?.assignedTo ||"-"}</div>
  </div>
  <div className="w-[1081px] h-16 left-[307px] top-[159px] absolute">
    <div className="w-[1081px] h-16 left-0 top-[13.44px] absolute opacity-0 bg-white" />
    <div className="w-24 h-5 left-[23px] top-[20.61px] absolute justify-center text-black text-base font-medium font-['Inter'] leading-6">TCK-117</div>
    <div className="w-24 h-6 left-[662.09px] top-[20.61px] absolute">
      <div className="w-32 h-9 px-2.5 py-2 left-[-15.09px] top-[-4px] absolute bg-white rounded-[10.37px] outline outline-[1.30px] outline-offset-[-1.30px] outline-neutral-200 inline-flex justify-center items-center gap-2.5">
        <div className="justify-start text-black text-base font-semibold font-['Inter'] leading-5">{ticket?.projectName || "-"}</div>
      </div>
    </div>
    <div className="w-20 h-6 left-[811px] top-[16.13px] absolute">
      <div className="h-9 px-2.5 py-2 left-0 top-0 absolute bg-yellow-500 rounded-[10.30px] outline outline-[1.29px] outline-offset-[-1.29px] outline-neutral-200 inline-flex justify-center items-center gap-2.5">
        <div className="justify-start text-black text-base font-semibold font-['Inter'] leading-5">Medium</div>
      </div>
    </div>
    <div className="w-14 h-5 left-[205px] top-[21.51px] absolute justify-center text-black text-base font-normal font-['Inter'] leading-6">OCT 16</div>
    <div className="w-32 h-8 px-2.5 py-2 left-[950px] top-[16.13px] absolute bg-white rounded-[10.37px] outline outline-[1.30px] outline-offset-[-1.30px] outline-neutral-200 inline-flex justify-center items-center gap-2.5">
      <div className="justify-start text-black text-base font-semibold font-['Inter'] leading-5">
       {currentStatus}
      </div>
    </div>
    <div className="w-14 h-3.5 left-[405px] top-[23.30px] absolute justify-start text-black text-base font-normal font-['Inter'] leading-4">DEC 28</div>
  </div>
  <div className="w-[1099px] h-0 left-[300px] top-[659px] absolute outline outline-1 outline-offset-[-0.50px] outline-slate-500"></div>
  <div className="w-[1099px] h-0 left-[300px] top-[228px] absolute outline outline-1 outline-offset-[-0.50px] outline-slate-500"></div>
  <button
  type="button"
  onClick={handleSend}
  // Send’e basıldığında seçilen status'ü gerçek status olarak kaydedecek
  disabled={!currentStatus}
  // Eğer hiçbir şey seçilmediyse buton pasif
  className={`w-28 h-9 left-[1272px] top-[887px] absolute rounded-lg overflow-hidden flex items-center justify-center ${
    !currentStatus
      ? "bg-sky-300 cursor-not-allowed"
      : "bg-sky-600 cursor-pointer"
  }`}
>
  <span className="text-white text-xl font-medium font-['Inter'] leading-5">
    Send
  </span>
</button>

  
  <button
  type="button"
  onClick={toggleStatusDropdown}
  className="w-40 left-[1231px] top-[671px] absolute bg-white rounded-sm shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center overflow-hidden"
>
  <div className="w-28 self-stretch px-4 py-2 bg-teal-600 rounded-tl-sm rounded-bl-sm outline outline-1 outline-offset-[-1px] outline-zinc-300 flex justify-start items-center gap-2 overflow-hidden">
    <span className="text-white text-sm font-normal font-['Roboto'] leading-5">
      Update Status
    </span>
  </div>

  <div className="w-10 self-stretch flex items-center justify-center rounded-tr-sm rounded-br-sm outline outline-1 outline-offset-[-1px] outline-white">
    <span
      className={`text-sm transition-transform ${
        isStatusOpen ? "rotate-180" : ""
      }`}
    >
      ▼
    </span>
  </div>
</button>
{/* STATUS DROPDOWN */}
{isStatusOpen && (
  <div className="w-40 left-[1231px] top-[707px] absolute bg-white border border-zinc-300 rounded-sm shadow-sm">
    
    {/* Clear Selection */}
    <div
      className="px-3 py-1.5 hover:bg-zinc-100 cursor-pointer text-teal-700 text-sm font-normal"
      onClick={() => setCurrentStatus("Not Started")}
    >
      Clear Selection
    </div>

    {/* Status Options */}
    {["In Progress", "Not Started", "Done", "Blocked"].map((status) => (
      <div
        key={status}
        className="px-3 py-1.5 hover:bg-zinc-100 cursor-pointer flex items-center gap-2"
         onClick={() => {
      setCurrentStatus(status);   // üstteki chip’i anında güncelle
      setIsStatusOpen(false);    // istersen dropdown'ı da kapat
    }}
      >
        {/* Checkbox */}
        <div
          className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
            currentStatus === status
              ? "bg-teal-600 border-teal-600"
              : "bg-white border-zinc-300"
          }`}
        >
          {/* White check icon */}
          {currentStatus === status && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Status Text */}
        <span className="text-black/90 text-sm font-normal">{status}</span>
      </div>
    ))}
  </div>
)}

 
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

      

    
 </div>
 );
};
export default TicketDetail;
