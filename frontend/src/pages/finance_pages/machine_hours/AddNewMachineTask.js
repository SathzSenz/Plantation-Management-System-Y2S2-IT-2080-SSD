import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {SnackbarProvider, useSnackbar} from 'notistack';
import axios from 'axios';
import Navbar from '../../../components/utility/Navbar';
import SideBar from '../../../components/SideBar';
import FinanceNavigation from '../../../components/finances/FinanceNavigation';
import Breadcrumb from '../../../components/utility/Breadcrumbs';
import BackButton from '../../../components/utility/BackButton';
import {message} from "antd";

function AddNewMachineTask() {
    const [start_date, setStartDate] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('Excavator small');
    const [rate, setRate] = useState('');
    const [payee, setPayee] = useState('');
    const [description, setDescription] = useState('');

    const [autoSaveTransaction, setAutoSaveTransaction] = useState(false);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSaveMachineRecord = () => {
        if (!start_date || !name || !type || !rate || !description || !payee ) {
            message.warning('Please fill in all fields. The record will not be saved with incomplete data.');
            return;
        }


        // Validate numeric fields
        if (isNaN(rate) || rate <= 0) {
            message.warning('Rate must be a positive number.');
            return;
        }

        if (new Date(start_date) > new Date()) {
            message.error('Please select a date on or before today.');
            return;
        }

        const machineData = {
            start_date,
            name,
            type,
            rate,
            payee,
            description,
        };
        setLoading(true);
        axios
            .post('http://localhost:5555/machines', machineData)
            .then(() => {
                setLoading(false);
                message.success('Machine task has successfully saved.');



                navigate('/finances/machineHours');
            })
            .catch((error) => {
                setLoading(false);
                message.error('Machine record saving failed.');
                console.log(error);
                navigate('/finances/machineHours');
            });
    };

// Adjust handleSaveTransactionRecord to accept data directly
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


    const breadcrumbItems = [
        { name: 'Finance', href: '/finances' },
        { name: 'Machine Records', href: '/finances/machineHours' },
        { name: 'Add New Machine Record', href: '/finances/machineHours/addeqmainpage' },
    ];

    const handleCancel = () => {
        navigate(-1); // This will navigate back to the previous location in the history stack
    };

    return (
        <SnackbarProvider>
            <div className="">
                <Navbar/>
                <div className="">
                    <div className="grid sm:grid-cols-6 ">
                        <div className="col-span-1 sticky top-0">
                            <SideBar/>
                        </div>

                        <div className="w-full col-span-5 flex flex-col ">
                            <FinanceNavigation/>
                            <div className="flex flex-row">
                                <BackButton/>
                                <Breadcrumb items={breadcrumbItems}/>
                            </div>

                            <form className=" flex-col flex items-center justify-center">
                                <div className="space-y-12 pt-4 px-0 pb-16 w-8/12 ">
                                    <div className="">
                                        <legend
                                            className="text-sm font-semibold leading-6 text-gray-900">Machine
                                            type
                                        </legend>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Specify the type of the rented machine.</p>
                                        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 ">


                                            <div className="sm:col-span-2 sm:col-start-1">
                                                <label htmlFor="type"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Machine Type
                                                </label>
                                                <div className="">
                                                    <select
                                                        name="type"
                                                        value={type}
                                                        onChange={(e) => setType(e.target.value)}
                                                        id="type"
                                                        required
                                                        autoComplete="type"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                    >
                                                        <option>Excavator small</option>
                                                        <option>Excavator Large</option>
                                                        <option>Dozer</option>
                                                        <option>Tractor Rotary</option>
                                                        <option>Tractor Disc</option>
                                                        <option>Tractor Grass Cutter</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="start_date"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Task Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={start_date}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    id="start_date"
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            {/* Amount */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="name"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Task Name
                                                </label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    type="text"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                    required // Makes the field required
                                                />
                                            </div>
                                            <div className="sm:col-span-2 sm:col-start-1">
                                                <label htmlFor="rate"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Rate
                                                </label>
                                                <input
                                                    type="number"
                                                    name="rate"
                                                    required
                                                    value={rate}
                                                    onChange={(e) => setRate(e.target.value)}
                                                    id="rate"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="col-span-full">
                                                <label htmlFor="description"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={3}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    autoComplete="description"
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            {/* Payer/Payee */}
                                            <div className="col-span-2">
                                                <label htmlFor="payee"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Payee
                                                </label>
                                                <input
                                                    type="text"
                                                    name="payee"
                                                    required
                                                    value={payee}
                                                    onChange={(e) => setPayee(e.target.value)}
                                                    id="payee"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>


                                        </div>

                                    </div>

                                </div>
                            </form>

                            <div
                                className="h-14  sticky border-b z-10 bottom-0 left-0 right-0 bg-gray-100 bg-opacity-50 backdrop-blur border-t"
                                id="savebar">
                                <div
                                    className="flex  justify-end gap-2 align-middle items-center text-sm font-semibold h-full pr-8 z-30">


                                    <div className="space-x-3 justify-center">
                                        <button type="button"
                                                className="rounded-full bg-gray-300 px-4 py-1 hover:bg-gray-400 text-sm font-semibold  text-gray-900"
                                                onClick={handleCancel}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveMachineRecord}
                                            className="rounded-full bg-lime-200 px-4 py-1 text-sm font-semibold text-gray-900 shadow-sm hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
                                        >
                                            Save
                                        </button>
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SnackbarProvider>

    );
}

export default AddNewMachineTask;
