import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ProductEditingForm = () => {
    const [productID, setProductID] = useState('');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams(); // Extracting id from route parameters

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/productRecords/${id}`)
            .then((response) => {
                setProductID(response.data.productID);
                setProductName(response.data.productName);
                setProductDescription(response.data.productDescription);
                setProductQuantity(response.data.productQuantity);
                setProductPrice(response.data.productPrice);

                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });
    }, [id]);

    const handleEdit = () => {
        const data = {
            productID,
            productName,
            productDescription,
            productQuantity,
            productPrice,
        };
        setLoading(true);
        axios
            .put(`http://localhost:5555/productRecords/${id}`, data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Edited successfully', { variant: 'success' });
                navigate('/wholesaleDashboard', { state: { highlighted: true } });
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    const validateProductID = (value) => {
        return /^[A-Z]{2}\d{4}$/.test(value);
    };

    const validateProductQuantity = (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    };

    const validateProductPrice = (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    };

    return (
        <div>
            <form onSubmit={handleEdit}>
                <div className="mx-auto max-w-7xl px-10 lg:px-8 flex justify-center">
                    <div className="space-y-12">
                        <h2 className="text-xl font-semibold leading-7 text-gray-900 mt-4">Edit Product</h2>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Product ID</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productID"
                                               id="productID"
                                               value={productID}
                                               onChange={(e) => setProductID(e.target.value)}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${!validateProductID(productID) ? 'border-red-500' : ''}`}
                                        />
                                        {!validateProductID(productID) && (
                                            <p className="text-red-500 text-xs mt-1">Please enter a valid Product ID</p>
                                        )}
                                    </div>
                                </div>

                                {/* Other form fields */}
                                {/* Product Name */}
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Product Name</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productName"
                                               id="productName"
                                               onChange={(e) => setProductName(e.target.value)}
                                               value={productName}
                                               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="col-span-full">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                                    <div className="mt-2">
                    <textarea id="productDescription"
                              name="productDescription"
                              onChange={(e) => setProductDescription(e.target.value)}
                              value={productDescription}
                              rows="3"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    ></textarea>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productQuantity"
                                               id="productQuantity"
                                               onChange={(e) => setProductQuantity(e.target.value)}
                                               value={productQuantity}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${!validateProductQuantity(productQuantity) ? 'border-red-500' : ''}`}
                                        />
                                        {!validateProductQuantity(productQuantity) && (
                                            <p className="text-red-500 text-xs mt-1">Please enter a valid quantity</p>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Price Per 1Kg</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productPrice"
                                               id="productPrice"
                                               onChange={(e) => setProductPrice(e.target.value)}
                                               value={productPrice}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${!validateProductPrice(productPrice) ? 'border-red-500' : ''}`}
                                        />
                                        {!validateProductPrice(productPrice) && (
                                            <p className="text-red-500 text-xs mt-1">Please enter a valid price</p>
                                        )}
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

export default ProductEditingForm;
