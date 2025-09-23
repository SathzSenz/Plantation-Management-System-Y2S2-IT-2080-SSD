import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {enqueueSnackbar} from "notistack";

export default function AddPrice() {

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [date, setDate] = useState('');
    const [min_price, setMinPrice] = useState('');
    const [max_price, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [dateError, setDateError] = useState('');

    const handleSavePrice = (e) => {
        e.preventDefault();

        //check for future dates
        if(dateError) {
            return;  //if future date selected don't proceed
        }

        //check whether min > max
        if (Number(min_price) > Number(max_price)) {
            alert('Minimum Price cannot be greater than Maximum Price');
            return; // Exit function early if validation fails
        }


        const data = {
            name,
            type,
            date,
            min_price,
            max_price
        };
        setLoading(true);
        axios
            .post(`${process.env.REACT_APP_API_BASE_URL}/marketprice`, data)
            .then(() => {
                setLoading(false);
                navigate('/insights/marketprice');
                window.alert("Record Added Successfully!");
                enqueueSnackbar('Record Added Successfully!', { variant: 'success' });
            })
            .catch((error) => {
                setLoading(false);
                if(error.response && error.response.status === 400)
                {
                    alert(error.response.data.message);
                }
                else
                {
                    alert('An error happened. Please check console');
                    console.log(error.response.data);
                }

            });
    };

    const getNamesByType = () => {
        switch (type) {
            case 'Fruit':
                return ['Papaya', 'Apple Guava'];
            case 'Vegetable' :
                return ['Cabbage', 'Carrot'];
            case 'Other' :
                return ['Coconut'];
            default:
                return [];
        }
    }

    return (
        <div className= " flex justify-center items-center mb-2">
            <form
                method="post"
                onSubmit={handleSavePrice}
                className=" mr-2 ml-2 bg-lime-300 border-2 border-black rounded-lg px-4 py-4"
            >
                <div className="flex flex-wrap mb-3">
                    <div className="w-full md:w-1/5 pr-2">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Type</label>
                        <select
                            value={type}
                            required
                            onChange={(e) => setType(e.target.value)}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option>Select Type</option>
                            <option value="Fruit">Fruit</option>
                            <option value="Vegetable">Vegetable</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="w-full md:w-1/5 pr-2">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Name</label>
                        <select
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option>Select Name</option>
                            {getNamesByType().map((nameOption) => (
                                <option key={nameOption} value={nameOption}>{nameOption}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/5 pr-2">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Date</label>
                        <input
                            type='date'
                            required
                            value={date}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                const currentDate = new Date();
                                if(selectedDate > currentDate) {
                                    setDate(e.target.value);
                                    setDateError("Future Dates cannot be selected");
                                } else {
                                    setDate(e.target.value);
                                    setDateError("");
                                }
                            }}
                            className='border-2 rounded-md mb-1 border-gray-500 px-4 py-2 w-full'
                        />
                        {dateError && <span className=" text-center text-red-500 text-sm mb-4">{dateError}</span>}
                    </div>
                    <div className="w-full md:w-1/5 pr-2">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Min Price</label>
                        <input
                            type='number'
                            required
                            value={min_price}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className='border-2 rounded-md mb-5 border-gray-500 px-4 py-2 w-full'
                        />
                    </div>
                    <div className="w-full md:w-1/5 pr-2">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Max Price</label>
                        <input
                            type='number'
                            required
                            value={max_price}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className='border-2 rounded-md mb-5 border-gray-500 px-4 py-2 w-full'
                        />
                    </div>
                </div>
                <div className= "mx-auto flex flex-wrap justify-center items-center">
                    <button
                        type="submit"
                        className='mx-auto rounded-md bg-lime-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                        Add Price
                    </button>
                </div>
            </form>
        </div>
    );

}
