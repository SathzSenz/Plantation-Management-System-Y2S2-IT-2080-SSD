import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EditRotation = () => {
    const [season, setSeason] = useState('');
    const [fieldName, setFieldName] = useState('');
    const [cropType, setCropType] = useState('');
    const [variety, setVariety] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [yieldValue, setYieldValue] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5555/rotation/${id}`)
            .then((response) => {
                setSeason(response.data.season);
                setFieldName(response.data.fieldName);
                setCropType(response.data.cropType);
                setVariety(response.data.variety);
                setQuantity(response.data.quantity);
                setYieldValue(response.data.yield);
                setRemarks(response.data.remarks);

                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });
    }, [id]);

    const handleEdit = (e) => {
        e.preventDefault();
        const data = {
            season,
            fieldName,
            cropType,
            variety,
            quantity,
            yield: yieldValue,
            remarks
        };
        setLoading(true);
        axios
            .put(`http://localhost:5555/rotation/${id}`, data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Edited successfully', { variant: 'success' });
                navigate('/crop/rotation');
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "season":
                setSeason(value);
                break;
            case "fieldName":
                setFieldName(value);
                break;
            case "cropType":
                setCropType(value);
                break;
            case "variety":
                setVariety(value);
                break;
            case "quantity":
                setQuantity(value);
                break;
            case "yield":
                setYieldValue(value);
                break;
            case "remarks":
                setRemarks(value);
                break;
            default:
                break;
        }
    };

    const handleCancel = () => {
        navigate('/crop/rotation');
    };

    return (
        <div className="pt-2">
            <div className="flex flex-col ml-96 mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Edit Rotation Record
                </h1>
            </div>
            <form className="flex flex-col items-center justify-center" onSubmit={handleEdit}>
                <div className="space-y-12 px-0 py-16 w-6/12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label htmlFor="season" className="block text-sm font-medium leading-6 text-gray-900">
                                    Season
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="season"
                                        name="season"
                                        value={season}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
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
                                        value={fieldName}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
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
                                        value={cropType}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
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
                                        value={variety}
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
                                        value={quantity}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="yield"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Yield
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="yield"
                                        type="number"
                                        name="yield"
                                        onChange={handleChange}
                                        value={yieldValue}
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
                                        value={remarks}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        placeholder="Type Here.."
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-sm font-semibold leading-6 text-gray-900">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-lime-300 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditRotation;
