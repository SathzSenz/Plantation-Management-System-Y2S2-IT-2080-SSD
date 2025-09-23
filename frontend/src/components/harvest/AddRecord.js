import React, { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function AddRecord() {
    const [date, setDate] = useState('');
    const [cropType, setCropType] = useState('');
    const [ageOfYield, setAgeOfYield] = useState('');
    const [wayPicked, setWayPicked] = useState('');
    const [quantity, setQuantity] = useState('');
    const [treesPicked, setTreesPicked] = useState('');
    const [remarks, setRemarks] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);



    const handleSubmit = async (e) => {
        e.preventDefault();

            const data = {
                date,
                cropType,
                ageOfYield,
                wayPicked,
                quantity,
                treesPicked,
                remarks
            };
        setLoading(true);
        axios
            .post('http://localhost:5555/record', data)
            .then(() => {
                setLoading(false);
                navigate('/harvest/harvestRecords');
                window.alert("Record Added Successfully!");
        })
            .catch((error) => {
                setLoading(false);
                alert('An error happened. Please check console');
                console.log(error);
            });
    };

    const handleAgeOfYieldChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setAgeOfYield(value);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setQuantity(value);
        }
    };

    const handleTreesPickedChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setTreesPicked(value);
        }
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col ml-96 mt-6">
                <h1 className="text-2xl font-bold mb-5">Record Harvestings</h1>
                <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Crop Type:</label>
                        <select
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select Crop Type</option>
                            <option value="coconut">Coconut</option>
                            <option value="papaya">Papaya</option>
                            <option value="guava">Guava</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Age of the Yield (days):</label>
                        <input
                            type="text"
                            value={ageOfYield}
                            onChange={handleAgeOfYieldChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Way Picked:</label>
                        <input
                            type="text"
                            value={wayPicked}
                            onChange={(e) => setWayPicked(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Quantity (kg):</label>
                        <input
                            type="text"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Trees Picked:</label>
                        <input
                            type="text"
                            value={treesPicked}
                            onChange={handleTreesPickedChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Remarks:</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-400"
                    >
                        Submit
                    </button>
                </form>

            </div>
        </div>

    );
}
