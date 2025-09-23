import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EditEqMain = () => {
    const [equipmentNames, setEquipmentNames] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [Eq_id_main, setEq_id_main] = useState('');
    const [date_referred, setDate_referred] = useState('');
    const [date_received, setDate_received] = useState('');
    const [date_receivedError, setDate_receivedError] = useState('');
    const [price, setPrice] = useState('');
    const [pay_person, setPayPerson] = useState('');
    const [ref_loc, setRef_loc] = useState('');
    const [status, setStatus] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams(); // Extracting id from route parameters
    const [autoSaveTransaction, setAutoSaveTransaction] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5555/inventoryrecords/${id}`)
            .then((response) => {
                setSelectedEquipment(response.data.Eq_machine_main);
                setEq_id_main(response.data.Eq_id_main);
                setDate_referred(response.data.date_referred.split("T")[0]); // Extracting date part
                setDate_received(response.data.date_received.split("T")[0]); // Extracting date part
                setPrice(response.data.price);
                setPayPerson(response.data.pay_person);
                setRef_loc(response.data.ref_loc);
                setStatus(response.data.status);
                setComment(response.data.comment);
                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            enqueueSnackbar('An error occurred. Please check the console.', { variant: 'error' });
            console.log(error);
        });

        // Fetch equipment names and IDs from inventory records
        axios.get('http://localhost:5555/inventoryinputs')
            .then((response) => {
                const filteredEquipments = response.data.data
                    .filter((item) => item.type === 'Equipments')
                    .map((item) => ({
                        id: item.record_ID,
                        name: item.record_name,
                    }));
                setEquipmentNames(filteredEquipments);
            })
            .catch((error) => {
                console.log(error);
            });

    }, [id]); // Adding id to dependency array

    useEffect(() => {
        // Find the Eq_id_main based on the selected Eq_machine_main
        const selectedEquipmentData = equipmentNames.find(
            (item) => item.name === selectedEquipment
        );
        if (selectedEquipmentData) {
            setEq_id_main(selectedEquipmentData.id);
        } else {
            setEq_id_main('');
        }
    }, [selectedEquipment, equipmentNames]);


    const handleDateReceivedChange = (value) => {
        const referredDate = new Date(date_referred);
        const receivedDate = new Date(date_received);
        const today = new Date();
        const oneYearFuture = new Date();
        oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1);

        if (receivedDate <= referredDate || receivedDate > oneYearFuture ) {
            setDate_receivedError("Please select a date within one year from today and date not after the referred date");
        } else {
            setDate_receivedError("");
            setDate_received(value);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        if (date_receivedError) {
            enqueueSnackbar(date_receivedError, { variant: 'error' });
            return;
        }

        if (autoSaveTransaction) {
            const transactionData = {
                date: new Date().toISOString().slice(0, 10),
                type: 'expense',
                subtype: 'Maintenance Fee',
                amount: price,
                description: selectedEquipment,
                payer_payee: pay_person,
                method: 'Automated Entry',
            };

            try {
                await axios.post('http://localhost:5555/transactions', transactionData);
            } catch (error) {
                console.error('Error saving transaction:', error);
            }
        }

        const data = {
            Eq_machine_main: selectedEquipment,
            Eq_id_main,
            date_referred,
            date_received,
            price,
            pay_person,
            ref_loc,
            status,
            comment,
        };

        setLoading(true);
        axios
            .put(`http://localhost:5555/inventoryrecords/${id}`, data)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Edited Successfully!', {
                    variant: 'success',
                    autoHideDuration: 6000,
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                });
                setTimeout(() => {
                    navigate('/inventory/maintenancelog');
                }, 100);
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar('Error', { variant: 'error' });
                console.error('Error editing record:', error);
            });
    };


    return (
        <div className="pt-2">
            <div className="flex flex-col ml-96 mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Edit Equipment / Machine Maintenance Record
                </h1>
            </div>
            <form className="flex flex-col items-center justify-center" onSubmit={handleEdit}>
                <div className="space-y-12 px-0 py-16 w-6/12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label htmlFor="Eq_machine_main"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Equipment / Machine Name
                                </label>
                                <div className="mt-2">
                                    <select
                                        name="Eq_machine_main"
                                        value={selectedEquipment}
                                        onChange={(e) => setSelectedEquipment(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="">Select Equipment Name</option>
                                        {equipmentNames.map((item) => (
                                            <option key={item.id} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="Eq_id_main"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Equipment / Machine ID
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="Eq_id_main"
                                        value={Eq_id_main}
                                        readOnly
                                        onChange={(e) => setEq_id_main(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="date_referred"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Date referred to
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        name="date_referred"
                                        value={date_referred}
                                        onChange={(e) => setDate_referred(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="date_received"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Received date
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        name="date_received"
                                        value={date_received}
                                        onChange={(e) => handleDateReceivedChange(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                    {date_receivedError && <p className="text-red-500">{date_receivedError}</p>}
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="price"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Price
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        name="price"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="pay_person"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Payer / Payee
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="pay_person"
                                        value={pay_person}
                                        onChange={(e) => setPayPerson(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="ref_loc" className="block text-sm font-medium leading-6 text-gray-900">
                                    Referred location for maintenance
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="ref_loc"
                                        value={ref_loc}
                                        onChange={(e) => setRef_loc(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={status} // Set selected value based on status state
                                    onChange={(e) => setStatus(e.target.value)}
                                    id="status"
                                    autoComplete="status"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="">Select</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                            </div>
                            <div className="col-span-full">
                                <label htmlFor="comment" className="block text-sm font-medium leading-6 text-gray-900">
                                    Comment
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-lime-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <div
                            className="flex  justify-end gap-2 align-middle items-center text-sm font-semibold h-full pr-8 z-30">
                            <label className="bg-gray-200 py-1 pl-4 rounded-full">
                                Automatically save to transactions
                                <input
                                    className="size-6 ml-4 mr-1 form-checkbox text-lime-600 bg-white border-gray-300 rounded-full focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50 hover:bg-lime-100 checked:bg-lime-500"
                                    type="checkbox"
                                    checked={autoSaveTransaction}
                                    onChange={(e) => setAutoSaveTransaction(e.target.checked)}/>

                            </label>
                        </div>
                        <button type="button"
                                className="rounded-full bg-gray-300 px-4 py-1 hover:bg-gray-400 text-sm font-semibold  text-gray-900">

                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-full bg-lime-200 px-4 py-1 text-sm font-semibold text-gray-900 shadow-sm hover:bg-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
        ;
}

export default EditEqMain;
