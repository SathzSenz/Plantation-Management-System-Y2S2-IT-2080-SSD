import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';

import {DatePicker, Button, Radio, message} from 'antd';
import { Popover, Transition } from '@headlessui/react'
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon, ArrowDownTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

export default function MachineRecordsList() {
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [machineRecords, setMachineRecords] = useState([]);
    const [machineRecordDetails, setMachineRecordDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('start_date');
    const [sortOrder, setSortOrder] = useState('asc');
    const { enqueueSnackbar } = useSnackbar();
    const {getPermission, getPermissions} = useKindeAuth();
    const [selectedDates, setSelectedDates] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const [autoSaveTransaction, setAutoSaveTransaction] = useState(true);

    const [taskId, setTaskId] = useState('');
    const [recordDate, setRecordDate] = useState('');
    const [reading_start, setReadingStart] = useState('');
    const [reading_end, setReadingEnd] = useState('');
    const [recordPay, setRecordPay] = useState('');


    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/machines')
            .then((response) => {
                setMachineRecords(response.data.data);
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
            .get('http://localhost:5555/machineRecord')
            .then((response) => {
                setMachineRecordDetails(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleDeleteMachineRecord = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this machine record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`http://localhost:5555/machines/${id}`)
                .then(() => {
                    setMachineRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
                    message.success('Machine record successfully deleted.');
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    message.error('Machine record deletion failed.');
                    console.log(error);
                });
        }
    };

    const handleDeleteMachineDetailRecord = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this machine record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`http://localhost:5555/machineRecord/${id}`)
                .then(() => {
                    setMachineRecordDetails((prevRecords) => prevRecords.filter((record) => record._id !== id));
                    message.success('Machine detail record successfully deleted.');
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    message.error('Machine detail record deletion failed.');
                    console.log(error);
                });
        }
    };

    const sortedRecords = [...machineRecords].sort((a, b) => {
        if (sortBy === 'start_date') {
            return sortOrder === 'asc' ? new Date(a.start_date) - new Date(b.start_date) : new Date(b.start_date) - new Date(a.start_date);
        }
    });

    const filteredMachineRecords = sortedRecords.filter(record => {
        // Convert all values to lowercase for case-insensitive search
        const searchTerm = searchQuery.toLowerCase();

        // Check if any field in the record contains the search query
        return Object.values(record).some(value =>
            typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        );
    });

    const handleSortBy = (criteria) => {
        if (criteria === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(criteria);
            setSortOrder('asc');
        }
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSortBy('start_date');
        setSortOrder('asc');
    };

    const handleClearSorting = () => {
        setSearchQuery(''); // Reset search query
        setSortBy('');
        setSortOrder('asc');
    };



    const handleDetailsSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (isNaN(reading_start) || isNaN(reading_end) || isNaN(recordPay) ||
            reading_start < 0 || reading_end < 0 || recordPay < 0 || recordPay > 2000000) {
            message.error('Please enter valid values for readings and payment.');
            return;
        }

        if (new Date(recordDate) > new Date()) {
            message.error('Please select a date on or before today.');
            return;
        }

        if (reading_start >= reading_end) {
            message.error('The starting reading must be less than the ending reading.');
            return;
        }

        // Create a payload object with form data
        const payload = {
            task_id: taskId,
            record_date: recordDate,
            reading_start,
            reading_end,
            record_pay: recordPay
        };

        try {
            // Make POST request to the API endpoint
            const response = await
                axios.post('http://localhost:5555/machineRecord', payload);

            // Handle success response
            console.log('Record added successfully:', response.data);

            message.success('Machine record detail has successfully saved.');

            // Construct the transaction data based on the saved machine fee data
            if (autoSaveTransaction) {
                // Construct the transaction data based on the saved machine fee data
                const transactionData = {
                    date: payload.record_date,
                    type: 'expense',
                    subtype: 'Machine Fee',
                    amount: payload.record_pay,
                    description: `from ${payload.reading_start} to ${payload.reading_end}`,
                    payer_payee: 'Machine Pay',
                    method: 'Automated Entry',
                };

                // Save the transaction record
                handleSaveTransactionRecord(transactionData);
            }

            // Reset form fields after successful submission
            setRecordDate('');
            setReadingStart('');
            setReadingEnd('');
            setRecordPay('');

        } catch (error) {
            // Handle error response
            console.error('Error adding record:', error);

            // Optionally, you can show an error message here
        }
    };

    const handleSaveTransactionRecord = (transactionData) => {
        setLoading(true);
        axios
            .post('http://localhost:5555/transactions', transactionData)
            .then(() => {
                setLoading(false);
                message.success('Transaction record has automatically saved.');

            })
            .catch((error) => {
                setLoading(false);
                message.error('Automatic Transaction record saving failed.');
                console.log(error);

            });
    };

    return (
        <div>
        <div className=" overflow-x-auto ">
            <SnackbarProvider/>
            <div className="flex flex-row justify-between items-center align-bottom mx-8 py-4">
                <div>
                    <h1 className="text-lg font-semibold text-left">Machine Renting records</h1>
                    <p className="mt-1 text-sm font-normal text-gray-500 0">
                        Browse a list of all machine renting activity stored in the system
                    </p>
                    <div className="flex flex-row gap-4">
                        <div className="py-4  relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="text-gray-500 h-4 w-4"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Search all records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-full px-3 py-1 w-fit text-sm pl-10 pr-4"
                                style={{paddingRight: ''}}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer"/>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4 relative px-4">
                            <button
                                className="flex items-center space-x-1 cursor-pointer bg-lime-200 px-4 py-1 rounded-full hover:bg-lime-400"
                                onClick={() => handleSortBy('start_date')}
                            >
                                <span className="text-sm text-gray-600">Date</span>
                                {sortBy === 'start_date' && (
                                    sortOrder === 'asc' ? (
                                        <ChevronUpIcon
                                            className="w-4 h-4 bg-green-800 text-white stroke-2 rounded-full"/>
                                    ) : (
                                        <ChevronDownIcon
                                            className="w-4 h-4 bg-green-800 text-white stroke-2 rounded-full"/>
                                    )
                                )}
                            </button>

                            <button
                                className="flex items-center space-x-1 bg-rose-200 rounded-full hover:bg-red-400 cursor-pointer p-1"
                                onClick={handleClearSorting}
                            >
                                <XMarkIcon className="w-4 h-4 "/>
                            </button>




                        </div>
                    </div>

                </div>
                <div>
                    <Link
                        to="/finances/machineHours/addMachineRecords"
                        className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        Add New Machine Record <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>

        </div>


            <div id="print-area">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                    <thead
                        className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                    <tr className=" ">
                        <th></th>
                        <th scope="col" className="px-6 py-3">
                            Start Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Rate
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Payee
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Description
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Total Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Paid Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Payable
                        </th>


                        <th scope="col" className=" py-3">
                            <span className="sr-only">Info</span>
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
                    <tbody className="border-b border-gray-200">
                    {filteredMachineRecords.map((record, index) => {
                        // Filter detail records relevant to the current machine record
                        const relevantDetailRecords = machineRecordDetails.filter(detail_record => detail_record.task_id === record._id);

                        // Calculate the paid amount based on relevant detail records
                        const paidAmount = relevantDetailRecords.reduce((total, detail) => {
                            // Add the record_pay to the total
                            return total + detail.record_pay;
                        }, 0);

                        // Calculate the total amount based on relevant detail records
                        const totalAmount = relevantDetailRecords.reduce((total, detail_record) => {
                            // Calculate the amount for each detail record
                            const amount = (detail_record.reading_end - detail_record.reading_start) * record.rate;
                            // Add the amount to the total
                            return total + amount;
                        }, 0);

                        return (
                            <tr
                                key={record._id}
                                className={` divide-y
                                    ${record.paid === 'false' ? 'border-l-4 border-red-500 ' : 'border-l-4 border-lime-500 '}`}
                            >
                                <td></td>
                                <td className="px-6 py-4">{record.start_date}</td>
                                <td className="px-6 py-4">{record.name}</td>
                                <td className="px-6 py-4">{record.type}</td>
                                <td className="px-6 py-4">Rs.{record.rate.toLocaleString()}</td>
                                <td className="px-6 py-4">{record.payee}</td>
                                <td className="px-6 py-4">{record.description}</td>
                                <td className="px-6 py-4">Rs.{totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4">Rs.{paidAmount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div>
                                        {totalAmount - paidAmount < 0 ?
                                            <span
                                                className="text-red-600">Overpaid: Rs.{(paidAmount - totalAmount).toLocaleString()}</span> :
                                            <span
                                                className="text-lime-600">Rs.{(totalAmount - paidAmount).toLocaleString()}</span>
                                        }
                                    </div>
                                </td>


                                <td className="  text-right py-4 px-4 ">

                                    <Popover className="relative ">
                                        <Popover.Button
                                            onClick={() => setTaskId(record._id)} // Pass the _id to setTaskId
                                            className="align-middle   content-center inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
                                            <PlusIcon
                                                className="h-6 w-6 flex-none bg-lime-200 p-1 rounded-full text-gray-800 hover:bg-lime-500"
                                                aria-hidden="true"
                                            />
                                        </Popover.Button>

                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-150"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            <Popover.Panel
                                                className="absolute right-full z-10 my-2 flex flex-col   w-screen max-w-2xl -translate-x-0 px-4">
                                                <div
                                                    className="w-screen max-w-2xl flex-auto overflow-hidden rounded-3xl  text-sm leading-6 shadow-2xl bg-gray-200 bg-opacity-40 backdrop-blur ring-1 ring-gray-900/5">
                                                    <div className="py-6">
                                                        <form onSubmit={handleDetailsSubmit}
                                                              className="flex flex-col w-full items-center justify-center space-y-4">
                                                            <div className=" w-full px-8 grid grid-cols-2 gap-4">
                                                                <div
                                                                    className="flex flex-col col-span-2 items-start"> {/* Added items-start class for vertical alignment */}
                                                                    <label htmlFor="task_id"
                                                                           className="text-sm font-semibold leading-6 text-gray-900">Task
                                                                        ID</label>
                                                                    <input
                                                                        type="text"
                                                                        id="task_id"
                                                                        value={taskId}
                                                                        onChange={(e) => setTaskId(e.target.value)}
                                                                        required
                                                                        readOnly
                                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                                                                    />
                                                                </div>


                                                                <div
                                                                    className="flex flex-col items-start"> {/* Added items-start class for vertical alignment */}
                                                                    <label htmlFor="reading_start"
                                                                           className="text-sm font-semibold leading-6 text-gray-900">Reading
                                                                        Start</label>
                                                                    <input
                                                                        type="number"
                                                                        id="reading_start"
                                                                        value={reading_start}
                                                                        onChange={(e) => setReadingStart(e.target.value)}
                                                                        required
                                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                                                                    />
                                                                </div>
                                                                <div
                                                                    className="flex flex-col items-start"> {/* Added items-start class for vertical alignment */}
                                                                    <label htmlFor="reading_end"
                                                                           className="text-sm font-semibold leading-6 text-gray-900">Reading
                                                                        End</label>
                                                                    <input
                                                                        type="number"
                                                                        id="reading_end"
                                                                        value={reading_end}
                                                                        onChange={(e) => setReadingEnd(e.target.value)}
                                                                        required
                                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                                                                    />
                                                                </div>

                                                                <div
                                                                    className="flex flex-col items-start"> {/* Added items-start class for vertical alignment */}
                                                                    <label htmlFor="record_date"
                                                                           className="text-sm font-semibold leading-6 text-gray-900">Record
                                                                        Date</label>
                                                                    <input
                                                                        type="date"
                                                                        id="record_date"
                                                                        value={recordDate}
                                                                        onChange={(e) => setRecordDate(e.target.value)}
                                                                        required
                                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                                                                    />
                                                                </div>

                                                                <div
                                                                    className="flex flex-col items-start"> {/* Added items-start class for vertical alignment */}
                                                                    <label htmlFor="record_pay"
                                                                           className="text-sm font-semibold leading-6 text-gray-900">Payment</label>
                                                                    <input
                                                                        type="number"
                                                                        id="record_pay"
                                                                        value={recordPay}
                                                                        onChange={(e) => setRecordPay(e.target.value)}
                                                                        required
                                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-row">
                                                                <label className="bg-gray-200 py-1 pl-4 rounded-full">
                                                                    Automatically save to transactions
                                                                    <input
                                                                        className="size-6 ml-4 mr-1 form-checkbox text-lime-600 bg-white border-gray-300 rounded-full focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50 hover:bg-lime-100 checked:bg-lime-500"
                                                                        type="checkbox"
                                                                        checked={autoSaveTransaction}
                                                                        onChange={(e) => setAutoSaveTransaction(e.target.checked)}
                                                                    />

                                                                </label>
                                                                <button type="submit"
                                                                        className="self-end mx-8 px-4 py-1 bg-lime-200 text-black font-semibold rounded-full hover:bg-lime-400 focus:outline-none focus:ring focus:ring-lime-300 focus:ring-opacity-50">Submit
                                                                </button>
                                                            </div>

                                                        </form>


                                                        <table
                                                            className="w-full mt-4 text-sm text-left rtl:text-right text-gray-500 ">
                                                            <thead
                                                                className="text-xs text-gray-700  uppercase bg-gray-100 border-y border-gray-300 ">
                                                            <tr className=" ">
                                                                <th></th>
                                                                <th scope="col" className="px-6 py-3">
                                                                    Record Date
                                                                </th>
                                                                <th scope="col" className="px-6 py-3">
                                                                Reading Start
                                                                </th>
                                                                <th scope="col" className="px-6 py-3">
                                                                    Reading End
                                                                </th>
                                                                <th scope="col" className="px-6 py-3">
                                                                    Payment
                                                                </th>
                                                                <th scope="col" className="px-6 py-3">

                                                                </th>


                                                            </tr>
                                                            </thead>
                                                            <tbody className="border-b border-gray-300 ">
                                                            {machineRecordDetails
                                                                .filter(detail_record => detail_record.task_id === record._id) // Filter records by taskId
                                                                .map((detail_record, index) => (
                                                                    <tr key={detail_record._id}
                                                                        className={`divide-y divide-gray-300 `}>
                                                                        <td></td>
                                                                        <td className="px-6 py-4">{detail_record.record_date}</td>
                                                                        <td className="px-6 py-4">{detail_record.reading_start}</td>
                                                                        <td className="px-6 py-4">{detail_record.reading_end}</td>
                                                                        <td className="px-6 py-4">{detail_record.record_pay.toLocaleString()}</td>

                                                                        { getPermission("update:records").isGranted ? (

                                                                        <td className=" ">
                                                                            <Button shape="circle" type="text"
                                                                                    onClick={() => handleDeleteMachineDetailRecord(detail_record._id)}>
                                                                                <TrashIcon
                                                                                    className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                                                                    aria-hidden="true"/>
                                                                            </Button>
                                                                        </td>
                                                                        ) : null
                                                                        }
                                                                    </tr>
                                                                ))
                                                            }
                                                            </tbody>
                                                        </table>


                                                    </div>

                                                </div>
                                            </Popover.Panel>
                                        </Transition>
                                    </Popover>
                                </td>

                                { getPermission("update:records").isGranted ? (

                                <td className=" py-4 text-right">
                                    <Link to={`/finances/machineHours/editMachineRecords/${record._id}`}>
                                        <PencilSquareIcon
                                            className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </td>

                                ) : null
                                }

                                { getPermission("update:records").isGranted ? (
                                <td className=" py-4 text-right">
                                    <Link to={`/finances/machineHours/viewMachineRecords/${record._id}`}>
                                        <InformationCircleIcon
                                            className="h-6 w-6 flex-none bg-gray-200 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </td>
                                ) : null
                                }

                                { getPermission("update:records").isGranted ? (
                                <td className=" ">
                                    <Button shape="circle" type="text" onClick={() => {
                                        handleDeleteMachineRecord(record._id);
                                    }}>
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"
                                        />
                                    </Button>

                                </td>
                    ) : null
                    }
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
