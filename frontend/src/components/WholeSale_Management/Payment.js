import React, {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom"; // Add useLocation here
import {useSnackbar} from "notistack";
import axios from 'axios'; // Add this line to import axios
import {FaCcAmex, FaCcMastercard, FaCcVisa} from "react-icons/fa";

const Payment = () => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        cardHolderName: '',
        cardType: '',
    });
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const {enqueueSnackbar } = useSnackbar();
    const location = useLocation(); // Use useLocation hook here
    const orderData = location.state.orderData;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear validation error when user starts typing again
        setErrors({ ...errors, [name]: '' });
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        // Validate form fields before submission
        if (validateForm()) {
            // Implement your payment logic here
            console.log('Payment submitted:', formData);

            enqueueSnackbar('Order Place successfully!', {
                variant: 'success',
                autoHideDuration: 6000,
                anchorOrigin: {
                    vertical: 'top', // Display the snackbar at the top
                    horizontal: 'center', // Align the snackbar at the center horizontally
                },
            });
            // Delay navigation for a short duration to ensure the snackbar is displayed first
            setTimeout(() => {
                // Post order data
                axios
                    .post('http://localhost:5555/orderRecords', orderData)
                    .then(() => {
                        enqueueSnackbar('Record Created Successfully', { variant: 'success' });
                        // Navigate to the confirmation page
                        navigate('/WholeSale/orders');
                    })
                    .catch((error) => {
                        enqueueSnackbar('Error', { variant: 'error' });
                        console.log(error);
                    });
            }, 1000); // Adjust the duration as needed
        }
    };

    const validateForm = () => {
        let valid = true;
        const errors = {};

        // Card Number validation (16 digits)
        if (formData.cardNumber.length !== 16) {
            errors.cardNumber = 'Card Number must be 16 digits';
            valid = false;
        }

        // Expiration Date validation (MM/YY format)
        const expirationDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expirationDateRegex.test(formData.expirationDate)) {
            errors.expirationDate = 'Invalid Expiration Date. Please use MM/YY format';
            valid = false;
        }

        // CVV validation (3 digits)
        if (formData.cvv.length !== 3) {
            errors.cvv = 'CVV must be 3 digits';
            valid = false;
        }

        // Cardholder Name validation (non-empty)
        if (formData.cardHolderName.trim() === '') {
            errors.cardHolderName = 'Cardholder Name is required';
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    return (
        <div className="max-w-lg mx-auto mt-8 mb-8 p-4 rounded-md shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-center"> Enter Payment Details</h2>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit}>
                {/* Card Number */}
                <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card Number
                    </label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.cardNumber ? 'border-red-500' : ''}`}
                        placeholder="Card Number"
                        required
                        aria-label="Card Number"
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>
                {/* Expiry Date and CVV */}
                <div className="flex justify-between mb-4">
                    {/* Expiry Date */}
                    <div className="w-1/2 mr-2">
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            id="expirationDate"
                            name="expirationDate"
                            value={formData.expirationDate}
                            onChange={handleInputChange}
                            className={`mt-1 p-2 w-full border rounded-md ${errors.expirationDate ? 'border-red-500' : ''}`}
                            placeholder="MM/YY"
                            required
                            aria-label="Expiry Date"
                        />
                        {errors.expirationDate && <p className="text-red-500 text-sm mt-1">{errors.expirationDate}</p>}
                    </div>
                    {/* CVV */}
                    <div className="w-1/2 ml-2">
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                            CVV
                        </label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={`mt-1 p-2 w-full border rounded-md ${errors.cvv ? 'border-red-500' : ''}`}
                            placeholder="CVV"
                            required
                            aria-label="CVV"
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                </div>
                <label className="block text-sm font-medium text-gray-700">Card Type</label>
                <div className="flex items-center">
                    <label className="mr-12">
                        <input
                            type="radio"
                            name="cardType"
                            value="visa"
                            checked={formData.cardType === 'visa'}
                            onChange={handleInputChange}
                        />
                        <FaCcVisa size={30} className="ml-2" />
                    </label>
                    <label className="mr-12">
                        <input
                            type="radio"
                            name="cardType"
                            value="master"
                            checked={formData.cardType === 'master'}
                            onChange={handleInputChange}
                        />
                        <FaCcMastercard size={30} className="ml-2" />
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="cardType"
                            value="amex"
                            checked={formData.cardType === 'amex'}
                            onChange={handleInputChange}
                        />
                        <FaCcAmex size={30} className="ml-2" />
                    </label>

                </div>
                {/* Cardholder Name */}
                <div className="mb-4">
                    <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700">
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        id="cardHolderName"
                        name="cardHolderName"
                        value={formData.cardHolderName}
                        onChange={handleInputChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.cardHolderName ? 'border-red-500' : ''}`}
                        placeholder="Full Name"
                        required
                        aria-label="Cardholder Name"
                    />
                    {errors.cardHolderName && <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>}
                </div>
                {/* Submit Button */}
                <button type="submit" className="bg-black text-white p-2 rounded-md w-full hover:bg-emerald-700">
                    Pay Now
                </button>
            </form>
        </div>
    );
};

export default Payment;
