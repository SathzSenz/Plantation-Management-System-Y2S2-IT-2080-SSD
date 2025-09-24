import React, {useEffect, useState} from "react";
import SideBar from "../../../components/SideBar";
import Navbar from "../../../components/utility/Navbar";
import FinanceNavigation from "../../../components/finances/FinanceNavigation";
import BackButton from "../../../components/utility/BackButton";
import Breadcrumb from "../../../components/utility/Breadcrumbs";

import {
    ArrowDownTrayIcon, ChevronUpIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import {Link, useParams} from "react-router-dom";
import {useSnackbar} from "notistack";
import axios from "axios";
import {ChevronDownIcon, HomeModernIcon, RectangleGroupIcon, TruckIcon} from "@heroicons/react/24/solid";
import {GiFruitBowl, GiPayMoney, GiReceiveMoney, GiTwoCoins, GiWaterTank} from "react-icons/gi";
import {MdElectricalServices} from "react-icons/md";
import {FaMoneyCheck} from "react-icons/fa";
import {Button, DatePicker, message, Popover, Radio} from "antd";
import FinanceValuationStatBar from "../../../components/finances/finance_valuation/FinanceValuationStatBar";


import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";


export default function Valuation() {
    const [loading, setLoading] = useState(false);

    const { id } = useParams();
    const [ValuationRecords, setValuationRecords] = useState([]);
    let [searchQuery, setSearchQuery] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const {getPermission, getPermissions} = useKindeAuth();
    const [machineRecords, setMachineRecords] = useState([]);

    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');

    const [selectedDates, setSelectedDates] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);

    const breadcrumbItems = [
        { name: 'Finance', href: '/finances' },
        { name: 'Valuation', href: '/finances/valuation' },
    ];

    useEffect(() => {
        setLoading(true);
        axios
            .get('${process.env.REACT_APP_API_BASE_URL}/valuation')
            .then((response) => {
                setValuationRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);




    const handleDeleteValuation = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this valuation record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/valuation/${id}`)
                .then(() => {
                    setValuationRecords(prevRecords => prevRecords.filter(record => record._id !== id));
                    message.success('Valuation record has been successfully deleted.');
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    message.error('Valuation record deletion failed.');
                    console.log(error);
                });
        }
    };

    const subtypeBorderColorMap = {
        Land: "border-lime-400",
        Machinery: "border-green-400",
        Crops: "border-teal-400",
        Infrastructure: "border-cyan-400",
        Utilities: "border-sky-400",
        Water: "border-blue-400",
        Loans: "border-rose-400",
        Debts: "border-red-400",
        Leases: "border-pink-400",
        Taxes: "border-violet-400",
    };

    function getBorderColorClass(subtype) {
        return subtypeBorderColorMap[subtype] || "border-gray-200"; // Default color
    }






    const sortedRecords = [...ValuationRecords].sort((a, b) => {
        if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        }
    });

    const filteredValuationRecords = sortedRecords.filter(record => {
        // Convert all values to lowercase for case-insensitive search
        const searchTerm = searchQuery;

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
        const sortedRecords = ValuationRecords.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
            }
        });

        const filteredRecords = sortedRecords.filter(valuation => {
            const transactionDate = new Date(valuation.date);
            return transactionDate >= selectedDates[0] && transactionDate <= selectedDates[1];
        });

        const doc = new jsPDF();
        doc.text('Valuation Records Report', 10, 10);

        const headers = [['Date', 'Type', 'Subtype', 'Quantity', 'Price', 'Description', 'Payer Payee', 'Percentage %','Value']];
        const data = filteredRecords.map(valuation => [
            valuation.date,
            valuation.type,
            valuation.subtype,
            valuation.quantity,
            valuation.price,
            valuation.description,
            valuation.payer_payee,
            valuation.appreciationOrDepreciation,
            valuation.quantity * valuation.price
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
        });

        doc.save('valuation_records_report.pdf');
    };


    return (
        <div className="">
            {/* Navbar */}
            <div className="sticky top-0 z-10">
                <Navbar />
            </div>
            <div className="">
                <div className="grid sm:grid-cols-6 ">
                    <div className="  col-span-1 sticky left-0 top-0">
                        <SideBar/>
                    </div>

                    <div className="w-full col-span-5 flex flex-col ">
                        <FinanceNavigation/>
                        <div className="flex flex-row ">
                            <BackButton/>
                            <Breadcrumb items={breadcrumbItems}/>
                        </div>
                        <FinanceValuationStatBar/>

                        <div>
                            <div className="flex flex-row justify-between items-center px-8 py-4">
                                <div>
                                    <h1 className=" text-lg font-semibold text-left">Valuation records</h1>
                                    <p className="mt-1 text-sm font-normal text-gray-500 0">Browse a list of all assets
                                        and liabilities stored in the system</p>
                                </div>

                                <div>
                                    <Link to="/finances/valuation/addValuation"
                                       className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                                        Add new record <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="">
                            <div className=" flex flex-row w-full bg-gray-200  h-72 ">
                                <button value="land" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden h-full bg-lime-100 flex flex-col justify-between items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle justify-between pb-8  pt-8">
                                        <div className="w-8 h-8">
                                            <RectangleGroupIcon/>
                                        </div>
                                        <dd className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Land
                                        </dd>
                                    </div>
                                </button>
                                <button value="machinery" onClick={(e) => setSearchQuery(e.target.value)}
                                    className=" w-full overflow-hidden bg-green-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <span
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <TruckIcon/>
                                        </div>

                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Machinery
                                        </div>


                                    </span>
                                </button>
                                <button value="crops" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-teal-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <GiFruitBowl className="w-full h-full"/>
                                        </div>

                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Crops
                                        </div>


                                    </div>
                                </button>
                                <button value="infrastruscture" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-cyan-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <HomeModernIcon/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Infrastruscture
                                        </div>
                                    </div>
                                </button>
                                <button value="utilities" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-sky-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <MdElectricalServices className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Utilities
                                        </div>
                                    </div>
                                </button>
                                <button value="water" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-blue-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <GiWaterTank className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Water
                                        </div>
                                    </div>
                                </button>
                                <button value="loans" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-rose-200 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <GiReceiveMoney className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Loans
                                        </div>
                                    </div>
                                </button>
                                <button value="debts" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-red-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <GiPayMoney className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Debts
                                        </div>
                                    </div>
                                </button>
                                <button value="leases" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-pink-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <FaMoneyCheck className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Leases
                                        </div>
                                    </div>
                                </button>
                                <button value="taxes" onClick={(e) => setSearchQuery(e.target.value)}
                                    className="w-full overflow-hidden bg-violet-100 flex justify-center items-center hover:w-[120%] hover:h-[105%] hover:shadow-xl transition-all duration-300 ease-in-out">
                                    <div
                                        className="flex flex-col h-full items-center content-center align-middle pt-8 pb-8  justify-between ">
                                        <div className="w-8 h-8">
                                            <GiTwoCoins className="w-full h-full"/>
                                        </div>
                                        <div
                                            className="text-xl font-semibold text-gray-900 sm:text-xl [writing-mode:vertical-lr] rotate-180">
                                            Taxes
                                        </div>
                                    </div>
                                </button>

                            </div>

                            <div className="flex justify-start px-8 w-full  py-4 ">

                                <div className="py-4  relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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


                                </div>


                            </div>

                        </div>

                        <table className="w-full text-sm text-left rtl:text-right text-gray-500  ">
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
                                    Subtype
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Quantity
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Payer/Payee
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Percentage
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Value
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

                            {filteredValuationRecords.map((record, index) => (
                                <tr key={record._id}
                                    className={`divide-y border-l-4 ${getBorderColorClass(record.subtype)}`}
                                >
                                    <td></td>
                                    <td className="px-6 py-4">
                                        {record.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.subtype}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.quantity}
                                    </td>
                                    <td className="px-6 py-4">
                                        Rs.{record.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.payer_payee}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.appreciationOrDepreciation}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div
                                            className="py-1 bg-zinc-200 rounded-full text-black text-center hover:bg-zinc-400">
                                            Rs.{(record.quantity * record.price).toLocaleString()}
                                        </div>

                                    </td>
                                    <td className=" py-4 text-right">
                                        <Link to={`/finances/valuation/viewValuation/${record._id}`}>
                                            <InformationCircleIcon
                                                className="h-6 w-6 flex-none bg-gray-200 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                                aria-hidden="true"/>
                                        </Link>
                                    </td>
                                   
                                    <td className=" py-4 text-right">
                                        <Link to={`/finances/valuation/editValuation/${record._id}`}>
                                            <PencilSquareIcon
                                                className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                                aria-hidden="true"/>
                                        </Link>
                                    </td>
                                    
                                        
                                    <td className=" ">
                                            <Button shape="circle" type="text" onClick={() => {
                                                handleDeleteValuation(record._id);
                                            }}>
                                                <TrashIcon
                                                    className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                    </td>

                                    

                                </tr>
                            ))}


                            </tbody>
                        </table>

                    </div>
                </div>
            </div>

        </div>
)
    ;
}
