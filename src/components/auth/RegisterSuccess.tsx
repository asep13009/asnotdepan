import { Link } from "react-router-dom";

export default function RegisterSuccess() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Registration Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been created successfully. You can now sign in. Confirm your Admin to Verify First...
        </p>
        <Link
          to="/signin"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
        >
          Go to Sign In
        </Link>    
         
        <Link
          to="/signup"
          className="px-4 py-2   text-black rounded-lg  transition dark:text-white mb-4"
        >
           or Sign Up Again...
        </Link>
      </div>
    </div>
  );
}