import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {enqueueSnackbar, useSnackbar} from "notistack";
import {axisBottom, axisLeft, line, scaleLinear, scaleTime, select} from "d3";
import AddPrice from "./AddPrice";
import * as d3 from "d3-array";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import LoadingAnimation from "../utility/LoadingAnimation";
import LoadingMessage from "../utility/LoadingMessage";

export default function MarketPriceList() {

    const [MarketPriceRecords, setMarketPriceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {id} = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const priceChartContainer = useRef(null);
    const futurePricesChartContainer = useRef(null);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [currentPageHistorical, setCurrentPageHistorical] = useState(1);
    const [currentPagePredicted, setCurrentPagePredicted] = useState(1);
    const recordsPerPage = 400;
    const recordsPerPage1 = 365;
    const [futurePrices, setFuturePrices] = useState([]);
    const [futurePricesTF, setFuturePricesTF] = useState([]);
    const [generateClicked, setGenerateClicked] = useState(false);
    const [loadingPrediction, setLoadingPrediction] = useState(false);

    const handleFilterChange = (e) => {
        setSelectedFilter(e.target.value);   //update value to selected value
    };
    const handleGenerateClick = () => {
        setGenerateClicked(true);  //set status upon click
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get('http://localhost:5555/marketprice', {
                params: {
                    filter: selectedFilter // Pass the selected filter value(name)
                }
            })
            .then((response) => {
                const sortedData = response.data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setMarketPriceRecords(sortedData);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, [selectedFilter]);

    useEffect(() => {
        renderPriceChart();
        renderFuturePricesChart();
    }, [currentPageHistorical,currentPagePredicted, MarketPriceRecords, futurePrices, selectedFilter]);

    // Function to navigate to the next page of a paginated data set
    const nextPage = () => {
        // Calculate the total number of pages needed to display all records based on the records per page
        const totalPages = Math.ceil(MarketPriceRecords.length / recordsPerPage);

        // Check if there is a next page available to navigate to
        if (currentPageHistorical < totalPages) {
            // Increment the current page number to navigate to the next page
            setCurrentPageHistorical(currentPageHistorical + 1);
        }
    };

    const nextPage1 = () => {
        const totalPages = Math.ceil(futurePrices.length / recordsPerPage1);
        if(currentPagePredicted < totalPages) {
            setCurrentPagePredicted(currentPagePredicted + 1);
        }
    };

    //Function to navigate to previous page of a paginated data set
    const prevPage = () => {
        //check whether previous page is available
        if(currentPageHistorical > 1) {
            //decrement current page no to navigate to prev page
            setCurrentPageHistorical(currentPageHistorical - 1);
        }
    };

    const prevPage1 = () => {
        if(currentPagePredicted > 1) {
            setCurrentPagePredicted(currentPagePredicted - 1);
        }
    };

    const renderPriceChart = () => {

        if (!selectedFilter) {
            // If no filter is selected, return without rendering the graph
            return;
        }

        const filteredRecords = MarketPriceRecords.filter(record => {
            if (selectedFilter === "") {
                return true; // If no filter is selected, show all records
            } else {
                return record.name === selectedFilter; // Filter records based on selected type
            }
        });

        const startIndex = (currentPageHistorical - 1) * recordsPerPage; //calculate startindex to display current page
        const endIndex = Math.min(startIndex + recordsPerPage, filteredRecords.length); //calculate endindex to display
        // Extract the subset of records to be displayed on the current page
        const recordsToDisplay = filteredRecords.slice(startIndex, endIndex);
        const allMarketPriceRecords = [...filteredRecords];

        if (!priceChartContainer.current || recordsToDisplay.length === 0) return;

        if (MarketPriceRecords.length === 0) {
            return;
        }

        //sort data in ascending order
        const sortedDates = allMarketPriceRecords.slice(startIndex, endIndex).sort((a, b) => new Date(a.date) - new Date(b.date));

        const svg = select(priceChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        //x axis represents date
        const x = scaleTime()
            .range([0, width])
            .domain([new Date(sortedDates[0].date), new Date(sortedDates[recordsToDisplay.length - 1].date)]);

        //y axis represents prices
        const y = scaleLinear()
            .range([height, 0])
            .domain([0, Math.max(
                ...sortedDates.map(record => record.max_price),
                ...sortedDates.map(record => record.min_price)
                ) + 40]);

        const g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const lineGenerator = line()
            .x(record => x(new Date(record.date)))
            .y(record => y(record.price));

        g.selectAll(".min-price-circle")
            .data(sortedDates)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.min_price))
            .attr("r", 4)
            .attr("fill", "rgb(64, 64, 191)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Date: ${d.date}<br/>Price: ${d.min_price}`)
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

        g.selectAll(".max-price-circle")
            .data(sortedDates)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.max_price))
            .attr("r", 4)
            .attr("fill", "rgba(236, 19, 19)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Date: ${d.date}<br/>Price: ${d.max_price}`)
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
            .style("background-color", "rgb(79, 134, 224)")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("border", "1px solid black");

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x).ticks(5));

        //x axis label
        g.append("g")
            .attr("class", "axis axis--y")
            .call(axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price");

        //y axis label
        g.append("path")
            .datum(sortedDates)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator.y(record => y(record.max_price)));

        g.append("path")
            .datum(sortedDates)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineGenerator.y(record => y(record.min_price)));

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
            .text("Price");

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 40}, 5)`);

        legend.append("text")
            .attr("y", 10)
            .text("Max Price")
            .attr("fill", "red");

        legend.append("text")
            .attr("y", 30)
            .text("Min Price")
            .attr("fill", "blue");

    };

    const generatePrediction = () => {
        if (!selectedFilter || selectedFilter === "All Types" ) {
            // If no filter is selected, show an error message
            enqueueSnackbar('Please select a type to generate predictions!!!', { variant: 'error' });
            return;
        }
        setLoadingPrediction(true);
        axios
            .get('http://localhost:5555/generate_market_prices', {
                params: {
                    name: selectedFilter // Pass the selected filter value
                }
            })
            .then((response) => {
                const {futureMaxPrices, futureMinPrices, futureTensorFlowModel} = response.data;
                // Combine the future predicted prices into a single array
                const combinedFuturePrices = futureMaxPrices.map((maxPrice, index) => ({
                    date: maxPrice.date,
                    predictedMinPrice: futureMinPrices[index].price,
                    predictedMaxPrice: maxPrice.price,
                    tensorFlowMinPrice: futureTensorFlowModel[index].minPrice,
                    tensorFlowMaxPrice: futureTensorFlowModel[index].maxPrice
                }));
                setFuturePrices(combinedFuturePrices);  //Set the combined future prices state variable
                console.log(futurePrices.length);
                enqueueSnackbar('Predictions generated successfully', { variant: 'success' });
            })
            .catch((error) => {
                console.log(error);
                enqueueSnackbar('Error generating future market prices', {variant: 'error'});
            })
            .finally(() => {
                setLoadingPrediction(false);
            })
    }

    const renderFuturePricesChart = () => {

        if (!futurePricesChartContainer.current || futurePrices.length === 0) return;

        const startIndex = (currentPagePredicted - 1) * recordsPerPage1;  //calculating start index of displaying page
        const endIndex = Math.min(startIndex + recordsPerPage1, futurePrices.length); //calculating end index
        //extract subset of prices to display
        const futurePricesToDisplay = futurePrices.slice(startIndex, endIndex);

        const svg = select(futurePricesChartContainer.current);

        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const width = svg.attr("width") - margin.left - margin.right;
        const height = svg.attr("height") - margin.top - margin.bottom;

        //x axis represents future dates
        const x = scaleTime()
            .range([0, width])
            .domain(d3.extent(futurePricesToDisplay, d => new Date(d.date)));

        //y-axis represents future prices
        const y = scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(futurePricesToDisplay, d => Math.max(d.predictedMaxPrice, d.predictedMinPrice, d.tensorFlowMaxPrice, d.tensorFlowMinPrice)) + 30]);

        //max from linear reg
        const lineMax = line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.predictedMaxPrice));

        //min from lin reg
        const lineMin = line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.predictedMinPrice));

        //max from tensorflow
        const lineMax1 = line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.tensorFlowMaxPrice));

        //min from tensorflow
        const lineMin1 = line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.tensorFlowMinPrice));

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

       /* g.selectAll(".min-price-circle")
            .data(futurePricesToDisplay)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.predictedMinPrice))
            .attr("r", 3)
            .attr("fill", "rgb(64, 64, 191)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Date: ${d.date}<br/>Price: ${d.predictedMinPrice}`)
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

        g.selectAll(".max-price-circle")
            .data(futurePricesToDisplay)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.predictedMaxPrice))
            .attr("r", 3)
            .attr("fill", "rgba(236, 19, 19)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Date: ${d.date}<br/>Price: ${d.predictedMaxPrice}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mousemove", (event) => {

                tooltip.style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {

                tooltip.style("opacity", 0);
            });*/

        const tooltip = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "rgb(79, 134, 224)")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("border", "1px solid black");
        const tooltip1 = select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background-color", "rgba(255, 63, 63, 1)")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("border", "1px solid black");

        g.selectAll(".min-price-circle1")
            .data(futurePricesToDisplay)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.tensorFlowMinPrice))
            .attr("r", 3)
            .attr("fill", "rgb(64, 64, 191)")
            .on("mouseover", (event, d, i) => {

                tooltip.style("opacity", 1);
                tooltip.html(`Date: ${d.date}<br/>Price: ${d.tensorFlowMinPrice}`)
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

        g.selectAll(".max-price-circle1")
            .data(futurePricesToDisplay)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(new Date(d.date)))
            .attr("cy", (d) => y(d.tensorFlowMaxPrice))
            .attr("r", 3)
            .attr("fill", "rgba(236, 19, 19)")
            .on("mouseover", (event, d, i) => {

                tooltip1.style("opacity", 1);
                tooltip1.html(`Date: ${d.date}<br/>Price: ${d.tensorFlowMaxPrice}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mousemove", (event) => {

                tooltip1.style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {

                tooltip1.style("opacity", 0);
            });


       /* g.append("path")
            .datum(futurePricesToDisplay)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line max-price")
            .attr("d", lineMax);

        g.append("path")
            .datum(futurePricesToDisplay)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line min-price")
            .attr("d", lineMin);*/

        g.append("path")
            .datum(futurePricesToDisplay)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line min-price1")
            .attr("d", lineMin1);

        g.append("path")
            .datum(futurePricesToDisplay)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line max-price1")
            .attr("d", lineMax1);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(axisBottom(x));

        g.append("g")
            .call(axisLeft(y));

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Price");

        g.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Time");

        const legend1 = svg.append("g")
            .attr("transform", `translate(${width - 40}, 5)`);

        legend1.append("text")
            .attr("y", 10)
            .text("Max Price")
            .attr("fill", "red");

        legend1.append("text")
            .attr("y", 30)
            .text("Min Price")
            .attr("fill", "blue");

    };

    const fruitTypes = [...new Set(MarketPriceRecords.map(record => record.name))];

    return (
        <div>
            <div className=" overflow-x-auto  ">
                        <div className="flex flex-row justify-between items-center px-8 mt-1 mb-4">
                            <div>
                                <h1 className=" text-lg font-semibold text-left">MARKET PRICES</h1>
                            </div>
                        </div>
                        <div>
                            <AddPrice/>
                        </div>
                        {loadingPrediction ? ( // Conditionally render the loading spinner
                            <>
                                <LoadingMessage/>
                            </>
                        ) : (
                            <>

                        <div className=" flex flex-wrap items-center justify-center mt-4 mb-4">
                            <div className="mr-2">
                                <button
                                    onClick={() => {
                                        generatePrediction();
                                        handleGenerateClick();
                                    }}
                                    className=" className='mx-auto rounded-md bg-lime-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    Generate Prices
                                </button>
                            </div>
                            <div className="ml-2 w-auto">
                                <select
                                    value={selectedFilter}
                                    onChange={handleFilterChange}
                                    className="rounded-full px-auto py-1 w-auto">
                                    <option value="All Types">All Types</option>
                                    {fruitTypes.map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                        </div>
                        {generateClicked && futurePrices.length > 0 && (
                            <>
                                <div className=" flex flex-wrap items-center justify-center mb-3 mt-3">
                                    <h4 className=" text-lg font-semibold text-center">PREDICTED PRICES</h4>
                                </div>
                                <div
                                    className="bg-green-100 border-2 border-blue-600 px-2 py-2 mr-2 ml-2 rounded-lg mb-4">
                                    <h2 className="text-center text-lg font-semibold">{selectedFilter}</h2>
                                    <svg ref={futurePricesChartContainer} width="1200" height="400"></svg>
                                </div>
                                <div className="flex justify-center mt-4 mb-3">
                                    <button onClick={prevPage1}
                                            className="mr-2 px-3 py-2 font-medium bg-lime-300 hover:bg-lime-400 rounded-md">
                                        <FaArrowLeft/>
                                    </button>
                                    <button onClick={nextPage1}
                                            className="mr-2 px-3 py-2 font-medium bg-lime-300 hover:bg-lime-400 rounded-md">
                                        <FaArrowRight/>
                                    </button>
                                </div>
                            </>
                        )}
                        {selectedFilter && (
                            <>
                                <div className=" flex flex-wrap items-center justify-center mb-3 mt-3">
                                    <h4 className=" text-lg font-semibold text-center">HISTORICAL PRICES</h4>
                                </div>
                                <div className="bg-green-100 border-2 border-blue-600 px-2 py-2 mr-2 ml-2 rounded-lg">
                                    <h2 className="text-center text-lg font-semibold">{selectedFilter}</h2>
                                    <svg ref={priceChartContainer} width="1200" height="400"></svg>
                                </div>
                                <div className="flex justify-center mt-4 mb-3">
                                    <button onClick={prevPage}
                                            className="mr-2 px-3 py-2 font-medium bg-lime-300 hover:bg-lime-400 rounded-md">
                                        <FaArrowLeft/>
                                    </button>
                                    <button onClick={nextPage}
                                            className="mr-2 px-3 py-2 font-medium bg-lime-300 hover:bg-lime-400 rounded-md">
                                        <FaArrowRight/>
                                    </button>
                                </div>
                            </>
                        )}
                            </>
                        )}
                    </div>
        </div>

    )
}
