import React, { useState, useEffect } from 'react';
import { api } from '../../apiClient';

function Weather() {
    const [weatherData, setWeatherData] = useState({ temperature: null, weatherCode: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('http://localhost:5555/weather?lat=40.7128&lon=-74.0060');
                console.log(data); // To understand the structure

                // Assuming data contains an array named 'timelines' and we are interested in the first item
                const firstDataPoint = data.timelines[0].intervals[0].values; // Adjust based on actual structure
                setWeatherData({
                    temperature: firstDataPoint.temperature,
                    weatherCode: firstDataPoint.weatherCode
                });
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {weatherData.temperature && weatherData.weatherCode ? (
                <div>
                    <p>Temperature: {weatherData.temperature}</p>
                    <p>Weather Code: {weatherData.weatherCode}</p>
                </div>
            ) : (
                <p>Loading weather data...</p>
            )}
        </div>
    );
}

export default Weather;
