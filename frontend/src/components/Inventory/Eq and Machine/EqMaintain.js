import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import {InformationCircleIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import { GoAlert } from "react-icons/go";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import {FiDownload} from "react-icons/fi";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

const EqMaintain = () => {
    const [inventoryRecords, setInventoryRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const {getPermission, getPermissions} = useKindeAuth();

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

    //show equipments received today logic
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const hasRecordToday = inventoryRecords.some(record => record.date_received.split('T')[0] === today);
        setShowNotification(hasRecordToday);
    }, [inventoryRecords]);

    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const handleDelete = (recordId) => {
        setSelectedRecordId(recordId);
        setShowConfirmation(true);
    };

    const handleConfirmDelete = () => {
        const recordId = selectedRecordId;
        axios
            .delete(`http://localhost:5555/inventoryrecords/${recordId}`)
            .then(() => {
                setInventoryRecords(prevRecords => prevRecords.filter(record => record._id !== recordId));
                setShowConfirmation(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
    };

    const filteredRecords = inventoryRecords.filter((record) =>
        Object.values(record).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        })
    );
    const handlePrint = () => {
        const currentDate = new Date().toLocaleString('en-GB');
        const past30Days = new Date();
        past30Days.setDate(past30Days.getDate() - 30);

        // Filtered data for printing (excluding Info, Edit, Delete columns)
        const printData = filteredRecords.map(record => {
            const { Eq_machine_main, Eq_id_main, date_referred, date_received, ref_loc, status, comment } = record;
            return { Eq_machine_main, Eq_id_main, date_referred, date_received, ref_loc, status, comment };
        });

        // Statistics
        const totalRecords = printData.length;
        const past30DaysRecords = printData.filter(record => new Date(record.date_received) >= past30Days).length;
        const inProgressRecords = printData.filter(record => record.status === 'In Progress');

        const input = document.getElementById('eq-main-table');

        if (input) {
            html2canvas(input).then((canvas) => {
                const pdf = new jsPDF('l', 'mm', 'a3');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const textWidth = pdf.getStringUnitWidth('Equipment Maintenance Records') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                const centerPosition = (pageWidth - textWidth) / 2;

                pdf.setFontSize(16);
                pdf.text('Equipment Maintenance Records', centerPosition, 10);
                pdf.setFontSize(12);
                pdf.text(`As At: ${currentDate}`, centerPosition, 20);

                // Table Generation
                const yPos = 60;
                pdf.autoTable({
                    head: [
                        ['No', 'Equipment/Machine', 'Eq / Machine ID', 'Date referred to', 'Received date', 'Referred location', 'Status', 'Description']
                    ],
                    body: printData.map((record, index) => [
                        index + 1,
                        record.Eq_machine_main,
                        record.Eq_id_main,
                        record.date_referred.split("T")[0],
                        record.date_received.split("T")[0],
                        record.ref_loc,
                        record.status,
                        record.comment
                    ]),
                    startY: yPos,
                    theme: 'grid',
                });

                // Print Statistics after the table
                const statsYPos = yPos + 10 + (printData.length * 10); // Adjust the position based on the number of rows in the table
                pdf.text(`Total Maintenance Records: ${totalRecords}`, 10, statsYPos);
                pdf.text(`Maintenance Records in Past 30 Days: ${past30DaysRecords}`, 10, statsYPos + 10);
                pdf.text(`Maintenance Records In Progress: ${inProgressRecords.length}`, 10, statsYPos + 20);
                if (inProgressRecords.length > 0) {
                    pdf.text('In Progress Records:', 10, statsYPos + 30);
                    inProgressRecords.forEach((record, index) => {
                        pdf.text(`${index + 1}. ${record.Eq_machine_main}, Location: ${record.ref_loc}`, 20, statsYPos + 40 + (index * 10));
                    });
                }

                pdf.save(`Equipment-Maintenance-Records_generatedAt_${currentDate}.pdf`);
            }).catch((error) => {
                console.error('Error generating PDF:', error);
            });
        } else {
            console.error('Table element not found');
        }
    };

    const getStatusBackgroundClass = (status) => {
        if (status === 'In Progress') {
            return 'bg-red-300 text-red-800 px-2 py-1 rounded-md text-xs'; // Red background for In Progress
        } else if (status === 'Completed') {
            return 'text-green-800 px-2 py-1 rounded-md text-xs'; // Green background for Completed
        }
        return ''; // Default empty class for other statuses
    };

    const getStatusRowBackgroundClass = (record) => {
        const today = new Date().toISOString().split('T')[0];

        // Check if the received date matches today's date or if status is 'In Progress'
        if (record.date_received && record.date_received.split('T')[0] === today && record.status === 'In Progress') {
            return 'bg-red-100 text-red-800'; // Red background for In Progress with today's date
        } else if (record.status === 'Completed') {
            return '';
        }

        return '';
    };


    return (
        <div className="overflow-x-auto">
            <div className="flex flex-row justify-between items-center px-8 py-4">
                <div>
                    <h1 className="text-lg font-semibold text-left">Maintenances Records</h1>
                    <p className="mt-1 text-sm font-normal text-gray-500 0">Easily access stored Maintenances Records
                        within the system for thorough insights.</p>
                    <div className="py-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="text-gray-500 h-4 w-4"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Search all maintenances records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-full px-3 py-1 w-full text-sm pl-10"
                            style={{paddingRight: '2.5rem'}}/>
                    </div>
                </div>
                <div>
                    <div className="flex items-center">
                        <Link to="/inventory/maintenancelog/addeqmainpage"
                           className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                            Add new maintenances record <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <button
                            onClick={handlePrint}
                            className="ml-4 flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                            Generate report <FiDownload className="mr-1 inline-block" />
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div id="print-area">
                    <table
                        id="eq-main-table"
                        className="w-full text-sm text-left rtl:text-right text-gray-500  mt-10">
                        <thead
                            className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                        <tr className=" ">
                            <th></th>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Equipment/Machine
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Eq / Machine ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Date referred to
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Received date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Referred location
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Description
                            </th>
                            <th scope="col" className=" py-3">
                                <span className="sr-only">Info</span>
                            </th>
                            <th scope="col" className=" py-3">
                                <span className="sr-only">Edit</span>
                            </th>
                            <th scope="col" className=" py-3">
                                <span className="sr-only">Delete</span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRecords.map((record, index) => (
                            <tr key={record._id}
                                className={`${getStatusRowBackgroundClass(record)} ${getStatusRowBackgroundClass(record) === '' ? '' : 'hover:bg-gray-100'}`}>
                                <td></td>
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">{record.Eq_machine_main}</td>
                                <td className="px-6 py-4">{record.Eq_id_main}</td>
                                <td className="px-6 py-4">{record.date_referred.split("T")[0]}</td>
                                <td className="px-6 py-4">{record.date_received.split("T")[0]}</td>
                                <td className="px-6 py-4">{record.ref_loc}</td>
                                <td className={`px-6 ${getStatusBackgroundClass(record.status)}`}>
                                    {record.status}
                                </td>
                                <td className="px-6 py-4">{record.comment}</td>
                                <td className="px-6 py-4 text-right">
                                    <Link to={`/inventory/maintenancelog/viewmain/${record._id}`}
                                          className="font-medium text-blue-600 hover:underline">
                                        <InformationCircleIcon
                                            className="h-6 w-6 flex-none bg-gray-300 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                            aria-hidden="true"/>
                                    </Link>
                                </td>
                                <td className="px-3 py-4 text-right">
                                    <Link to={`/inventory/maintenancelog/editeqmainpage/${record._id}`}
                                          className="font-medium text-blue-600 hover:underline">
                                        <PencilSquareIcon
                                            className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                            aria-hidden="true"/>
                                    </Link>
                                </td>
                                {
                                    getPermission("update:records").isGranted ? (
                                <td className="px-6 py-4">
                                    <button className="flex items-center" onClick={() => handleDelete(record._id)}>
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"/>
                                    </button>
                                </td>
                                    ): null
                                }
                            </tr>
                        ))}
                        </tbody>

                    </table>
                </div>
                {/* Confirmation Dialog */}
                {showConfirmation && (
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
                                    <button onClick={handleConfirmDelete}
                                            className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 hover:bg-red-600 hover:text-white text-red-700 rounded-lg font-semibold text-sm md:ml-2 md:order-2">
                                        Confirm
                                    </button>
                                    <button onClick={handleCancelDelete}
                                            className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 hover:bg-black hover:text-white rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className={`bg-green-500 py-2 px-4 rounded-md text-white text-center fixed bottom-4 right-4 flex gap-4 ${showNotification ? 'visible' : 'hidden'}`}>
                    <p>You have machine(s) to receive today.</p>
                    <span className="cursor-pointer font-bold" onClick={() => setShowNotification(false)}>
                        <sup>X</sup>
                    </span>
                </div>
            </div>
        </div>
    );
};
export default EqMaintain;
