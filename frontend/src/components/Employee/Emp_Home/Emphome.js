import React, { useEffect, useState } from "react";
import { FaUsers, FaUserPlus, FaTasks, FaCalendarPlus, FaRegUser, FaCheckSquare } from "react-icons/fa";
import axios from "axios";
import {Link} from "react-router-dom";

function Emphome() {
    const [loading, setLoading] = useState(false);
    const [employeeRecords, setEmployeeRecords] = useState([]);
    const [taskRecords, setTaskRecords] = useState([]);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [registeredThisWeek, setRegisteredThisWeek] = useState(0);

    useEffect(() => {
        setLoading(true);
        axios.get('${process.env.REACT_APP_API_BASE_URL}/employeeRecords')
            .then(response => {
                setEmployeeRecords(response.data.data)
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching total records: ', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get('${process.env.REACT_APP_API_BASE_URL}/taskRecords')
            .then(response => {
                setTaskRecords(response.data.data);
                setCompletedTasks(response.data.data.filter(task => task.task_status === "completed").length);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching task records: ', error);
                setLoading(false);
            });
    }, []);

    // Calculate the count of employees registered in the current week
    useEffect(() => {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Start of current week
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay())); // End of current week

        const registeredThisWeekCount = employeeRecords.filter(record => {
            const createdAtDate = new Date(record.createdAt);
            return createdAtDate >= startOfWeek && createdAtDate <= endOfWeek;
        }).length;

        setRegisteredThisWeek(registeredThisWeekCount);
    }, [employeeRecords]);



    const getPermanentEmpCount = employeeRecords.filter(
        (record) => record.emp_type === "permanent"
    ).length;

    const getOngoingTaskCount = taskRecords.filter(
        (record) => record.task_status === "inprogress"
    ).length;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl text-center mb-4">
                <span className="text-black font-semibold">Employee Management System</span>
            </h1>
            <p className="text-center mb-12 mt-2 text-gray-500 font-semibold">Welcome to the Employee Management System.</p>
            <div className="section mb-8">
                <div className="section-header flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold">Employee Registration</h2>
                    <Link to="/employees/registration" className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300">
                        View All Employees
                    </Link>
                </div>
                <div className="section-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-between">
                    <div className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-24">
                        <FaUsers className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">Total No of Employees</h3>
                        <p className="text-xl text-black">{employeeRecords.length}</p>
                    </div>
                    <div className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-36">
                        <FaUserPlus className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">Registered in this week</h3>
                        <p className="text-xl text-black">{registeredThisWeek}</p>
                    </div>
                    <div className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-48">
                        <FaRegUser className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">No of Permanent Employees</h3>
                        <p className="text-xl text-black">{getPermanentEmpCount}</p>
                    </div>
                </div>
            </div>
            <div className="section mb-8">
                <div className="section-header flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold">Assign Tasks</h2>
                    <Link to="/employees/tasks" className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300">
                        View All Tasks
                    </Link>
                </div>
                <div className="section-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-between">
                    <div
                        className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-24">
                        <FaTasks className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">Total No of Tasks</h3>
                        <p className="text-xl text-black">{taskRecords.length}</p>
                    </div>
                    <div
                        className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-36">
                        <FaCalendarPlus className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">In progress tasks</h3>
                        <p className="text-xl text-black">{getOngoingTaskCount}</p>
                    </div>
                    <div
                        className="card bg-lime-300 p-6 hover:bg-lime-400 shadow-lg transition-shadow duration-300 ease-in-out rounded-lg w-80 h-56 flex flex-col items-center justify-center space-y-3 ml-48">
                        <FaCheckSquare className="text-black text-3xl"/>
                        <h3 className="text-lg font-semibold text-black">No of Completed Tasks</h3>
                        <p className="text-xl text-black">{completedTasks}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Emphome;
