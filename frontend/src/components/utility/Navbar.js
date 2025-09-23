import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    ChartPieIcon,
    CursorArrowRaysIcon,
    FingerPrintIcon,
    XMarkIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon, UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/20/solid';
import {Link} from "react-router-dom";
import { safeFetch } from "../../apiClient";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { login, register, logout, user, isAuthenticated, isLoading, getToken } = useKindeAuth();
    const location = useLocation();
    const {getPermission, getPermissions} = useKindeAuth();

    // Kinde React SDK handles redirects via provider; no manual callback needed here

    const fetchData = async () => {
        try {
            const accessToken = await getToken();
            const res = await safeFetch(`${process.env.REACT_APP_KINDE_DOMAIN}/api`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { data } = await res.json();
            console.log({ data });
        } catch (err) {
            console.log(err);
        }
    };

    if (isLoading) {
        return <p>Loading</p>;
    }

    return (
        <header className="bg-white bg-opacity-70 backdrop-blur text-emerald-950 sticky top-0 w-screen z-50 shadow-md">
            <nav
                className="text-lg h-full mx-auto flex max-w-7xl items-center relative justify-between p-6 lg:px-8 py-2 gap-4">
                {/* Navbar content */}
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5">
                        <span className="text-2xl font-bold flex flex-row">ELEMAHANA <span
                            className="font-light text-base">&trade;</span></span>
                    </Link>
                </div>
                <Link to="/" className="nav-item">
                    <div
                        className="h-full font-medium px-6 rounded-full transition-all duration-200 hover:bg-lime-200">Home
                    </div>
                </Link>
                <Link to="/placeOrder" className="nav-item">
                    <div
                        className="h-full font-medium px-6 rounded-full transition-all duration-200 hover:bg-lime-200">Marketplace
                    </div>
                </Link>
                <Link to="/tourism" className="nav-item">
                    <div
                        className="h-full font-medium px-6 rounded-full transition-all duration-200 hover:bg-lime-200">Visit
                        Us
                    </div>
                </Link>


                        <Link to="/dashboard" className="nav-item">
                            <div className="h-full font-medium px-6 rounded-full transition-all duration-200 hover:bg-lime-200">
                                Dashboard
                            </div>
                        </Link>




                <div
                    className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 font-medium content-center items-center align-middle">
                    {isAuthenticated ? (
                        <>
                            <UserCircleIconSolid className="w-6 h-6"/>
                            <div className="text-xs text-gray-400">{user.email}</div>
                            <button onClick={logout}
                                    className="px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full text-black bg-red-200 hover:bg-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Logout
                            </button>

                        </>
                    ) : (
                        <>
                            <button onClick={register} type="button"
                                    className="px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full text-black bg-lime-200 transition-all duration-200  hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500">Register
                            </button>
                            <button onClick={() => login(
                                {
                                    authUrlParams: {login_hint: "john@exmail.com"},
                                    app_state: {
                                        redirectTo: location.state ? location.state?.from?.pathname : null
                                    }
                                }
                                )}
                                    type="button"
                                    className="px-3 py-1 border border-lime-500 text-sm leading-4 font-medium rounded-full text-black transition-all duration-200 hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500">Log
                                In
                            </button>
                            <UserCircleIcon className="w-6 h-6"/>
                        </>
                    )}
                </div>

            </nav>

        </header>
    );
}
