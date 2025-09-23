import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRotate } from 'react-icons/fa6';

export default function RotationTile() {
    const [plantingRecords, setPlantingRecords] = useState([]);
    const [rotationRecords, setRotationRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joinedRecords, setJoinedRecords] = useState([]);
    const [possibleCrops, setPossibleCrops] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios
            .get('${process.env.REACT_APP_API_BASE_URL}/cropinput')
            .then((response) => {
                const plantingRecordsData = response.data.data;
                const filteredPlantingRecords = plantingRecordsData.filter(record => record.type === 'Planting' && record.cropType !== 'Coconut');
                setPlantingRecords(filteredPlantingRecords);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        axios
            .get('${process.env.REACT_APP_API_BASE_URL}/rotation')
            .then((response) => {
                const rotationRecordsData = response.data.data;
                const filteredRotationRecords = rotationRecordsData.filter(record => record.season === '1 Season Ago' || record.season === '2 Seasons Ago');
                setRotationRecords(filteredRotationRecords);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (plantingRecords.length > 0 && rotationRecords.length > 0) {
            const joined = plantingRecords.reduce((acc, plantingRecord) => {
                const matchingRotationRecords = rotationRecords.filter(rotationRecord => rotationRecord.fieldName === plantingRecord.field);
                if (matchingRotationRecords.length > 0) {
                    acc.push({
                        field: plantingRecord.field,
                        plantingRecord: plantingRecord,
                        rotationRecords: matchingRotationRecords,
                    });
                }
                return acc;
            }, []);
            setJoinedRecords(joined);
        }
    }, [plantingRecords, rotationRecords]);

    useEffect(() => {
        if (joinedRecords.length > 0) {
            const possibleCropsForFields = joinedRecords.map(record => {
                let possibleCropsForField = ['Apple Guava', 'Papaya', 'Sesame'];

                // Check if Apple Guava is ruled out
                if (record.plantingRecord.cropType === 'Apple Guava') {
                    possibleCropsForField = possibleCropsForField.filter(crop => crop !== 'Apple Guava');
                }

                // Check if Papaya is ruled out
                if (record.plantingRecord.cropType === 'Papaya' && record.rotationRecords.some(rotation => rotation.season === '1 Season Ago')) {
                    possibleCropsForField = possibleCropsForField.filter(crop => crop !== 'Papaya');
                }

                return {
                    field: record.field,
                    possibleCrops: possibleCropsForField,
                };
            });

            possibleCropsForFields.sort((a, b) => a.field.localeCompare(b.field));

            setPossibleCrops(possibleCropsForFields);
        }
    }, [joinedRecords]);

    return (
        <div>
            <li className="rounded-xl bg-lime-200 px-6 py-6  hover:transform hover:scale-110 transition-transform duration-300">
                <FaRotate className="mx-auto h-10 w-10 " />
                <h3 className="my-3 font-display font-medium group-hover:text-primary-500 text-center">Rotation</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div>
                        <p className = "my-2 text-center">Possible crops for upcoming season:</p>
                        {possibleCrops.map((crop, index) => (
                            <div key={index} className = "">
                                <h4 className = "text-center">{`${crop.field}`} - {crop.possibleCrops.join(', ')}</h4>
                            </div>
                        ))}
                    </div>
                )}
            </li>
        </div>
    );
}
