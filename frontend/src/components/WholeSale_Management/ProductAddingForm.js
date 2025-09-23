import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const ProductAddingForm = () => {
    const [productID, setProductID] = useState('');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productPrice, setProductPrice] = useState('');
    // const [productImage, setProductImage] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            productID,
            productName,
            productDescription,
            productQuantity,
            productPrice,
        };

        axios
            .post('http://localhost:5555/productRecords', data)
            .then(() => {
                enqueueSnackbar('Record Created Successfully', { variant: 'success' });
                navigate('/wholesaleDashboard', { state: { highlighted: true } });
            })
            .catch((error) => {
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    }


    const validateProductID = (value) => {
        return /^[A-Z]{2}\d{4}$/.test(value);
    };

    const validateNumber = (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mx-auto max-w-7xl px-10 lg:px-8 flex justify-center">
                    <div className="space-y-12">
                        <h2 className="text-xl font-semibold leading-7 text-gray-900 mt-4">Add a Product</h2>
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
                                               onChange={(e) => setProductID(e.target.value)}
                                               value={productID}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                                   !validateProductID(productID) ? 'border-red-500' : ''
                                               }`}
                                               required
                                        />
                                    </div>
                                    {!validateProductID(productID) && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid Product ID</p>
                                    )}
                                </div>

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

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productQuantity"
                                               id="productQuantity"
                                               onChange={(e) => setProductQuantity(e.target.value)}
                                               value={productQuantity}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                                   !validateNumber(productQuantity) ? 'border-red-500' : ''
                                               }`}
                                               required
                                        />
                                    </div>
                                    {!validateNumber(productQuantity) && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid quantity</p>
                                    )}
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Price Per 1Kg</label>
                                    <div className="mt-2">
                                        <input type="text"
                                               name="productPrice"
                                               id="productPrice"
                                               onChange={(e) => setProductPrice(e.target.value)}
                                               value={productPrice}
                                               className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                                   !validateNumber(productPrice) ? 'border-red-500' : ''
                                               }`}
                                               required
                                        />
                                    </div>
                                    {!validateNumber(productPrice) && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid price</p>
                                    )}
                                </div>


                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Add A picture</label>
                                    <input type="file"
                                           accept="image/*"
                                           name="productImage"
                                           id="productImage"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ProductAddingForm;
