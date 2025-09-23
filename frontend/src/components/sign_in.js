import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export default function SignIn() {
    const { login, register } = useKindeAuth();

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <button
                    onClick={() => login()}
                    className="flex w-full justify-center rounded-full bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-500"
                >
                    Sign in with Kinde
                </button>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Not a member?{" "}
                    <button
                        onClick={() => register()}
                        className="font-semibold leading-6 text-lime-600 hover:text-lime-500"
                    >
                        Register Now
                    </button>
                </p>
            </div>
        </div>
    );
}
