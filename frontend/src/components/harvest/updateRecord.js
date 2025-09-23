import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const EditHarvest = () => {
    const [date, setDate] = useState('');
    const [cropType, setCropType] = useState('');
    const [ageOfYield, setAgeOfYield] = useState('');
    const [wayPicked, setWayPicked] = useState('');
    const [quantity, setQuantity] = useState('');
    const [treesPicked, setTreesPicked] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5555/record/${id}`)
            .then((response) => {
                setDate(response.data.date.split("T")[0]);
                setCropType(response.data.cropType);
                setAgeOfYield(response.data.ageOfYield);
                setWayPicked(response.data.wayPicked);
                setQuantity(response.data.quantity);
                setTreesPicked(response.data.treesPicked);
                setRemarks(response.data.remarks);
                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });
    }, [id]);

    const handleEdit = (e) => {
        e.preventDefault();
        const data = {
            date,
            cropType,
            ageOfYield,
            wayPicked,
            quantity,
            treesPicked,
            remarks,
        };
        setLoading(true);
        axios
            .put(`http://localhost:5555/record/${id}`, data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Edited successfully', { variant: 'success' });
                navigate('/harvest/harvestRecords');
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error editing record', { variant: 'error' });
                console.log(error);
            });
    };

    return (
        <div className="mx-auto py-10">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">Edit Harvest Record</h1>
            </div>
            <form className="max-w-md mx-auto mt-6" onSubmit={handleEdit}>
                <div className="space-y-8 px-4 py-6 bg-gray-100 border rounded-lg">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-900">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="cropType" className="block text-sm font-medium text-gray-900">Crop Type</label>
                        <select
                            value={cropType}
                            onChange={(e) => setCropType(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        >
                            <option value="">Select Crop Type</option>
                            <option value="coconut">Coconut</option>
                            <option value="papaya">Papaya</option>
                            <option value="guava">Guava</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ageOfYield" className="block text-sm font-medium text-gray-900">Age of the Yield
                            (days)</label>
                        <input
                            type="text"
                            name="ageOfYield"
                            value={ageOfYield}
                            onChange={(e) => setAgeOfYield(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="wayPicked" className="block text-sm font-medium text-gray-900">Way
                            Picked</label>
                        <input
                            type="text"
                            name="wayPicked"
                            value={wayPicked}
                            onChange={(e) => setWayPicked(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-900">Quantity
                            (kg)</label>
                        <input
                            type="text"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="treesPicked" className="block text-sm font-medium text-gray-900">Trees
                            Picked</label>
                        <input
                            type="text"
                            name="treesPicked"
                            value={treesPicked}
                            onChange={(e) => setTreesPicked(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-900">Remarks</label>
                        <textarea
                            name="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-md text-gray-900"
                            required
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    >
                        Update
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 ml-4 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => navigate('/harvest/records')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditHarvest;
