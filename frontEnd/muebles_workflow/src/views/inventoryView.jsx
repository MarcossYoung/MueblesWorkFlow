import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserProvider';
import { BASE_URL } from '../api/config';

const UNITS = ['KG', 'M2', 'M', 'UNITS', 'LITERS', 'OTHER'];

const emptyForm = { name: '', unit: 'UNITS', quantityInStock: '', unitCost: '', minStock: '' };

export default function InventoryView() {
    const { user } = useContext(UserContext);
    const isAdmin = user?.role === 'ADMIN';
    const token = user?.token || localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [items, setItems] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const params = { page, size: 20 };
            if (search) params.name = search;
            const [itemsRes, lowRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/inventory`, { params, headers }),
                axios.get(`${BASE_URL}/api/inventory/low-stock`, { headers }),
            ]);
            setItems(itemsRes.data.content);
            setTotalPages(itemsRes.data.totalPages);
            setLowStock(lowRes.data);
        } catch (err) {
            console.error('Error loading inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, search]);

    const openCreate = () => {
        setEditItem(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            name: item.name,
            unit: item.unit,
            quantityInStock: item.quantityInStock,
            unitCost: item.unitCost,
            minStock: item.minStock,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editItem) {
                await axios.put(`${BASE_URL}/api/inventory/${editItem.id}`, form, { headers });
            } else {
                await axios.post(`${BASE_URL}/api/inventory`, form, { headers });
            }
            setShowModal(false);
            load();
        } catch (err) {
            console.error('Error saving item:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este material?')) return;
        try {
            await axios.delete(`${BASE_URL}/api/inventory/${id}`, { headers });
            load();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const fmt = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

    if (loading) return <div style={{ padding: '25px' }}>Cargando inventario...</div>;

    return (
        <div style={{ padding: '25px', backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2d3436' }}>Inventario de Materiales</h2>
                {isAdmin && (
                    <button onClick={openCreate} style={btnStyle('#00b894')}>+ Agregar Material</button>
                )}
            </div>

            {lowStock.length > 0 && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
                    <strong>Stock bajo:</strong> {lowStock.map(i => i.name).join(', ')}
                </div>
            )}

            <input
                placeholder='Buscar por nombre...'
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #dfe6e9', width: '300px', marginBottom: '20px' }}
            />

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            {['Nombre', 'Unidad', 'Stock', 'Stock Mín.', 'Costo Unit.', 'Valor Total', 'Estado', isAdmin ? 'Acciones' : ''].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                <td style={tdStyle}>{item.name}</td>
                                <td style={tdStyle}>{item.unit}</td>
                                <td style={{ ...tdStyle, color: item.isLowStock ? '#e17055' : '#2d3436', fontWeight: item.isLowStock ? '600' : 'normal' }}>
                                    {fmt(item.quantityInStock)}
                                </td>
                                <td style={tdStyle}>{fmt(item.minStock)}</td>
                                <td style={tdStyle}>${fmt(item.unitCost)}</td>
                                <td style={tdStyle}>${fmt(item.totalValue)}</td>
                                <td style={tdStyle}>
                                    {item.isLowStock
                                        ? <span style={badgeStyle('#e17055')}>Stock bajo</span>
                                        : <span style={badgeStyle('#00b894')}>OK</span>
                                    }
                                </td>
                                {isAdmin && (
                                    <td style={tdStyle}>
                                        <button onClick={() => openEdit(item)} style={{ ...btnStyle('#0984e3'), marginRight: '6px', padding: '4px 10px', fontSize: '12px' }}>Editar</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ ...btnStyle('#d63031'), padding: '4px 10px', fontSize: '12px' }}>Eliminar</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan={isAdmin ? 8 : 7} style={{ ...tdStyle, textAlign: 'center', color: '#b2bec3' }}>Sin materiales</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={btnStyle('#636e72')}>Anterior</button>
                    <span style={{ padding: '8px' }}>{page + 1} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={btnStyle('#636e72')}>Siguiente</button>
                </div>
            )}

            {showModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0 }}>{editItem ? 'Editar Material' : 'Nuevo Material'}</h3>
                        <label style={labelStyle}>Nombre</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                        <label style={labelStyle}>Unidad</label>
                        <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={inputStyle}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <label style={labelStyle}>Stock actual</label>
                        <input type='number' value={form.quantityInStock} onChange={e => setForm(f => ({ ...f, quantityInStock: e.target.value }))} style={inputStyle} />
                        <label style={labelStyle}>Costo unitario</label>
                        <input type='number' value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: e.target.value }))} style={inputStyle} />
                        <label style={labelStyle}>Stock mínimo</label>
                        <input type='number' value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} style={inputStyle} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button onClick={handleSave} disabled={saving} style={btnStyle('#00b894')}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            <button onClick={() => setShowModal(false)} style={btnStyle('#636e72')}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#636e72', fontSize: '13px' };
const tdStyle = { padding: '12px 16px', fontSize: '14px', color: '#2d3436' };
const btnStyle = (bg) => ({ background: bg, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' });
const badgeStyle = (bg) => ({ background: bg, color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' });
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', borderRadius: '12px', padding: '30px', width: '400px', maxHeight: '90vh', overflowY: 'auto' };
const labelStyle = { display: 'block', fontWeight: '600', marginBottom: '4px', marginTop: '12px', fontSize: '13px', color: '#636e72' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #dfe6e9', fontSize: '14px', boxSizing: 'border-box' };
