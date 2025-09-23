import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link, useParams} from "react-router-dom";
import {PencilSquareIcon, TrashIcon} from "@heroicons/react/24/outline";
import ProgressBar from "./ProgressBar";

const ConfirmTheOrders = () =>{

    const [orderRecords, setOrderRecords] = useState([]);
    const [loading,setLoading] = useState(false);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/orderRecords')
            .then((response) =>{
                setOrderRecords(response.data.data); // Assuming response.data is an object with a 'data' property containing an array of records
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const confirmOrder = async (record) => {
        try {
            const response = await axios.put(`http://localhost:5555/orderRecords/${record._id}`, {
                orderStatus: 'confirmed',
                orderQuantity: record.orderQuantity // include all required fields
            });
            console.log(response.data);
            // Here you can update your component state to re-render the component
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-md w-full">
            <div>
                <div className="-mx-4 px-4 sm:px-12 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <div className="flex px-10 ">
                            <Link to="/wholesaleDashboard"
                                  className=" block rounded-md bg-black px-4 py-1 text-center text-sm font-semibold text-white shadow-sm hover:bg-black-500
                                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-600 left-2"> Go to Product Details
                            </Link>
                        </div>
                        <table className="min-w-full leading-normal mt-8">
                            <thead>
                            <tr>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    product Name
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Price
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Confirm
                                </th>
                                {/*<th*/}
                                {/*    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">*/}
                                {/*    Delete*/}
                                {/*</th>*/}
                            </tr>
                            </thead>
                            <tbody>
                            {(searchQuery ? filteredRecords : orderRecords).map((record, index) => (
                                <React.Fragment key={record._id}>
                                    <tr>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-3 h-10">
                                                </div>
                                                <div className="ml-2">
                                                    <p className="text-gray-900 whitespace-no-wrap">
                                                        {record.orderId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{record.orderProductName}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {record.orderDate}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {record.orderQuantity}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {record.orderPrice}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {record.orderStatus}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white">
                                            <button
                                                onClick={() => confirmOrder(record)} // Pass the record ID and record itself to the confirmOrder function
                                                className="bg-black text-white font-semibold py-1 px-2 rounded">
                                                Confirm
                                            </button>

                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmTheOrders
