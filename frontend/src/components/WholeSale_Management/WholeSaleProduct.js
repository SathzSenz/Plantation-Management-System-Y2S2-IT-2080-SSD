import React, {useEffect, useState} from 'react';
import Tomato from "../WholeSale_Management/pictuers/tomato.jpeg";
import Guava from "../WholeSale_Management/pictuers/guava.jpg"
import Papaya from "../WholeSale_Management/pictuers/papaya.jpg"
import {Link} from "react-router-dom"
import axios from "axios";

const WholeSaleProduct = () => {
    const [productRecords, setProductRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [filteredRecords, setFilteredRecords] = useState([]);
    // const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/productRecords`)
            .then((response) => {
                setProductRecords(response.data.data); // Assuming response.data is an object with a 'data' property containing an array of records
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const handleOrderClick = (productID) => {
        productRecords.push(`/WholeSale/transactions/${productID}`);
    };

    return(
        <div>
            {productRecords.map((record, index) => (
                <div>
                    <div className="bg-white py-24 sm:py-4">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">

                            <div
                                className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-0 lg:mx-0 lg:flex lg:max-w-none">
                                <div className="p-8 sm:p-10 lg:flex-auto">
                                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">{record.productName}</h3>
                                    <p className="mt-6 text-base leading-7 text-gray-600">{record.productDescription}</p>
                                    <div className="mt-10 flex items-center gap-x-10">
                                        <div className="h-px flex-auto bg-gray-300"></div>
                                    </div>
                                    <ul role="list"
                                        className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                                        <li className="flex gap-x-3">
                                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                                 fill="currentColor" aria-hidden="true">
                                                <path fill-rule="evenodd"
                                                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                            Availabe Kilos(Kg) - {record.productQuantity}
                                        </li>
                                        <li className="flex gap-x-3">
                                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                                 fill="currentColor" aria-hidden="true">
                                                <path fill-rule="evenodd"
                                                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                            Price for Kilo(Rs) - {record.productPrice}
                                        </li>
                                        <li className="flex gap-x-3">
                                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                                 fill="currentColor" aria-hidden="true">
                                                <path fill-rule="evenodd"
                                                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                            Include Delivery Charges
                                        </li>
                                        <li className="flex gap-x-3">
                                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20"
                                                 fill="currentColor" aria-hidden="true">
                                                <path fill-rule="evenodd"
                                                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                            Tracking
                                        </li>
                                    </ul>
                                </div>
                                <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                                    <div
                                        className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                        <div className="mx-auto max-w-xs px-8">
                                            <div className="mx-auto w-full h-auto rounded-full">
                                                <img src={Guava} alt="guava"/>
                                            </div>
                                            <div>
                                                <Link to={`/WholeSale/transactions/${record._id}`}>
                                                    <button className="block w-full mt-5 rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500
                                                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                                        Order Now
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WholeSaleProduct;
