import {
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {enqueueSnackbar, useSnackbar} from "notistack";
import {jsPDF} from "jspdf";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";

export default function DiseaseList() {

     const [DiseaseRecords, setDiseaseRecords] = useState([]);
     const [loading, setLoading] = useState(false);
     const navigate = useNavigate();
     const {id} = useParams();
     const [searchQuery, setSearchQuery] = useState('');
     const [diseaseChart, setDiseaseChart] = useState({});
     const { enqueueSnackbar } = useSnackbar();
   //const [showType, setShowType] = useState('table');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const {getPermission, getPermissions} = useKindeAuth();

   useEffect(() => {
       setLoading(true);
       axios
           .get('${process.env.REACT_APP_API_BASE_URL}/diseases')
           .then((response) => {
               setDiseaseRecords(response.data.data);
               setLoading(false);
           })
           .catch((error) => {
               console.log(error);
               setLoading(false);
           });
   }, []);

    const handleDeleteDisease = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this disease record?");
        if (confirmDelete) {
            setLoading(true);
            axios
                .delete(`${process.env.REACT_APP_API_BASE_URL}/diseases/${id}`)
                .then(() => {
                    // Update state after successful deletion
                    setDiseaseRecords(prevRecords => prevRecords.filter(record => record._id !== id));
                    setLoading(false);
                    enqueueSnackbar('Record Deleted successfully', { variant: 'success' });
                })
                .catch((error) => {
                    setLoading(false);
                    console.log(error);
                });
        }
    };

    const filteredRecords = DiseaseRecords.filter((record) =>
        Object.values(record).some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                // Convert value to string and check if it includes the search query
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        })
    );

    const handleDownloadDiseaseReport = () => {

        if (!startDate || !endDate || !location || location === "Select Location") {
            // Show an error message if any of the required fields are empty
            enqueueSnackbar('Please select start date, end date, and location to generate the report!', { variant: 'error' });
            return;
        }

        const filteredDiseaseData = DiseaseRecords.filter(record => {
            const recordDate = new Date(record.date);   //converts date string to JS Date object
            //check whether date falls in date range
            const dateRange = recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
            //checks if record's location equal to the selected location
            const selectedLocation = location === "All Fields" || record.location === location;
            return dateRange && selectedLocation;
        });

        const doc = new jsPDF({orientation: 'landscape'}); //sets page orientation

        doc.text(`DISEASE REPORT`, 10, 10);
        doc.text(`From ${startDate} To ${endDate}`, 10,  20);
        doc.text(`Location :  ${location}`, 10,  30);

        const headers = ["Disease Name", "Crop Type", "Date","Trees Affected", "Severity", "Treatment", "Status"];
        if(location === "All Fields") {
            headers.splice(3,0, "Location"); //3rd heading is set to location if all fields selected
        }
        const tableData = [headers];  //assigns headerto an array

        let totalAffectedTrees = 0;
        let totalRecoveredTrees = 0;

        //for each record, data is added to the row
        filteredDiseaseData.forEach(record => {
            const rowData = [
                record.disease_name,
                record.crop,
                record.date,
                location === "All Fields" ? record.location : record.plant_count,
                location === "All Fields" ? record.plant_count : record.severity,
                location === "All Fields" ? record.severity : record.treatment,
                location === "All Fields" ? record.treatment : record.status,
                record.status
            ];

            tableData.push(rowData);

            totalAffectedTrees += record.plant_count;  //update total affected trees count

            if(record.status === "Recovered")
            {
                totalRecoveredTrees += record.plant_count;  //update recovered plants count
            }

        });

        const leftMargin = 10;
        const table = doc.autoTable({
            head: [headers],         //array strings assigned to headers
            body: tableData.slice(1),
            startY: 40,             //position of table start
            styles: {overflow: 'linebreak', columnWidth: 'wrap'},
            theme: 'striped',        //table theme
            columnStyles: {
                6: {columnWidth: 70}   //column 6 width
            }
        });

        //calculate recovery percentage
        const recPercentage = ((totalRecoveredTrees / totalAffectedTrees) * 100).toFixed(3);

        const totalRecords = filteredDiseaseData.length; //total no of records in array
        doc.text(`Total Number of diseased plants detected : ${totalAffectedTrees}`, 10, table.lastAutoTable.finalY + 10);
        doc.text(`Total Number of plants recovered : ${totalRecoveredTrees}`, 10, table.lastAutoTable.finalY + 20);
        doc.text(`Recovery Percentage : ${recPercentage} %`, 10, table.lastAutoTable.finalY + 30);

        doc.save('disease_report.pdf');
    }

    return (
        <div className=" overflow-x-auto  ">
            <div className="flex flex-row justify-between items-center px-8 mt-1 mb-0">
                <div>
                    <h1 className=" text-lg font-semibold text-left">DISEASE RECORDS</h1>
                    <div className=" py-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="text-gray-500 h-4 w-4"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Search all records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-gray-300 rounded-full px-3 py-1 w-full text-sm pl-10"
                            style={{paddingRight: "2.5rem"}}
                        />

                    </div>
                </div>

                <div>
                    <button
                        className="flex-none rounded-full bg-gray-900 px-3.5 py-1 p-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                        <Link to="/diseases/records/addDisease" className="flex items-center">
                            Add New Disease Record <span aria-hidden="true"  style={{ marginLeft: '0.5rem' }}>&rarr;</span>
                        </Link>
                    </button>
                    &nbsp;
                </div>
            </div>
            <div className="flex flex-row justify-between items-center px-8 py-4 text-base mb-2 text-gray-700">
                <div>
                    <label>Start Date : </label>
                    <input className=' rounded-lg' type="date" value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}/>
                </div>
                <div>
                    <label>End Date : </label>
                    <input className=' rounded-lg' type="date" value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}/>
                </div>
                <div>
                    <label className='text-md mr-2'>Location</label>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className=' rounded-lg'
                    >
                        <option>Select Location</option>
                        <option value="All Fields">All Fields</option>
                        <option value="Field A">Field A</option>
                        <option value="Field B">Field B</option>
                        <option value="Field C">Field C</option>
                        <option value="Field D">Field D</option>
                        <option value="Field E">Field E</option>
                        <option value="Field F">Field F</option>
                        <option value="Field G">Field G</option>
                    </select>
                </div>
                <div>
                    <button
                        onClick={handleDownloadDiseaseReport}
                        className=" ml-3 flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                        Generate Report
                    </button>
                </div>
            </div>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500  ">
                <thead
                    className="text-xs text-gray-700 shadow-md uppercase bg-gray-100 border-l-4 border-gray-500 ">
                <tr className=" ">
                    <th></th>
                    <th scope="col" className="px-6 py-3 text-center"> Disease ID</th>
                    <th scope="col" className="px-6 py-3 text-center">Disease Name</th>
                    <th scope="col" className="px-6 py-3 text-center">Crop Type</th>
                    <th scope="col" className="px-6 py-3 text-center">Date</th>
                    <th scope="col" className="px-6 py-3 text-center">Location</th>
                    <th scope="col" className="px-6 py-3 text-center">Trees Affected</th>
                    <th scope="col" className="px-6 py-3 text-center">Severity</th>
                    <th scope="col" className="px-6 py-3 text-center">Treatment</th>
                    <th scope="col" className="px-6 py-3 text-center">Status</th>
                    <th scope="col" className=" py-3"><span className="sr-only">Info</span></th>
                    <th scope="col" className=" py-3"><span className="sr-only">Edit</span></th>
                    <th scope="col" className=" py-3"><span className="sr-only">Delete</span></th>
                </tr>
                </thead>

                <tbody className="border-b border-green-400">

                {filteredRecords.map((drecord, index) => (
                    <tr key={drecord._id} className = {`divide-y ${
                        drecord.status === 'Under Treatment' ? 'border-l-4 border-blue-400' : drecord.status === 'Not Treated' ? 'border-l-4 border-red-500' :  'border-l-4 border-green-400'
                    }`}>
                        <td></td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.plant_id}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.disease_name}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.crop}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.date}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.location}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.plant_count}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.severity}
                        </td>
                        <td className='px-6 py-4 text-center'>
                            {drecord.treatment}
                        </td>
                        <td className= 'px-6 py-4'>
                            <div
                                className={` px-1 py-1 text-white text-center font-semibold rounded-lg ${drecord.status === 'Under Treatment' ? 'bg-blue-500' : drecord.status === 'Recovered' ? 'bg-green-500' : 'bg-red-500'} `}>
                                {drecord.status}
                            </div>
                        </td>
                        <td className=" py-4 text-right">
                            <Link to={`/diseases/records/viewDisease/${drecord._id}`}>
                                <InformationCircleIcon
                                    className="h-6 w-6 flex-none bg-gray-300 p-1 rounded-full text-gray-800 hover:bg-gray-500"
                                    aria-hidden="true"/>
                            </Link>
                        </td>
                        {
                            getPermission("update:records").isGranted? (
                                <td className=" py-4 text-right">
                                    <Link to={`/diseases/records/updateDisease/${drecord._id}`}>
                                        <PencilSquareIcon
                                            className="h-6 w-6 flex-none bg-blue-200 p-1 rounded-full text-gray-800 hover:bg-blue-500"
                                            aria-hidden="true"/>
                                    </Link>
                                </td>
                            ):null
                        }
                        {
                            getPermission("update:records").isGranted? (
                                <td className=" ">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleDeleteDisease(drecord._id)}
                                    >
                                        <TrashIcon
                                            className="h-6 w-6 flex-none bg-red-200 p-1 rounded-full text-gray-800 hover:bg-red-500"
                                            aria-hidden="true"/>
                                    </button>
                                </td>
                            ):null
                        }
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
