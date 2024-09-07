import { useState } from "react";

// cb = callback function
const useFetch = (cb, options = null) => {
  const [data, setData] = useState(null); // Initialize as null or [] based on your use case
  const [loading, setLoading] = useState(false); // Set loading as false initially
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(options, ...args); // Pass options as the first argument to cb
      setData(response); // Set the response data
    } catch (err) {
      setError(err); // Catch and set any error that occurs
    } finally {
      setLoading(false); // Ensure loading is set to false after completion
    }
  };

  return { data, loading, error, fn }; // Return states and the fetch function
};

export default useFetch;
