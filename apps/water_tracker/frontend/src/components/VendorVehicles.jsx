import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Modal from './Modal';
import Toast from './Toast';

const VendorVehicles = () => {
    const [vendors, setVendors] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [toast, setToast] = useState(null);
    const [filterVendor, setFilterVendor] = useState('');

    const [formData, setFormData] = useState({
        vendor: '',
        vehicle_name: '',
        capacity_liters: '',
        is_active: true,
    });

    const fetchData = useCallback(async () => {
        try {
            const [vehiclesRes, sourcesRes] = await Promise.all([
                api.get('vendor-vehicles/'),
                api.get('sources/'),
            ]);
            const allVehicles = vehiclesRes.data.results || vehiclesRes.data || [];
            const allSources = sourcesRes.data.results || sourcesRes.data || [];
            setVehicles(allVehicles);
            // Only show Vendor type sources
            setVendors(allSources.filter(s => s.source_type === 'Vendor'));
        } catch {
            setToast({ message: 'Failed to load data', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                vendor: vehicle.vendor,
                vehicle_name: vehicle.vehicle_name,
                capacity_liters: vehicle.capacity_liters,
                is_active: vehicle.is_active,
            });
        } else {
            setEditingVehicle(null);
            setFormData({ vendor: '', vehicle_name: '', capacity_liters: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await api.put(`vendor-vehicles/${editingVehicle.id}/`, formData);
                setToast({ message: 'Vehicle updated successfully!', type: 'success' });
            } else {
                await api.post('vendor-vehicles/', formData);
                setToast({ message: 'Vehicle added successfully!', type: 'success' });
            }
            fetchData();
            handleCloseModal();
        } catch {
            setToast({ message: 'Failed to save vehicle', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`vendor-vehicles/${id}/`);
            setToast({ message: 'Vehicle deleted successfully!', type: 'success' });
            fetchData();
        } catch {
            setToast({ message: 'Failed to delete vehicle', type: 'error' });
        }
    };

    const handleToggleActive = async (vehicle) => {
        try {
            await api.patch(`vendor-vehicles/${vehicle.id}/`, { is_active: !vehicle.is_active });
            fetchData();
        } catch {
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const filteredVehicles = filterVendor
        ? vehicles.filter(v => v.vendor === parseInt(filterVendor))
        : vehicles;

    const getVendorName = (vendorId) => {
        const v = vendors.find(v => v.id === vendorId);
        return v ? v.source_name : '-';
    };

    if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Vendor Vehicles</h1>
                    <p className="text-gray-600 dark:text-slate-400 mt-1">Manage vehicles owned by external water vendors</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    + Add Vendor Vehicle
                </button>
            </div>

            {/* Vendor Filter */}
            <div className="mb-4">
                <select
                    value={filterVendor}
                    onChange={(e) => setFilterVendor(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm"
                >
                    <option value="">All Vendors</option>
                    {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.source_name}</option>
                    ))}
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {vendors.map(vendor => {
                    const vendorVehicles = vehicles.filter(v => v.vendor === vendor.id);
                    if (vendorVehicles.length === 0) return null;
                    return (
                        <div key={vendor.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{vendor.source_name}</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{vendorVehicles.length}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                {vendorVehicles.filter(v => v.is_active).length} active
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                        <tr>
                            {['Vendor', 'Vehicle Name', 'Capacity (Liters)', 'Status', 'Actions'].map(col => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredVehicles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400 dark:text-slate-500">
                                    No vendor vehicles found. Click "+ Add Vendor Vehicle" to get started.
                                </td>
                            </tr>
                        ) : filteredVehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                    {getVendorName(vehicle.vendor)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">
                                    {vehicle.vehicle_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                                    <span className="font-semibold">{vehicle.capacity_liters?.toLocaleString()}</span>
                                    <span className="text-xs ml-1 text-gray-400">L</span>
                                    <span className="ml-2 text-xs text-gray-400">
                                        ({(vehicle.capacity_liters / 1000).toFixed(0)} KL)
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(vehicle)}
                                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                            vehicle.is_active
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-400'
                                        }`}
                                    >
                                        {vehicle.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(vehicle)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vehicle.id)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVehicle ? 'Edit Vendor Vehicle' : 'Add Vendor Vehicle'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Vendor *</label>
                        <select
                            value={formData.vendor}
                            onChange={(e) => setFormData(p => ({ ...p, vendor: e.target.value }))}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.source_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Vehicle Name *</label>
                        <input
                            type="text"
                            value={formData.vehicle_name}
                            onChange={(e) => setFormData(p => ({ ...p, vehicle_name: e.target.value }))}
                            required
                            placeholder="e.g., Tata Tanker 12KL"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Capacity (Liters) *</label>
                        <input
                            type="number"
                            value={formData.capacity_liters}
                            onChange={(e) => setFormData(p => ({ ...p, capacity_liters: e.target.value }))}
                            required
                            placeholder="e.g., 12000"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.capacity_liters && (
                            <p className="text-xs text-gray-400 mt-1">= {(formData.capacity_liters / 1000).toFixed(1)} KL</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                            className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-slate-300">Active</label>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {editingVehicle ? 'Update' : 'Add Vehicle'}
                        </button>
                        <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VendorVehicles;
