import React, { useState, useEffect } from "react";
import axios from "axios";
import GenerateGraphs from "../diseaseManagement_home/visualization/GenerateGraphs";
import HarvestGraphs from "./Visualisation/HarvestGraphs";

function LastMonthHarvestRecords() {
    const [plantSummaries, setPlantSummaries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/record')
            .then((response) => {
                const currentDate = new Date();
                const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1; // Adjusting for January
                const lastMonthRecords = response.data.data.filter(record => {
                    const recordDate = new Date(record.date); // Assuming there's a date property in your harvest records
                    return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === currentDate.getFullYear();
                });

                // Calculate the sum of harvests for each plant type
                const summaries = {};
                lastMonthRecords.forEach(record => {
                    if (summaries[record.cropType]) {
                        summaries[record.cropType] += record.quantity;
                    } else {
                        summaries[record.cropType] = record.quantity;
                    }
                });

                // Convert summaries object to an array of objects for easier mapping
                const summaryArray = Object.entries(summaries).map(([cropType, sum]) => ({ cropType, sum }));

                setPlantSummaries(summaryArray);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching last month\'s harvest records:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div>
                <h1 className="px-6 py-6 text-2xl font-bold w-full ">
                    HARVEST MANAGEMENT
                </h1>
                <p className="px-6 py-6 ">This month's summary</p>
            </div>




                <div className="flex flex-row">
                    {plantSummaries.map((summary, index) => (
                        <div key={index}
                             className="flex flex-col items-center justify-center rounded-lg shadow-lg bg-green-300 max-w-2xl w-full mb-4 mr-4 hover:bg-green-400"
                             style={{minWidth: "300px"}} // Optional: Set a minimum width for each item
                        >
                            <h3 className="text-2xl font-bold capitalize">{summary.cropType}</h3>
                            <p>Sum of harvests: {summary.sum} kg</p>
                        </div>
                    ))}
                </div>



            <div>
                <HarvestGraphs/>
            </div>
        </div>
    );
}

export default LastMonthHarvestRecords;
