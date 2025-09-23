import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {FaCheck, FaCross, FaSync} from "react-icons/fa";
import {GiCancel} from "react-icons/gi";

export default function ViewDisease() {

    const [DiseaseRecords, setDiseaseRecord] = useState({});
    const [loading, setLoading] = useState(false);
    const [treatedRecords, setTreatedRecords] = useState(new Set());
    const [resetRecords, setResetRecords] = useState(new Set());
    const [untreatedRecords, setUntreatedRecords] = useState(new Set());
    const [showTreatedButtons, setShowTreatedButtons] = useState(true);
    const {id} = useParams();

    useEffect(() => {
        const storedTreatedRecords = localStorage.getItem("treatedRecords");
        const storedUntreatedRecords = localStorage.getItem("untreatedRecords");
        const storedResetRecords = localStorage.getItem("resetRecords");
        const storedShowTreatedButtons = localStorage.getItem("showTreatedButtons");

        if (storedTreatedRecords) {
            setTreatedRecords(new Set(JSON.parse(storedTreatedRecords)));
        }
        if(storedUntreatedRecords) {
            setUntreatedRecords(new Set(JSON.parse(storedUntreatedRecords)));
        }
        if (storedResetRecords) {
            setResetRecords(new Set(JSON.parse(storedResetRecords)));
        }
        if (storedShowTreatedButtons) {
            setShowTreatedButtons(JSON.parse(storedShowTreatedButtons));
        }

        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/diseases/${id}`)
            .then((response) => {
                setDiseaseRecord(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem("treatedRecords", JSON.stringify(Array.from(treatedRecords)));
        localStorage.setItem("untreatedRecords", JSON.stringify(Array.from(untreatedRecords)));
        localStorage.setItem("resetRecords", JSON.stringify(Array.from(resetRecords)));
        localStorage.setItem("showTreatedButtons", JSON.stringify(showTreatedButtons));
    }, [treatedRecords, untreatedRecords, resetRecords, showTreatedButtons]);


    const getSevenDays = (initialDate) => {
        const sevenDates = [];
        const currentDate = new Date(initialDate);
        for(let i = 0; i < 7; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            sevenDates.push(nextDate.toLocaleDateString());
        }
        return sevenDates;
    };

    const isPlantRecovered = DiseaseRecords.status !== "Recovered";
    const handleTreatedClick = (index) => {
        const updatedTreatedRecords = new Set(treatedRecords);
        updatedTreatedRecords.add(index);
        setTreatedRecords(updatedTreatedRecords);
    };

    const handleUntreatedClick = (index) => {
        const updatedUntreatedRecords = new Set(untreatedRecords);
        updatedUntreatedRecords.add(index);
        setUntreatedRecords(updatedUntreatedRecords);
    };

    const handleResetClick = (index) => {
        const updatedResetRecords = new Set(resetRecords);
        updatedResetRecords.add(index);
        setResetRecords(updatedResetRecords);
        setTreatedRecords((prev) => {
            const updated = new Set(prev);
            updated.delete(index);
            return updated;
        });
        setUntreatedRecords((prev) => {
            const updated = new Set(prev);
            updated.delete(index);
            return updated;
        });
        setShowTreatedButtons(true);
    };

    const isRecordTreated = (index) => treatedRecords.has(index);
    const isRecordUntreated = (index) => untreatedRecords.has(index);
    const isRecordReset = (index) => resetRecords.has(index);

    return (
        <div className="px-8 py-8">
            <div className="px-4 sm:px-0">
                <h3 className="text-base font-bold leading-7 text-gray-900">RECORD DETAILS</h3>
                <p className="mt-1 text-sm font-normal text-gray-500 0">View details regarding diseased plants...</p>
            </div>
            <div className=' mt-4 flex flex-wrap border-green-400 rounded-xl w-full p-4  border-2'>
                <div className=" w-full md:w-1/2 pr-2">
                    <div className='my-2 mr-4'>
                        <span className='text-lg mr-4 text-gray-500'>Disease Name :</span>
                        <span>{DiseaseRecords.disease_name}</span>
                    </div>
                    <div className='my-2 mr-4'>
                        <span className='text-lg mr-4 text-gray-500'>Crop Type :</span>
                        <span>{DiseaseRecords.crop}</span>
                    </div>
                </div>
                <div className="w-full md:w-1/2 pr-2">
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Date Detected :</span>
                        <span>{DiseaseRecords.date}</span>
                    </div>
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Location : </span>
                        <span>{DiseaseRecords.location}</span>
                    </div>
                </div>
                <div className=" w-full md:w-1/2 pr-2">
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Trees Affected : </span>
                        <span>{DiseaseRecords.plant_count}</span>
                    </div>
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Severity :</span>
                        <span>{DiseaseRecords.severity}</span>
                    </div>
                </div>
                <div className=" w-full md:w-1/2 pr-2">
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Treatment Used :</span>
                        <span>{DiseaseRecords.treatment}</span>
                    </div>
                    <div className='my-2'>
                        <span className='text-lg mr-4 text-gray-500'>Status</span>
                        <span>{DiseaseRecords.status}</span>
                    </div>
                </div>
            </div>
            <div className="px-4 sm:px-0 mt-4">
                <h3 className="text-base font-bold leading-7 text-gray-900">TREATMENT PLAN</h3>
            </div>
            {isPlantRecovered && (
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 mt-2 ">
                    <thead
                        className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                    <tr className=" ">
                        <th></th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Treatment</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                    </thead>
                    <tbody className="border-b border-green-400">
                    {getSevenDays(DiseaseRecords.date).map((date, index) => (
                        <tr key={index} className="divide-y">
                            <td></td>
                            <td className="px-6 py-4">
                                {date}
                            </td>
                            <td className="px-6 py-4">
                                {DiseaseRecords.treatment}
                            </td>
                            <td className="px-6 py-4">
                                {isRecordTreated(index) ? (
                                    <>
                                    <button className=" mr-4">
                                        <FaCheck className="text-green-500"/>
                                    </button>
                                    <button
                                        onClick={() => handleResetClick(index)}
                                    >
                                        <FaSync className= "text-gray-500"/>
                                    </button>
                                    </>
                                ) : isRecordUntreated(index) ? (
                                    <>
                                        <button className=" mr-4">
                                            <GiCancel className="text-red-500"/>
                                        </button>
                                        <button
                                            onClick={() => handleResetClick(index)}
                                        >
                                            <FaSync className= "text-gray-500"/>
                                        </button>
                                    </>
                                ) : showTreatedButtons ? (
                                    <>
                                    <button
                                        onClick={() => handleTreatedClick(index)}
                                        className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg mr-2">
                                        Treated
                                    </button>
                                    <button
                                        onClick={() => handleUntreatedClick(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg mr-2">
                                    Untreated
                                    </button>
                                    </>
                                    ) : null}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
