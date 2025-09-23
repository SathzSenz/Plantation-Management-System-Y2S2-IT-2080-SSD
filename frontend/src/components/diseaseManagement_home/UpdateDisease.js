import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {enqueueSnackbar,useSnackbar} from "notistack";

export default function UpdateDisease() {
    const [disease_name, setName] = useState('');
    const [plant_id, setId] = useState('');
    const [crop, setType] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [treatment, setTreatment] = useState([]);
    const [plant_count, setPlantCount] = useState('');
    const [severity, setSeverity] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {id} = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const [diseaseIdError, setDiseaseIdError] = useState('');
    const [dateError, setDateError] = useState('');

    const handleDiseaseChange = (e) => {
        const selectedDisease = e.target.value;
        setName(selectedDisease); // Update diseaseName state
        // Set treatment based on selected disease
        if (selectedDisease === "Anthracnose") {
            setTreatment(["Daconil Chlorothalonil (chlorothalonil 500g/l SC) fungicide"]);
        } else if (selectedDisease === "Leaf Curling disease") {
            setTreatment(["Mitsu Abamectin (abamectin 18g/l EC) insecticide"]);
        } else if (selectedDisease === "Fungal Disease") {
            setTreatment(["Oasis Thiram (thiuram disulfide) fungicide"]);
        } else if (selectedDisease === "Plesispa") {
            setTreatment(["Marshal 20 SC (carbosulfan 200g/l SC) insecticide"]);
        } else {
            setTreatment([" "]); // Reset treatment if disease changes
        }
    };

    const handleDiseaseIdChange = (e) => {
        const enteredDiseaseId = e.target.value;
        setId(enteredDiseaseId); // Update plant_id state

        // Validate disease ID format
        const diseaseIdRegex = /^D\d{3}$/;
        if (!diseaseIdRegex.test(enteredDiseaseId)) {
            setDiseaseIdError("Disease ID should start with 'D' followed by 3 digits");
        } else {
            setDiseaseIdError("");
        }
    };

    useEffect(() => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/diseases/${id}`)
            .then((response) => {
                setName(response.data.disease_name);
                setId(response.data.plant_id);
                setType(response.data.crop);
                setDate(response.data.date);
                setLocation(response.data.location);
                setPlantCount(response.data.plant_count);
                setTreatment(prevTreatment => [...prevTreatment, response.data.treatment]);
                setSeverity(response.data.severity);
                setStatus(response.data.status);
                setLoading(false);
            }).catch((error) => {
            setLoading(false);
            alert('An error happened. Please check console.');
            console.log(error);
        });

    }, [id]);



    const handleUpdateDisease = (e) => {
        e.preventDefault()

        if(dateError) {
            return;  //don't proceed if there is an error
        }

        const data = {
            disease_name,
            plant_id,
            crop,
            date,
            location,
            plant_count,
            treatment: treatment.join(', '),
            severity,
            status,
        };

        if (diseaseIdError) {
            return; // Don't proceed if there's an error
        }

        setLoading(true);
                    axios
                        .put(`${process.env.REACT_APP_API_BASE_URL}/diseases/${id}`, data)
                        .then(() => {
                            setLoading(false);
                            enqueueSnackbar('Record Updated successfully', { variant: 'success' });
                            navigate('/diseases/records');
                            window.alert("Record Updated Successfully!");
                        })
                        .catch((error) => {
                            setLoading(false);
                            alert(`${error.response.data.message}`);
                            console.log(error);
                        });
    };
    return (
        <div className='items-center justify-center flex'>
            <form
                onSubmit={handleUpdateDisease}
                className="w-fit ml-1/3 mt-2 p-4 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
                <legend className='text-x font-bold mb-2 '>Update Disease Record</legend>
                <div className="flex flex-row w-full">
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Plant ID</label>
                        <input
                            type='text'
                            required
                            value={plant_id}
                            onChange={handleDiseaseIdChange}
                            placeholder="Enter Disease ID"
                            className='border-2 rounded-md mb-1 border-gray-500 px-4 py-2 w-full'
                        />
                        {diseaseIdError && <span className="text-red-500 text-sm mb-2">{diseaseIdError}</span>}
                    </div>
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Disease Name</label>
                        <select
                            value={disease_name}
                            onChange={handleDiseaseChange}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option value="Anthracnose">Anthracnose Disease</option>
                            <option value="Plesispa">Plesispa (Coconut Bug)</option>
                            <option value="Fungal Disease">Fungal Disease</option>
                            <option value="Leaf Curling disease">Leaf Curling Disease</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-row w-full">
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Crop Type</label>
                        <select
                            value={crop}
                            onChange={(e) => setType(e.target.value)}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option value="Papaya">Papaya</option>
                            <option value="Apple Guava">Apple Guava</option>
                            <option value="Coconut">Coconut</option>
                        </select>
                    </div>
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 text-gray-500 mb-1'>Date</label>
                        <input
                            type='date'
                            required
                            value={date}
                            onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                const currentDate = new Date();
                                if (selectedDate > currentDate) {
                                    setDate(e.target.value);
                                    setDateError("Future Dates cannot be selected");
                                } else {
                                    setDate(e.target.value);
                                    setDateError("");
                                }
                            }}
                            className='border-2 rounded-md mb-1 border-gray-500 px-4 py-2 w-full'
                        />
                        {dateError && <span className="text-red-500 text-sm mb-2">{dateError}</span>}
                    </div>
                </div>
                <div className="flex flex-row w-full">
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 mb-1 text-gray-500'>Location</label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option value="Field A">Field A</option>
                            <option value="Field B">Field B</option>
                            <option value="Field C">Field C</option>
                            <option value="Field D">Field D</option>
                            <option value="Field E">Field E</option>
                            <option value="Field F">Field F</option>
                            <option value="Field G">Field G</option>
                        </select>
                    </div>
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mb-1 mr-4 text-gray-500'>Trees Affected</label>
                        <input
                            type='number'
                            required
                            value={plant_count}
                            onChange={(e) => setPlantCount(e.target.value)}
                            placeholder="Enter number of trees affected"
                            min={1}
                            max={1000}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full">
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mr-4 mb-1 text-gray-500'>Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        >
                            <option value="Not Treated">Not Treated</option>
                            <option value="Under Treatment">Under Treatment</option>
                            <option value="Recovered">Recovered</option>
                        </select>
                    </div>
                    <div className="w-full md:w-1/2 pr-4">
                        <label className='text-md mb-1 mr-4 text-gray-500'>Severity</label>
                        <input
                            type='text'
                            required
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            placeholder="Comment on severity"
                            className='border-2 rounded-md mb-4 border-gray-500 px-4 py-2 w-full'
                        />
                    </div>
                    </div>
                    <div className="flex flex-row w-full">
                        <div className="w-full md:w- pr-4">
                            <label className='text-md mr-4 text-gray-500 mb-1'>Treatment</label>
                            <select
                                required
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                className='border-2 mb-4 rounded-md border-gray-500 px-4 py-2 w-full'
                            >
                                <option>Select Treatment</option>
                                {Array.isArray(treatment) && treatment.map((treatmentOption, index) => (
                                    <option key={index} value={treatmentOption}>{treatmentOption}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                <button
                    className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
                    Update
                </button>
            </form>
        </div>

    );

};
