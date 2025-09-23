import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tomato from '../WholeSale_Management/pictuers/tomato.jpeg';
import guava from '../WholeSale_Management/pictuers/guava.jpg'
import axios from "axios";
import { useSnackbar } from "notistack";
import { v4 as uuidv4 } from 'uuid';

const OrderPlacingForm = () => {
    const { id } = useParams(); // Extracting id from route parameters
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [orderDate, setOrderDate] = useState(''); 
    const [orderQuantity, setOrderQuantity] = useState('60');


    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/productRecords/${id}`)
            .then((response) => {
                setProduct(response.data);
                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });
    }, [id]);

    const generateOrderId = () => {
        return uuidv4();
    };

    const handleQuantityChange = (e) => {
        const newOrderQuantity = parseInt(e.target.value);
        setOrderQuantity(newOrderQuantity);
    };

    const validateOrderQuantity = (quantity) => {
        return quantity > 60;
    };

    const validateOrderDate = (date) => {
        const currentDate = new Date();
        const selectedDate = new Date(date);
        return selectedDate.toDateString() === currentDate.toDateString();
    };

    const calculateTotalPrice = () => {
        if (product) {
            return orderQuantity * parseFloat(product.productPrice);
        }
        return 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const orderId = generateOrderId();
        const totalPrice = calculateTotalPrice();
        const orderProductPricePerKilo = product.productPrice;

        if (!validateOrderQuantity(orderQuantity)) {
            enqueueSnackbar('Please enter a quantity above 60kg', { variant: 'error' });
            return;
        }

        if (!validateOrderDate(orderDate)) {
            enqueueSnackbar('Please select the current date', { variant: 'error' });
            return;
        }

        const data = {
            orderId: orderId,
            orderProductName: product.productName,
            orderDate,
            orderQuantity,
            orderPrice: totalPrice,
            orderProductPricePerKilo: orderProductPricePerKilo,
            orderStatus: 'Pending'
        };


        // Navigate to PaymentGateway with order data
        navigate('/wholesale/Payment', { state: { orderData: data } });

    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>No product found</div>;
    }

    return (
        <div className="mx-auto max-w-9xl px-4 lg:px-20">
            <form onSubmit={handleSubmit}>
                {/* Product details */}
                <div className="flex justify-center">
                    <div className="space-y-12">
                        <h2 className="text-5xl font-semibold leading-7 text-gray-900 mt-1">{product.productName}</h2>
                    </div>
                </div>
                {/* Product image and description */}
                <div className="flex justify-start">
                    {/* Product image */}
                    <div className="space-y-12">
                        <img className="h-auto max-w-lg rounded-lg mt-16" src={guava} alt="guava" width="450" height="450"/>
                    </div>
                    {/* Product description */}
                    <div className="space-y-12 ">
                        <p className="text-[18px] ml-4 mt-20">{product.productDescription}</p>

                        <div className="mt-4 ml-28">
                            <ul role="list"
                                className="mt-8 grid grid-cols-1 gap-4 text-[16px] leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                                <li className="flex gap-x-3">
                                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"/>
                                    </svg>
                                    Availabe Kilos(Kg) - {product.productQuantity}
                                </li>
                                <li className="flex gap-x-3">
                                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"/>
                                    </svg>
                                    Price for Kilo(Rs) - {product.productPrice}
                                </li>
                                <li className="flex gap-x-3">
                                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"/>
                                    </svg>
                                    Include Delivery Charges
                                </li>
                                <li className="flex gap-x-3">
                                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"/>
                                    </svg>
                                    Tracking
                                </li>
                            </ul>
                        </div>

                        {/* Order details */}
                        <div className="mt-32 ml-24">
                            <div className="">
                                <div>
                                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9 ">
                                        <div className="sm:col-span-3">
                                            <label htmlFor="orderQuantity"
                                                   className="block text-sm font-medium leading-6 text-gray-900">
                                                Enter the Quantity (1Kg)
                                            </label>
                                            <input type="number"
                                                   name="orderQuantity"
                                                   id="orderQuantity"
                                                   min="1"
                                                   onChange={handleQuantityChange}
                                                   value={orderQuantity}
                                                   title="Enter the quantity"
                                                   placeholder="Enter quantity (1Kg)"
                                                   className="block w-full rounded-lg border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300
                                                   placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {!validateOrderQuantity(orderQuantity) && (
                                                <p className="text-red-500 text-xs mt-1">Please enter a quantity above 60kg</p>
                                            )}
                                        </div>
                                        <div className="sm:col-span-3 ml-8">
                                            <label htmlFor="orderDate"
                                                   className="block text-sm font-medium leading-6 text-gray-900">
                                                Enter the Order Date
                                            </label>
                                            <input type="date"
                                                   name="orderDate"
                                                   id="orderDate"
                                                   onChange={(e) => setOrderDate(e.target.value)}
                                                   value={orderDate}
                                                   title="Select the order date"
                                                   placeholder="Select order date"
                                                   className="block w-full rounded-lg border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2
                                                   focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {!validateOrderDate(orderDate) && (
                                                <p className="text-red-500 text-xs mt-1">Please select the current date</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total price */}
                        <div className="ml-32">
                            <div className="space-y-40">
                                <div className="mt-8">
                                    <p>Price(Rs) - {calculateTotalPrice()}</p>
                                </div>
                            </div>
                        </div>
                        {/* Submit button */}
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button type="submit"
                                        className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default OrderPlacingForm;
