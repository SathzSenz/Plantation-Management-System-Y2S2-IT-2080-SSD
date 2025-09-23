import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { select, scaleBand, scaleLinear, axisBottom, axisLeft, line, curveMonotoneX, scaleTime } from "d3";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";


export default function GenerateGraphs() {
    const [DiseaseRecords, setDiseaseRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeLineFilter, setTimeLineFilter] = useState("1 Year");
    const chartContainer = useRef(null);
    const lineChartContainer = useRef(null);
    const cropBarChartContainer = useRef(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5555/diseases/g?timeline=${timeLineFilter}`)
            .then((response) => {
                setDiseaseRecords(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, [timeLineFilter]);

    const handleTimeLineFilterChange = (e) => {
        setTimeLineFilter(e.target.value);
    };

    useEffect(() => {
        renderBarChart();
        renderLineChart();
        renderCropBarChart();
    }, [DiseaseRecords]);

    const renderBarChart = () => {
        if (!chartContainer.current) return;

        const typesOfDiseases = new Map();  //initialising empty map

        DiseaseRecords.forEach((record) => {
            if(typesOfDiseases.has(record.disease_name)) {   //checks whether map already contains key with the given disease name
                typesOfDiseases.set(
                    record.disease_name,
                    typesOfDiseases.get(record.disease_name) + record.plant_count   //updates existing count
                );
            }
            else {
                typesOfDiseases.set(record.disease_name, record.plant_count);   //sets dname as key and appends to the map
            }
        });

        const labels = [...typesOfDiseases.keys()];  //labels contains dnames
        const data = [...typesOfDiseases.values()];  //data contain plant counts

        const svg = select(chartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };   //set the margins for the graph
        const width = svg.attr("width") - margin.left - margin.right;   //set width of the graph
        const height = svg.attr("height") - margin.top - margin.bottom; //set height of the graph

        const x = scaleBand()
            .range([0, width])          //set x-axis range
            .padding(0.3)           //set padding between bars
            .domain(labels);        //x -axis label

        const y = scaleLinear()
            .range([height, 0])        //set y-axis height
            .domain([0, Math.max(...data)]);    //set y-axis label

        const g = svg   //appends new group element to svg container
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Number of Diseased Plants");

        g.selectAll(".bar")
            .data(typesOfDiseases)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .style("fill", "rgba(0, 226, 29, 0.28)")
            .style("stroke", "rgb(13, 128, 0)")
            .style("stroke-width", 1)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
                tooltip.html(`Disease: ${d[0]}<br/>Value: ${d[1]}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })

            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "rgba(212, 225, 87)")
            .style("padding", "5px")
            .style("border-radius", "10px")
            .style("border", "1px solid black ");


        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", margin.left + (width / 2))
            .attr("y", height + margin.top + 50)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Disease Type");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 60 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Amount of Records");
    };

    const renderCropBarChart = () => {

        if (!cropBarChartContainer.current) return;

        const typesOfCrops = new Map();

        DiseaseRecords.forEach((record) => {
            //checks for key with given crop name
            if(typesOfCrops.has(record.crop)) {
                typesOfCrops.set(
                    record.crop,
                    typesOfCrops.get(record.crop) + record.plant_count  //updates available plant count
                );
            }
            else {
                typesOfCrops.set(record.crop, record.plant_count);  //append crop to map
            }
        });

        const labels1 = [...typesOfCrops.keys()];    //crop name as labels
        const data1 = [...typesOfCrops.values()];    //plant count as data

        const svg = select(cropBarChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 10, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleBand()
            .range([0, width])
            .padding(0.5)
            .domain(labels1);  //labels assigned to x axis

        const y = scaleLinear().range([height, 0]).domain([0, Math.max(...data1)]);  //y range from 0 to y-max

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Number of Diseased Plants");

        g.selectAll(".bar")
            .data(typesOfCrops)    //bars represent plant count
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .style("fill", "rgba(0, 226, 29, 0.28)")
            .style("stroke", "rgb(13, 128, 0)")
            .style("stroke-width", 1)
            .on("mouseover", (event, d) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Crop: ${d[0]}<br/>Value: ${d[1]}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mousemove", (event) => {

                tooltip.style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {

                tooltip.style("opacity", 0);
            });


        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "rgba(212, 225, 87)")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("border", "1px solid black");

        svg.append("text")    //x axis label
            .attr("class", "axis-label")
            .attr("x", margin.left + (width / 2))
            .attr("y", height + margin.top + 50)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Crop Type");

        svg.append("text")     //y axis label
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 60 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Amount of Diseased Plants");

    };

    const renderLineChart = () => {

        if (!lineChartContainer.current) return;

        if (DiseaseRecords.length === 0) {
            return;
        }

        const accumulatedCounts = new Map();

        DiseaseRecords.forEach((record) => {
            //check for key having similar to given date
            const date = record.date;
            if (!accumulatedCounts.has(date)) {
                accumulatedCounts.set(date, 0);    //update existing plant count
            }
            accumulatedCounts.set(date, accumulatedCounts.get(date) + record.plant_count);   //append date as key to map
        });

        //sorts dates in ascending order
        const sortedDates = Array.from(accumulatedCounts.keys()).sort(
            (a, b) => new Date(a) - new Date(b)
        );
        //maps each date to its count
        const counts = sortedDates.map((date) => accumulatedCounts.get(date));

        const svg = select(lineChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleTime()
            .range([0, width])
            .domain([new Date(sortedDates[0]), new Date(sortedDates[sortedDates.length - 1])]); //date represents x axis

        const y = scaleLinear().range([height, 0]).domain([0, Math.max(...counts)]);  //counts represents y axis

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.selectAll("circle")
            .data(sortedDates.map((date, i) => ({ date, value: counts[i]})))
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.value))
            .attr("r", 5)
            .attr("fill", "rgb(13, 128, 0)")
            .on("mouseover", (event, d) => {
                const {date, value} = d;
                tooltip.style("opacity", 1);
                tooltip.html(`Date : ${date} <br> Plants: ${value}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mousemove", (event) => {

                tooltip.style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {

                tooltip.style("opacity", 0);
            });


        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "rgb(69, 201, 53)")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("border", "1px solid black");

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x).ticks(5));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Number of Records");

        const line1 = line()
            .x((d, i) => x(new Date(sortedDates[i])))
            .y((d) => y(d))
            .curve(curveMonotoneX);

        g.append("path")
            .datum(counts)
            .attr("fill", "none")
            .attr("stroke", "rgb(13, 128, 0)")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line1);

        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", margin.left + (width / 2))
            .attr("y", height + margin.top + 50)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Time");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 60 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Amount of Diseased Plants");

    };

    return (
        <div className=" overflow-x-auto  ">
            <div className="flex flex-row justify-between items-center px-8 py-4">
                <div>
                    <h1 className=" text-lg font-semibold text-left">
                        GRAPH VISUALIZATION
                    </h1>
                    <p className="mt-1 text-sm font-normal text-gray-500 0">
                        Visualize trends of diseases that escalate throughout the farm...
                    </p>
                </div>
            </div>
            {DiseaseRecords.length === 0 ? (
                <div className=" text-base font-semibold text-left px-8">
                    There is no data available to generate graphs.. <Link to="/diseases/records/addDisease" className=" text-lime-400"> Click here</Link>
                </div>
            ) : (
                <>
                    <div className="mx-auto px-8  w-fit border-2 rounded-xl border-green-400">
                        <div className="flex flex-row items-center justify-center mt-2">
                            <div className="mr-2">
                                <h1 className=" mt-4 text-lg font-bold text-left flex justify-center items-center">
                                    Disease V Records
                                </h1>
                            </div>
                            <div className="ml-2">
                                <select
                                    className="rounded-full px-auto py-1 w-auto"
                                    value={timeLineFilter}
                                    onChange={handleTimeLineFilterChange}>
                                    <option value="1 Year">1Y</option>
                                    <option value="1 Month">1M</option>
                                    <option value="1 Week">1W</option>
                                </select>
                            </div>
                        </div>
                        <div className="  py-4 ">
                            <svg ref={chartContainer} width="800" height="400"></svg>
                        </div>
                    </div>
                    <div className="mx-auto px-8 w-fit py-4 border-2 mt-6 rounded-xl border-green-400">
                        <div className="flex flex-row items-center justify-center">
                            <div className="mr-2">
                                <h1 className=" mt-4 text-lg font-bold text-left flex justify-center items-center">
                                    Number of Diseased Plants V Time
                                </h1>
                            </div>
                            <div className="ml-2">
                                <select
                                    className="rounded-full px-auto py-1 w-auto"
                                    value={timeLineFilter}
                                    onChange={handleTimeLineFilterChange}>
                                    <option value="1 Year">1Y</option>
                                    <option value="1 Month">1M</option>
                                    <option value="1 Week">1W</option>
                                </select>
                            </div>
                        </div>
                        <div className=" w-2/3 h-1/4  py-4 ">
                            <svg ref={lineChartContainer} width="800" height="400"></svg>
                        </div>
                    </div>
                    <div className=" w-fit mx-auto px-8 py-4 border-2 mt-6 rounded-xl border-green-400">
                        <div className="flex flex-row items-center justify-center">
                            <div className="mr-2">
                                <h1 className=" mt-4 text-lg font-bold text-left flex justify-center items-center">
                                    Amount of Diseased Plants V Crop Type
                                </h1>
                            </div>
                            <div className="ml-2">
                                <select
                                    className="rounded-full px-auto py-1 w-auto"
                                    value={timeLineFilter}
                                    onChange={handleTimeLineFilterChange}>
                                    <option value="1 Year">1Y</option>
                                    <option value="1 Month">1M</option>
                                    <option value="1 Week">1W</option>
                                </select>
                            </div>
                        </div>
                        <div className=" w-2/3 h-1/4 py-4 ">
                            <svg ref={cropBarChartContainer} width="800" height="300"></svg>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
