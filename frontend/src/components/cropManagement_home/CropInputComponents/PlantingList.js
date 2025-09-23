import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import axios from 'axios';
import html2canvas from 'html2canvas';
import { InformationCircleIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import jsPDF from 'jspdf';
import { useSnackbar } from "notistack";
import { FiDownload } from "react-icons/fi";
import {GoAlert} from "react-icons/go";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

const PlantingList = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [plantingRecords, setPlantingRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [selectedFieldFilter, setSelectedFieldFilter] = useState('All Fields');
    const {getPermission, getPermissions} = useKindeAuth();

    const fieldAcreageData = [
        { Field: 'Field A', Area: 2 },
        { Field: 'Field B', Area: 2.5 },
        { Field: 'Field C', Area: 1 },
        { Field: 'Field D', Area: 2 },
        { Field: 'Field E', Area: 1 },
        { Field: 'Field F', Area: 0.5 },
        { Field: 'Field G', Area: 1 },
    ];

    const calculateTotalCostPerCrop = (plantingRecords) => {
        const totalCostPerCrop = {};
        plantingRecords.forEach((record) => {
            const { cropType, unitCost, quantity } = record;
            const cost = unitCost * quantity;
            if (!totalCostPerCrop[cropType]) {
                totalCostPerCrop[cropType] = 0;
            }
            totalCostPerCrop[cropType] += cost;
        });
        return totalCostPerCrop;
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/cropinput`)
            .then((response) => {
                const formattedRecords = response.data.data
                    .filter(record => record.type === "Planting")
                    .map(record => ({
                        ...record,
                        date: new Date(record.date).toLocaleDateString('en-GB')
                    }));
                setPlantingRecords(formattedRecords);
                setFilteredRecords(formattedRecords);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setFilteredRecords(
            plantingRecords.filter(record =>
                (selectedFieldFilter === 'All Fields' || record.field.toLowerCase() === selectedFieldFilter.toLowerCase()) &&
                (record.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        );
    }, [plantingRecords, searchQuery, selectedFieldFilter]);

    const handleDelete = (recordId) => {
        setRecordToDelete(recordId);
    };

    const confirmDelete = () => {
        if (recordToDelete) {
            axios
                .delete(`http://localhost:5555/cropinput/${recordToDelete}`)
                .then(() => {
                    setPlantingRecords(prevRecords =>
                        prevRecords.filter(record => record._id !== recordToDelete)
                    );
                    setRecordToDelete(null);
                    enqueueSnackbar('Record deleted successfully', { variant: 'success' });
                })
                .catch((error) => {
                    console.log(error);
                    enqueueSnackbar('Error deleting record', { variant: 'error' });
                });
        }
    };

    const generatePDF = () => {
        const currentDate = new Date().toLocaleString('en-GB');
        const acreagePerCrop = calculateAcreagePerCrop(filteredRecords);
        const totalCostPerCrop = calculateTotalCostPerCrop(filteredRecords);
        const input = document.getElementById('planting-table');

        if (input) {
            html2canvas(input)
                .then((canvas) => {
                    const pdf = new jsPDF('l', 'mm', 'a3');
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const textWidth = pdf.getStringUnitWidth('Planting Records') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                    const centerPosition = (pageWidth - textWidth) / 2;

                    pdf.setFontSize(16);
                    pdf.text('Planting Records', centerPosition, 10);
                    pdf.setFontSize(12);
                    pdf.text(`As At: ${currentDate}`, centerPosition, 20);

                    const yPos = 30;
                    pdf.autoTable({
                        html: '#planting-table',
                        startY: yPos + 10,
                        theme: 'grid',
                    });

                    pdf.text('Acreage per Crop:', 10, 105);
                    let y = 30;
                    Object.entries(acreagePerCrop).forEach(([cropType, acreage]) => {
                        pdf.text(`${cropType}: ${acreage} acres`, 20, pdf.autoTable.previous.finalY + y);
                        y = y + 10;
                    });

                    pdf.text('Total Cost per Crop:', 200, pdf.autoTable.previous.finalY + 20);
                    y = 30;
                    Object.entries(totalCostPerCrop).forEach(([cropType, totalCost]) => {
                        pdf.text(`${cropType}: Rs. ${totalCost} `, 200, pdf.autoTable.previous.finalY + y);
                        y = y + 10;
                    });

                    pdf.save(`planting-records_generatedAt_${currentDate}.pdf`);
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                });
        } else {
            console.error('Table element not found');
        }
    };

    const calculateAcreagePerCrop = (plantingRecords) => {
        const acreagePerCrop = {};
        plantingRecords.forEach((record) => {
            const { field, cropType } = record;
            const acreage = fieldAcreageData.find((item) => item.Field === field)?.Area || 0;
            if (!acreagePerCrop[cropType]) {
                acreagePerCrop[cropType] = 0;
            }
            acreagePerCrop[cropType] += acreage;
        });
        return acreagePerCrop;
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFieldFilterChange = (event) => {
        setSelectedFieldFilter(event.target.value);
    };

    return (
        <div className="z-0">
            <div className="absolute left-80">
                <input
                    type="text"
                    placeholder="Search Planting"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="border border-gray-300 rounded-full px-3 py-1 pl-10"
                />
                <FaSearch className="absolute left-3 top-2 text-gray-400"/>
                <select
                    value={selectedFieldFilter}
                    onChange={handleFieldFilterChange}
                    className="ml-3 border border-gray-300 rounded-full px-8 py-1"
                >
                    {['All Fields', 'Field A', 'Field B', 'Field C', 'Field D', 'Field E', 'Field F', 'Field G'].map((field, index) => (
                        <option key={index} value={field}>{field}</option>
                    ))}
                </select>
            </div>
            <Link to="/crop/input/add">
                <button
                    className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-14 right-5 mt-10"
                >
                    Add New Planting <span aria-hidden="true">&rarr;</span>
                </button>
            </Link>

            <button
                onClick={generatePDF}
                className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-24 right-5 mt-20"
            >
                Generate PDF <FiDownload className="mr-1 inline-block" />
            </button>

            <div className="overflow-x-auto">
                <table
                    id="planting-table"
                    className="w-10/12 bg-white shadow-md rounded-md overflow-hidden absolute top-1/3 left-64"
                >
                    <thead className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                    <tr>
                        <th className="px-6 py-3">No</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Field Name</th>
                        <th className="px-6 py-3">Crop Type</th>
                        <th className="px-6 py-3">Variety</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Unit Cost(Rs.)</th>
                        <th className="px-6 py-3">Remarks</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRecords.map((record, index) => (
                        <tr className="hover:bg-lime-100 divide-y divide-gray-200" key={index}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{record.date}</td>
                            <td className="px-6 py-4">{record.field}</td>
                            <td className="px-6 py-4">{record.cropType}</td>
                            <td className="px-6 py-4">{record.variety}</td>
                            <td className="px-6 py-4">{record.quantity}</td>
                            <td className="px-6 py-4">{record.unitCost}</td>
                            <td className="px-6 py-4">{record.remarks}</td>
                            <td className="px-6 py-4">
                                <div className="flex justify-between">
                                    <Link to={`/crop/input/planting/record/${record._id}`}
                                          className="font-medium text-blue-600  hover:underline">
                                        <InformationCircleIcon
                                            className="h-6 w-6 flex-none bg-gray-300 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                            aria-hidden="true"/>
                                    </Link>
                                    {getPermission("update:records").isGranted ? (
                                    <Link to={`/crop/input/update/${record._id}`}>
                                        <PencilSquareIcon
                                            className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                            aria-hidden="true"/>
                                    </Link>
                                    ) : null}
                                    {getPermission("update:records").isGranted ? (
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleDelete(record._id)}
                                    >
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"
                                        />
                                    </button>
                                    ) : null}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {recordToDelete && (
                <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur confirm-dialog">
                    <div className="relative px-4 min-h-screen md:flex md:items-center md:justify-center">
                        <div className="opacity-25 w-full h-full absolute z-10 inset-0"></div>
                        <div
                            className="bg-white rounded-lg md:max-w-md md:mx-auto p-4 fixed inset-x-0 bottom-0 z-50 mb-4 mx-4 md:relative shadow-lg">
                            <div className="md:flex items-center">
                                <div
                                    className="rounded-full border border-gray-300 flex items-center justify-center w-16 h-16 flex-shrink-0 mx-auto">
                                    <GoAlert className="w-10 h-10"/></div>
                                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                                    <p className="font-bold">Confirm Deletion</p>
                                    <p className="text-sm text-gray-700 mt-1">Are you sure you want to delete this
                                        record?</p>
                                </div>
                            </div>
                            <div className="text-center md:text-right mt-4 md:flex md:justify-end">
                                <button onClick={confirmDelete}
                                        className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 hover:bg-red-600 hover:text-white text-red-700 rounded-lg font-semibold text-sm md:ml-2 md:order-2">
                                    Confirm
                                </button>
                                <button onClick={() => setRecordToDelete(null)}
                                        className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 hover:bg-black hover:text-white rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlantingList;
