import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { StyleSheet } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
});

const EmployeeList = () => {
    const [RegistrationRecords, setRegistrationRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
    const [filteredEmployeeRecords, setFilteredEmployeeRecords] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/employeeRecords`)
            .then((response) => {
                setRegistrationRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const getFilteredEmployeeRecords = (searchQuery, selectedTypeFilter) => {
        const filtered = RegistrationRecords.filter((record) => {
            const fullName = `${record.f_name} ${record.l_name}`.toLowerCase();
            return (
                fullName.includes(searchQuery.toLowerCase()) &&
                (selectedTypeFilter === 'All Types' || record.emp_type === selectedTypeFilter)
            );
        });
        setFilteredEmployeeRecords(filtered);
    };

    useEffect(() => {
        getFilteredEmployeeRecords(searchQuery, selectedTypeFilter);
    }, [searchQuery, selectedTypeFilter]);


    const handleDelete = (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this registration record?');
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`http://localhost:5555/employeeRecords/${id}`)
                .then(() => {
                    setRegistrationRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
                    setLoading(false);
                    enqueueSnackbar('Record Deleted successfully', { variant: 'success' });
                })
                .catch((error) => {
                    console.log(error);
                    // Handle error
                });
        }
    };

    const filteredRecords = RegistrationRecords.filter((record) =>
        Object.values(record).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                // Convert value to string and check if it includes the search query
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        }) && (selectedTypeFilter === 'All Types' || record.emp_type === selectedTypeFilter)
    );

    const employeeTypes = [...new Set(RegistrationRecords.map((record) => record.emp_type))];

    const generatePDF = () => {
        const input = document.getElementById('registration-table');
        if (input) {
            const currentDate = new Date().toLocaleString('en-GB');

            html2canvas(input)
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a3');

                    const recordCount = filteredRecords.length;
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const textWidth =
                        pdf.getStringUnitWidth('Employee Details') * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                    const centerPosition = (pageWidth - textWidth) / 2;

                    pdf.setFontSize(16);
                    pdf.text('Employee Details', centerPosition, 10);
                    pdf.setFontSize(12);
                    pdf.text(`As At: ${currentDate}`, centerPosition, 20);

                    pdf.text(`Number of Employees: ${recordCount}`, 10, 40);

                    pdf.autoTable({
                        html: '#registration-table',
                        startY: 70,
                        theme: 'grid',
                    });

                    pdf.save(`Employee-details_generatedAt_${currentDate}.pdf`);
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                });
        } else {
            console.error('Table element not found');
        }
    };

    function getBorderColorClass(emp_type) {
        return subtypeBorderColorMap[emp_type] || 'border-gray-200';
    }

    const subtypeBorderColorMap = {
        permanent: 'border-cyan-400',
        contract: 'border-yellow-400',
        trainee: 'border-red-400',
        seasonal: 'border-purple-400',
        casual: 'border-lime-400',
    };
        return (
            <div className=" overflow-x-auto  ">

                <div className="flex flex-row justify-between items-center px-8 py-4">
                    <div>
                        <h1 className=" text-lg font-semibold text-left">Employee Details</h1>
                        <p className="mt-1 text-sm font-normal text-gray-500 0">Easily access stored employee details
                            within the system for thorough insights.</p>
                        <div className="py-4 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="text-gray-500 h-4 w-4"/>
                            </div>
                            <input
                                type="text"
                                placeholder="Search all employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-300 rounded-full px-3 py-1.5 w-full text-sm pl-8"
                                style={{paddingRight: '2.5rem'}}
                            />


                        </div>

                    </div>
                    <div className="mt-2">
                        <select
                            value={selectedTypeFilter}
                            onChange={(e) => setSelectedTypeFilter(e.target.value)}
                            className="appearance-none rounded-full bg-white px-7 py-1.5 text-sm text-gray-900 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 mt-11"
                            style={{marginLeft: "-175px"}}
                        >
                            <option value="All Types">All Types</option>
                            {employeeTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>


                    <div>

                        <Link to="/employees/registration/addEmployee"
                           className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                            Add new employee <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <button
                            onClick={generatePDF}
                            className="ml-4 flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table
                        id="registration-table"
                        className="w-full text-sm text-left rtl:text-right text-gray-500  ">
                        <thead
                            className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                        <tr className=" ">
                            <th></th>
                            <th scope="col" className="px-6 py-3">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3">
                                First Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                            Last Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            DOB
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Gender
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Contact No
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3">
                            NIC
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Address
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Employee type
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Work Qualifications
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Hired Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Hourly Rate
                        </th>
                        <th scope="col" className=" py-3">
                            <span className="sr-only"></span>
                        </th>
                        <th scope="col" className=" py-3">
                            <span className="sr-only"></span>
                        </th>
                        <th scope="col" className=" py-3">
                            <span className="sr-only"></span>
                        </th>
                    </tr>
                    </thead>
                        <tbody className="border-b border-green-400">

                        {filteredRecords.map((record, index) => (

                            <tr key={index}
                                className={`divide-y border-l-4 ${getBorderColorClass(record.emp_type)}`}
                            >
                                <td></td>
                                <td className="px-6 py-4">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    {record.f_name}
                                </td>
                                <td className="px-6 py-4">
                                    {record.l_name}
                                </td>
                                <td className="px-6 py-4">
                                    {record.dob.split("T")[0]}
                                </td>
                                <td className="px-6 py-4">
                                    {record.gender}
                                </td>
                                <td className="px-6 py-4">
                                    {record.contact_no}
                                </td>
                                <td className="px-6 py-4">
                                    {record.emp_email}
                                </td>
                                <td className="px-6 py-4">
                                    {record.nic}
                                </td>
                                <td className="px-6 py-4">
                                    {record.e_address}
                                </td>
                                <td className="px-6 py-4">
                                    {record.emp_type}
                                </td>
                                <td className="px-6 py-4">
                                    {record.qualifications}
                                </td>
                                <td className="px-6 py-4">
                                    {record.h_date.split("T")[0]}
                                </td>
                                <td className="px-6 py-4">
                                    {record.h_rate}
                                </td>


                                <td className=" py-4 text-right">
                                    <Link to={`/employees/registration/viewEmployee/${record._id}`}
                                          className="font-medium text-blue-600  hover:underline">
                                        <InformationCircleIcon
                                            className="h-6 w-6 flex-none bg-gray-300 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                            aria-hidden="true"/>
                                    </Link>
                                </td>
                                <td className=" py-4 text-right">
                                    <Link to={`/employees/registration/editEmployee/${record._id}`}
                                          className="font-medium text-blue-600 hover:underline">
                                        <PencilSquareIcon
                                            className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                            aria-hidden="true"/>
                                    </Link>
                                </td>

                                <td className=" py-4 text-right">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleDelete(record._id)}
                                    >
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"/>
                                    </button>
                                </td>
                            </tr>
                        ))}


                        </tbody>
                    </table>
                </div>
            </div>
        )
};
export default EmployeeList;
