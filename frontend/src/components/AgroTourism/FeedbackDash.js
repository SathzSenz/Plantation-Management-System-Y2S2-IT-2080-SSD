import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { select, scaleBand, scaleLinear, axisBottom, axisLeft } from "d3";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BsDownload } from "react-icons/bs";
export default function FeedbackDashboard() {
    const [feedbackData, setFeedbackData] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartContainer = useRef(null);
    const tooltipRef = useRef(null);
    const totalFeedbacksRef = useRef(null);
    const avgRatingRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get("http://localhost:5555/feedback")
            .then((response) => {
                setFeedbackData(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        renderBarChart();
    }, [feedbackData]);

    const renderBarChart = () => {
        if (!chartContainer.current || feedbackData.length === 0) return;

        const ratingsCount = new Map();

        feedbackData.forEach((feedback) => {
            const rating = feedback.rating;
            ratingsCount.set(
                rating,
                (ratingsCount.get(rating) || 0) + 1
            );
        });

        const labels = [...ratingsCount.keys()];
        const data = [...ratingsCount.values()];

        const svg = select(chartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 80 }; // Increased left margin
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

        g.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 20)
            .text("Rating");

        g.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20) // Adjusted position
            .attr("x", -height / 2)
            .text("Number of Ratings");

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
            .text("Number of Ratings");

        const bars = g.selectAll(".bar")
            .data(ratingsCount)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .style("fill", "#cbff58")
            .on("mouseover", (event, d) => {
                const [rating, count] = d;
                const tooltip = select(tooltipRef.current);
                tooltip.style("visibility", "visible")
                    .html(`Rating: ${rating}<br/>Number of Feedbacks: ${count}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => {
                const tooltip = select(tooltipRef.current);
                tooltip.style("visibility", "hidden");
            });

        const totalFeedbacks = feedbackData.length;
        select(totalFeedbacksRef.current)
            .text(`Total Feedbacks: ${totalFeedbacks}`)
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .attr("x", width / 2)
            .attr("y", 0);

        // Calculate average rating
        const totalRating = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0);
        const avgRating = totalRating / totalFeedbacks;
        select(avgRatingRef.current)
            .text(`Average Rating: ${avgRating.toFixed(2)}`)
            .style("font-weight", "bold")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .attr("x", width / 2)
            .attr("y", 40); // Adjust the y position
    };
    const [feedbackString, setFeedbackString] = useState('');

    const handleGeneratePDF = () => {
        const ratingsCount = new Map();
        const rowCount = feedbackData.length
        feedbackData.forEach((feedback) => {
            const rating = feedback.rating;
            ratingsCount.set(
                rating,
                (ratingsCount.get(rating) || 0) + 1
            );
        });

        let dataString = `Total number of Ratings: ${rowCount}

`;

        ratingsCount.forEach((count, rating) => {
            dataString += `Rating: ${rating}, Number of Ratings: ${count}\n`;
        });

        const currentDate = new Date().toLocaleString('en-GB');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add Title
        pdf.setFontSize(20);
        pdf.text('Feedback and Rating Analysis', pdf.internal.pageSize.getWidth() / 2, 10, 'center');

        // Add the ratings data
        pdf.setFontSize(12);
        pdf.text(dataString, 10, 30);

        // Add the "Latest Feedbacks" topic
        pdf.setFontSize(12);
        pdf.text('Latest Feedbacks', 10, 73);

        // Add the feedback data as a table
        const headers = ['No', 'Name', 'Email', 'Feedback', 'Rating'];
        const data = feedbackData.slice(-10).map((feedback, index) => [
            index + 1,
            feedback.name || '', // Add fallback value if name is undefined
            feedback.email,
            feedback.feedback || '', // Add fallback value if feedback is undefined
            feedback.rating,
        ]);

        pdf.autoTable({
            head: [headers],
            body: data,
            startY: 80, // Adjust start Y position if needed
            theme: 'grid', // Add grid theme for table borders
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'left' },
                2: { halign: 'left' },
                3: { halign: 'left' },
                4: { halign: 'center' },
            },
        });

        pdf.save(`feedback-analysis_${currentDate}.pdf`);
    };



    return (
        <div className="flex flex-col items-end">
            <div className="overflow-x-auto">
                <div className="flex flex-row justify-between items-center px-8 py-4"> {/* Changed justify-center to justify-between */}
                    <div className="text-center">
                        <h1 className="text-4xl font-semibold">
                            Feedbacks
                        </h1>
                        <p className="mt-1 text-s font-normal text-black">
                            Visualization of Ratings
                        </p>
                    </div>
                    <button
                        onClick={handleGeneratePDF}
                        className="bg-black text-white px-3 py-1 rounded-full hover:bg-emerald-700 focus:outline-none ml-2 flex items-center"
                    >
                        Generate PDF<BsDownload style={{ marginLeft: '10px' }} />
                    </button>

                </div>


            <div className="grid grid-cols-2 gap-4">
                <div className="bg-lime-200 rounded-lg p-4 mb-4">
                    <div className="text-center text-black font-semibold " ref={totalFeedbacksRef}></div>
                </div>
                <div className="bg-lime-200 rounded-lg p-4 mb-4">
                        <div className="text-center text-black font-semibold " ref={avgRatingRef}></div>
                    </div>
                </div>


                {loading ? (
                    <div>Loading...</div>
                ) : feedbackData.length === 0 ? (
                    <div className="text-base font-semibold text-left px-8">
                        No feedback data available.
                    </div>
                ) : (
                    <div className="mx-auto px-8 w-fit border-2 rounded-xl border-gray-400">
                        <div className="py-4">
                            <svg ref={chartContainer} width="800" height="400"></svg>
                        </div>
                    </div>
                )}
                <div ref={tooltipRef} className="tooltip" style={{
                    visibility: "hidden",
                    position: "absolute",
                    backgroundColor: "white",
                    border: "1px solid black",
                    padding: "5px",
                    borderRadius: "5px"
                }}></div>
                <div><br/></div>
            </div>
        </div>
    );
}
