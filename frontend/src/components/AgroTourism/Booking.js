import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
export default function BookingForm() {
    const { isAuthenticated } = useKindeAuth(); // Check if the user is authenticated

    const [formData, setFormData] = useState({
        name: '',
        telNo: '',
        nicNo: '',
        email: '',
        selectedPackage: '',
        date: '',
        numberOfDays: '',
        numberOfPeople: '',
        visitorType:'',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    /*const authenticatedUserId = user?.userId || null;*/

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const validateForm = () => {
        const errors = {};

        // Validate name
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        // Validate contact number
        if (!formData.telNo.trim()) {
            errors.telNo = "Contact number is required";
        } else if (!/^\d+$/.test(formData.telNo)) {
            errors.telNo = "Invalid contact number";
        }

        // Validate NIC number
        if (!formData.nicNo.trim()) {
            errors.nicNo = "NIC number is required";
        } else if (!/^\d{12}[vVxX]?$/.test(formData.nicNo)) {
            errors.nicNo = "Invalid NIC number";
        }

        // Validate email
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Invalid email address";
        }

        // Validate selected package
        if (!formData.selectedPackage) {
            errors.selectedPackage = "Please select a package";
        }

        // Validate date
        if (!formData.date) {
            errors.date = "Date is required";
        }

        // Validate number of people
        if (!formData.numberOfPeople.trim()) {
            errors.numberOfPeople = "Number of people is required";
        } else if (!/^\d+$/.test(formData.numberOfPeople)) {
            errors.numberOfPeople = "Invalid number of people";
        } else if(parseInt(formData.numberOfPeople) > 20) {
            errors.numberOfPeople = "Number of people cannot exceed 20";
        }

        // Validate number of days for guidedFarmTour package
        if (formData.selectedPackage === 'guidedFarmTour') {
            if (!formData.numberOfDays.trim()) {
                errors.numberOfDays = "Number of days is required";
            } else if (parseInt(formData.numberOfDays) > 10) {
                errors.numberOfDays = "Number of days cannot exceed 10";
            }
        }


        // Set the errors state
        setErrors(errors);

        // Check if there are any errors
        return Object.keys(errors).length === 0;
    };

    const calculateTotalPayment = () => {
        const { selectedPackage, numberOfDays, numberOfPeople, visitorType } = formData;
        let price = 0;

        switch (selectedPackage) {
            case 'fruitAndVegetablePicking':
                price = visitorType === 'foreign' ? 700 * parseInt(numberOfPeople) : 300 * parseInt(numberOfPeople);
                break;
            case 'farmChoreExperience':
                price = visitorType === 'foreign' ? 2500 * parseInt(numberOfPeople) : 1200 * parseInt(numberOfPeople);
                break;
            case 'guidedFarmTour':
                price = visitorType === 'foreign' ? 700 * parseInt(numberOfDays) * parseInt(numberOfPeople) : 700 * parseInt(numberOfDays) * parseInt(numberOfPeople);
                break;
            default:
                price = 0;
        }

        // Check if price is NaN, return 0 in such cases
        return isNaN(price) ? 0 : price;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate the form
        const isValid = validateForm();

        if (isValid) {
            try {
                // Calculate total payment
                const totalPayment = calculateTotalPayment();
                // Create a new object with the form data and totalPayment
                const bookingData = {
                    ...formData,
                    totalPayment,
                };
                // Post booking data
                await axios.post('http://localhost:5555/booking', bookingData);
                // <-- Issue here, formData should be bookingData
                // Reset form data
                setFormData({
                    name: '',
                    telNo: '',
                    nicNo: '',
                    email: '',
                    selectedPackage: '',
                    date: '',
                    numberOfDays: '',
                    numberOfPeople: '',
                    visitorType: '',
                });
                /// Create transaction data
                const transactionData = {
                    date: new Date().toISOString().slice(0, 10),
                    type: 'income', // Set type to income
                    subtype: 'Booking', // Set subtype to booking
                    amount: totalPayment, // Set the amount to the totalPayment
                    description: `Booking: ${formData.nicNo}`, // Description includes NIC Number
                    payer_payee: formData.name,
                    method: 'Automated Entry',
                };

                // Post the transaction data
                await axios.post('http://localhost:5555/transactions', transactionData);


                // Redirect to a confirmation page or any other page after successful submission
                navigate('/payment', { state: { totalPayment } });
            } catch (error) {
                console.log(error.message);
            }
        }
    };
/* Redirect to login page if user is not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null; // Render nothing while redirecting
    }*/
    return (
        <div className="max-w-lg mx-auto mt-8 mb-8 p-4 rounded-md shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-center">Join With Us to Explore the Farm</h2>
            <form onSubmit={handleSubmit} method="post">
                <div><br/></div>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        id="telNo"
                        name="telNo"
                        value={formData.telNo}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.telNo ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.telNo && <p className="text-red-500 text-sm">{errors.telNo}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="nicNumber" className="block text-sm font-medium text-gray-700">
                        NIC Number
                    </label>
                    <input
                        type="text"
                        id="nicNo"
                        name="nicNo"
                        value={formData.nicNo}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.nicNo ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.nicNo && <p className="text-red-500 text-sm">{errors.nicNo}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visitor Type
                    </label>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="localVisitor"
                            name="visitorType"
                            value="local"
                            checked={formData.visitorType === "local"}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="localVisitor" className="mr-4">Local</label>
                        <input
                            type="radio"
                            id="foreignVisitor"
                            name="visitorType"
                            value="foreign"
                            checked={formData.visitorType === "foreign"}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="foreignVisitor">Foreign</label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="selectedPackage" className="block text-sm font-medium text-gray-700">
                        Package Type
                    </label>
                    <select
                        id="selectedPackage"
                        name="selectedPackage"
                        value={formData.selectedPackage}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.selectedPackage ? 'border-red-500' : ''}`}
                        required
                    >
                        <option value="">Select Package</option>
                        <option value="fruitAndVegetablePicking">Fruit and Vegetable Picking</option>
                        <option value="farmChoreExperience">Farm Chore Experience</option>
                        <option value="guidedFarmTour">Guided Farm Tour</option>
                    </select>
                    {errors.selectedPackage && <p className="text-red-500 text-sm">{errors.selectedPackage}</p>}
                </div>
                {/* Conditional rendering based on the selected package */}
                {formData.selectedPackage === 'guidedFarmTour' && (
                    <div className="mb-4">
                        <label htmlFor="numberOfDays" className="block text-sm font-medium text-gray-700">
                            Number of Days for the Stay
                        </label>
                        <input
                            type="number"
                            id="numberOfDays"
                            name="numberOfDays"
                            value={formData.numberOfDays}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md ${errors.numberOfDays ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.numberOfDays && <p className="text-red-500 text-sm">{errors.numberOfDays}</p>}
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date for Booking
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.date ? 'border-red-500' : ''}`}
                        required
                        min={new Date().toISOString().split('T')[0]} // Set the minimum date to today
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">
                        Number of People
                    </label>
                    <input
                        type="number"
                        id="numberOfPeople"
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={handleChange}
                        className={`mt-1 p-2 w-full border rounded-md ${errors.numberOfPeople ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.numberOfPeople && <p className="text-red-500 text-sm">{errors.numberOfPeople}</p>}
                </div>
                <button type="submit" className="bg-black text-white p-2 rounded-md w-full hover:bg-emerald-700">
                    Book Now
                </button>
            </form>
        </div>
    );
}
