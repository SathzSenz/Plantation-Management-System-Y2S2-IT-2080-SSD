import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { safeFetch } from "../../apiClient";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user from backend (if JWT cookie exists)
    const fetchUser = async () => {
        try {
            const res = await safeFetch(`${process.env.REACT_APP_API_BASE_URL}/auth/me`, {
                credentials: 'include', // send cookie
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error(err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    fetchUser(); // always fetch user on mount
}, []);


    const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google?prompt=select_account`;
};

    const handleLogout = async () => {
    try {
        await safeFetch(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);

        // Force Google logout (redirect to Google's logout page)
        window.location.href = 'https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000';
    } catch (err) {
        console.error(err);
    }
};


    if (loading) return <p>Loading...</p>;

    return (
        <header className="bg-white bg-opacity-70 backdrop-blur text-emerald-950 sticky top-0 w-screen z-50 shadow-md">
            <nav className="text-lg h-full mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 py-2 gap-4">
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5">
                        <span className="text-2xl font-bold flex flex-row">ELEMAHANA <span className="font-light text-base">&trade;</span></span>
                    </Link>
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">
                    {user ? (
                        <>
                            <div className="text-sm font-medium">{user.name || user.email}</div>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 border border-transparent text-sm font-medium rounded-full text-black bg-red-200 hover:bg-red-400 transition-all duration-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleGoogleLogin}
                            className="px-3 py-1 border border-transparent text-sm font-medium rounded-full text-black bg-lime-500 hover:bg-lime-600 transition-all duration-200"
                        >
                            Login
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}
