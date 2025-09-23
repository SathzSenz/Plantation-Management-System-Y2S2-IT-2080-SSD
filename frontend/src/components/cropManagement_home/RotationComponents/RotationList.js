import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { StyleSheet } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {FaSearch} from "react-icons/fa";
import {useSnackbar} from "notistack";
import {GoAlert} from "react-icons/go";
import {FiDownload} from "react-icons/fi";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});


const RotationList = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [RotationRecords, setRotationRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [selectedFieldFilter, setSelectedFieldFilter] = useState('All Fields');
    const {getPermission, getPermissions} = useKindeAuth();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/rotation`)
            .then((response) => {
                setRotationRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setFilteredRecords(
            RotationRecords.filter((record) =>
                (selectedFieldFilter === 'All Fields' || record.fieldName === selectedFieldFilter) &&
                (record.season.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    record.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        );
    }, [RotationRecords, searchQuery, selectedFieldFilter]);

    const handleDelete = (recordId) => {
        setRecordToDelete(recordId);
    };

    const confirmDelete = () => {
        if (recordToDelete) {
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/rotation/${recordToDelete}`)
                .then(() => {
                    setRotationRecords(prevRecords =>
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

    const confirmDeleteAction = () => {
        axios
            .delete(`${process.env.REACT_APP_API_BASE_URL}/rotation/${recordToDelete}`)
            .then(() => {
                setRotationRecords(prevRecords => prevRecords.filter(record => record._id !== recordToDelete));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleCancelDelete = () => {
        setRecordToDelete(null);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFieldFilterChange = (event) => {
        setSelectedFieldFilter(event.target.value);
    };

    const generatePDF = () => {
        const input = document.getElementById('rotation-table');
        if (input) {
            const currentDate = new Date().toLocaleString('en-GB');

            html2canvas(input)
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a3');

                    const recordCount = filteredRecords.length;

                    const crops = {};
                    filteredRecords.forEach((record) => {
                        crops[record.cropType] = crops[record.cropType] ? crops[record.cropType] + 1 : 1;
                    });
                    const mostCommonCrop = Object.keys(crops).reduce((a, b) => crops[a] > crops[b] ? a : b);

                    const seasons = {};
                    const cropYields = {};
                    filteredRecords.forEach((record) => {
                        seasons[record.season] = seasons[record.season] ? seasons[record.season] + record.yield : record.yield;
                        cropYields[record.cropType] = cropYields[record.cropType] ? [...cropYields[record.cropType], record.yield] : [record.yield];
                    });
                    const highestYieldSeason = Object.keys(seasons).reduce((a, b) => seasons[a] > seasons[b] ? a : b);
                    const highestAverageYieldCrop = Object.keys(cropYields).reduce((a, b) => {
                        const averageA = cropYields[a].reduce((sum, val) => sum + val, 0) / cropYields[a].length;
                        const averageB = cropYields[b].reduce((sum, val) => sum + val, 0) / cropYields[b].length;
                        return averageA > averageB ? a : b;
                    });

                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const textWidth = pdf.getStringUnitWidth('Rotation Records') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                    const centerPosition = (pageWidth - textWidth) / 2;

                    pdf.setFontSize(16);
                    pdf.text('Rotation Records', centerPosition, 10);
                    pdf.setFontSize(12);
                    pdf.text(`As At: ${currentDate}`, centerPosition, 20);

                    pdf.text(`Most Common Crop: ${mostCommonCrop}`, 10, 30);
                    pdf.text(`Number of Records: ${recordCount}`, 10, 40);
                    pdf.text(`Highest Yield Season: ${highestYieldSeason}`, 10, 50);
                    pdf.text(`Highest Average Yield Crop: ${highestAverageYieldCrop}`, 10, 60);

                    pdf.autoTable({
                        html: '#rotation-table',
                        startY: 70,
                        theme: 'grid',
                    });

                    pdf.save(`rotation-records_generatedAt_${currentDate}.pdf`);
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                });
        } else {
            console.error('Table element not found');
        }
    };

    const fieldOptions = ['All Fields', 'Field A', 'Field B', 'Field C', 'Field D', 'Field E', 'Field F', 'Field G'];

    const [filteredRecords, setFilteredRecords] = useState([]);

    useEffect(() => {
        setFilteredRecords(RotationRecords);
    }, [RotationRecords]);

    return (
        <div className="z-0">
            <div className="absolute left-80 mt-10">
                <input
                    type="text"
                    placeholder="Search Rotation"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="border border-gray-300 rounded-full px-3 py-1 pl-10"
                />
                <FaSearch className="absolute left-3 top-2 text-gray-400"/>
                <select
                    value={selectedFieldFilter}
                    onChange={(e) => setSelectedFieldFilter(e.target.value)}
                    className="ml-3 border border-gray-300 rounded-full px-8 py-1"
                >
                    {fieldOptions.map((field, index) => (
                        <option key={index} value={field}>{field}</option>
                    ))}
                </select>
            </div>

            <Link to="/crop/rotation/add">
                <button
                    className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-14 right-5 mt-10"
                >
                    Add New Rotation Record <span aria-hidden="true">&rarr;</span>
                </button>
            </Link>

            <button
                onClick={generatePDF}
                className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-24 right-5 mt-20"
            >
                Generate PDF <FiDownload className="mr-1 inline-block" />
            </button>

            <div className="overflow-x-auto">
                <table id="rotation-table"
                       className="w-10/12 bg-white shadow-md rounded-md overflow-hidden absolute top-1/3 left-1/6">
                    <thead className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                    <tr>
                        <th className="px-6 py-3">No</th>
                        <th className="px-6 py-3">Season</th>
                        <th className="px-6 py-3">Field Name</th>
                        <th className="px-6 py-3">Crop Type</th>
                        <th className="px-6 py-3">Variety</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Yield (mt/ha)</th>
                        <th className="px-6 py-3">Remarks</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRecords.map((record, index) => (
                        <tr className="hover:bg-gray-100 divide-y divide-gray-200" key={index}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{record.season}</td>
                            <td className="px-6 py-4">{record.fieldName}</td>
                            <td className="px-6 py-4">{record.cropType}</td>
                            <td className="px-6 py-4">{record.variety}</td>
                            <td className="px-6 py-4">{record.quantity}</td>
                            <td className="px-6 py-4">{record.yield}</td>
                            <td className="px-6 py-4">{record.remarks}</td>
                            <td className="px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <Link to={`/crop/rotation/record/${record._id}`}
                                          className="mx-1 font-medium text-blue-600 hover:underline">
                                        <InformationCircleIcon
                                            className="h-6 w-6 bg-gray-300 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                            aria-hidden="true"/>
                                    </Link>
                                    {getPermission("update:records").isGranted ? (
                                        <Link to={`/crop/rotation/update/${record._id}`}
                                              className="mx-1 font-medium text-blue-600 hover:underline">
                                            <PencilSquareIcon
                                                className="h-6 w-6 bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                                aria-hidden="true"/>
                                        </Link>
                                    ) : null}
                                    {getPermission("update:records").isGranted ? (
                                    <button className="flex items-center" onClick={() => handleDelete(record._id)}>
                                        <TrashIcon
                                            className="h-6 w-6 bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"/>
                                    </button>
                                    ) : null}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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
                                        <p className="text-sm text-gray-700 mt-1">Are you sure you want to delete this record?</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right mt-4 md:flex md:justify-end">
                                    <button onClick={confirmDelete} className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 hover:bg-red-600 hover:text-white text-red-700 rounded-lg font-semibold text-sm md:ml-2 md:order-2">
                                        Confirm
                                    </button>
                                    <button onClick={() => setRecordToDelete(null)} className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 hover:bg-black hover:text-white rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RotationList;
