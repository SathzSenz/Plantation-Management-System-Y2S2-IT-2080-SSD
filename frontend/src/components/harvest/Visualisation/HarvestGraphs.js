import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { select, scaleBand, scaleLinear, axisBottom, axisLeft, line, curveMonotoneX, scaleTime } from "d3";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {Link} from "react-router-dom";


export default function HarvestGraphs() {
    const [HarvestRecords, setHarvestRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartContainer = useRef(null);
    const tooltip = useRef(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get("http://localhost:5555/record")
            .then((response) => {
                setHarvestRecords(response.data.data);
                console.log("HarvestRecords:", response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (HarvestRecords.length > 0) {
            renderBarChart();
        }
    }, [HarvestRecords]);

    const renderBarChart = () => {
        if (!chartContainer.current) return;

        const typesOfCrop = new Map();

        HarvestRecords.forEach((record) => {
            typesOfCrop.set(
                record.cropType,
                (typesOfCrop.get(record.cropType) || 0) + 1
            );
        });

        const labels = [...typesOfCrop.keys()];
        const data = [...typesOfCrop.values()];

        const svg = select(chartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleBand()
            .range([0, width])
            .padding(0.3)
            .domain(labels);

        const y = scaleLinear()
            .range([height, 0])
            .domain([0, Math.max(...data)]);

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
            .data(typesOfCrop)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .style("fill", "rgba(0, 226, 29, 0.28)")
            .style("stroke", "rgba(212, 225, 87)")
            .style("stroke-width", 1)
            .on("mouseover", (event, d) => {
                select(tooltip.current)
                    .style("opacity", 1)
                    .html(`Disease: ${d[0]}<br/>Value: ${d[1]}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })

            .on("mousemove", (event) => {
                select(tooltip.current)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {
                select(tooltip.current)
                    .style("opacity", 0);
            });

        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", margin.left + (width / 2))
            .attr("y", height + margin.top + 50)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Crop Type");

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

/*    const renderCropBarChart = () => {

        if (!cropBarChartContainer.current) return;

        const typesOfCrops = new Map();

        HarvestRecords.forEach((record) => {
            typesOfCrops.set(record.crop, (typesOfCrops.get(record.crop) || 0) + 1);
        });

        const labels1 = [...typesOfCrops.keys()];
        const data1 = [...typesOfCrops.values()];

        const svg = select(cropBarChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 10, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleBand()
            .range([0, width])
            .padding(0.5)
            .domain(labels1);

        const y = scaleLinear().range([height, 0]).domain([0, Math.max(...data1)]);

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
            .data(typesOfCrops)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .style("fill", "rgba(0, 226, 29, 0.28)")
            .style("stroke", "rgba(212, 225, 87)")
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

        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", margin.left + (width / 2))
            .attr("y", height + margin.top + 50)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Crop Type");

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

    const renderLineChart = () => {

        if (!lineChartContainer.current) return;

        if (HarvestRecords.length === 0) {
            return;
        }

        const accumulatedCounts = new Map();

        HarvestRecords.forEach((record) => {
            const date = record.date;
            if (!accumulatedCounts.has(date)) {
                accumulatedCounts.set(date, 0);
            }
            accumulatedCounts.set(date, accumulatedCounts.get(date) + 1);
        });

        const sortedDates = Array.from(accumulatedCounts.keys()).sort(
            (a, b) => new Date(a) - new Date(b)
        );
        const counts = sortedDates.map((date) => accumulatedCounts.get(date));

        const svg = select(lineChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleTime()
            .range([0, width])
            .domain([new Date(sortedDates[0]), new Date(sortedDates[sortedDates.length - 1])]);

        const y = scaleLinear().range([height, 0]).domain([0, Math.max(...counts)]);

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.selectAll("circle")
            .data(counts)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(sortedDates[i])))
            .attr("cy", (d) => y(d))
            .attr("r", 5)
            .attr("fill", "rgba(0, 226, 29, 0.28)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Value: ${d}`)
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
            .style("background-color", "rgba(0, 226, 29, 0.28")
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
            .attr("stroke", "rgba(0, 226, 29, 0.28)")
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

    };*/

    return (
        <div className=" overflow-x-auto  ">
            <div className="flex flex-row justify-between items-center px-8 py-4">
                <div>
                    <h1 className=" text-lg font-semibold text-left">
                        GRAPH VISUALIZATION
                    </h1>

                </div>
            </div>
            {HarvestRecords.length === 0 ? (
                <div className=" text-base font-semibold text-left px-8">
                    There is no data available to generate graphs.. <Link to="/diseases/records/addDisease" className=" text-lime-400"> Click here</Link>
                </div>
            ) : (
                <>
                    <div className="mx-auto px-8  w-fit border-2 rounded-xl border-green-400">
                        <h1 className=" mt-4 text-lg font-bold text-left flex justify-center items-center">
                        </h1>
                        <div className="  py-4 ">
                            <svg ref={chartContainer} width="800" height="400"></svg>
                        </div>
                    </div>
                    {/* <div className="mx-auto px-8 w-fit py-4 border-2 mt-6 rounded-xl border-green-400">
                        <h1 className="  text-lg font-bold text-left flex justify-center items-center">
                            Number of Diseased Plants V Time
                        </h1>
                        <div className=" w-2/3 h-1/4  py-4 ">
                            <svg ref={lineChartContainer} width="800" height="400"></svg>
                        </div>
                    </div>
                    <div className=" w-fit mx-auto px-8 py-4 border-2 mt-6 rounded-xl border-green-400">
                        <h1 className=" mb-2 text-lg font-bold text-left flex justify-center items-center">
                            Amount of Diseased Plants V Crop Type
                        </h1>
                        <div className=" w-2/3 h-1/4 py-4 ">
                            <svg ref={cropBarChartContainer} width="800" height="300"></svg>
                        </div>
                    </div>*/}
                </>
            )}
        </div>
    );
}
