import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoCloseCircle } from "react-icons/io5";

export default function CropTwoTile() {
    const [loading, setLoading] = useState(true);
    const [plantingRecords, setPlantingRecords] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [averageCropAge, setAverageCropAge] = useState(null);
    const [cropArea, setCropArea] = useState(null);
    const [totalPlantingCost, setTotalPlantingCost] = useState(null);
    const [totalAgrochemicalCost, setTotalAgrochemicalCost] = useState(null);
    const [marketPriceRecord, setMarketPriceRecord] = useState(null);

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
            .get('${process.env.REACT_APP_API_BASE_URL}/cropinput')
            .then((response) => {
                const plantingRecordsData = response.data.data;
                const filteredPlantingRecords = plantingRecordsData.filter(record => record.type === 'Planting' && record.cropType === 'Papaya');
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

                // Calculate crop area
                const fields = filteredPlantingRecords.map(record => record.field);
                const totalArea = calculateCropArea(fields);
                setCropArea(totalArea);

                const totalPlantingCost = calculateTotalCost(filteredPlantingRecords);
                setTotalPlantingCost(totalPlantingCost);

                // Calculate total agrochemical cost
                const agrochemicalRecords = response.data.data.filter(record => record.type === 'Agrochemical' && fields.includes(record.field));
                const totalAgrochemicalCost = calculateTotalCost(agrochemicalRecords);
                setTotalAgrochemicalCost(totalAgrochemicalCost);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

        axios
            .get('${process.env.REACT_APP_API_BASE_URL}/marketprice')
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
        records.filter(record => record.name === "Papaya").forEach(record => {
            const recordDate = new Date(record.date);
            const difference = Math.abs(currentDate - recordDate);
            if (difference < minDifference) {
                minDifference = difference;
                closestRecord = record;
            }
        });
        return closestRecord;
    };

    const calculateCropArea = (fields) => {
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

    return (
        <div>
            <li className="rounded-xl text-center bg-lime-200 px-6 py-8 hover:transform hover:scale-110 transition-transform duration-300" onClick={handleTileClick}>
                <img src="https://cdn-icons-png.flaticon.com/512/681/681028.png" alt="" className="mx-auto h-10 w-10" />
                <h3 className="my-3 font-display font-medium group-hover:text-primary-500">Papaya</h3>
                <p className="mt-1.5 text-sm leading-6 text-secondary-500">
                    {loading ? 'Loading...' : `Crop Area - ${cropArea} acres`} <br/>
                    {averageCropAge && `Average Crop Age - ${averageCropAge}`}
                </p>
            </li>
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur bg-opacity-50">
                    <div className="shadow-lg bg-white rounded-lg p-8 w-5/12 max-w-md relative border border-gray-300">
                        <IoCloseCircle onClick={() => setShowPopup(false)}
                                       className="absolute top-2 right-2 cursor-pointer"/>
                        <img src="https://cdn-icons-png.flaticon.com/512/681/681028.png" className="mx-auto h-10 w-10"
                             alt="papaya icon"/>
                        <h3 className="text-lg font-semibold mb-2">Papaya</h3>
                        <p>Planted in: {plantingRecords.map((record, index) => (
                            <span key={record.id}>{index > 0 && ", "}{record.field}</span>
                        ))}</p> <br/>
                        <p>Total Planting Cost: Rs. {totalPlantingCost ? totalPlantingCost.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) : 'Loading...'}</p>
                        <p>Total Agrochemical Cost:
                            Rs. {totalAgrochemicalCost ? totalAgrochemicalCost.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) : 'Loading...'}</p>
                        <p>Total Cost for
                            Papaya: {totalPlantingCost && totalAgrochemicalCost ? (totalPlantingCost + totalAgrochemicalCost).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) : 'Loading...'}</p><br/>
                        {marketPriceRecord && (
                            <p>Most recent market price :
                                Rs. {(marketPriceRecord.min_price + marketPriceRecord.max_price) / 2} on {marketPriceRecord.date}</p>
                        )}
                        {marketPriceRecord && (
                            <p>Harvest to break-even at above price: {((totalPlantingCost + totalAgrochemicalCost) / ((marketPriceRecord.min_price + marketPriceRecord.max_price) / 2)).toLocaleString('en-US')} kg</p>
                        )}
                        </div>
                </div>
            )}
        </div>
    );
}
