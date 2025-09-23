import React, { useState, useEffect } from "react";
import axios from "axios";
import { GiCoconuts } from "react-icons/gi";
import { IoCloseCircle } from "react-icons/io5";

export default function CropOneTile() {
    const [loading, setLoading] = useState(true);
    const [plantingRecords, setPlantingRecords] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [averageCropAge, setAverageCropAge] = useState(null);
    const [harvestArea, setHarvestArea] = useState(null);
    const [totalPlantingCost, setTotalPlantingCost] = useState(null);
    const [agrochemicalSum, setAgrochemicalSum] = useState(null);
    const [marketPriceRecord, setMarketPriceRecord] = useState(null);
    const [totalAgrochemicalCost, setTotalAgrochemicalCost] = useState(null);

    const handleTileClick = () => {
        setShowPopup(true);
    };

    const fieldAcreageData = [
        { Field: 'Field A', Area: 2 },
        { Field: 'Field B', Area: 2.5 },
        { Field: 'Field C', Area: 1 },
        { Field: 'Field D', Area: 2 },
        { Field: 'Field E', Area: 1 },
        { Field: 'Field F', Area: 0.5 },
        { Field: 'Field G', Area: 1 },
    ];

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/cropinput')
            .then((response) => {
                const plantingRecordsData = response.data.data;
                const filteredPlantingRecords = plantingRecordsData.filter(record => record.type === 'Planting' && record.cropType === 'Coconut');
                setPlantingRecords(filteredPlantingRecords);
                setLoading(false);

                // Calculate average crop age
                const totalAgeInDays = filteredPlantingRecords.reduce((total, record) => {
                    const plantingDate = new Date(record.date);
                    const currentDate = new Date();
                    const diffTime = Math.abs(currentDate - plantingDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
                    return total + diffDays;
                }, 0);
                const averageAgeInMonths = Math.floor(totalAgeInDays / 30);
                const averageAgeInYears = Math.floor(totalAgeInDays / 365);

                // Set average crop age based on duration
                if (averageAgeInYears >= 1) {
                    setAverageCropAge(`${averageAgeInYears} years`);
                } else {
                    setAverageCropAge(`${averageAgeInMonths} months`);
                }

                // Calculate and set harvest area
                const fields = filteredPlantingRecords.map(record => record.field);
                const totalArea = calculateHarvestArea(fields);
                setHarvestArea(totalArea);

                const totalCost = calculateTotalCost(filteredPlantingRecords);
                setTotalPlantingCost(totalCost);

                // Filter agrochemical records where Coconut is planted
                const filteredAgrochemicalRecords = response.data.data.filter(record => record.type === 'Agrochemical' && filteredPlantingRecords.some(plantingRecord => plantingRecord.field === record.field));
                const agrochemicalSumByField = calculateAgrochemicalSum(filteredAgrochemicalRecords);
                setAgrochemicalSum(agrochemicalSumByField);

                // Calculate total agrochemical cost
                const totalAgrochemicalCost = Object.values(agrochemicalSumByField).reduce((total, sum) => total + sum, 0);
                setTotalAgrochemicalCost(totalAgrochemicalCost);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
        axios
            .get('http://localhost:5555/marketprice')
            .then((response) => {
                const marketPriceData = response.data.data;
                const closestRecord = findClosestRecord(marketPriceData);
                setMarketPriceRecord(closestRecord);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const findClosestRecord = (records) => {
        const currentDate = new Date();
        let closestRecord = null;
        let minDifference = Infinity;
        records.filter(record => record.name === "Coconut").forEach(record => {
            const recordDate = new Date(record.date);
            const difference = Math.abs(currentDate - recordDate);
            if (difference < minDifference) {
                minDifference = difference;
                closestRecord = record;
            }
        });
        return closestRecord;
    };

    const calculateHarvestArea = (fields) => {
        let totalArea = 0;
        const fieldsArray = toArray(fields);
        fieldsArray.forEach(field => {
            const foundField = fieldAcreageData.find(item => item.Field === field);
            if (foundField) {
                totalArea += foundField.Area;
            }
        });
        return totalArea;
    };

    const toArray = (fields) => {
        if (Array.isArray(fields)) {
            return fields;
        } else if (typeof fields === 'string') {
            return [fields];
        } else {
            return [];
        }
    };

    const calculateTotalCost = (records) => {
        return records.reduce((total, record) => {
            return total + (record.unitCost * record.quantity);
        }, 0);
    };

    const calculateAgrochemicalSum = (records) => {
        return records.reduce((sums, record) => {
            if (!sums[record.field]) {
                sums[record.field] = 0;
            }
            sums[record.field] += record.unitCost * record.quantity;
            return sums;
        }, {});
    };

    return (
        <div>
            <li className="rounded-xl text-center bg-lime-200 px-6 py-8 items-center hover:transform hover:scale-110 transition-transform duration-300" onClick={handleTileClick}>
                <GiCoconuts className="mx-auto h-10 w-10 "/>
                <h3 className="my-3 font-display font-medium">Coconut</h3>
                <p className="mt-1.5 text-sm leading-6 text-secondary-500">
                    {loading ? 'Loading...' : `Harvest Area - ${harvestArea} acres`} <br/>
                    {averageCropAge && `Average Crop Age - ${averageCropAge}`}
                </p>
            </li>
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur bg-opacity-50">
                    <div
                        className="shadow-lg bg-white rounded-lg p-8 w-1/3 min-w-32 relative border border-gray-300">
                        <IoCloseCircle onClick={() => setShowPopup(false)}
                                       className="absolute top-2 right-2 cursor-pointer"/>
                        <GiCoconuts className="mx-auto h-10 w-10"/>
                        <h3 className="text-lg font-semibold mb-2">Coconut</h3>
                        <p>Planted in: {plantingRecords.map((record) => (
                            <span key={record.id}>{record.field}</span>
                        ))}</p>
                        <p>Planting Cost: Rs. {totalPlantingCost ? totalPlantingCost.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) : 'Loading...'}</p>
                        <p>Agrochemical Cost: {agrochemicalSum ? Object.entries(agrochemicalSum).map(([field, sum]) => `${field}: Rs. ${sum.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`).join(', ') : 'Loading...'}</p>
                        <p>Total Cost for Coconut: {totalPlantingCost && totalAgrochemicalCost ? (totalPlantingCost + totalAgrochemicalCost).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) : 'Loading...'}</p><br/>
                            <p>Most recent market price :
                                Rs. {80} on 2024-05-05</p>
                        <p>Harvest to break-even at above price: {Math.ceil((totalPlantingCost + totalAgrochemicalCost) / 80).toLocaleString('en-US')} coconuts</p>
                    </div>
                </div>
            )}
        </div>
    );
}
