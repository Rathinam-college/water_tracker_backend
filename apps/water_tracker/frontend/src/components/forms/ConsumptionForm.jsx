import { useState, useEffect } from 'react';
import api from '../../services/api';

const ConsumptionForm = ({ 
    isEditMode, 
    id, 
    consumptionLocations, 
    categories,
    onSuccess, 
    onCancel,
    setToast 
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [consumptionType, setConsumptionType] = useState('Normal');
    const [consumptionFormData, setConsumptionFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        location: '',
        current_reading: '',
        previous_reading: 0,
        comments: '',
        is_manual_previous: false
    });
    const [showComments, setShowComments] = useState(false);

    // Fetch Entry Data if in Edit Mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchEntry = async () => {
                try {
                    const response = await api.get(`consumption-entries/${id}/`);
                    const entry = response.data;
                    setConsumptionFormData({
                        date: entry.date,
                        location: entry.location || '',
                        current_reading: entry.current_reading || '',
                        previous_reading: entry.previous_reading || 0,
                        comments: entry.comments || ''
                    });
                    if (entry.comments) setShowComments(true);

                    // Auto-set category/type in edit mode
                    if (entry.location && consumptionLocations.length > 0) {
                        const loc = consumptionLocations.find(l => l.id === entry.location);
                        if (loc) {
                            if (loc.category) setSelectedCategory(loc.category.toString());
                            setConsumptionType(loc.consumption_type || 'Normal');
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch consumption entry:', err);
                    setToast({ message: 'Failed to fetch entry details', type: 'error' });
                }
            };
            fetchEntry();
        }
    }, [isEditMode, id, consumptionLocations, setToast]);

    // Auto-fetch last consumption reading
    useEffect(() => {
        const fetchLastConsumption = async () => {
            if (consumptionFormData.location && !isEditMode) {
                try {
                    const response = await api.get(`last-consumption-reading/?location_id=${consumptionFormData.location}&date=${consumptionFormData.date}`);
                    setConsumptionFormData(prev => ({
                        ...prev,
                        previous_reading: response.data.previous_reading || 0,
                        is_manual_previous: false
                    }));
                } catch (err) {
                    console.error('Failed to fetch last consumption reading:', err);
                }
            }
        };
        fetchLastConsumption();
    }, [consumptionFormData.location, consumptionFormData.date, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`consumption-entries/${id}/`, consumptionFormData);
                setToast({ message: 'Consumption entry updated successfully!', type: 'success' });
            } else {
                await api.post('consumption-entries/', consumptionFormData);
                setToast({ message: 'Consumption entry saved successfully!', type: 'success' });
            }
            setTimeout(() => onSuccess(), 1500);
        } catch (err) {
            console.error('Submit Error:', err.response?.data);
            setToast({
                message: err.response?.data?.error || 'Failed to save consumption entry',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredConsumptionLocations = consumptionLocations.filter(loc => {
        const matchesCategory = !selectedCategory || (loc.category && loc.category.toString() === selectedCategory);
        const matchesType = loc.consumption_type === consumptionType;
        return matchesCategory && matchesType;
    });

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Date *
                    </label>
                    <input
                        type="date"
                        value={consumptionFormData.date}
                        onChange={(e) => setConsumptionFormData({ ...consumptionFormData, date: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category Filter</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Type</label>
                        <select
                            value={consumptionType}
                            onChange={(e) => setConsumptionType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        >
                            <option value="Normal">Normal</option>
                            <option value="Drinking">Drinking</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Consumption Location *
                    </label>
                    <select
                        value={consumptionFormData.location}
                        onChange={(e) => setConsumptionFormData({ ...consumptionFormData, location: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select Location</option>
                        {filteredConsumptionLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                Previous Reading (KL)
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={consumptionFormData.is_manual_previous}
                                    onChange={(e) => setConsumptionFormData({ ...consumptionFormData, is_manual_previous: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">Manual Edit</span>
                            </label>
                        </div>
                        <input
                            type="number"
                            step="0.0001"
                            value={consumptionFormData.previous_reading}
                            onChange={(e) => setConsumptionFormData({ ...consumptionFormData, previous_reading: e.target.value })}
                            disabled={!consumptionFormData.is_manual_previous}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white ${!consumptionFormData.is_manual_previous ? 'opacity-50' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Current Reading (KL) *
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            value={consumptionFormData.current_reading}
                            onChange={(e) => setConsumptionFormData({ ...consumptionFormData, current_reading: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-green-50 dark:bg-slate-900/50 p-4 rounded-md">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Calculated Consumption: <span className="text-lg ml-2 font-bold">
                        {((consumptionFormData.current_reading || 0) - (consumptionFormData.previous_reading || 0)).toFixed(2)} KL
                    </span>
                    <span className="text-xs ml-2 opacity-70">
                        ({(((consumptionFormData.current_reading || 0) - (consumptionFormData.previous_reading || 0)) * 1000).toFixed(0)} Liters)
                    </span>
                </p>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="showConsComments"
                    checked={showComments}
                    onChange={(e) => {
                        setShowComments(e.target.checked);
                        if (!e.target.checked) setConsumptionFormData(prev => ({ ...prev, comments: '' }));
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showConsComments" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                    Add Comments
                </label>
            </div>

            {showComments && (
                <textarea
                    value={consumptionFormData.comments}
                    onChange={(e) => setConsumptionFormData({ ...consumptionFormData, comments: e.target.value })}
                    maxLength="300"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="Enter any notes..."
                />
            )}

            <div className="flex gap-4 pt-4 border-t dark:border-slate-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Saving...' : (isEditMode ? 'Update Consumption' : 'Save Consumption')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-md hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ConsumptionForm;
