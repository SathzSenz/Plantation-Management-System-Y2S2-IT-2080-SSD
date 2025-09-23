import React, {useEffect, useRef, useState} from "react";
import {FaCrop, FaDisease, FaTractor} from "react-icons/fa";
import axios from "axios";
import {
    GiField, GiFruitTree,
    GiHealingShield,
    GiMedicines
} from "react-icons/gi";
import { FaSunPlantWilt} from "react-icons/fa6";
import moment from "moment";

export default function DiseaseHomeContent(){

    const [DiseaseRecords, setDiseaseRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [untreatedPlantsCount, setUntreatedPlantsCount] = useState(0);
    const [recoveredPlantsCount, setRecoveredPlantsCount] = useState(0);
    const [underTreatmentPlantsCount, setUnderTreatmentPlantsCount] = useState(0);

    useEffect(() => {
        setLoading(true);
        axios
            .get("${process.env.REACT_APP_API_BASE_URL}/count/untreatedPlants")//fetches count of untreated plants from the endpoint
            .then((response) => {
                setUntreatedPlantsCount(response.data.totalTreesAffected); //assigns the count received to the variable
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

        axios
            .get("${process.env.REACT_APP_API_BASE_URL}/count/recoveredPlants")//fetches count of recoveredplants from the endpoint
            .then((response) => {
                setRecoveredPlantsCount(response.data.totalTreesAffected);//assigns the count received to the variable
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

        axios
            .get("${process.env.REACT_APP_API_BASE_URL}/count/underTreatmentPlants")//fetches count of plants under treatment from the endpoint
            .then((response) => {
                setUnderTreatmentPlantsCount(response.data.totalTreesAffected);//assigns the count received to the variable
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

        axios
            .get("${process.env.REACT_APP_API_BASE_URL}/diseases")//fetches information about records
            .then((response) => {
                setDiseaseRecords(response.data.data); //assigns values in the array of disease records
                console.log("DiseaseRecords:", response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });

    }, []);

    //deducts 31 days from the value of the object used to store the current date
    const monthAgo = moment().subtract(31, 'days').format('YYYY-MM-DD');

    //iterates over each record to get the total count of trees affected for each field within the last month
    const getFieldCounts = {};
    DiseaseRecords.forEach((record) => {
        /*getFieldCounts[record.location] = (getFieldCounts[record.location] || 0) + 1;*/
        if(moment(record.date, 'YYYY-MM-DD').isSameOrAfter(monthAgo)) {
            if(getFieldCounts[record.location]) {
                getFieldCounts[record.location] += record.plant_count;  //add count if location already available
            }
            else {
                getFieldCounts[record.location] = record.plant_count;  //add new count if location is not available
            }
        }
    });

    let mostVulnerableField = []; //assigning empty array to store most vulnerable field/s
    let maxCount = 0;  //initializing max count of trees affected
    for(const location in getFieldCounts) {
        if(getFieldCounts[location] > maxCount) {
            mostVulnerableField = [location];    //if count is greater than current max, assign new location to array
            maxCount = getFieldCounts[location];   //updates max count of affected trees
        }else if (getFieldCounts[location] === maxCount) {  //checks if current count is equal to max count
            mostVulnerableField.push(location);    //append location to array
        }
    }

//iterates over each record to get the total count of trees affected for each disease within the last month
    const getDiseaseCounts = {};
    DiseaseRecords.forEach((record) => {
        /*getDiseaseCounts[record.disease_name] = (getDiseaseCounts[record.disease_name] || 0) + 1;*/
        if(moment(record.date, 'YYYY-MM-DD').isSameOrAfter(monthAgo)) {
            if(getDiseaseCounts[record.disease_name]) {
                getDiseaseCounts[record.disease_name] += record.plant_count;  //add count if disease already available
            }
            else {
                getDiseaseCounts[record.disease_name] = record.plant_count;  //add new count if disease unavailable
            }
        }
    });

    let trendingDisease = [];  //assigning empty array to store most trending disease
    let maxDiseaseCount = 0;  //initializing max count of trees affected
    for(const disease_name in getDiseaseCounts) {
        if(getDiseaseCounts[disease_name] > maxDiseaseCount) {
            trendingDisease = [disease_name];      //if count is greater than current max, assign new disease to array
            maxDiseaseCount = getDiseaseCounts[disease_name];  //updates max count of affected trees
        } else if (getDiseaseCounts[disease_name] === maxDiseaseCount) {  //checks if current count is equal to max count
            trendingDisease.push(disease_name);    //append disease to array
        }
    }


//iterates over each record to get the total count of trees affected for each crop within the last month
    const getCropCount = {};
    DiseaseRecords.forEach((record) => {
        /*getCropCount[record.crop] = (getCropCount[record.crop] || 0) + 1;*/
        if(moment(record.date, 'YYYY-MM-DD').isSameOrAfter(monthAgo)) {
            if(getCropCount[record.crop]) {
                getCropCount[record.crop] += record.plant_count;  //add count if crop already available
            }
            else {
                getCropCount[record.crop] = record.plant_count;  //add new count if crop unavailable
            }
        }
    });

    let mostVulnerableCrop = [];  //assigning empty array to store most vulnerable crop
    let maxCropCount = 0;  //initializing max count of trees affected
    for(const crop in getCropCount)
    {
        if(getCropCount[crop] > maxCropCount)
        {
            mostVulnerableCrop = [crop];   //if count is greater than current max, assign new crop to array
            maxCropCount = getCropCount[crop];    //updates max count of affected trees
        } else if (getCropCount[crop] === maxCropCount)   //checks if current count is equal to max count
        {
            mostVulnerableCrop.push(crop);  //append crop to array
        }
    }

    return(
        <div className=" overflow-x-auto  ">
            <div className="flex flex-row justify-between items-center px-8 py-4 text-center">
                <div className="w-full">
                    <h1 className=" text-2xl font-bold">
                        DISEASE MANAGEMENT
                    </h1>
                    <p className=" mt-1 text-base font-normal text-gray-500">
                        Hop on Board with the Disease Management Center!!<br/>
                        Prioritize the health of your plants by monitoring them effectively.<br/>
                        Explore insights, track disease trends and make your decision making more precise....
                    </p>
                    <div className=" justify-between grid-cols-1 ml-6 w-full mt-8 flex flex-wrap items-center md:grid-cols-3">
                        <div
                            className=" py-4 items-center justify-center rounded-lg flex-col flex-1 flex shadow-lg bg-lime-300 max-w-2xl w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className= "mt-2 mb-3">
                                <FaSunPlantWilt className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className= " text-center text-lg font-bold">
                                Number of Untreated Plants
                            </div>
                            <div className= " text-center text-lg font-medium">
                                {untreatedPlantsCount}
                            </div>
                        </div>
                        <div
                            className=" py-4 flex-col items-center justify-center rounded-lg flex-1 flex shadow-lg bg-lime-300 w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className=" mt-2 mb-3">
                                <GiHealingShield className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className=" text-center text-lg font-bold">
                                Number of Recovered Plants
                            </div>
                            <div className=" text-center text-lg font-medium">
                                {recoveredPlantsCount}
                            </div>
                        </div>
                        <div
                            className=" py-4 flex-col items-center justify-center  rounded-lg flex-1 flex shadow-lg bg-lime-300 w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className= " mt-2 mb-3">
                                <GiMedicines className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className= "text-center text-lg font-bold">
                                Number of Plants Under Treatment
                            </div>
                            <div className= "text-center text-lg font-medium">
                                {underTreatmentPlantsCount}
                            </div>
                        </div>
                    </div>
                    <div className=" justify-between ml-6 w-full mt-3 flex flex-wrap items-center">
                        <div
                            className=" py-4 items-center justify-center  rounded-lg flex-1 flex-col  flex shadow-lg bg-lime-300 max-w-2xl w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className="mt-2 mb-3">
                                <GiField className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className=" text-center text-lg font-bold">
                                Most Vulnerable Field/s
                            </div>
                            <div className=" text-center text-base font-medium mt-2">
                                {mostVulnerableField.map((location, index) => (
                                    <span key={index}>
                                   {location}
                                        {index < mostVulnerableField.length - 1 && ", "}
                               </span>
                                ))}
                            </div>
                        </div>
                        <div
                            className=" py-4 items-center justify-center rounded-lg flex-1 flex flex-col shadow-lg bg-lime-300 max-w-2xl w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className="mt-2 mb-3">
                                <FaDisease className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className=" text-center text-lg font-bold ">
                                Most Trending Disease/s
                            </div>
                            <div className=" text-center text-base font-medium mt-2">
                                {trendingDisease.map((disease_name, index) => (
                                    <span key={index}>
                                    {disease_name}
                                        {index < trendingDisease.length - 1 && ", "}
                                </span>
                                ))}
                            </div>
                        </div>
                        <div
                            className=" py-4 items-center justify-center rounded-lg flex-1 flex flex-col shadow-lg bg-lime-300 max-w-2xl w-full mb-4 mr-4 hover:bg-lime-400">
                            <div className=" mt-2 mb-3">
                                <GiFruitTree className="h-10 w-10 mx-auto"/>
                            </div>
                            <div className=" text-center text-lg font-bold ">
                                Most Vulnerable Crop/s
                            </div>
                            <div className=" text-center text-base font-medium mt-2">
                                {mostVulnerableCrop.map((crop, index) => (
                                    <span key={index}>
                                    {crop}
                                        {index < mostVulnerableCrop.length - 1 && ", "}
                                </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}
