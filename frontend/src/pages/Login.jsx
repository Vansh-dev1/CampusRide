import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        <div className="mb-8 text-center">
          <div className="flex justify-center text-4xl">
            🚗
          </div>
          <h2 className="mt-3 text-2xl font-bold text-teal-700">CampusRide</h2>
          <h3 className="mt-1 text-xl font-bold text-slate-800">Welcome Back!</h3>
          <p className="mt-1 text-sm text-slate-500">
            Login to continue sharing rides
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-teal-900">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="your.username@adit.ac.in"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-teal-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-800">
            Sign up here
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm font-medium text-teal-600 hover:text-teal-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}