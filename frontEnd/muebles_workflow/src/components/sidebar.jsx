// src/components/Sidebar.jsx
import {NavLink} from 'react-router-dom';
import React, {useContext} from 'react';
import {UserContext} from '../UserProvider';

export default function Sidebar() {
	const linkClass = ({isActive}) =>
		`block p-2 rounded ${isActive ? 'bg-amber-200 font-bold' : ''}`;

	const {user} = useContext(UserContext);
	const isAdmin = user?.role === 'ADMIN';

	return (
		<aside className='sidebar bg-gray-100 p-4 justifyContent'>
			<div>
				<NavLink to='/dashboard' end className={linkClass}>
					Todos los pedidos
				</NavLink>

				<NavLink to='due-this-week' className={linkClass}>
					Entregas esta semana
				</NavLink>

				<NavLink to='late' className={linkClass}>
					Atrasados
				</NavLink>

				<NavLink to='not-picked-up' className={linkClass}>
					No retirados
				</NavLink>
			</div>

			{isAdmin && (
				<NavLink className={linkClass} to='/admin'>
					Panel Admin
				</NavLink>
			)}

			<div>
				<NavLink to={`/profile/${user.id}`}>Perfil</NavLink>
			</div>
		</aside>
	);
}
