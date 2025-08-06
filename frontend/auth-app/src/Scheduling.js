import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function firstWeekdayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function Scheduling() {
    const navigate = useNavigate();

    // Token protection
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:8000/verify-token/${token}`);
                if (!response.ok) {
                    throw new Error("Token verification failed");
                }
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };
        verifyToken();
    }, [navigate]);

    // Calendar state
    const [currentYear, setCurrentYear] = useState(2025);
    const [currentMonth, setCurrentMonth] = useState(7); // August
    const [selectedDay, setSelectedDay] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);

    // Meeting form state
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [meetingURL, setMeetingURL] = useState("");

    // Available hours state (for each day)
    const [availableDays, setAvailableDays] = useState({
        sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false
    });

    // Calendar grid
    const totalDays = daysInMonth(currentYear, currentMonth);
    const offset = firstWeekdayOfMonth(currentYear, currentMonth);

    const calendarCells = [];
    for (let i = 0; i < offset; i++) {
        calendarCells.push(<div key={`blank-${i}`}></div>);
    }
    for (let day = 1; day <= totalDays; day++) {
        const isSelected = selectedDay === day;
        calendarCells.push(
            <div key={day} className="h-12 flex items-center justify-center">
                <button
                    type="button"
                    aria-label={`Select ${monthNames[currentMonth]} ${day}, ${currentYear}`}
                    aria-pressed={isSelected}
                    className={`w-8 h-8 rounded flex items-center justify-center font-medium border transition-all
                        ${isSelected ? "bg-blue-100 border-2 border-blue-900 text-blue-900 font-bold" : "border text-gray-700"}`}
                    onClick={() => {
                        setSelectedDay(day);
                        setModalOpen(true);
                        setMeetingTitle("");
                        setMeetingTime("");
                        setMeetingURL("");
                    }}
                >
                    {day}
                </button>
            </div>
        );
    }

    // Modal save handler
    const handleSaveMeeting = () => {
        if (!meetingTitle || !meetingTime || !meetingURL) {
            alert("Please fill all fields");
            return;
        }
        if (meetingTime < "08:00" || meetingTime > "17:00") {
            alert("Please select a time between 08:00 and 17:00.");
            return;
        }
        if (!selectedDay) {
            alert("Please select a date from the calendar before saving.");
            return;
        }

        const dateStr = `${currentYear}-${currentMonth}-${selectedDay}`;
        fetch("http://localhost:8000/meetings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: meetingTitle,
                time: meetingTime,
                url: meetingURL,
                date: dateStr
            })
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            alert("Meeting saved!");
            setModalOpen(false);
        })
        .catch(error => {
            alert("Failed to save meeting.");
        });
    };

    // Available hours handler
    const handleDayCheckbox = (day) => {
        setAvailableDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    return (
        <div className="bg-[#FFA500] min-h-screen font-sans">
            {/* Preview Banner */}
            <div className="bg-yellow text-white text-sm px-4 py-6 flex justify-between items-center"></div>
            <div className="flex flex-col lg:flex-row max-w-5xl mx-auto mt-10 gap-8 px-4">
                {/* Left: Available hours */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full lg:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg font-semibold text-blue-900 underline mb-0">Scheduling Settings</h1>
                            <a href="/homepage" className="text-sm text-gray-500 hover:underline">&larr; Back</a>
                        </div>
                        <h2 className="font-extrabold text-2xl mb-2 text-blue-900">Available hours</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Set the times that people will be able to schedule these types of meetings with you.
                        </p>
                        <div className="text-sm text-blue-600 cursor-pointer mb-6">Custom hours</div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day, idx) => (
                                <div key={day} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={day}
                                            className="h-4 w-4 day-checkbox"
                                            checked={availableDays[day]}
                                            onChange={() => handleDayCheckbox(day)}
                                        />
                                        <label htmlFor={day} className="font-medium">{day.toUpperCase()}</label>
                                    </div>
                                    <div className="flex-1"></div>
                                    <button aria-label={`Add ${day.charAt(0).toUpperCase() + day.slice(1)} hours`} className="text-blue-600 px-2 py-1 rounded hover:bg-blue-50">+</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button className="px-5 py-2 border rounded-md text-sm">Cancel</button>
                        <button className="px-5 py-2 bg-blue-900 text-white rounded-md text-sm hover:bg-indigo-900 transition">Save and close</button>
                    </div>
                </div>

                {/* Right: Calendar-only panel */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full lg:w-2/3 flex flex-col">
                    <div className="border-b px-8 py-6 flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-blue-900">Group-UP</span>
                        <span className="text-xs bg-black text-white px-3 py-1 rounded">This is a preview.</span>
                    </div>
                    <div className="px-8 py-8 flex flex-col flex-1">
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xl font-bold text-blue-900">Select a Date &amp; Time</div>
                            <div className="flex gap-2 text-sm">
                                <button
                                    aria-label="Previous month"
                                    className="cursor-pointer px-3 py-1 rounded-full border border-blue-900 text-blue-900 hover:bg-blue-50"
                                    onClick={() => {
                                        if (currentMonth === 0) {
                                            setCurrentMonth(11);
                                            setCurrentYear(currentYear - 1);
                                        } else {
                                            setCurrentMonth(currentMonth - 1);
                                        }
                                        setSelectedDay(null);
                                    }}
                                >&lt;</button>
                                <div className="px-3 py-1 font-bold text-blue-900">
                                    {monthNames[currentMonth]} {currentYear}
                                </div>
                                <button
                                    aria-label="Next month"
                                    className="cursor-pointer px-3 py-1 rounded-full border border-blue-900 text-blue-900 hover:bg-blue-50"
                                    onClick={() => {
                                        if (currentMonth === 11) {
                                            setCurrentMonth(0);
                                            setCurrentYear(currentYear + 1);
                                        } else {
                                            setCurrentMonth(currentMonth + 1);
                                        }
                                        setSelectedDay(null);
                                    }}
                                >&gt;</button>
                            </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-600 mb-2">
                            <div className="font-bold">SUN</div>
                            <div className="font-bold">MON</div>
                            <div className="font-bold">TUE</div>
                            <div className="font-bold">WED</div>
                            <div className="font-bold">THU</div>
                            <div className="font-bold">FRI</div>
                            <div className="font-bold">SAT</div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2 text-sm flex-1 auto-rows-min">
                            {calendarCells}
                        </div>

                        {/* Footer timezone & action */}
                        <div className="mt-6 w-full border-t pt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM5 20h14a2 2 0 002-2v-5a5 5 0 00-5-5H8a5 5 0 00-5 5v5a2 2 0 002 2z" />
                                </svg>
                                Eastern Time - US &amp; Canada (11:07 AM)
                            </div>
                            <div className="flex items-center gap-2">
                                <button aria-label="Troubleshoot" className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-blue-50 border-blue-900 text-blue-900">
                                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9.75 17a2.25 2.25 0 004.5 0m-7.5-6.75a6 6 0 1112 0v3.75a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 015.25 14V10.25z" />
                                    </svg>
                                    Troubleshoot
                                </button>
                                <span className="text-xs text-gray-500">ⓘ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedDay
                                ? `Schedule Meeting for ${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
                                : "Select a date"}
                        </h3>
                        <label className="block mb-2">
                            Title
                            <input
                                type="text"
                                value={meetingTitle}
                                onChange={e => setMeetingTitle(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                            />
                        </label>
                        <label className="block mb-4">
                            Time
                            <input
                                type="time"
                                value={meetingTime}
                                onChange={e => setMeetingTime(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                                min="08:00"
                                max="17:00"
                            />
                        </label>
                        <label className="block mb-2">
                            URL
                            <input
                                type="text"
                                value={meetingURL}
                                onChange={e => setMeetingURL(e.target.value)}
                                className="w-full border rounded px-2 py-1"
                            />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-1"
                                onClick={() => setModalOpen(false)}
                            >Cancel</button>
                            <button
                                className="px-3 py-1 bg-blue-900 text-white rounded"
                                onClick={handleSaveMeeting}
                            >Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Scheduling;