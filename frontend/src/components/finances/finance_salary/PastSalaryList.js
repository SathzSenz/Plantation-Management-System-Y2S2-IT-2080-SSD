import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';

import {DatePicker, Button, Popover, Radio, message} from 'antd'; // Assuming you're using Ant Design for popover and date picker

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

export default function PastSalaryList() {
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [salaryRecords, setSalaryRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const { enqueueSnackbar } = useSnackbar();

    const {getPermission, getPermissions} = useKindeAuth();

    const [selectedDates, setSelectedDates] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/salary')
            .then((response) => {
                setSalaryRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleDeleteSalaryRecord = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this salary record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`http://localhost:5555/salary/${id}`)
                .then(() => {
                    setSalaryRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
                    message.success('Salary record successfully deleted.');
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    message.error('Salary record deletion failed.');
                    console.log(error);
                });
        }
    };

    const sortedRecords = [...salaryRecords].sort((a, b) => {
        if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
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
        setSortBy('date');
        setSortOrder('asc');
    };

    const handleClearSorting = () => {
        setSearchQuery(''); // Reset search query
        setSortBy('');
        setSortOrder('asc');
    };

    const handleDownloadPDF = () => {
        const sortedRecords = salaryRecords.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
            }
        });

        const filteredRecords = sortedRecords.filter(machine => {
            const transactionDate = new Date(machine.date);
            return transactionDate >= selectedDates[0] && transactionDate <= selectedDates[1];
        });

        const doc = new jsPDF();
        doc.text('Salary Records Report', 10, 10);

        const headers = [['Date', 'Type', 'Hours/nos.', 'Rate', 'Description', 'Payer/Payee', 'Paid', 'Total']];
        const data = filteredRecords.map(machine => [
            machine.date,
            machine.type,
            machine.hours_nos,
            machine.rate,
            machine.description,
            machine.payer_payee,
            machine.paid,
            machine.hours_nos * machine.rate
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
        });

        doc.save('machine_records_report.pdf');
    };


    return (
        <div>
            <div className=" overflow-x-auto ">
                <SnackbarProvider/>
                <div className="flex flex-row justify-between items-center align-bottom mx-8 py-4 ">
                    <div>
                            <h1 className=" text-lg font-semibold text-left">Salary Payments</h1>
                            <p className="mt-1 text-sm font-normal text-gray-500 0">Manage your employee salary payment
                                operations</p>
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
                                        <XMarkIcon
                                            className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer"/>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-4 relative px-4">

                                {/*<button
                                    className="flex items-center space-x-1 cursor-pointer bg-lime-200 px-4 py-1 rounded-full hover:bg-lime-400"
                                    onClick={() => handleSortBy('date')}
                                >
                                    <span className="text-sm text-gray-600">Date</span>
                                    {sortBy === 'date' && (
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

                                <div>
                                    <Button
                                        shape="round"
                                        className="flex flex-row gap-2 items-center font-semibold bg-amber-200 text-gray-700 hover:bg-amber-500 border-none"
                                        onClick={() => setPopoverVisible(true)}>
                                        Download PDF Report <ArrowDownTrayIcon className="w-4 h-4 self-center"/>
                                    </Button>
                                    <Popover
                                        content={
                                            <div className="text-gray-600">
                                                <DatePicker.RangePicker
                                                    onChange={(dates) => setSelectedDates(dates)}
                                                />
                                                <div className="flex flex-col space-y-4 py-4">
                                                    <span>Select sorting criteria:</span>
                                                    <Radio.Group
                                                        onChange={(e) => setSortBy(e.target.value)}
                                                        value={sortBy}
                                                    >
                                                        <Radio value="date">Date</Radio>

                                                    </Radio.Group>
                                                    <span>Select sorting order:</span>
                                                    <Radio.Group
                                                        onChange={(e) => setSortOrder(e.target.value)}
                                                        value={sortOrder}
                                                    >
                                                        <Radio value="asc">Ascending</Radio>
                                                        <Radio value="desc">Descending</Radio>
                                                    </Radio.Group>
                                                </div>
                                                <Button shape="round"
                                                        className="bg-lime-600 border-none hover:text-lime-600 text-white"
                                                        onClick={handleDownloadPDF}>Download</Button>
                                            </div>
                                        }
                                        title="Select Date Range and Sorting"
                                        trigger="click"
                                        visible={popoverVisible}
                                        onVisibleChange={setPopoverVisible}
                                    />
                                </div>
*/}

                            </div>
                        </div>

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
                            Payment Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Start
                        </th>
                        <th scope="col" className="px-6 py-3">
                            End
                        </th>
                        <th scope="col" className="px-6 py-3">
                            NIC
                        </th>

                        <th scope="col" className="px-6 py-3">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Basic Days
                        </th>

                        <th scope="col" className="px-6 py-3">
                            Basic Rate
                        </th>

                        <th scope="col" className="px-6 py-3">
                            Bonus
                        </th>
                        <th scope="col" className="px-6 py-3">
                            OT Hrs
                        </th>
                        <th scope="col" className="px-6 py-3">
                            OT Rate
                        </th>
                        <th scope="col" className="px-6 py-3">
                            EPF/ETF
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Remarks
                        </th>

                        <th scope="col" className=" py-3">
                            <span className="sr-only">Delete</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="border-b border-gray-200">
                    {filteredMachineRecords.map((record, index) => (
                        <tr
                            key={record._id}
                            className={` divide-y
                                    ${record.paid === 'false' ? 'border-l-4 border-red-500 ' : 'border-l-4 border-lime-500 '}`}
                        >
                            <td></td>
                            <td className="px-6 py-4">{record.payment_date}</td>
                            <td className="px-6 py-4">{record.emp_name}</td>
                            <td className="px-6 py-4">{record.salary_start_date}</td>
                            <td className="px-6 py-4">{record.salary_end_date}</td>
                            <td className="px-6 py-4">{record.nic}</td>
                            <td className="px-6 py-4">{record.type}</td>
                            <td className="px-6 py-4">{record.basic_days}</td>
                            <td className="px-6 py-4">Rs.{record.basic_rate}</td>
                            <td className="px-6 py-4">Rs.{record.bonus_salary}</td>
                            <td className="px-6 py-4">{record.ot_hours}</td>
                            <td className="px-6 py-4">Rs.{record.ot_rate}</td>
                            <td className="px-6 py-4">{record.epf_etf}%</td>
                            <td className="px-6 py-4">{record.description}</td>


                            { getPermission("update:records").isGranted ? (
                                <td className=" ">

                                    <Button shape="circle" type="text" onClick={() => {
                                        handleDeleteSalaryRecord(record._id);
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
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
