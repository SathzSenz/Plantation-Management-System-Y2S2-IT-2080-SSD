import React, { useEffect, useState } from 'react';
import { GiChemicalDrop, GiFertilizerBag } from "react-icons/gi";
import { FaTractor } from "react-icons/fa";
import { IoIosLeaf } from "react-icons/io";
import axios from "axios";
import NewBox from './newBox';
import { BsTools } from "react-icons/bs";

const InHome = () => {
    const [inventoryInputs, setInventoryInputs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inventoryRecords, setInventoryRecords] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/inventoryrecords`)
            .then((response) => {
                setInventoryRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/inventoryinputs`)
            .then((response) => {
                setInventoryInputs(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const getInProgressCount = inventoryRecords.filter(
        (record) => record.status === "In Progress"
    ).length;

    const equipmentCount = inventoryInputs
        .filter(record => record.type === 'Equipments')
        .reduce((total, record) => total + record.quantity, 0);


    const filteredRecords = inventoryInputs.filter((record) =>
        Object.values(record).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        })
    );

    return (
        <div className="bg-white py-24 sm:py-32 mt-[-96px]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="w-full">
                        <h1 className=" text-xl font-semibold text-left">
                            INVENTORY MANAGEMENT
                        </h1>
                        <p className=" mt-1 text-lg font-normal text-gray-500">
                            Welcome to inventory management....
                        </p>
                    </div>

                    <div className="flex justify-between items-center mt-10">
                        <div
                            className="py-12 flex flex-col items-center justify-center rounded-lg shadow-lg bg-lime-200 max-w-xs w-full mb-4 hover:bg-lime-100 mt-2 ml-24">
                            <div className="mt-2 mb-3">
                                <FaTractor className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className="text-center text-lg font-bold">No of Maintenance In Progress</div>
                            <div className="text-center text-xl font-medium mt-2">
                                {getInProgressCount}
                            </div>
                        </div>

                        <div
                            className="py-12 flex flex-col items-center justify-center rounded-lg shadow-lg bg-lime-200 max-w-xs w-full mb-4 hover:bg-lime-100 mt-2 ml-5">
                            <div className="mt-2 mb-3">
                                <BsTools className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className="text-center text-lg font-bold">Total Equipments</div>
                            <div className="text-center text-xl font-medium mt-2">
                                {equipmentCount}
                            </div>
                        </div>

                        <NewBox/>

                    </div>


                    <div
                        className="mt-10 grid grid-cols-1 gap-5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-3">
                        <div
                            className="flex flex-col bg-green-300 p-8 rounded-lg transition duration-300 ease-in-out hover:bg-green-400 hover:shadow-md">
                            <div className="flex items-center justify-center">
                                <IoIosLeaf className="text-5xl text-black mr-4"/>
                                <dt className="text-xl font-semibold leading-6 text-black">Plants</dt>
                            </div>
                            <div className="p-8">
                                {Object.values(
                                    filteredRecords
                                        .filter((record) => record.type === "Planting")
                                        .reduce((acc, record) => {
                                            if (!acc[record.record_name]) {
                                                acc[record.record_name] = {...record};
                                            } else {
                                                acc[record.record_name].quantity += record.quantity;
                                            }
                                            return acc;
                                        }, {})
                                ).map((record, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-row items-center gap-4 w-full justify-between ">
                                            <dd className="text-base tracking-tight sm:text-lg -ml-12">{record.record_name}</dd>
                                            <div
                                                className="text-base tracking-tight sm:text-lg -mr-10">{record.quantity} plants
                                            </div>
                                        </div>
                                        {index < Object.values(filteredRecords).length - 1 && (
                                            <hr className="my-4 -ml-12 -mr-10 border-black"/>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div
                            className="flex flex-col bg-blue-300 p-8 rounded-lg transition duration-300 ease-in-out hover:bg-blue-400 hover:shadow-md">
                            <div className="flex items-center justify-center">
                                <GiChemicalDrop className="text-5xl text-black mr-4"/>
                                <dt className="text-xl font-semibold leading-6 text-black">Agro Chemicals</dt>
                            </div>
                            <div className="p-8">
                                {Object.values(
                                    filteredRecords
                                        .filter((record) => record.type === "Agrochemical")
                                        .reduce((acc, record) => {
                                            const {record_name, size, quantity, unit} = record;
                                            const key = `${record_name}_${size}_${unit}`;

                                            if (!acc[key]) {
                                                acc[key] = {...record, quantity: size * quantity};
                                            } else {
                                                acc[key].quantity += size * quantity;
                                            }
                                            return acc;
                                        }, {})
                                ).map((record, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-row items-center gap-4 w-full justify-between">
                                            <dd className="text-base tracking-tight sm:text-lg -ml-12 text-left">{record.record_name} ({record.size}{record.unit})</dd>
                                            <div className="text-base tracking-tight sm:text-lg whitespace-nowrap">
                                                {`${record.quantity} ${record.unit}`}
                                            </div>
                                        </div>
                                        {index < Object.values(filteredRecords).length - 1 && (
                                            <hr className="my-4 -ml-12 -mr-10 border-black"/>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div
                            className="flex flex-col bg-yellow-300 p-8 rounded-lg transition duration-300 ease-in-out hover:bg-yellow-400 hover:shadow-md">
                            <div className="flex items-center justify-center">
                                <GiFertilizerBag className="text-5xl text-black mr-4"/>
                                <dt className="text-xl font-semibold leading-6 text-black">Fertilizers</dt>
                            </div>
                            <div className="p-8">
                                {Object.values(
                                    filteredRecords
                                        .filter((record) => record.type === "Fertilizer")
                                        .reduce((acc, record) => {
                                            const {record_name, size, quantity, unit} = record;
                                            const key = `${record_name}_${size}_${unit}`;

                                            if (!acc[key]) {
                                                acc[key] = {...record, quantity: size * quantity};
                                            } else {
                                                acc[key].quantity += size * quantity;
                                            }
                                            return acc;
                                        }, {})
                                ).map((record, index) => (
                                    <React.Fragment key={index}>
                                        <div className="flex flex-row items-center gap-4 w-full justify-between">
                                            <dd className="text-base tracking-tight sm:text-lg -ml-12">{record.record_name} ({record.size}{record.unit})</dd>
                                            <div className="text-base tracking-tight sm:text-lg -mr-10">
                                                {`${record.quantity} ${record.unit}`}
                                            </div>
                                        </div>
                                        {index < Object.values(filteredRecords).length - 1 && (
                                            <hr className="my-4 -ml-12 -mr-10 border-black"/>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default InHome;
