import React, {useState, useContext, Suspense, lazy} from 'react';
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from 'react-router-dom';
import {UserContext} from './UserProvider';
import {OrdersProvider} from './OrdersContext';
import Loader from './loader';

// Keep these static because they are wrappers/layouts used immediately
import Sidebar from './components/sidebar';
import ProtectedRoute from './components/protectedRoute';
import AdminRoute from './AdminRoute';
import RoleRoute from './RoleRoute';
import './css/styles.css';

// --- LAZY LOADED VIEWS ---
const Login = lazy(() => import('./views/login'));
const Register = lazy(() => import('./views/registro'));
const Dashboard = lazy(() => import('./views/dashboard'));
const Products = lazy(() => import('./views/productsAll')); // Was 'productsAll'
const ProductDetail = lazy(() => import('./views/productsDetail'));
const ProductEdit = lazy(() => import('./views/productEditForm'));
const Profile = lazy(() => import('./views/profile'));
const AdminPage = lazy(() => import('./views/adminPage'));
const OrdersDueThisWeek = lazy(() => import('./views/ordersDueThisWeek'));
const OrdersNotPickedUp = lazy(() => import('./views/ordersNotPickedUp'));
const OrdersPastDue = lazy(() => import('./views/ordersPastDue'));
const Finances = lazy(() => import('./views/finances'));
const CostsManager = lazy(() => import('./views/CostsManager'));

// Simple Loading Spinner Component

function App() {
	const {user, setUser} = useContext(UserContext);
	// Keeping this state as it was in your original file, though it seems unused by the views
	const [product] = useState(null);

	return (
		<OrdersProvider>
			<Router>
				<Suspense fallback={<Loader />}>
					<Routes>
						{/* Public Routes */}
						<Route
							path='/login'
							element={<Login setUser={setUser} />}
						/>
						<Route path='/registro' element={<Register />} />

						{/* --- PROTECTED DASHBOARD LAYOUT --- */}
						<Route
							path='/dashboard'
							element={
								<ProtectedRoute user={user}>
									<Sidebar />
									{/* Pass user prop as your original code did */}
									<Dashboard user={user} />
								</ProtectedRoute>
							}
						>
							{/* Nested Routes inside Dashboard */}
							<Route
								path='due-this-week'
								element={
									<RoleRoute
										user={user}
										allowedRoles={[
											'USER',
											'SELLER',
											'ADMIN',
										]}
									>
										<OrdersDueThisWeek user={user} />
									</RoleRoute>
								}
							/>

							{/* SELLER + ADMIN Views */}
							<Route
								index
								element={
									<RoleRoute
										user={user}
										allowedRoles={['SELLER', 'ADMIN']}
									>
										<Products />
									</RoleRoute>
								}
							/>
							<Route
								path='not-picked-up'
								element={
									<RoleRoute
										user={user}
										allowedRoles={['SELLER', 'ADMIN']}
									>
										<OrdersNotPickedUp />
									</RoleRoute>
								}
							/>
							<Route
								path='late'
								element={
									<RoleRoute
										user={user}
										allowedRoles={['SELLER', 'ADMIN']}
									>
										<OrdersPastDue />
									</RoleRoute>
								}
							/>
						</Route>

						{/* --- OTHER PROTECTED PAGES --- */}
						<Route
							path='/finance'
							element={
								<RoleRoute
									user={user}
									allowedRoles={['SELLER', 'ADMIN']}
								>
									<Sidebar />
									<div className='main-content'>
										<Finances />
									</div>
								</RoleRoute>
							}
						/>
						<Route
							path='/costs'
							element={
								<RoleRoute
									user={user}
									allowedRoles={['SELLER', 'ADMIN']}
								>
									<Sidebar />
									<div className='main-content'>
										<CostsManager />
									</div>
								</RoleRoute>
							}
						/>

						<Route
							path='/profile/:id'
							element={
								<ProtectedRoute user={user}>
									<Sidebar />
									<Profile user={user} />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/products/:productId'
							element={
								<ProtectedRoute user={user}>
									<Sidebar />
									<ProductDetail product={product} />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/edit/:productId'
							element={
								<ProtectedRoute user={user}>
									<Sidebar />
									<ProductEdit product={product} />
								</ProtectedRoute>
							}
						/>

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

						{/* Redirects */}
						<Route
							path='/'
							element={<Navigate to='/dashboard' replace />}
						/>
						<Route
							path='*'
							element={<Navigate to='/dashboard' replace />}
						/>
					</Routes>
				</Suspense>
			</Router>
		</OrdersProvider>
	);
}

export default App;
