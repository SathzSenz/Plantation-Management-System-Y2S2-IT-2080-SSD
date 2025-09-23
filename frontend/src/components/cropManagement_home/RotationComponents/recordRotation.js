import React, { useState } from "react";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {useNavigate} from "react-router-dom";

export default function RecordRotation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        season: '',
        fieldName: '',
        cropType: '',
        variety: '',
        quantity: '',
        yield: '',
        remarks: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "quantity" || name === "yield") {
            if (isNaN(value) || Number(value) < 0) {
                console.log("Please enter a positive number.");
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('${process.env.REACT_APP_API_BASE_URL}/rotation', formData);
            console.log(response.data);
            setFormData({
                season: '',
                fieldName: '',
                cropType: '',
                variety: '',
                quantity: '',
                yield: '',
                remarks: ''
            });
            enqueueSnackbar('Record Added successfully', { variant: 'success' });
            navigate('/crop/rotation')
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleCancel = () => {
        setFormData({
            season: "",
            fieldName: "",
            field: "",
            cropType: "",
            variety: "",
            quantity: "",
            yield: "",
            remarks: ""
        });
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col ml-96 mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Add Record
                </h1>
            </div>
            <form className="flex flex-col items-center justify-center" onSubmit={handleSubmit} method="post">
                <div className="space-y-12 px-0 py-16 w-6/12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="season"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Season
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="season"
                                        name="season"
                                        onChange={handleChange}
                                        value={formData.season}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">Select Season</option>
                                        <option value="1 Season Ago">1 Season Ago</option>
                                        <option value="2 Seasons Ago">2 Seasons Ago</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="fieldName"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Field Name
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="fieldName"
                                        name="fieldName"
                                        onChange={handleChange}
                                        value={formData.fieldName}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">Select an option</option>
                                        <option value="Field A">Field A</option>
                                        <option value="Field B">Field B</option>
                                        <option value="Field C">Field C</option>
                                        <option value="Field D">Field D</option>
                                        <option value="Field E">Field E</option>
                                        <option value="Field F">Field F</option>
                                        <option value="Field G">Field G</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="cropType"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Crop Type
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="cropType"
                                        name="cropType"
                                        onChange={handleChange}
                                        value={formData.cropType}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">Select an option</option>
                                        <option value="Coconut">Coconut</option>
                                        <option value="Apple Guava">Apple Guava</option>
                                        <option value="Papaya">Papaya</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="variety"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Seed Variety
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="variety"
                                        id="variety"
                                        onChange={handleChange}
                                        value={formData.variety}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="quantity"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Seed Quantity
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="quantity"
                                        type="number"
                                        name="quantity"
                                        onChange={handleChange}
                                        value={formData.quantity}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="yield"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Yield (mt/ha)
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="yield"
                                        type="number"
                                        name="yield"
                                        onChange={handleChange}
                                        value={formData.yield}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="remarks"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Remarks
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="remarks"
                                        type="text"
                                        name="remarks"
                                        onChange={handleChange}
                                        value={formData.remarks}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        placeholder="Type Here.."
                                        required
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-lime-300 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
