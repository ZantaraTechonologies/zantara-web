import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // State to manage loading
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true); // Show loader when submitting the form

        try {
            const res = await API.post('/login', { email, password });
            console.log('Response:', res);
            if (res.data?.token) {
                login(res.data.token);
                toast.success('Login successful!', {
                    position: 'top-center',
                });
                navigate('/dashboard'); // Redirect to dashboard or home page
            } else {
                setError('Login failed: No token received.');
                toast.error('Login failed: No token received.', {
                    position: 'top-center',
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
            toast.error(err.response?.data?.message || 'Login failed.', {
                position: 'top-center',
            });
        } finally {
            setIsLoading(false); // Hide loader after the request is complete
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar Component */}
            <Navbar />

            <div className="flex items-center justify-center bg-gray-100 flex-grow">
                <form onSubmit={handleSubmit} className="bg-white px-8 py-4 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

                    {/* Error Message */}
                    {error && (
                        <p className="mb-4 p-4 text-sm text-white bg-red-500 rounded-md shadow-md">
                            {error}
                        </p>
                    )}

                    {/* Email Field */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    {/* Password Field with Eye Toggle */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium mb-1 text-gray-600">Password</label>
                        <input
                            type={isPasswordVisible ? 'text' : 'password'} // Toggle between password and text type
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibility
                            className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500"
                        >
                            {isPasswordVisible ? (
                                <EyeOff />
                            ) : (
                                <Eye />
                            )}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={isLoading} // Disable button during loading
                    >
                        {isLoading ? (
                            <div className="flex justify-center">
                                <ClipLoader size={20} color="#fff" /> {/* Show loading spinner */}
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {/* Link to Register */}
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="text-blue-500 hover:underline">Register</a>
                    </p>
                </form>

                {/* Toast Container to display notifications */}
                <ToastContainer />
            </div>
            
            <Footer />
        </div>
    );
};

export default Login;