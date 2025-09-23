import React, { useState } from "react";
import { safeFetch } from "../../apiClient";
import { Link, useNavigate } from "react-router-dom";
import { SlActionUndo } from "react-icons/sl";

const FeedbackForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(0); // Initial rating
    const navigate = useNavigate();

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await safeFetch(`${process.env.REACT_APP_API_BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    feedback,
                    rating,
                }),
            });
            // safeFetch throws on non-OK; response here is OK
            // Reset form fields after successful submission
            setName("");
            setEmail("");
            setFeedback("");
            setRating(0);
            // Navigate to the feedback list page
            navigate("/feedbacklist");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            // Handle error (e.g., display error message to user)
        }
    };

    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="bg-gradient-to-r from-lime-200 to-white text-black flex justify-center items-center">
                <p className="text-3xl font-bold px-5 text-center">
                    Your feedback helps us provide you with the best possible experience. We value your input and use it
                    to continually improve our services.<br/> Thank you for taking the time to share your thoughts with us!
                </p>
            </div>
            <div className="flex justify-center items-center">
                <form onSubmit={handleSubmit} className="max-w-md w-full">
                    <h1 className="text-3xl font-semibold mb-4 text-center">Give Us Your Feedback</h1>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-600">
                            Feedback
                        </label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mt-1 p-2 w-full border rounded-md"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600">Rating</label>
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((number) => (
                                <label key={number} className="inline-flex items-center mr-4">
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={number}
                                        checked={rating === number}
                                        onChange={() => handleRatingChange(number)}
                                        className="form-radio text-blue-500"
                                    />
                                    <span className="ml-2">{number}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mb-3 mt-8 flex justify-center">
                        <button
                            type="submit"
                            className="bg-black text-white p-2 rounded-md w-full hover:bg-emerald-700"
                        >
                            Submit Feedback
                        </button>
                    </div>
                    <p className="mt-4 text-lg flex items-center">
                        <Link to="/tourism" className="text-black flex items-center">
                            <SlActionUndo className="mr-2"/> Go back
                        </Link>
                    </p>
                </form>

            </div>
        </div>

    );
};

export default FeedbackForm;
