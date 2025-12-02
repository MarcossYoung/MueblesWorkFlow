// OrdersContext.jsx
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from 'react';
import axios from 'axios';
import {BASE_URL} from './api/config';

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({children}) => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Guards
	const didInitRef = useRef(false);
	const inFlightRef = useRef(false);

	// Read token once per call (don’t add token to deps to avoid refiring)
	const getAuthHeaders = () => {
		const token = localStorage.getItem('token');
		return token ? {Authorization: `Bearer ${token}`} : {};
	};

	// Fetch ALL orders (updates global state)
	const fetchAllOrders = useCallback(async () => {
		if (inFlightRef.current) return; // prevent overlapping
		inFlightRef.current = true;
		setLoading(true);
		setError(null);
		const res = await axios.get(`${BASE_URL}/api/products`, {
			headers: getAuthHeaders(),
		});
		try {
			const data = Array.isArray(res.data)``
				? res.data
				: res.data?.content || [];
			setOrders(data);
		} catch (err) {
			setError(err);
			console.error('fetchAllOrders error:', err, res);
		} finally {
			setLoading(false);
			inFlightRef.current = false;
		}
	}, []);

	// Fetch a subset (does NOT touch global orders)
	const fetchOrdersByRange = useCallback(async (endpoint) => {
		try {
			const res = await axios.get(`${BASE_URL}/api/products${endpoint}`, {
				headers: getAuthHeaders(),
			});
			const data = Array.isArray(res.data)
				? res.data
				: res.data?.content || [];
			return data;
		} catch (err) {
			console.error(`fetchOrdersByRange(${endpoint}) error:`, err);
			return [];
		}
	}, []);

	// Initial load ONCE (guarded against Strict Mode double effect)
	useEffect(() => {
		if (didInitRef.current) return;
		didInitRef.current = true;
		fetchAllOrders();
	}, [fetchAllOrders]);

	// Provide a STABLE context value (prevents children rerunning effects from changing function identities)
	const value = useMemo(
		() => ({
			orders,
			loading,
			error,
			fetchAllOrders,
			fetchOrdersByRange,

			setOrders, // expose only if you know what you’re doing
		}),
		[orders, loading, error, fetchAllOrders, fetchOrdersByRange]
	);

	return (
		<OrdersContext.Provider value={value}>
			{children}
		</OrdersContext.Provider>
	);
};
