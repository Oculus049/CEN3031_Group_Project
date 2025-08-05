import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();
    const [view, setView] = useState("monthly");

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

    return (
        <div className="bg-[#FFA500] min-h-screen font-sans">
            {/* Navigation Bar */}
            <nav className="bg-blue-900">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <span className="text-2xl font-bold text-white">Group-UP</span>
                        <a href="#" className="text-white hover:underline">Dashboard</a>
                        <a href="#" className="text-white hover:underline">Schedule</a>
                        <a href="#" className="text-white hover:underline">Participants</a>
                        <a href="#" className="text-white hover:underline">Settings</a>
                    </div>
                    <div> 
                        <span className="text-white text-2xl">👤</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-8">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800">
                        + New Meeting
                    </button>
                    <h1 className="text-3xl font-bold text-blue-900">Welcome user!</h1>
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
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xl font-semibold text-blue-900">July 2025</div>
                                <button className="text-blue-900 text-2xl">&gt;</button>
                            </div>
                            <table className="w-full border-collapse text-gray-700 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border">Sun</th>
                                        <th className="px-4 py-2 border">Mon</th>
                                        <th className="px-4 py-2 border">Tue</th>
                                        <th className="px-4 py-2 border">Wed</th>
                                        <th className="px-4 py-2 border">Thu</th>
                                        <th className="px-4 py-2 border">Fri</th>
                                        <th className="px-4 py-2 border">Sat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(4)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(7)].map((_, j) => (
                                                <td key={j} className="border h-24 p-1"></td>
                                            ))}
                                        </tr>
                                    ))}
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