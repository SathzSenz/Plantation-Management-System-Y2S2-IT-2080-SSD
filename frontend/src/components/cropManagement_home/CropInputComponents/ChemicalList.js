import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaSearch } from "react-icons/fa";
import {InformationCircleIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import {useSnackbar} from "notistack";
import {FiDownload} from "react-icons/fi";
import {GoAlert} from "react-icons/go";
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

const ChemicalList = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [ChemicalRecords, setChemicalRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [selectedFieldFilter, setSelectedFieldFilter] = useState('All Fields');
    const {getPermission, getPermissions} = useKindeAuth();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/cropinput`)
            .then((response) => {
                const formattedRecords = response.data.data
                    .filter(record => record.type === "Agrochemical")
                    .map(record => ({
                        ...record,
                        date: new Date(record.date).toLocaleDateString('en-GB')
                    }));
                setChemicalRecords(formattedRecords);
                setFilteredRecords(formattedRecords);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleDelete = (recordId) => {
        setRecordToDelete(recordId);
    };

    const confirmDelete = () => {
        if (recordToDelete) {
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/cropinput/${recordToDelete}`)
                .then(() => {
                    setChemicalRecords(prevRecords =>
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
            .delete(`${process.env.REACT_APP_API_BASE_URL}/cropinput/${recordToDelete}`)
            .then(() => {
                setChemicalRecords(prevRecords =>
                    prevRecords.filter(record => record._id !== recordToDelete)
                );
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleCancelDelete = () => {
        setRecordToDelete(null);
    };

    useEffect(() => {
        setFilteredRecords(
            ChemicalRecords.filter(record => {
                const lowerCaseField = record.field ? record.field.toLowerCase() : '';
                const lowerCaseDate = record.date ? record.date.toLowerCase() : '';
                const lowerCaseCropType = record.cropType ? record.cropType.toLowerCase() : '';
                const lowerCaseVariety = record.variety ? record.variety.toLowerCase() : '';
                const lowerCaseRemarks = record.remarks ? record.remarks.toLowerCase() : '';

                return (
                    (selectedFieldFilter === 'All Fields' || lowerCaseField === selectedFieldFilter.toLowerCase()) &&
                    (lowerCaseDate.includes(searchQuery.toLowerCase()) ||
                        lowerCaseField.includes(searchQuery.toLowerCase()) ||
                        lowerCaseCropType.includes(searchQuery.toLowerCase()) ||
                        lowerCaseVariety.includes(searchQuery.toLowerCase()) ||
                        lowerCaseRemarks.includes(searchQuery.toLowerCase()))
                );
            })
        );
    }, [ChemicalRecords, searchQuery, selectedFieldFilter]);


    const handleFieldFilterChange = (event) => {
        setSelectedFieldFilter(event.target.value);
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    function calculateTotalCostPerCrop(records) {
        let totalCostPerCrop = {};

        if (!Array.isArray(records)) {
            console.error('Error: Records is not an array.');
            return totalCostPerCrop; // Return an empty object or handle the error as needed
        }

        records.forEach(record => {
            // Assuming each record has a field and unitCost property
            const { field, unitCost, quantity } = record;
            const totalCost = unitCost * quantity;

            if (totalCostPerCrop.hasOwnProperty(field)) {
                totalCostPerCrop[field] += totalCost;
            } else {
                totalCostPerCrop[field] = totalCost;
            }
        });

        return totalCostPerCrop;
    }

    const generatePDF = (filteredRecords) => {
        const input = document.getElementById('chemical-table');
        if (input) {
            const currentDate = new Date().toLocaleString('en-GB');

            html2canvas(input)
                .then((canvas) => {
                    const pdf = new jsPDF('l', 'mm', 'a3');

                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const textWidth = pdf.getStringUnitWidth('Planting Records') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                    const centerPosition = (pageWidth - textWidth) / 2;

                    pdf.setFontSize(16);
                    pdf.text('Agrochemical Records', centerPosition, 10);
                    pdf.setFontSize(12);
                    pdf.text(`As At: ${currentDate}`, centerPosition, 20);

                    let yPos = 30;

                    pdf.autoTable({
                        html: '#chemical-table',
                        startY: yPos + 10,
                        theme: 'grid',
                    });

                    const totalCostPerCrop = calculateTotalCostPerCrop(filteredRecords);
                    yPos = 30;
                    Object.entries(totalCostPerCrop).forEach(([field, totalCost]) => {
                        pdf.text(`Total Cost for ${field}: Rs. ${totalCost}`, 10, yPos);
                        yPos += 10;
                    })

                    pdf.save(`chemical-records_generatedAt_${currentDate}.pdf`);
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                });
        } else {
            console.error('Table element not found');
        }
    };

    return (
        <div className="z-0">
            <div className="absolute left-80 top-1/4 pb-30 mb-30">
                <input
                    type="text"
                    placeholder="Search Agrochemical"
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
                    className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-14 right-5 mt-10 "
                >
                    Add New Agrochemical <span aria-hidden="true">&rarr;</span>
                </button>
            </Link>

            <button
                onClick={generatePDF}
                className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 absolute top-24 right-5 mt-20 "
            >
                Generate PDF <FiDownload className="mr-1 inline-block" />
            </button>

            <div className="overflow-x-auto">
                <table
                    id="chemical-table"
                    className="w-10/12 bg-white shadow-md rounded-md overflow-hidden absolute top-1/3 left-64"
                >
                    <thead className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                    <tr>
                        <th className="px-6 py-3">No</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Field Name</th>
                        <th className="px-6 py-3">Chemical Type</th>
                        <th className="px-6 py-3">Quantity</th>
                        <th className="px-6 py-3">Unit Cost</th>
                        <th className="px-6 py-3">Remarks</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRecords.map((record, index) => (
                        <tr className="hover:bg-lime-100 divide-y divide-gray-200" key={record._id}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{record.date}</td>
                            <td className="px-6 py-4">{record.field}</td>
                            <td className="px-6 py-4">{record.chemicalName}</td>
                            <td className="px-6 py-4">{record.quantity}</td>
                            <td className="px-6 py-4">{record.unitCost}</td>
                            <td className="px-6 py-4">{record.remarks}</td>
                            <td className="px-6 py-4">
                                <div className="flex justify-between">
                                    <Link to={`/crop/input/chemical/record/${record._id}`}
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
                                    <button className="flex items-center" onClick={() => handleDelete(record._id)}>
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
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
        </div>
    );
};

export default ChemicalList;
