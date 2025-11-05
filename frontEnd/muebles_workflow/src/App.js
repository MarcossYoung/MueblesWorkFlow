import {useContext} from 'react';
import React, {useState} from 'react';
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from 'react-router-dom';
import {UserContext} from './UserProvider';
import Register from './views/registro';
import Login from './views/login';
import ProductCreation from './views/productCreateForm';
import Profile from './views/profile';
import Products from './views/productsAll';
import ProductDetail from './views/productsDetail';
import ProductEdit from './views/productEditForm';
import AdminRoute from './AdminRoute';
import AdminPage from './views/adminPage';
import ProtectedRoute from './components/protectedRoute';
import Dashboard from './views/dashboard';
import OrdersDueThisWeek from './views/ordersDueThisWeek';
import OrdersNotPickedUp from './views/ordersNotPickedUp';
import OrdersPastDue from './views/ordersPastDue';
import Sidebar from './components/sidebar';
import {OrdersProvider} from './OrdersContext';

function App() {
	const {user, setUser} = useContext(UserContext);
	const [product, setProduct] = useState(null);

	return (
		<OrdersProvider>
			<Router>
				<Routes>
					{/* Public routes */}

					<Route
						path='/login'
						element={<Login setUser={setUser} />}
					/>

					{/* Protected routes */}
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute user={user}>
								<Sidebar />
								<Dashboard user={user} />
							</ProtectedRoute>
						}
					>
						<Route index element={<Products />} />
						<Route
							path='due-this-week'
							element={<OrdersDueThisWeek user={user} />}
						/>
						<Route
							path='not-picked-up'
							element={<OrdersNotPickedUp />}
						/>
						<Route path='late' element={<OrdersPastDue />} />
					</Route>
					<Route
						path='/products/create'
						element={
							<ProtectedRoute>
								<ProductCreation
									product={product}
									setProduct={setProduct}
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path='/profile/:id'
						element={
							<ProtectedRoute>
								<Sidebar />
								<Profile user={user} />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/products/:productId'
						element={
							<ProtectedRoute>
								<Sidebar />
								<ProductDetail product={product} />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/edit/:productId'
						element={
							<ProtectedRoute>
								<Sidebar />
								<ProductEdit />
							</ProtectedRoute>
						}
					/>

					{/* Admin-only route */}
					<Route
						path='/admin'
						element={
							<ProtectedRoute user={user}>
								<AdminRoute user={user}>
									<Sidebar />
									<AdminPage />
								</AdminRoute>
							</ProtectedRoute>
						}
					/>

					<Route path='/registro' element={<Register />} />

					{/* Catch-all redirect */}
					<Route
						path='/'
						element={<Navigate to='/dashboard' replace />}
					/>
					<Route
						path='*'
						element={<Navigate to='/dashboard' replace />}
					/>
				</Routes>
			</Router>
		</OrdersProvider>
	);
}

export default App;
