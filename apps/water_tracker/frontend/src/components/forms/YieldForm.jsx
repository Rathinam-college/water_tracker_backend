import { useState, useEffect } from 'react';
import api from '../../services/api';

const YieldForm = ({ 
    isEditMode, 
    id, 
    yieldLocations, 
    onSuccess, 
    onCancel,
    setToast 
}) => {
    const [loading, setLoading] = useState(false);
    const [yieldFormData, setYieldFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        location: '',
        current_reading: '',
        previous_reading: 0,
        yield_liters: '',
        comments: '',
        is_manual_previous: false
    });
    const [showComments, setShowComments] = useState(false);

    // Fetch Entry Data if in Edit Mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchEntry = async () => {
                try {
                    const response = await api.get(`yield-entries/${id}/`);
                    const entry = response.data;
                    setYieldFormData({
                        date: entry.date,
                        location: entry.location || '',
                        current_reading: entry.current_reading || '',
                        previous_reading: entry.previous_reading || 0,
                        yield_liters: entry.yield_liters || '',
                        comments: entry.comments || ''
                    });
                    if (entry.comments) setShowComments(true);
                } catch (err) {
                    console.error('Failed to fetch yield entry:', err);
                    setToast({ message: 'Failed to fetch entry details', type: 'error' });
                }
            };
            fetchEntry();
        }
    }, [isEditMode, id, setToast]);

    // Auto-fetch last yield reading
    useEffect(() => {
        const fetchLastYield = async () => {
            if (yieldFormData.location && !isEditMode) {
                try {
                    const response = await api.get(`last-yield-reading/?location_id=${yieldFormData.location}&date=${yieldFormData.date}`);
                    setYieldFormData(prev => ({
                        ...prev,
                        previous_reading: response.data.previous_reading || 0,
                        is_manual_previous: false
                    }));
                } catch (err) {
                    console.error('Failed to fetch last yield reading:', err);
                }
            }
        };
        fetchLastYield();
    }, [yieldFormData.location, yieldFormData.date, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            ...yieldFormData,
            yield_liters: yieldFormData.yield_liters || 
                (parseFloat(yieldFormData.current_reading) - parseFloat(yieldFormData.previous_reading || 0)).toFixed(2)
        };

        try {
            if (isEditMode) {
                await api.put(`yield-entries/${id}/`, data);
                setToast({ message: 'Yield entry updated successfully!', type: 'success' });
            } else {
                await api.post('yield-entries/', data);
                setToast({ message: 'Yield entry saved successfully!', type: 'success' });
            }
            setTimeout(() => onSuccess(), 1500);
        } catch (err) {
            console.error('Submit Error:', err.response?.data);
            setToast({
                message: err.response?.data?.error || 'Failed to save yield entry',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Date *
                    </label>
                    <input
                        type="date"
                        value={yieldFormData.date}
                        onChange={(e) => setYieldFormData({ ...yieldFormData, date: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Location (Borewell/Well) *
                    </label>
                    <select
                        value={yieldFormData.location}
                        onChange={(e) => setYieldFormData({ ...yieldFormData, location: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select Location</option>
                        {yieldLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.location_name} ({loc.yield_type})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                            Previous Reading (KL)
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={yieldFormData.is_manual_previous}
                                onChange={(e) => setYieldFormData({ ...yieldFormData, is_manual_previous: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">Manual Edit</span>
                        </label>
                    </div>
                    <input
                        type="number"
                        step="0.0001"
                        value={yieldFormData.previous_reading}
                        onChange={(e) => setYieldFormData({ ...yieldFormData, previous_reading: e.target.value })}
                        disabled={!yieldFormData.is_manual_previous}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white ${!yieldFormData.is_manual_previous ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Current Reading (KL) *
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        value={yieldFormData.current_reading}
                        onChange={(e) => setYieldFormData({ ...yieldFormData, current_reading: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-slate-900/50 p-4 rounded-md">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Calculated Yield: <span className="text-lg ml-2 font-bold">
                        {((yieldFormData.current_reading || 0) - (yieldFormData.previous_reading || 0)).toFixed(2)} KL
                    </span>
                    <span className="text-xs ml-2 opacity-70">
                        ({(((yieldFormData.current_reading || 0) - (yieldFormData.previous_reading || 0)) * 1000).toFixed(0)} Liters)
                    </span>
                </p>
            </div>

            {/* Comments Toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="showYieldComments"
                    checked={showComments}
                    onChange={(e) => {
                        setShowComments(e.target.checked);
                        if (!e.target.checked) setYieldFormData(prev => ({ ...prev, comments: '' }));
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="showYieldComments" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                    Add Comments
                </label>
            </div>

            {showComments && (
                <textarea
                    value={yieldFormData.comments}
                    onChange={(e) => setYieldFormData({ ...yieldFormData, comments: e.target.value })}
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
                    {loading ? 'Saving...' : (isEditMode ? 'Update Yield' : 'Save Yield')}
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

export default YieldForm;
