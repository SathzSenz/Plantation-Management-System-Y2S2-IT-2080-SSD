import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EditBooking = () => {
    const [name, setFullName] = useState('');
    const [telNo, setTelNo] = useState('');
    const [nicNo, setNicNo] = useState('');
    const [email, setEmail] = useState('');
    const [numberOfPeople, setnumberOfPeople] = useState('');
    const [selectedPackage, setselectedPackage] = useState('');
    const [numberOfDays, setNumberOfDays] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams(); // Extracting id from route parameters

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5555/booking/${id}`)
            .then((response) => {
                const { name, telNo, nicNo, email, selectedPackage, numberOfDays,numberOfPeople } = response.data;
                setFullName(name);
                setTelNo(telNo);
                setNicNo(nicNo);
                setEmail(email);
                setselectedPackage(selectedPackage);
                setNumberOfDays(numberOfDays);
                setnumberOfPeople(numberOfPeople);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
                console.log(error);
            });
    }, [id]); // Adding id to dependency array
// Update numberOfDays when packageType changes
    useEffect(() => {
        if (selectedPackage !== 'guidedFarmTour') {
            setNumberOfDays(undefined); // Set numberOfDays to undefined when packageType changes
        }
    }, [selectedPackage]);

    const handleEdit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        console.log("Submitting form...");
        const data = { name, telNo, nicNo, email, selectedPackage, numberOfDays, numberOfPeople };
        setLoading(true);
        try {
            await axios.put(`http://localhost:5555/booking/${id}`, data);
            console.log("Form submitted successfully");
            setLoading(false);
            enqueueSnackbar('Record Edited successfully', { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
            navigate('/confirmation', { state: { highlighted: true } }); // Redirect after successful save
        } catch (error) {
            console.error("Error submitting form:", error);
            setLoading(false);
            enqueueSnackbar('Error', { variant: 'error' });
            console.log(error);
        }
    };
    const handleCancel = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="container mx-auto px-4 py-8">

            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Edit Booking Details</h1>
            <form onSubmit={handleEdit} className="max-w-lg mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="telNo" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            type="tel"
                            name="telNo"
                            value={telNo}
                            onChange={(e) => setTelNo(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="nicNo" className="block text-sm font-medium text-gray-700">NIC Number</label>
                        <input
                            type="text"
                            name="nicNo"
                            value={nicNo}
                            onChange={(e) => setNicNo(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="mr-3 py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save
                    </button>
                </div>
                </div>
            </form>
        </div>

    );
}

export default EditBooking;
