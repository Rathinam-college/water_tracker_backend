import { useState, useEffect } from 'react';
import api from '../../services/api';

const GeneralRatesForm = ({ onCancel, setToast }) => {
    const [loading, setLoading] = useState(false);
    const [generalRates, setGeneralRates] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        normal_water_rate: '',
        drinking_water_rate: '',
        effective_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await api.get('general-water-rates/');
                setGeneralRates(response.data.results || response.data || []);
            } catch (err) {
                console.error('Failed to fetch general rates', err);
            }
        };
        fetchRates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('general-water-rates/', formData);
            setToast({ message: 'General rates saved successfully!', type: 'success' });
            // Refresh list
            const response = await api.get('general-water-rates/');
            setGeneralRates(response.data.results || response.data || []);
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                normal_water_rate: '',
                drinking_water_rate: '',
                effective_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Submit Error:', err.response?.data);
            setToast({ message: 'Failed to save general rates', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b dark:border-slate-700 pb-2">
                    Enter New General Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Entry Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Effective From Date *</label>
                        <input
                            type="date"
                            value={formData.effective_date}
                            onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Normal Water Rate (per Liter) *</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={formData.normal_water_rate}
                            onChange={(e) => setFormData({ ...formData, normal_water_rate: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Drinking Water Rate (per Liter) *</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={formData.drinking_water_rate}
                            onChange={(e) => setFormData({ ...formData, drinking_water_rate: e.target.value })}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : 'Save Rates'}
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

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50">
                                <th className="p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-b dark:border-slate-600">Effective Date</th>
                                <th className="p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-b dark:border-slate-600">Normal (₹/L)</th>
                                <th className="p-3 text-sm font-medium text-gray-700 dark:text-slate-300 border-b dark:border-slate-600">Drinking (₹/L)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generalRates.map((rate, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                    <td className="p-3 text-sm text-gray-600 dark:text-slate-400 border-b dark:border-slate-700">{rate.effective_date}</td>
                                    <td className="p-3 text-sm text-gray-600 dark:text-slate-400 border-b dark:border-slate-700">{rate.normal_water_rate}</td>
                                    <td className="p-3 text-sm text-gray-600 dark:text-slate-400 border-b dark:border-slate-700">{rate.drinking_water_rate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GeneralRatesForm;
