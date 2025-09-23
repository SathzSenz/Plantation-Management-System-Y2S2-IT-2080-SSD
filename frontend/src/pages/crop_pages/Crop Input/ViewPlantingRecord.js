import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Breadcrumb from "../../../components/utility/Breadcrumbs";
import BackButton from "../../../components/utility/BackButton";
import SideBar from "../../../components/SideBar";
import Navbar from "../../../components/utility/Navbar";
import CropNavigation from "../../../components/cropManagement_home/CropNavigation";
import axios from "axios";

const breadcrumbItems = [
    { name: 'Crop', href: '/crop/home' },
    { name: 'Crop Input List', href: '/crop/input/view' },
    { name: 'Planting Record', href: '/crop/input/planting/record' }
];

export default function ViewPlantingRecord() {
    const { id } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/cropinput/${id}`)
    .then((response) => {
            setRecord(response.data);
            setLoading(false);
        })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, [id]);

    return (
        <div className="">
            <div className="sticky top-0 z-10">
                <Navbar />
            </div>
            <div className="">
                <div className="grid sm:grid-cols-6">
                    <div className="col-span-1 sticky left-0 top-0 z-50">
                        <SideBar />
                    </div>
                    <div className="w-full col-span-5 flex flex-col">
                        <CropNavigation />
                        <div className="flex flex-row ">
                            <BackButton />
                            <Breadcrumb items={breadcrumbItems} />
                        </div>
                        <div className="mt-4 px-8 py-8">
                            <div className="px-4 sm:px-0">
                                <h3 className="text-base font-semibold leading-7 text-gray-900">Planting Record Details</h3>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Details of the planting record</p>
                            </div>
                            <div id="print-area" className="mt-6 border-t border-gray-100">
                                {record && (
                                    <div className="divide-y divide-gray-200">
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span className="text-sm font-medium leading-6 text-gray-900">Date:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                {new Date(record.date).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span className="text-sm font-medium leading-6 text-gray-900">Type:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.type}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span className="text-sm font-medium leading-6 text-gray-900">Field:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.field}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Crop Type:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.cropType}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Variety:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.variety}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Quantity:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.quantity}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Unit Cost (Rs.) :</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.unitCost}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Remarks:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{record.remarks}</span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Created At:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    {record.createdAt && new Date(record.createdAt).toLocaleString('en-GB')}
                                            </span>
                                        </div>
                                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                            <span
                                                className="text-sm font-medium leading-6 text-gray-900">Last Updated At:</span>
                                            <span
                                                className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                    {record.updatedAt && new Date(record.updatedAt).toLocaleString('en-GB')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
