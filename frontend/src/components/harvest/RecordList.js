import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { enqueueSnackbar } from "notistack";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import {Link} from "react-router-dom";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";


export default function HarvestList() {
    const [harvestRecords, setHarvestRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCropType, setSelectedCropType] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);
    const {getPermission, getPermissions} = useKindeAuth();

    useEffect(() => {
        setLoading(true);
        axios
            .get('${process.env.REACT_APP_API_BASE_URL}/record')
            .then((response) => {
                setHarvestRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching harvest records:', error);
                setLoading(false);
            });
    }, []);

    const handleDeleteHarvest = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this harvest record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/record/${id}`)
                .then(() => {
                    setHarvestRecords(prevRecords => prevRecords.filter(record => record._id !== id));
                    setLoading(false);
                    enqueueSnackbar('Record Deleted successfully', { variant: 'success' });
                })
                .catch((error) => {
                    setLoading(false);
                    console.log(error);
                });
        }
    };

    const handleSort = () => {
        if (selectedCropType) {
            const filtered = harvestRecords.filter(record => record.cropType === selectedCropType);
            setFilteredRecords(filtered);
        } else {
            setFilteredRecords([]);
        }
    };

    const handlePrint = () => {
        const input = document.getElementById('print-area');

        html2canvas(input)
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = pdf.internal.pageSize.getWidth() - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 10;
                pdf.setFontSize(16);
                pdf.text("Harvest Record", 10, position);
                heightLeft -= position + 10;

                pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
                heightLeft -= imgHeight;
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
                    heightLeft -= imgHeight;
                }

                pdf.save('harvest_records.pdf');
            });
    };

    return (
        <div className="overflow-x-auto">
            <div>
                <h1 className="text-lg font-semibold text-left px-8 py-2">Harvest Records</h1>
            </div>
            <div className="flex flex-row justify-between items-center px-8 py-4">

                <div className=" py-4">
                    <select
                        value={selectedCropType}
                        onChange={(e) => setSelectedCropType(e.target.value)}
                    >
                        <option value="">Select Crop Type</option>

                        <option value="coconut">Coconut</option>
                        <option value="guava">Guava</option>
                        <option value="papaya">Papaya</option>

                    </select>
                    <button onClick={handleSort}
                            style={{
                                padding: "8px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                margin: "10px"
                            }}>Apply Filter
                    </button>
                </div>
                <div>
                    <Link to="/harvest/records/addRecord"
                       className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                        Add New Harvest Record <span aria-hidden="true">&rarr;</span>
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="ml-4 flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                        Print
                    </button>
                </div>
            </div>
            <div id= "print-area">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500">
                    <tr>
                        <th></th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Crop Type</th>
                        <th scope="col" className="px-6 py-3">Age of Yield (days)</th>
                        <th scope="col" className="px-6 py-3">Way Picked</th>
                        <th scope="col" className="px-6 py-3">Quantity (kg)</th>
                        <th scope="col" className="px-6 py-3">Trees Picked</th>
                        <th scope="col" className="px-6 py-3">Remarks</th>
                        <th scope="col" className="py-3"><span className="sr-only">Info</span></th>
                        <th scope="col" className="py-3"><span className="sr-only">Edit</span></th>
                        <th scope="col" className="py-3"><span className="sr-only">Delete</span></th>
                    </tr>
                    </thead>
                    <tbody className="border-b border-green-400">
                    {(filteredRecords.length > 0 ? filteredRecords : harvestRecords).map((record, index) => (
                        <tr key={index}
                            className={`divide-y ${
                                    record.cropType === 'coconut' ? 'bg-yellow-100 text-black border-l-4 border-yellow-200' : record.cropType === 'guava' ? 'bg-blue-100 text-black border-l-4 border-blue-200' : record.cropType === 'papaya' ? 'bg-green-100 text-black border-l-4 border-green-200' : 'border-l-4 border-black-900'}`}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.cropType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.ageOfYield}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.wayPicked}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.treesPicked}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{record.remarks}</td>
                            <td className="py-4 text-right">

                            </td>
                           
                            <td className="py-4 text-right">
                                <a href={`/harvest/records/updateRecord/${record._id}`}
                                   className="font-medium text-blue-600 hover:underline">
                                    <PencilSquareIcon
                                        className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                        aria-hidden="true"/>
                                </a>
                            </td>
                               
                           
                            <td className="py-4 text-right">
                                <button className="flex items-center" onClick={() => handleDeleteHarvest(record._id)}>
                                    <TrashIcon
                                        className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                        aria-hidden="true"/>
                                </button>
                            </td>
                                    
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
