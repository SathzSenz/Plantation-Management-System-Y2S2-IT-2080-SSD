import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { extent, max } from 'd3-array';

export default function ProfitGraph() {
    const [transactionRecords, setTransactionRecords] = useState([]);
    const svgRef = useRef();

    useEffect(() => {
        axios.get("http://localhost:5555/transactions")
            .then((response) => {
                const records = response.data.data;
                // Calculate profit for each period
                const profits = records.reduce((acc, record) => {
                    const date = record.date.split("T")[0]; // Simplify date to YYYY-MM-DD if not already
                    if (!acc[date]) {
                        acc[date] = 0; // Initialize if not exist
                    }
                    if (record.type === 'income') {
                        acc[date] += record.amount;
                    } else if (record.type === 'expense') {
                        acc[date] -= record.amount;
                    }
                    return acc;
                }, {});

                // Transform profits object to array and sort by date
                const profitArray = Object.keys(profits).map(date => ({
                    date: new Date(date), // Ensure dates are in Date format for sorting
                    profit: profits[date],
                })).sort((a, b) => a.date - b.date); // Sort by date in ascending order

                setTransactionRecords(profitArray);
            })
            .catch((error) => {
                console.error("Failed to fetch transactions:", error);
            });
    }, []);

    useEffect(() => {
        if (!transactionRecords.length) return;

        const svg = select(svgRef.current);
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        const x = scaleTime()
            .domain(extent(transactionRecords, d => d.date))
            .range([margin.left, width + margin.left]);

        const y = scaleLinear()
            .domain([0, max(transactionRecords, d => d.profit)])
            .range([height + margin.top, margin.top])
            .nice();

        const xAxis = axisBottom(x);
        const yAxis = axisLeft(y);

        svg.selectAll("*").remove();

        svg.append("g")
            .attr("transform", `translate(0,${height + margin.top})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis);

        const lineGenerator = line()
            .x(d => x(d.date))
            .y(d => y(d.profit));

        svg.append("path")
            .datum(transactionRecords)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

    }, [transactionRecords]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
            <h2 className="text-lg font-semibold">Profit Over Time</h2>
            <svg ref={svgRef} width={600} height={400}></svg>
        </div>
    );
}
