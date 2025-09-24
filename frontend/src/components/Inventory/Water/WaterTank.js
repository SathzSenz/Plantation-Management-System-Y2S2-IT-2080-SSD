import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import {TrashIcon} from "@heroicons/react/24/outline";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
function PercentageRuler() {
    return (
        <div className="percentage-ruler absolute h-full top-0 left-0 flex flex-col justify-between items-center">
            <div className="text-xs">100%</div>
            <div className="text-xs">90%</div>
            <div className="text-xs">80%</div>
            <div className="text-xs">70%</div>
            <div className="text-xs">60%</div>
            <div className="text-xs">50%</div>
            <div className="text-xs">40%</div>
            <div className="text-xs">30%</div>
            <div className="text-xs">20%</div>
            <div className="text-xs">10%</div>
            <div className="text-xs">0%</div>
        </div>
    );
}
function WaterTank() {
    const [water_level1, setWater_level1] = useState('');
    const [water_level2, setWater_level2] = useState('');
    const [water_date, setWater_date] = useState('');
    const [water_des, setWater_des] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [waterRecords, setWaterRecord] = useState([]);
    const [loading, setLoading] = useState(false);
    const {getPermission, getPermissions} = useKindeAuth();

    const tank1Capacity = 100000;
    const tank2Capacity = 100000;

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            water_level1,
            water_level2,
            water_date,
            water_des
        };
        axios
            .post('${process.env.REACT_APP_API_BASE_URL}/waterRecords', data)
            .then((response) => {
                enqueueSnackbar('Record Created successfully', { variant: 'success' });
                setWaterRecord(prevRecords => [...prevRecords, response.data]);
                setWater_level1('');
                setWater_level2('');
                setWater_date('');
                setWater_des('');

                // Calculate total percentage of water based on the latest record
                const latestRecord = response.data;
                const totalPercentage = ((latestRecord.water_level1 + latestRecord.water_level2) / (tank1Capacity + tank2Capacity)) * 100;

                // Calculate the rate of decrease in water level per day
                const decreaseRatePerDay = calculateDecreaseRate(latestRecord, waterRecords[waterRecords.length - 1]);

                // Calculate the estimated number of days until water becomes 0%
                const daysToEmpty = calculateDaysToEmpty(decreaseRatePerDay);

                // Display the result
                if (isFinite(daysToEmpty)) {
                    enqueueSnackbar(`Water will be empty in approximately ${Math.ceil(daysToEmpty)} days.`, { variant: 'info' });
                    enqueueSnackbar(`Water Percentage is ${totalPercentage.toFixed(2)}%`, { variant: 'info' });
                }
            })
            .catch((error) => {
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    useEffect(() => {
        // Display the result when waterRecords state changes
        if (waterRecords.length > 0) {
            const latestRecord = waterRecords[waterRecords.length - 1];
            const totalPercentage = ((latestRecord.water_level1 + latestRecord.water_level2) / (tank1Capacity + tank2Capacity)) * 100;
            const decreaseRatePerDay = calculateDecreaseRate(latestRecord, waterRecords[waterRecords.length - 2]);
            const daysToEmpty = calculateDaysToEmpty(decreaseRatePerDay);

            if (isFinite(daysToEmpty)) {
                enqueueSnackbar(`Water will be empty in approximately ${Math.ceil(daysToEmpty)} days.`, { variant: 'info' });
                enqueueSnackbar(`Water Percentage is ${totalPercentage.toFixed(2)}%`, { variant: 'info' });
            }
        }
    }, [waterRecords]);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/waterRecords`)
            .then((response) => {
                setWaterRecord(response.data.data);
                setLoading(false);
                if (response.data.data.length > 0) {
                    const latestRecord = response.data.data[response.data.data.length - 1];
                }
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleDelete = (recordId) => {
        axios
            .delete(`${process.env.REACT_APP_API_BASE_URL}/waterRecords/${recordId}`)
            .then(() => {
                setWaterRecord(prevRecords => prevRecords.filter(record => record._id !== recordId));
                enqueueSnackbar('Record Deleted Successfully!', {
                    variant: 'success',
                    autoHideDuration: 6000,
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Calculate total percentage of water based on the latest record
    const latestRecord = waterRecords.length > 0 ? waterRecords[waterRecords.length - 1] : null;
    const totalPercentage = latestRecord ? ((latestRecord.water_level1 + latestRecord.water_level2) / (tank1Capacity + tank2Capacity)) * 100 : 0;

    // Calculate the rate of decrease in water level per day
    const calculateDecreaseRate = (latestRecord, prevRecord) => {
        if (!latestRecord || !prevRecord) return 0;
        let totalWaterRemaining = (prevRecord.water_level1 + prevRecord.water_level2) - (latestRecord.water_level1 + latestRecord.water_level2);

        // If the totalWaterRemaining is negative, it means water level increased
        if (totalWaterRemaining < 0) {
            totalWaterRemaining = (tank1Capacity + tank2Capacity) - (latestRecord.water_level1 + latestRecord.water_level2);
        }

        // Calculate the rate of decrease in water level per day
        const decreaseRatePerDay = totalWaterRemaining / 3; // Assuming each record is 7 days apart
        return decreaseRatePerDay;
    };

    // Calculate the estimated number of days until water becomes 0%
    const calculateDaysToEmpty = (decreaseRatePerDay) => {
        if (decreaseRatePerDay <= 0) return Infinity; // No decrease in water level

        // Get the latest water record
        const latestRecord = waterRecords[waterRecords.length - 1];

        // Calculate the total water remaining based on the latest record
        const totalWaterRemaining = (latestRecord.water_level1 + latestRecord.water_level2);

        // Calculate the estimated number of days until water becomes 0%
        const daysToEmpty = totalWaterRemaining / decreaseRatePerDay;
        return daysToEmpty;
    };

    // Calculate decrease rate and days to empty
    let decreaseRatePerDay = 0;
    let daysToEmpty = Infinity;
    {
        const latestRecord = waterRecords[waterRecords.length - 1];
        const prevRecord = waterRecords[waterRecords.length - 2];
        decreaseRatePerDay = calculateDecreaseRate(latestRecord, prevRecord);
        daysToEmpty = calculateDaysToEmpty(decreaseRatePerDay);
    }

    return (
        <div className="flex">
            <div className="flex-1 ml-16 mt-8 relative">
                <div className="WaterTank relative" style={{width: '400px', height: '600px'}}>
                    <h1 className="text-blue-500 text-3xl font-bold mb-4">Water Tank Visualization</h1>
                    <div className="border border-gray-400 rounded-md h-full relative overflow-hidden">
                        <div className="tank absolute bottom-0 bg-blue-500"
                             style={{height: `${totalPercentage}%`, width: '100%'}}/>
                        <PercentageRuler/>
                    </div>
                </div>
            </div>
            <div className="flex-1 mr-16 mt-20">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="water_level1" className="block text-gray-700 text-sm font-bold mb-2">
                            Enter Water Level 1:
                        </label>
                        <input
                            type="number"
                            name="water_level1"
                            value={water_level1}
                            onChange={(e) => setWater_level1(e.target.value)}
                            min="0"
                            max={tank1Capacity}
                            className="border border-gray-400 rounded-md p-2 w-80"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="water_level2" className="block text-gray-700 text-sm font-bold mb-2">
                            Enter Water Level 2:
                        </label>
                        <input
                            type="number"
                            name="water_level2"
                            value={water_level2}
                            onChange={(e) => setWater_level2(e.target.value)}
                            min="0"
                            max={tank2Capacity}
                            className="border border-gray-400 rounded-md p-2 w-80"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="water_date" className="block text-gray-700 text-sm font-bold mb-2">
                            Date:
                        </label>
                        <input
                            type="date"
                            name="water_date"
                            value={water_date}
                            onChange={(e) => setWater_date(e.target.value)}
                            className="border border-gray-400 rounded-md p-2 w-80"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="water_des" className="block text-gray-700 text-sm font-bold mb-2">
                            Description:
                        </label>
                        <textarea
                            name="water_des"
                            value={water_des}
                            rows={3}
                            onChange={(e) => setWater_des(e.target.value)}
                            className="border border-gray-400 rounded-md p-2 w-80"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>
                </form>
                <table className="border-collapse border border-gray-400 mt-10">
                    <thead className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                    <tr>
                        <th></th>
                        <th scope="col" className="px-6 py-3 border-r">No</th>
                        <th scope="col" className="px-6 py-3 border-r">Water Level 1</th>
                        <th scope="col" className="px-6 py-3 border-r">Water Level 2</th>
                        <th scope="col" className="px-6 py-3 border-r">Date</th>
                        <th scope="col" className="px-6 py-3 border-r">Description</th>
                        <th scope="col" className="px-6 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {waterRecords.map((record, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                <td></td>
                                <td className="px-6 py-4 border-r">{index + 1}</td>
                                <td className="px-6 py-4 border-r">{record.water_level1}</td>
                                <td className="px-6 py-4 border-r">{record.water_level2}</td>
                                <td className="px-6 py-4 border-r whitespace-nowrap">{record.water_date.split("T")[0]}</td>
                                <td className="px-6 py-4 border-r">{record.water_des ? record.water_des : "N/A"}</td>

                             
                                <td className="px-6 py-4">
                                    <div className="flex">
                                        <button
                                            className="flex items-center"
                                            onClick={() => handleDelete(record._id)}>
                                            <TrashIcon
                                                className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                                aria-hidden="true"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {index !== waterRecords.length - 1 && (
                                <tr>
                                    <td colSpan="7" className="border-b border-gray-400"></td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WaterTank;
