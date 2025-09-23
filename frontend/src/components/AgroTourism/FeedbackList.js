import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {FaEdit, FaSearch, FaTrash} from 'react-icons/fa';
import axios from 'axios';
import {PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";

const FeedbackList = () => {
    const [feedbackRecords, setFeedbackRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/feedback`)
            .then((response) => {
                setFeedbackRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setFilteredRecords(feedbackRecords);
    }, [feedbackRecords]);

    const handleSearch = (event) => {
        const searchQuery = event.target.value.toLowerCase();
        setSearchInput(searchQuery);
        const filtered = feedbackRecords.filter((record) => {
            return (
                record.name.toLowerCase().includes(searchQuery) ||
                record.email.toLowerCase().includes(searchQuery) ||
                record.feedback.toLowerCase().includes(searchQuery) ||
                record.rating.toString().includes(searchQuery)
            );
        });
        setFilteredRecords(filtered);
    };
    const handleDelete = (recordId) => {
        axios
            .delete(`${process.env.REACT_APP_API_BASE_URL}/feedback/${recordId}`)
            .then(() => {
                setFeedbackRecords((prevRecords) => prevRecords.filter((record) => record._id !== recordId));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <div className="flex items-center justify-center mb-4 mt-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={handleSearch}
                        className="border rounded-full px-3 py-1 pl-10 focus:outline-none focus:border-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-2 text-gray-400"/>
                </div>
                <Link to="/feedbackdash">
                    <button
                        className="bg-black text-white px-3 py-1 rounded-full hover:bg-emerald-700 focus:outline-none ml-2"
                    >
                        View Feedback Summary
                    </button>
                </Link>
            </div>


            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto flex justify-center">
                    <table id="feedback-table"
                           className="w-10/12 bg-white shadow-md rounded-md overflow-hidden  top-1/3 mb-10">
                        <thead
                            className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                        <tr>
                            <th className="px-6 py-3">No</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Feedback</th>
                            <th className="px-6 py-3">Rating</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRecords.map((record, index) => (
                            <tr className="hover:bg-gray-100" key={index}>
                                <td className="py-1 px-2 border border-gray-400">{index + 1}</td>
                                <td className="py-1 px-2 border border-gray-400">{record.name}</td>
                                <td className="py-1 px-2 border border-gray-400">{record.email}</td>
                                <td className="py-1 px-2 border border-gray-400">{record.feedback}</td>
                                <td className="py-1 px-2 border border-gray-400">{record.rating}</td>
                                <td className="py-1 px-2 border border-gray-400">
                                    <div className="flex">
                                        <Link
                                            to={`/feedback/${record._id}`} // Update the path to match the feedback form URL
                                            className="bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500 ">
                                            <PencilSquareIcon className="h-6 w-6 flex-none"/>
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            className="bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500">

                                            <TrashIcon className="h-6 w-6 flex-none"/>
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
