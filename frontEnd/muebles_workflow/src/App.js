import React, {Suspense, lazy} from 'react'; //
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import UserProvider from './UserProvider';
import {OrdersProvider} from './OrdersContext';
import ProtectedRoute from './components/protectedRoute';
import AdminRoute from './AdminRoute';
import './css/styles.css';
import './css/utils.css';
import './css/boxes.css';
import Loader from './loader';

// 1. Lazy Load your Views
// Instead of import Dashboard from './views/dashboard';
const Login = lazy(() => import('./views/login'));
const Dashboard = lazy(() => import('./views/dashboard'));
const ProductsAll = lazy(() => import('./views/productsAll'));
const ProductCreateForm = lazy(() => import('./views/productCreateForm'));
const ProductEditForm = lazy(() => import('./views/productEditForm'));
const ProductsDetail = lazy(() => import('./views/productsDetail'));
const OrdersDueThisWeek = lazy(() => import('./views/ordersDueThisWeek'));
const OrdersPastDue = lazy(() => import('./views/ordersPastDue'));
const OrdersNotPickedUp = lazy(() => import('./views/ordersNotPickedUp'));
const Registro = lazy(() => import('./views/registro'));
const AdminPage = lazy(() => import('./views/adminPage'));
const Profile = lazy(() => import('./views/profile'));
const CostsManager = lazy(() => import('./views/CostsManager'));
const Finance = lazy(() => import('./views/finances')); // Assuming you added this recently

function App() {
	return (
		<UserProvider>
			<OrdersProvider>
				<Router>
					{/* 2. Wrap Routes in Suspense */}
					{/* The 'fallback' is what the user sees while the chunk is downloading */}
					<Suspense fallback={<Loader />}>
						<Routes>
							{/* Public Routes */}
							<Route path='/login' element={<Login />} />
							<Route path='/register' element={<Registro />} />

							{/* Protected Routes */}
							<Route element={<ProtectedRoute />}>
								<Route
									path='/'
									element={
										<Navigate to='/dashboard' replace />
									}
								/>
								<Route
									path='/dashboard'
									element={<Dashboard />}
								/>
								<Route
									path='/products'
									element={<ProductsAll />}
								/>
								<Route
									path='/products/new'
									element={<ProductCreateForm />}
								/>
								<Route
									path='/products/:id'
									element={<ProductsDetail />}
								/>
								<Route
									path='/products/:id/edit'
									element={<ProductEditForm />}
								/>
								<Route
									path='/orders/week'
									element={<OrdersDueThisWeek />}
								/>
								<Route
									path='/orders/past-due'
									element={<OrdersPastDue />}
								/>
								<Route
									path='/orders/not-picked-up'
									element={<OrdersNotPickedUp />}
								/>
								<Route path='/profile' element={<Profile />} />

								{/* Admin/Role Specific Routes */}
								<Route element={<AdminRoute />}>
									<Route
										path='/admin'
										element={<AdminPage />}
									/>
									<Route
										path='/costs'
										element={<CostsManager />}
									/>

									<Route
										path='/finance'
										element={<Finance />}
									/>
								</Route>
							</Route>

							{/* Catch all */}
							<Route
								path='*'
								element={<Navigate to='/login' replace />}
							/>
						</Routes>
					</Suspense>
				</Router>
			</OrdersProvider>
		</UserProvider>
	);
}

export default App;
