import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import axios from "axios";
import {message, DatePicker} from "antd";
import moment from "moment";
import jsPDF from 'jspdf';

export default function SalaryProcessingSection() {


    const [emp_name, setEmpName] = useState('');
    const [nic, setNIC] = useState('');
    const [payment_date, setPaymentDate] = useState('');
    const [type, setType] = useState('permanent');

    const [salary_start_date, setSalaryStartDate] = useState(''); // Initialize with null
    const [salary_end_date, setSalaryEndDate] = useState(''); // Initialize with null

    const [basic_days, setBasicDays] = useState(0);
    const [basic_rate, setBasicRate] = useState(0);
    const [bonus_salary, setBonusSalary] = useState('0');
    const [ot_hours, setOtHours] = useState('0');
    const [ot_rate, setOtRate] = useState('0');
    const [epf_etf, setEpfEtf] = useState('0');
    const [description, setDescription] = useState('');

    const [id, setID] = useState('');




    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [RegistrationRecords, setRegistrationRecords] = useState([]);





    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/employeeRecords`)
            .then((response) => {
                setRegistrationRecords(response.data.data); // Assuming response.data is an object with a 'data' property containing an array of records
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const [selectedID, setSelectedID] = useState(null);

    const handleRadioChange = (id) => {
        setSelectedID(id);

        // Find the selected employee from the RegistrationRecords array
        const selectedEmployee = RegistrationRecords.find(person => person._id === id);

        // Concatenate the first name and last name to set the employee's full name
        const fullName = selectedEmployee ? `${selectedEmployee.f_name} ${selectedEmployee.l_name}` : '';

        // Update the state variables with the selected employee's data
        setEmpName(fullName);
        setNIC(selectedEmployee ? selectedEmployee.nic : '');
        setType(selectedEmployee ? selectedEmployee.emp_type : '');
        setBasicRate(selectedEmployee ? selectedEmployee.h_rate : '');
    };


    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/employeeRecords/${id}`)
            .then((response) => {

                // Conditionally set EPF/ETF based on employee type
                const defaultEpfEtf = response.data.emp_type === `permanent` ? 6 : 3;
                setEpfEtf(defaultEpfEtf);

                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const [attendanceRecords, setAttendanceRecords] = useState([]);


    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/attendanceRecords`)
            .then((response) => {
                setAttendanceRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (attendanceRecords.length > 0 && emp_name && salary_start_date && salary_end_date) {
            const filteredRecords = attendanceRecords.filter((record) =>
                record.e_name === emp_name &&
                moment(record.e_date).isBetween(salary_start_date, salary_end_date, null, '[]') // Filter records between salary start date and end date
            );
            console.log("Filtered Records:", filteredRecords); // Log filtered records
            let totalDays = 0;
            filteredRecords.forEach((record) => {
                if (record.att_status === "present") {
                    totalDays += 1;
                } else if (record.att_status === "halfday") {
                    totalDays += 0.5;
                }
                // For "absent", don't add any days
            });
            console.log("Total Days:", totalDays); // Log total days
            setBasicDays(totalDays);
        }
    }, [attendanceRecords, emp_name, salary_start_date, salary_end_date]);





    const calculateTotalSalary = () => {
        // Convert input values to numbers
        const basicDaysValue = parseFloat(basic_days);
        const basicRateValue = parseFloat(basic_rate);
        const bonusSalaryValue = parseFloat(bonus_salary);
        const otHoursValue = parseFloat(ot_hours);
        const otRateValue = parseFloat(ot_rate);
        const epfEtfValue = parseFloat(epf_etf);

        // Check if any input value is NaN and replace it with 0
        const validBasicDays = isNaN(basicDaysValue) ? 0 : basicDaysValue;
        const validBasicRate = isNaN(basicRateValue) ? 0 : basicRateValue;
        const validBonusSalary = isNaN(bonusSalaryValue) ? 0 : bonusSalaryValue;
        const validOtHours = isNaN(otHoursValue) ? 0 : otHoursValue;
        const validOtRate = isNaN(otRateValue) ? 0 : otRateValue;
        const validEpfEtf = isNaN(epfEtfValue) ? 0 : epfEtfValue;

        // Calculate basic salary
        const basicSalary = validBasicDays * validBasicRate;

        // Calculate OT salary
        const otSalary = validOtHours * validOtRate;

        // Calculate total salary
        const totalSalary = basicSalary + validBonusSalary + otSalary;

        // Calculate EPF/ETF deduction
        const epfEtfDeduction = (totalSalary * validEpfEtf) / 100;

        // Calculate net salary
        const netSalary = totalSalary - epfEtfDeduction;

        return netSalary;
    };


    const [isInputFocused, setIsInputFocused] = useState(false);
    const [autoSaveTransaction, setAutoSaveTransaction] = useState(true);

    const handleSaveSalaryRecord = async (e) => {
        e.preventDefault();

        // Validation for empty fields
        if (
            !payment_date ||
            !emp_name ||
            !salary_start_date ||
            !salary_end_date ||
            !nic ||
            !type ||
            !basic_days ||
            !basic_rate ||
            !bonus_salary ||
            !ot_hours ||
            !ot_rate ||
            !epf_etf ||
            !description
        ) {
            message.error('Please fill in all fields.');
            return;
        }

        // Validation checks
        if (basic_days < 0 || basic_rate <= 0 || basic_rate < 0 || bonus_salary < 0 || ot_hours < 0 || ot_rate < 0 || epf_etf < 0 || isNaN(basic_days) || isNaN(basic_rate) || isNaN(bonus_salary) || isNaN(ot_hours) || isNaN(ot_rate) || isNaN(epf_etf)) {
            message.error('Please enter valid positive values for days, rates, and amounts.');
            return;
        }

        if (new Date(payment_date) > new Date()) {
            message.error('Payment date cannot be in the future.');
            return;
        }

        if (description.length > 100) {
            message.error('Description should be shorter than 100 characters.');
            return;
        }

        const data = {
            payment_date,
            emp_name,
            salary_start_date,
            salary_end_date,
            nic,
            type,
            basic_days,
            basic_rate,
            bonus_salary,
            ot_hours,
            ot_rate,
            epf_etf,
            description

        };

        const basicDaysValue = parseFloat(data.basic_days);
        const basicRateValue = parseFloat(data.basic_rate);
        const basicSalary = basicDaysValue * basicRateValue;

        // Calculate OT salary
        const otHoursValue = parseFloat(data.ot_hours);
        const otRateValue = parseFloat(data.ot_rate);
        const otSalary = otHoursValue * otRateValue;

        // Calculate total salary
        const bonusSalaryValue = parseFloat(data.bonus_salary);
        const totalSalary = basicSalary + bonusSalaryValue + otSalary;

        // Calculate EPF/ETF deduction
        const epfEtfValue = parseFloat(data.epf_etf);
        const epfEtfDeduction = (totalSalary * epfEtfValue) / 100;

        // Calculate net salary
        const netSalary = totalSalary - epfEtfDeduction;
        setLoading(true);
        axios
            .post('${process.env.REACT_APP_API_BASE_URL}/salary', data)
            .then(() => {
                setLoading(false);
                message.success('Salary record has successfully saved.');

                if (autoSaveTransaction) {
                    // Construct the transaction data based on the saved machine fee data
                    const transactionData = {
                        date: data.payment_date,
                        type: 'expense',
                        subtype: `Salary payment` ,
                        amount:  netSalary,
                        description: `Salary from ${data.salary_start_date} to ${data.salary_end_date}`,
                        payer_payee: data.emp_name,
                        method: 'Automated Entry',
                    };

                    // Save the transaction record
                    handleSaveTransactionRecord(transactionData);
                }
                navigate('/finances/salaryPayment');
            })
            .catch((error) => {
                setLoading(false);
                message.error('Salary record saving failed.');
                console.log(error);
                console.error('Error occurred while saving salary record:', error);
                navigate('/finances/salaryPayment');
            });
    };

    const handleSaveTransactionRecord = (transactionData) => {
        setLoading(true);
        axios
            .post('${process.env.REACT_APP_API_BASE_URL}/transactions', transactionData)
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


    const generatePayslipPDF = () => {
        // Validation for empty fields
        const missingFields = [];
        if (!payment_date) missingFields.push('Payment Date');
        if (!salary_start_date) missingFields.push('Salary Start Date');
        if (!salary_end_date) missingFields.push('Salary End Date');
        if (!basic_days) missingFields.push('Basic Days');
        if (!basic_rate) missingFields.push('Basic Rate');
        if (!bonus_salary) missingFields.push('Bonus Salary');
        if (!ot_hours) missingFields.push('OT Hours');
        if (!ot_rate) missingFields.push('OT Rate');
        if (!epf_etf) missingFields.push('EPF/ETF');
        if (!description) missingFields.push('Description');

        if (missingFields.length > 0) {
            message.error(`Please fill in the following fields: ${missingFields.join(', ')}.`);
            return;
        }

        // Validation checks
        if (basic_days < 0 || basic_rate <= 0 || basic_rate < 0 || bonus_salary < 0 || ot_hours < 0 || ot_rate < 0 || epf_etf < 0 || isNaN(basic_days) || isNaN(basic_rate) || isNaN(bonus_salary) || isNaN(ot_hours) || isNaN(ot_rate) || isNaN(epf_etf)) {
            message.error('Please enter valid positive values for days, rates, and amounts.');
            return;
        }

        if (new Date(payment_date) > new Date()) {
            message.error('Payment date cannot be in the future.');
            return;
        }

        if (description.length > 100) {
            message.error('Description should be shorter than 100 characters.');
            return;
        }


        // Calculate total pay
        const basicDaysValue = parseFloat(basic_days);
        const basicRateValue = parseFloat(basic_rate);
        const bonusSalaryValue = parseFloat(bonus_salary);
        const otHoursValue = parseFloat(ot_hours);
        const otRateValue = parseFloat(ot_rate);
        const epfEtfValue = parseFloat(epf_etf);

        // Check if any input value is NaN and replace it with 0
        const validBasicDays = isNaN(basicDaysValue) ? 0 : basicDaysValue;
        const validBasicRate = isNaN(basicRateValue) ? 0 : basicRateValue;
        const validBonusSalary = isNaN(bonusSalaryValue) ? 0 : bonusSalaryValue;
        const validOtHours = isNaN(otHoursValue) ? 0 : otHoursValue;
        const validOtRate = isNaN(otRateValue) ? 0 : otRateValue;
        const validEpfEtf = isNaN(epfEtfValue) ? 0 : epfEtfValue;

        // Calculate basic salary
        const basicSalary = validBasicDays * validBasicRate;

        // Calculate OT salary
        const otSalary = validOtHours * validOtRate;

        // Calculate total salary
        const totalSalary = basicSalary + validBonusSalary + otSalary;

        // Calculate EPF/ETF deduction
        const epfEtfDeduction = (totalSalary * validEpfEtf) / 100;

        // Calculate net salary
        const netSalary = totalSalary - epfEtfDeduction;

        // Create a new PDF document in landscape orientation
        const doc = new jsPDF({});

        // Set monospace font
        doc.setFont('courier');

        // Add company information
        doc.setFontSize(18);
        doc.text('Elemahana Plantations', 10, 10);
        doc.text('Kotawehera, Nikaweratiya', 10, 20);

        // Add title for the payslip
        doc.setFontSize(12);
        doc.text('Salary Payslip', 10, 40);

        // Create table headers
        const headers = [['Description', 'Amount']];
        const data = [
            ['Employee Name', emp_name],
            ['NIC', nic],
            ['Date Range', `${salary_start_date} - ${salary_end_date}`],
            ['Basic Days', `${basic_days}`],
            ['Payment Date', payment_date],
            ['Type', type],
            ['Basic Salary', basicSalary.toFixed(2)],
            ['Bonus Salary', validBonusSalary.toFixed(2)],
            ['OT Salary', otSalary.toFixed(2)],
            ['Total Salary', totalSalary.toFixed(2)],
            ['EPF/ETF Deduction', epfEtfDeduction.toFixed(2)],
            // Set 'Net Salary' with different font color
            [{ content: 'Net Salary', styles: { textColor: [0, 0, 255] } }, { content: netSalary.toFixed(2), styles: { textColor: [0, 0, 255] } }]
        ];

        // Set table width and align headers to center
        const tableWidth = 170;
        const cellWidth = tableWidth / 2;
        doc.autoTable({
            startY: 50,
            head: headers,
            body: data,
            margin: { left: 10, right: 10 },
            columnStyles: { 0: { cellWidth: cellWidth, fontStyle: 'bold' }, 1: { cellWidth: cellWidth } }
        });

        // Save the PDF
        doc.save('payslip.pdf');
        message.success('Pay slip generated.');
    };






    return (
        <div className="border-t ">

            <div className="flex flex-row">
                <div className="w-1/3 overflow-scroll h-screen bg-gray-50  mb-14 overscroll-auto border-r  bottom-14" id="employeelist">
                    <ul role="list" className="divide-y divide-gray-300">
                        {RegistrationRecords.map((person) => (
                            <li key={person._id}
                                className={``}>
                                <label htmlFor={person._id}
                                       className={`py-3 px-4 flex hover:bg-lime-50 transition-all hover:shadow-xl duration-200  justify-between gap-x-4 ${selectedID === person._id ? 'bg-lime-100 border-l-4 border-lime-600 shadow-xl' : ''}`}>
                                    <div className="flex min-w-0 gap-x-4">
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">{person.f_name} {person.l_name}</p>
                                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.nic}</p>
                                        </div>
                                    </div>
                                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                        <p className="text-sm leading-6 text-gray-900">{person.emp_type}</p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">Rs.{person.h_rate.toLocaleString()}</p>
                                    </div>
                                    <input
                                        type="radio"
                                        id={person._id}
                                        name="employee"
                                        className="size-4 self-center focus:ring-white focus:ring-0 border border-gray-400 text-lime-600 checked:border-gray-500 checked:border checked::bg-lime-700"
                                        value={person.nic}
                                        checked={selectedID === person._id}
                                        onChange={() => handleRadioChange(person._id)}
                                    />
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="w-full">
                    <form className="flex-col flex items-center justify-center">
                        <div className="space-y-12 px-0 py-8 w-8/12">
                            <div className="">
                                <div className="mt-4  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 ">

                                    {/* EPM Name */}
                                    <div className="sm:col-span-2 sm:col-start-1">
                                        <label htmlFor="emp_name"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Employee Name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="emp_name"
                                                value={emp_name}
                                                onChange={(e) => setEmpName(e.target.value)}
                                                id="emp_name"
                                                disabled={true}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* NIC */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="nic"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            NIC
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="nic"
                                                value={nic}
                                                onChange={(e) => setNIC(e.target.value)}
                                                id="nic"
                                                disabled={true}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="type"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Type
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="type"
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                id="type"
                                                disabled={true}
                                                autoComplete="type"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />

                                        </div>
                                    </div>

                                    {/*Date range */}
                                    <div className="sm:col-span-4">
                                        <label htmlFor="salary_range"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Date Range
                                        </label>
                                        <div className="mt-2">
                                            <DatePicker.RangePicker
                                                value={salary_start_date && salary_end_date ? [moment(salary_start_date), moment(salary_end_date)] : null}
                                                onChange={(dates) => {
                                                    if (dates && dates.length === 2) {
                                                        // Format dates to yyyy-mm-dd before setting state variables
                                                        const startDateFormatted = dates[0].format('YYYY-MM-DD');
                                                        const endDateFormatted = dates[1].format('YYYY-MM-DD');
                                                        // Set state variables with formatted dates
                                                        setSalaryStartDate(startDateFormatted);
                                                        setSalaryEndDate(endDateFormatted);
                                                    } else {
                                                        setSalaryStartDate(null);
                                                        setSalaryEndDate(null);
                                                    }
                                                }}
                                                className="flex flex-row w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />

                                            <p className="text-xs text-lime-600 mt-1">
                                                Please select the range of dates for which you wish to find the present
                                                days and half-days of the selected employee.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Basic days */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="basic_days"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Basic Days
                                        </label>
                                        <div className="mt-2 relative">
                                            <input
                                                type="number"
                                                name="basic_days"
                                                value={basic_days}
                                                onChange={(e) => setBasicDays(e.target.value)}
                                                id="basic_days"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                            {/* Warning Message */}
                                            <p className=" text-xs text-amber-600 mt-1">
                                                Calculated by analyzing attendance records. Do not change unless the
                                                employee failed to mark attendance on a present
                                                day.
                                            </p>
                                        </div>
                                    </div>


                                    {/* Basic rate */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="basic_rate"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Basic Rate
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="basic_rate"
                                                value={basic_rate}
                                                onChange={(e) => setBasicRate(e.target.value)}
                                                id="basic_rate"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* Bonus Salary */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="bonus_salary"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Bonus Salary
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="bonus_salary"
                                                value={bonus_salary}
                                                onChange={(e) => setBonusSalary(e.target.value)}
                                                id="bonus_salary"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* OT Hours */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="ot_hours"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            OT Hours
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="ot_hours"
                                                value={ot_hours}
                                                onChange={(e) => setOtHours(e.target.value)}
                                                id="ot_hours"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* OT Rate */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="ot_rate"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            OT Rate
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="ot_rate"
                                                value={ot_rate}
                                                onChange={(e) => setOtRate(e.target.value)}
                                                id="ot_rate"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    {/* EPF/ETF */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="epf_etf"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            EPF/ETF (%)
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="epf_etf"
                                                value={epf_etf}
                                                onChange={(e) => setEpfEtf(e.target.value)}
                                                id="epf_etf"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>


                                    {/* Payment Date */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="payment_date"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Payment Date
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="date"
                                                value={payment_date}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                id="payment_date"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <label htmlFor="description"
                                               className="block text-sm font-medium leading-6 text-gray-900">
                                            Remarks
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            id="description"
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>

                </div>
            </div>


            <div className="flex relative " id="controlbar">
                <div
                    className="h-14  fixed border-b z-0 bottom-0 w-full right-0 bg-gray-100 bg-opacity-50 backdrop-blur border-t"
                    id="savebar">
                    <div
                        className="flex justify-end gap-2 align-middle items-center text-sm font-semibold h-full pr-8 z-30">
                        <div className="border-gray-500 border rounded-full py-1 px-6 mx-8 text-base font-semibold">
                            Total Salary:
                            {calculateTotalSalary() <= 0 || calculateTotalSalary() > 1000000 ? (
                                <span className="text-red-500">Invalid salary</span>
                            ) : (
                                <span className="text-lime-600 text-xl">Rs.{calculateTotalSalary()}</span>
                            )}
                        </div>

                        <button onClick={generatePayslipPDF}
                                className="bg-amber-200 rounded-full py-1 px-4 hover:bg-amber-300">
                            Generate Receipt
                        </button>
                        <Link className="bg-gray-300 rounded-full py-1 px-4 hover:bg-gray-400"
                              to="/dashboard">
                            Cancel
                        </Link>

                        <label className="bg-gray-200 py-1 pl-4 rounded-full">
                            Automatically save to transactions
                            <input
                                className="size-6 ml-4 mr-1 form-checkbox text-lime-600 bg-white border-gray-300 rounded-full focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50 hover:bg-lime-100 checked:bg-lime-500"
                                type="checkbox"
                                checked={autoSaveTransaction}
                                onChange={(e) => setAutoSaveTransaction(e.target.checked)}
                            />

                        </label>
                        <button className="bg-lime-200 rounded-full py-1 px-4 hover:bg-lime-400"
                                onClick={handleSaveSalaryRecord}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
