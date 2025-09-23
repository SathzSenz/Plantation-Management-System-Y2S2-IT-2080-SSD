
import Navbar from "../../../components/utility/Navbar";
import SideBar from "../../../components/SideBar";
import FinanceNavigation from "../../../components/finances/FinanceNavigation";
import Breadcrumb from "../../../components/utility/Breadcrumbs";
import IncomeRecordsList from "../../../components/finances/finance_income/IncomeRecordsList";
import React, {useState} from "react";
import BackButton from "../../../components/utility/BackButton";
import {useNavigate, useParams} from "react-router-dom";
import {useSnackbar} from "notistack";
import axios from "axios";

export default function DeleteTransaction() {

    const breadcrumbItems = [
        { name: 'Finance', href: '/finances' },
        { name: 'Transactions', href: '/finances/transactions' },
        { name: 'Delete Transaction', href: '/finances/transactions/addTransaction' },
    ];

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const handleDeleteTransaction = () => {
        setLoading(true);
        axios
            .delete(`http://localhost:5555/transactions/${id}`)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Record Deleted successfully', { variant: 'success' });
                navigate('/finances/transactions');
            })
            .catch((error) => {
                setLoading(false);
                // alert('An error happened. Please Chack console');
                enqueueSnackbar('Error', { variant: 'error' });
                console.log(error);
            });
    };

    return (
        <div className="">
            <div className=" sticky top-0 z-10">
                <Navbar/>
            </div>
            <div className="">
                <div className="grid sm:grid-cols-6 ">
                    <div className="  col-span-1 sticky top-0">
                        <SideBar/>
                    </div>

                    <div className="w-full col-span-5 flex flex-col ">
                        <FinanceNavigation/>
                        <div className="flex flex-row ">
                            <BackButton/>
                            <Breadcrumb items={breadcrumbItems}/>
                        </div>
                        <div>
                            <div className='p-4'>
                                <div
                                    className='flex flex-col items-center  rounded-xl  p-8'>
                                    <h3 className='text-2xl'>Are You Sure You want to delete this book?</h3>

                                    <button
                                        className='p-4 bg-red-500 text-white m-8 w-full hover:bg-red-700'
                                        onClick={handleDeleteTransaction}
                                    >
                                        Yes, Delete it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
