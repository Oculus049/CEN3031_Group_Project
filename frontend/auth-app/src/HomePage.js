import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();
    const [view, setView] = useState("monthly");
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const [currentMonth, setCurrentMonth] = useState(7); // August (0-based)
    const [currentYear, setCurrentYear] = useState(2025);

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    function firstWeekdayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

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

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    return (
        <div className="bg-[#FFA500] min-h-screen font-sans">
            {/* Navigation Bar */}
            <nav className="bg-blue-900">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <span className="text-2xl font-bold text-white">Group-UP</span>
                    </div>
                    <div> 
                        <span className="text-white text-2xl">👤</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-8">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/scheduling">
                        <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800">
                            + New Meeting
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold text-blue-900">Welcome!</h1>
                </div>

                <div className="flex space-x-6">
                    {/* SIDEBAR */}
                    <aside className="w-1/4 bg-white p-4 rounded-xl shadow-md">
                        {/* View toggles */}
                        <div className="mb-6">
                            <div className="flex mb-3">
                                <button
                                    className={`px-3 py-1 rounded-l-md ${view === "monthly" ? "bg-[#FFA500] text-white" : "bg-gray-100 text-blue-900"}`}
                                    onClick={() => setView("monthly")}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`px-3 py-1 rounded-r-md ${view === "weekly" ? "bg-[#FFA500] text-white" : "bg-gray-100 text-blue-900"}`}
                                    onClick={() => setView("weekly")}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                        {/* Status legend */}
                        <div>
                            <p className="font-semibold mb-2">Status</p>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                    Unassigned
                                </li>
                                <li className="flex items-center">
                                    <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                    In progress
                                </li>
                                <li className="flex items-center">
                                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    Completed
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Monthly View */}
                    {view === "monthly" && (
                        <section className="flex-1 bg-white p-4 rounded-xl shadow-md">
                            <div className="flex items-center justify-center mb-4 gap-4">
                                <button
                                    className="text-blue-900 text-2xl"
                                    onClick={handlePrevMonth}
                                    aria-label="Previous month"
                                >&lt;</button>
                                <div className="text-xl font-semibold text-blue-900 min-w-[120px] text-center">
                                    {monthNames[currentMonth]} {currentYear}
                                </div>
                                <button
                                    className="text-blue-900 text-2xl"
                                    onClick={handleNextMonth}
                                    aria-label="Next month"
                                >&gt;</button>
                            </div>
                            <table className="w-full border-collapse text-gray-700 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border w-16">Sun</th>
                                        <th className="px-4 py-2 border w-16">Mon</th>
                                        <th className="px-4 py-2 border w-16">Tue</th>
                                        <th className="px-4 py-2 border w-16">Wed</th>
                                        <th className="px-4 py-2 border w-16">Thu</th>
                                        <th className="px-4 py-2 border w-16">Fri</th>
                                        <th className="px-4 py-2 border w-16">Sat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const days = daysInMonth(currentYear, currentMonth);
                                        const offset = firstWeekdayOfMonth(currentYear, currentMonth);
                                        const cells = [];
                                        for (let i = 0; i < offset; i++) {
                                            cells.push(<td key={`blank-${i}`} className="border h-24 p-1 w-16"></td>);
                                        }
                                        for (let day = 1; day <= days; day++) {
                                            cells.push(
                                                <td key={day} className="border h-24 p-1 text-left align-top w-16">
                                                    {day}
                                                </td>
                                            );
                                        }
                                        // Fill out the last row with blanks if needed
                                        while (cells.length % 7 !== 0) {
                                            cells.push(<td key={`end-blank-${cells.length}`} className="border h-24 p-1 w-16"></td>);
                                        }
                                        // Split into rows of 7
                                        const rows = [];
                                        for (let i = 0; i < cells.length; i += 7) {
                                            rows.push(<tr key={i}>{cells.slice(i, i + 7)}</tr>);
                                        }
                                        return rows;
                                    })()}
                                </tbody>
                            </table>
                        </section>
                    )}

                    {/* Weekly View */}
                    {view === "weekly" && (
                        <section className="flex-1 bg-white p-4 rounded-xl shadow-md">
                            <h2 className="text-xl font-semibold text-blue-900 mb-4">Weekly Meetings</h2>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>No meetings scheduled this week.</li>
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;