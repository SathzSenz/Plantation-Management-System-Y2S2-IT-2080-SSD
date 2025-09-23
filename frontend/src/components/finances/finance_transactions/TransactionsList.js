import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';

import {DatePicker, Button, Popover, Radio, message} from 'antd';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

export default function TransactionsList() {
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [TransactionsRecords, setTransactionsRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const { enqueueSnackbar } = useSnackbar();

    const [selectedDates, setSelectedDates] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const {getPermission, getPermissions} = useKindeAuth();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/transactions`)
            .then((response) => {
                setTransactionsRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleDeleteTransaction = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this transaction record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/transactions/${id}`)
                .then(() => {
                    setTransactionsRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
                    message.success('Transaction record has successfully deleted.');
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    message.error('Transaction record saving failed.');
                    console.log(error);
                });
        }
    };

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

    const sortedRecords = [...TransactionsRecords].sort((a, b) => {
        if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'amount') {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
    });

    const sortedAndFilteredRecords = sortedRecords.filter((record) =>
        Object.values(record).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        })
    );

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = () => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions`)
            .then(response => {
                setTransactions(response.data.data);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const handleDownloadPDF = () => {
        const startDate = new Date(selectedDates[0]);
        const endDate = new Date(selectedDates[1]);

        // Format date range
        const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

        const sortedTransactions = transactions.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
            } else if (sortBy === 'amount') {
                return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
        });

        // Adjust to include the full day of start and end dates
        startDate.setHours(0, 0, 0, 0); // Set to start of the day
        endDate.setHours(23, 59, 59, 999); // Set to end of the day

        const filteredTransactions = sortedTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Initialize and calculate summary variables
        let totalIncome = 0;
        let totalExpense = 0;
        filteredTransactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'expense') {
                totalExpense += transaction.amount;
            }
        });
        const profitOrLoss = totalIncome - totalExpense;
        const numberOfTransactions = filteredTransactions.length;

        const doc = new jsPDF();
        doc.text('Transaction Report', 10, 10);

        // Display selected date range
        doc.text(`Date Range: ${dateRange}`, 10, 20);

        const headers = [['Date', 'Type','Sub Type', 'Amount', 'Description', 'Payer/Payee', 'Payment Method']];
        const data = filteredTransactions.map(transaction => [
            transaction.date,
            transaction.type,
            transaction.subtype,
            transaction.amount,
            transaction.description,
            transaction.payer_payee,
            transaction.method
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 30,
        });

        // Ensure there is a gap between the transactions table and the summary table
        let finalY = doc.lastAutoTable.finalY || 30;
        const summaryHeaders = [['Number of Transactions', 'Total Income', 'Total Expense', 'Profit/Loss']];
        const summaryData = [[
            numberOfTransactions.toString(),
            totalIncome.toFixed(2),
            totalExpense.toFixed(2),
            profitOrLoss.toFixed(2),

        ]];

        // Adding Summary Table
        doc.autoTable({
            head: summaryHeaders,
            body: summaryData,
            startY: finalY + 10, // Adjust this value as needed to control the gap
        });

        doc.save('transaction_report.pdf');
    };







    return (
        <div className=" overflow-x-auto ">
            <SnackbarProvider/>
            <div className="flex flex-row justify-between items-center align-bottom mx-8 py-4">
                <div>
                    <h1 className="text-lg font-semibold text-left">Transaction records</h1>
                    <p className="mt-1 text-sm font-normal text-gray-500 0">
                        Browse a list of all income and expense records stored in the system
                    </p>
                    <div className="flex flex-row gap-4">
                        <div className="py-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="text-gray-500 h-4 w-4"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Search all transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-full px-3 py-1 w-full text-sm pl-10"
                                style={{paddingRight: '2.5rem'}}
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
                                className="flex items-center space-x-1 cursor-pointer bg-lime-200 px-4 py-1 rounded-full hover:bg-lime-400"
                                onClick={() => handleSortBy('amount')}
                            >
                                <span className="text-sm text-gray-600">Amount</span>
                                {sortBy === 'amount' && (
                                    sortOrder === 'asc' ? (
                                        <ChevronUpIcon
                                            className="w-4 h-4 bg-green-800  text-white stroke-2 rounded-full"/>
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
                                                    <Radio value="amount">Amount</Radio>
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
                                            <Button shape="round" className="bg-lime-600 border-none hover:text-lime-600 text-white"
                                                    onClick={handleDownloadPDF}>Download</Button>
                                        </div>
                                    }
                                    title="Select Date Range and Sorting"
                                    trigger="click"
                                    visible={popoverVisible}
                                    onVisibleChange={setPopoverVisible}
                                />
                            </div>


                        </div>
                    </div>

                </div>
                <div>
                    <Link
                        to="/finances/transactions/addTransaction"
                        className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        Add new transaction <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>


            <div id="print-area">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                    <thead
                        className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                    <tr className=" ">
                        <th></th>
                        <th scope="col" className="px-6 py-3">
                            Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Sub Type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Description
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Payer/Payee
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Payment Method
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
                    {sortedAndFilteredRecords.map((record, index) => (
                        <tr
                            key={record._id}
                            className={` divide-y
                                    ${record.type === 'expense' ? 'border-l-4 border-red-400 ' : 'border-l-4 border-green-400 '}`}
                        >
                            <td></td>
                            <td className="px-6 py-4">{record.date}</td>
                            <td className="px-6 py-4">{record.type}</td>
                            <td className="px-6 py-4">{record.subtype}</td>
                            <td className="px-6 py-4">Rs.{record.amount.toLocaleString()}</td>
                            <td className="px-6 py-4">{record.description}</td>
                            <td className="px-6 py-4">{record.payer_payee}</td>
                            <td className="px-6 py-4">{record.method}</td>
                            <td className=" py-4 text-right">
                                <Link to={`/finances/transactions/viewTransactionDetails/${record._id}`}>
                                    <InformationCircleIcon
                                        className="h-6 w-6 flex-none bg-gray-200 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </td>

                            {
                                getPermission("update:records").isGranted ? (
                            <td className=" py-4 text-right">
                                <Link to={`/finances/transactions/editTransaction/${record._id}`}>
                                    <PencilSquareIcon
                                        className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </td>

                                ): null
                            }
                            { getPermission("update:records").isGranted ? (
                            <td className=" ">
                                    <Button shape="circle" type="text" onClick={() => {
                                        handleDeleteTransaction(record._id);
                                    }}>
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"
                                        />
                                    </Button>
                            </td>
                            ): null
                            }
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
