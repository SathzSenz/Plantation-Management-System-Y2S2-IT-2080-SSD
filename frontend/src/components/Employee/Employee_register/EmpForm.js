import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EmpForm = () => {

    const [f_name, setF_name] = useState('');
    const [l_name, setL_name] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [contact_no, setContact_no] = useState('');
    const [emp_email, setEmp_email] = useState('');
    const [nic, setNic] = useState('');
    const [e_address, setE_address] = useState('');
    const [emp_type, setEmp_type] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [h_date, setH_date] = useState('');
    const [h_rate, setH_rate] = useState('');
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            f_name,
            l_name,
            dob,
            gender,
            contact_no,
            emp_email,
            nic,
            e_address,
            emp_type,
            qualifications,
            h_date,
            h_rate,
        };
        axios
            .post('http://localhost:5555/employeeRecords', data)
            .then(() => {
                enqueueSnackbar('Record Created successfully', { variant: 'success' });
                navigate('/employees/registration', { state: { highlighted: true } }); // Navigate to maintenance log and highlight it
            })
            .catch((error) => {
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    // Validation functions
    const validateContactNo = (value) => {
        return /^\d{10}$/.test(value); // Checks if value consists of exactly 10 digits
    };

    const validateNIC = (value) => {
        return /^\d{12}$/.test(value); // Checks if value consists of exactly 12 digits
    };

    const validateEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Basic email format validation
    };



    return (
        <div className="pt-2">
            <div className="flex flex-col ml-96 mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Employee Registration Form
                </h1>
            </div>
            <form className="flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                <div className="space-y-12 px-0 py-16 w-6/12 ml-1">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="f_name"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    First Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="f_name"
                                        value={f_name}
                                        onChange={(e) => setF_name(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="l_name"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Last Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="l_name"
                                        value={l_name}
                                        onChange={(e) => setL_name(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="dob"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Date of Birth
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        name="dob"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="gender"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Gender
                                </label>
                                <select required className="w-full p-2 border rounded mb-4"
                                        name="gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                >

                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>

                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="contact_no"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Contact Number
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="contact_no"
                                        value={contact_no}
                                        onChange={(e) => setContact_no(e.target.value)}
                                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                            !validateContactNo(contact_no) ? 'border-red-500' : '' // Add red border if validation fails
                                        }`}
                                        required
                                    />
                                </div>
                                {!validateContactNo(contact_no) && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number</p>
                                    )}
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="emp_email"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Email
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="email"
                                        name="emp_email"
                                        value={emp_email}
                                        onChange={(e) => setEmp_email(e.target.value)}
                                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                            !validateEmail(emp_email) ? 'border-red-500' : '' // Add red border if validation fails
                                        }`}
                                        required
                                    />
                                </div>
                                {!validateEmail(emp_email) && (
                                    <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
                                )}

                            </div>
                            <div className="col-span-full">
                                <label htmlFor="nic"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    NIC
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="nic"
                                        value={nic}
                                        onChange={(e) => setNic(e.target.value)}
                                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                            !validateNIC(nic) ? 'border-red-500' : '' // Add red border if validation fails
                                        }`}
                                        required
                                    />
                                </div>
                                {!validateNIC(nic) && (
                                    <p className="text-red-500 text-xs mt-1">Please enter a valid 12-digit NIC number</p>
                                )}
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="e_address"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Address
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="e_address"
                                        name="e_address"
                                        value={e_address}
                                        onChange={(e) => setE_address(e.target.value)}
                                        rows={3}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="emp_type"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Employee Type
                                </label>
                                <select required className="w-full p-2 border rounded mb-4"
                                        name="emp_type"
                                        value={emp_type}
                                        onChange={(e) => setEmp_type(e.target.value)}
                                >

                                    <option value="Select_Type">Select type</option>
                                    <option value="permanent">Permanent</option>
                                    <option value="seasonal">Seasonal workers</option>
                                    <option value="casual">Casual Labours</option>
                                    <option value="contract">Contract workers</option>
                                    <option value="trainee">Trainee</option>
                                    <option value="manager">Manager</option>

                                </select>

                            </div>

                            <div className="col-span-full">
                                <label htmlFor="qualifications"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Work qualifications
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="qualifications"
                                        name="qualifications"
                                        value={qualifications}
                                        onChange={(e) => setQualifications(e.target.value)}
                                        rows={3}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="h_date"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Hired Date
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        name="h_date"
                                        value={h_date}
                                        onChange={(e) => setH_date(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="h_rate"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Hourly Rate
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="h_rate"
                                        value={h_rate}
                                        onChange={(e) => setH_rate(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Submit
                        </button>

                        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                            Cancel
                        </button>

                    </div>
                </div>
            </form>
        </div>


    );


}
export default EmpForm;


