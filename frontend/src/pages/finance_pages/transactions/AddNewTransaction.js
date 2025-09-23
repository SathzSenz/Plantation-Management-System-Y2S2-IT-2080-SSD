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

function AddNewTransaction() {
    const [date, setDate] = useState('');
    const [type, setType] = useState('income');
    const [subtype, setSubType] = useState('Papaya');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [payerPayee, setPayerPayee] = useState('');
    const [method, setMethod] = useState('Cheque');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [validation, setValidation] = useState({
        amount: true, // Assuming true means the input is valid
    });

    const handleSaveTransactionRecord = async (e) => {
        e.preventDefault();

        // Check for empty fields
        if (!date || !type || !subtype || !amount || !description || !payerPayee || !method) {
            message.error('Please fill in all fields.');
            return;
        }

        // Validation
        if (!amount || amount <= 0 || amount > 10000000) {
            message.error('Please enter a valid amount between 0 and 10 million.');
            return;
        }

        if (!date || new Date(date) > new Date()) {
            message.error('Please select a date on or before today.');
            return;
        }

        if (!description || description.length > 300) {
            message.error('Please enter a description with less than 300 characters.');
            return;
        }

        // Proceed with saving
        console.log('Saving transaction record...');
        const data = {
            date,
            type,
            subtype,
            amount,
            description,
            payer_payee: payerPayee,
            method,
        };

        setLoading(true);
        try {
            await axios.post('${process.env.REACT_APP_API_BASE_URL}/transactions', data);
            setLoading(false);
            message.success('Transaction record has successfully saved.');
            navigate('/finances/transactions');
        } catch (error) {
            setLoading(false);
            message.error('Transaction record saving failed.');
            console.error(error);
            navigate('/finances/transactions');
        }
    };


    const breadcrumbItems = [
        { name: 'Finance', href: '/finances' },
        { name: 'Transactions', href: '/finances/transactions' },
        { name: 'Add New Transaction', href: '/finances/transactions/addeqmainpage' },
    ];

        const handleCancel = () => {
            navigate(-1); // This will navigate back to the previous location in the history stack
        };

    const handleTypeChange = (e) => {
        setType(e.target.value);
        // Reset subtype when type changes
        setSubType('Electricity Bill');
    };

    const validateAmount = (value) => {
        const regex = /^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/; // Allows positive decimals or integers, not starting with zero
        return regex.test(value) && value.trim() !== '';
    };

    const handleAmountChange = (event) => {
        const { value } = event.target;
        setAmount(value);
        setValidation({ ...validation, amount: validateAmount(value) });
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
                                <div className="space-y-8 px-0  w-8/12 ">
                                    <div className=" relative">
                                        <div className="pb-12 mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                            <fieldset className="sm:col-span-4 gap-y-8">
                                                <legend
                                                    className="text-sm font-semibold leading-6 text-gray-900">Transaction
                                                    type
                                                </legend>
                                                <p className="mt-1 text-sm leading-6 text-gray-600">Specify whether this
                                                    is an income or an expense</p>
                                                <div className="mt-6 gap-4 flex flex-row items-center ">
                                                    <div className="flex items-center gap-x-3 ">
                                                        <input
                                                            id="income"
                                                            name="type"
                                                            type="radio"
                                                            value="income"
                                                            checked={type === 'income'}
                                                            onChange={handleTypeChange}
                                                            className="h-4 w-4 border-gray-300 text-lime-600 focus:ring-lime-600"
                                                        />
                                                        <label htmlFor="income"
                                                               className="block text-sm font-medium leading-6 text-gray-900">
                                                            Income
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-x-3 ">
                                                        <input
                                                            id="expense"
                                                            name="type"
                                                            type="radio"
                                                            value="expense"
                                                            checked={type === 'expense'}
                                                            onChange={handleTypeChange}
                                                            className="h-4 w-4 border-gray-300 text-lime-600 focus:ring-lime-600"
                                                        />
                                                        <label htmlFor="expense"
                                                               className="block text-sm font-medium leading-6 text-gray-900">
                                                            Expense
                                                        </label>
                                                    </div>
                                                </div>
                                            </fieldset>

                                            <div className="sm:col-span-2 sm:col-start-1">
                                                <label htmlFor="subtype"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Sub Type
                                                </label>
                                                <div className="mt-2">
                                                    <select
                                                        name="subtype"
                                                        value={subtype}
                                                        onChange={(e) => setSubType(e.target.value)}
                                                        required
                                                        id="subtype"
                                                        autoComplete="subtype"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                    >
                                                        {type === 'income' ? (
                                                            <>
                                                                <option>Papaya</option>
                                                                <option>Coconut</option>
                                                                <option>Apple Guava</option>
                                                                <option>Vegetables</option>
                                                                <option>Bee Honey</option>
                                                                <option>Visitor Payment</option>
                                                                <option>Other</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option>Electricity Bill</option>
                                                                <option>Salary Payment</option>
                                                                <option>Machine Purchase</option>
                                                                <option>Transportation</option>
                                                                <option>Land Purchase</option>
                                                                <option>Machine Renting</option>
                                                                <option>Other</option>
                                                            </>

                                                        )}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="date"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    id="date"
                                                    required
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            {/* Amount */}
                                            <div className="sm:col-span-3">
                                                <label htmlFor="amount"
                                                       className="block text-sm font-medium leading-6 text-gray-900">Amount</label>
                                                <input
                                                    id="amount"
                                                    name="amount"
                                                    value={amount}
                                                    required
                                                    onChange={handleAmountChange}
                                                    type="text"
                                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                                        validation.amount ? 'ring-gray-300' : 'ring-red-500'
                                                    } focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6`}
                                                />
                                                {!validation.amount && (
                                                    <p className="mt-2 text-sm text-red-600" id="amount-error">
                                                        Amount must be a positive number.
                                                    </p>
                                                )}
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
                                            <div className="col-span-full">
                                                <label htmlFor="payer_payee"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Payer/Payee
                                                </label>
                                                <input
                                                    type="text"
                                                    name="payer_payee"
                                                    required
                                                    value={payerPayee}
                                                    onChange={(e) => setPayerPayee(e.target.value)}
                                                    id="payer_payee"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>

                                            {/* Payment Method */}
                                            <div className="sm:col-span-2 sm:col-start-1">
                                                <label htmlFor="method"
                                                       className="block text-sm font-medium leading-6 text-gray-900">
                                                    Payment Method
                                                </label>
                                                <div className="mt-2">
                                                    <select
                                                        name="method"
                                                        value={method}
                                                        onChange={(e) => setMethod(e.target.value)}
                                                        id="method"
                                                        autoComplete="method"
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                                    >
                                                        <option>Cheque</option>
                                                        <option>Cash</option>
                                                        <option>Online Transfer</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </form>

                            <div
                                className="h-14  sticky border-b z-10 bottom-0 left-0 right-0 bg-gray-100 bg-opacity-50 backdrop-blur border-t"
                                id="savebar">
                                <div
                                    className="flex justify-end gap-2 align-middle items-center text-sm font-semibold h-full pr-8 z-30">
                                    <button type="button"
                                            className="rounded-full bg-gray-300 px-4 py-1 hover:bg-gray-400 text-sm font-semibold  text-gray-900"
                                            onClick={handleCancel}>
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSaveTransactionRecord}
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
        </SnackbarProvider>

    );
}

export default AddNewTransaction;
