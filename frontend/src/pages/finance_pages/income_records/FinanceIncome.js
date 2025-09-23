import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SideBar from "../../../components/SideBar";
import Navbar from "../../../components/utility/Navbar";
import FinanceNavigation from "../../../components/finances/FinanceNavigation.js";
import IncomeRecordsList from "../../../components/finances/finance_income/IncomeRecordsList";
import Breadcrumb from "../../../components/utility/Breadcrumbs";

export default function FinanceIncome() {

    const [testRecords, setTestRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    //const [showType, setShowType] = useState('table');

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/financeincome')
            .then((response) => {
                setTestRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    const breadcrumbItems = [
        { name: 'Home', href: '/dashboard' },
        { name: 'Finance', href: '/finances' },
        { name: 'Income', href: '/finances/financeincome' },
    ];

    return (
        <div className="">
            <div className=" sticky top-0 z-10">
                <Navbar />
            </div>
            <div className="">
                <div className="grid sm:grid-cols-6 ">
                    <div className="  col-span-1 sticky top-0">
                        <SideBar/>
                    </div>

                    <div className="w-full col-span-5 flex flex-col ">
                        <FinanceNavigation/>
                        <Breadcrumb items = {breadcrumbItems}/>
                        <IncomeRecordsList testRecords={testRecords}/>

                    </div>
                </div>
            </div>
        </div>
    );
}
