import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";

const OrderEditingForm = () => {
    const [orderID, setOrderID] = useState('');
    const [orderProductName, setOrderProductName] = useState('');
    const [orderPrice, setOrderPrice] = useState('');
    const [orderQuantity, setOrderQuantity] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [orderProductPricePerKilo, setOrderProductPricePerKilo] = useState('');
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/orderRecords/${id}`)
            .then((response) => {
                setProduct(response.data);
                setOrderQuantity(response.data.orderQuantity);
                setOrderDate(response.data.orderDate);
                setOrderID(response.data.orderId);
                setOrderProductName(response.data.orderProductName);
                setOrderPrice(response.data.orderPrice);
                setOrderProductPricePerKilo(response.data.orderProductPricePerKilo);
                setLoading(false);

            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });
    }, [id]);

    const calculateTotalPrice = () => {
        if (orderQuantity) {
            return orderQuantity * parseFloat(orderProductPricePerKilo);
        }
        return 0;
    };

    const handleEdit = (e) => {
        e.preventDefault();

        // Validate quantity
        if (isNaN(orderQuantity) || orderQuantity <= 60) {
            enqueueSnackbar('Quantity must be above 60.', { variant: 'error' });
            return;
        }

        // Validate date
        const currentDate = new Date().toISOString().slice(0, 10);
        if (orderDate !== currentDate) {
            enqueueSnackbar('Please select the current date.', { variant: 'error' });
            return;
        }

        const totalPrice = calculateTotalPrice();
        const data = {
            orderQuantity,
            orderDate,
            orderPrice: totalPrice,
        };
        setLoading(true);
        axios
            .put(`http://localhost:5555/orderRecords/${id}`, data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Edited successfully', { variant: 'success' });
                navigate('/WholeSale/orders', { state: { highlighted: true } });
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    return (
        <div>
            <form onSubmit={handleEdit}>
                <div className="mx-auto max-w-7xl px-10 lg:px-8 flex justify-center">
                    <div className="space-y-12">
                        <h2 className="text-xl font-semibold leading-7 text-gray-900 mt-4">Edit Order Details</h2>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <div className="mt-2">
                                        <span>Order ID - {orderID}</span>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <div className="mt-2">
                                        <span>Product Name - {orderProductName}</span>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Date</label>
                                    <div className="mt-2">
                                        <input type="date"
                                               name="orderDate"
                                               id="orderDate"
                                               value={orderDate}
                                               onChange={(e) => setOrderDate(e.target.value)}
                                               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="orderQuantity"
                                               id="orderQuantity"
                                               value={orderQuantity}
                                               onChange={(e) => setOrderQuantity(e.target.value)}
                                               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <div className="mt-2">
                                        <span>Price - {calculateTotalPrice()}</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Update
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default OrderEditingForm;
