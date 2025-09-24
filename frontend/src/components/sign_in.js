export default function SignIn() {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google?prompt=select_account`;
};

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <button
          onClick={handleGoogleLogin}
          className="flex w-full justify-center rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500"
        >
          Sign in with Google
        </button>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <button
            onClick={handleGoogleLogin}
            className="font-semibold leading-6 text-red-600 hover:text-red-500"
          >
            Sign up with Google
          </button>
        </p>
      </div>
    </div>
  );
}
