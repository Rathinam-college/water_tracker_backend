import { useState, useEffect } from 'react';
import api from '../../services/api';

const PurchaseForm = ({ 
    isEditMode, 
    id, 
    locations, 
    sources, 
    vehicles,   // Internal Rathinam vehicles
    onSuccess, 
    onCancel,
    setToast 
}) => {
    const [loading, setLoading] = useState(false);
    const [entryType, setEntryType] = useState('Vendor'); // 'Vendor', 'Internal', 'Pipeline' (Corporation)
    const [isManualOverride, setIsManualOverride] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [calculatedCost, setCalculatedCost] = useState(null);

    // We only use internal vehicles now (which include vendor registered vehicles)
    const [selectedVendorVehicle, setSelectedVendorVehicle] = useState('');

    const [formData, setFormData] = useState({
        entry_date: new Date().toISOString().split('T')[0],
        source: '',
        loading_location: '',
        unloading_location: '',
        shift: 'Morning',
        water_type: 'Drinking Water',
        vehicle: '',
        load_count: 1,
        meter_reading_current: '',
        meter_reading_previous: '',
        manual_capacity_liters: '',
        total_quantity_liters: '',
        total_cost: 0,
        comments: ''
    });



    // Calculate Total Quantity for Vendor based on Vehicle Capacity
    useEffect(() => {
        if (entryType === 'Vendor' && selectedVendorVehicle) {
            let selectedCapacity = 0;
            
            if (selectedVendorVehicle.startsWith('int-')) {
                const intId = parseInt(selectedVendorVehicle.replace('int-', ''));
                const iv = vehicles.find(v => v.id === intId);
                if (iv) selectedCapacity = iv.capacity_liters;
            }

            if (selectedCapacity > 0 && !isManualOverride) {
                setFormData(prev => ({
                    ...prev,
                    total_quantity_liters: selectedCapacity * (prev.load_count || 1)
                }));
            }
        }
    }, [selectedVendorVehicle, formData.load_count, isManualOverride, vehicles, entryType]);

    // Fetch Entry Data if in Edit Mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchEntry = async () => {
                try {
                    const response = await api.get(`entries/${id}/`);
                    const entry = response.data;

                    // Determine entry type
                    let type = 'Vendor';
                    const source = (sources || []).find(s => s.id === entry.source);
                    if (source) {
                        if (source.source_type === 'Vendor') type = 'Vendor';
                        else if (source.source_type === 'Pipeline') type = 'Pipeline';
                        else type = 'Internal';
                    } else if (entry.vehicle) {
                        type = 'Internal';
                    }

                    setEntryType(type);
                    setFormData({
                        entry_date: entry.entry_date,
                        source: entry.source || '',
                        loading_location: entry.loading_location || '',
                        unloading_location: entry.unloading_location || '',
                        shift: entry.shift || 'Morning',
                        water_type: entry.water_type || 'Drinking Water',
                        vehicle: entry.vehicle || '',
                        load_count: entry.load_count || 1,
                        meter_reading_current: entry.meter_reading_current || '',
                        meter_reading_previous: entry.meter_reading_previous || '',
                        manual_capacity_liters: entry.manual_capacity_liters || '',
                        total_quantity_liters: entry.total_quantity_liters,
                        total_cost: entry.total_cost,
                        comments: entry.comments || ''
                    });

                    if (entry.comments) setShowComments(true);
                    if (entry.manual_capacity_liters) setIsManualOverride(true);
                    setCalculatedCost(parseFloat(entry.total_cost));
                    
                    // Reconstruct selected vendor vehicle mapping if editing a vendor entry
                    if (type === 'Vendor' && entry.vehicle) {
                        setSelectedVendorVehicle(`int-${entry.vehicle}`);
                    }
                } catch (err) {
                    console.error('Failed to fetch entry:', err);
                    setToast({ message: 'Failed to fetch entry details', type: 'error' });
                }
            };
            fetchEntry();
        }
    }, [isEditMode, id, sources, setToast]);

    // Internal Source Auto-selection
    useEffect(() => {
        if (!isEditMode && entryType === 'Internal' && sources.length > 0) {
            const internalSources = sources.filter(s => s.source_type === 'Internal_Bore' || s.source_type === 'Internal_Well');
            if (internalSources.length > 0 && !formData.source) {
                setFormData(prev => ({ ...prev, source: internalSources[0].id }));
            }
        }
    }, [entryType, sources, isEditMode, formData.source]);

    // Pipeline Previous Reading Fetch
    useEffect(() => {
        if (entryType === 'Pipeline' && formData.source && !isEditMode) {
            const fetchLastPipeline = async () => {
                try {
                    const response = await api.get(`last-pipeline-reading/?source_id=${formData.source}&entry_date=${formData.entry_date}`);
                    setFormData(prev => ({
                        ...prev,
                        meter_reading_previous: response.data.previous_reading || 0
                    }));
                } catch (err) {
                    console.error('Failed to fetch last pipeline reading:', err);
                }
            };
            fetchLastPipeline();
        }
    }, [entryType, formData.source, formData.entry_date, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-calculate quantity based on manual override
            if (isManualOverride && (name === 'manual_capacity_liters' || name === 'load_count')) {
                const manualCap = parseFloat(newData.manual_capacity_liters) || 0;
                newData.total_quantity_liters = manualCap * (newData.load_count || 1);
            }
            // Auto-calculate quantity for Internal when vehicle/load changes
            else if (entryType === 'Internal' && !isManualOverride) {
                if (name === 'vehicle' || name === 'load_count') {
                    const veh = vehicles.find(v => v.id === parseInt(newData.vehicle));
                    if (veh) {
                        newData.total_quantity_liters = veh.capacity_liters * (newData.load_count || 1);
                    }
                }
            }

            // Auto-calculate quantity for Pipeline when readings change
            if (entryType === 'Pipeline' && (name === 'meter_reading_current' || name === 'meter_reading_previous')) {
                const current = parseFloat(newData.meter_reading_current) || 0;
                const previous = parseFloat(newData.meter_reading_previous) || 0;
                if (current >= previous) {
                    newData.total_quantity_liters = (current - previous).toFixed(2);
                }
            }

            return newData;
        });
    };

    const handleCalculateCost = async () => {
        if ((entryType !== 'Internal' && !formData.source) || !formData.total_quantity_liters) {
            setToast({ message: 'Please select a source and ensure quantity is calculated', type: 'error' });
            return;
        }

        const sourceTypeMap = {
            'Vendor': 'vendor',
            'Internal': 'internal',
            'Pipeline': 'pipeline'
        };

        // Determine capacity for vehicle-specific rate lookup
        let selectedCapacity = null;
        if (entryType === 'Vendor' && selectedVendorVehicle) {
            if (selectedVendorVehicle.startsWith('int-')) {
                const iv = vehicles.find(v => v.id === parseInt(selectedVendorVehicle.replace('int-', '')));
                if (iv) selectedCapacity = iv.capacity_liters;
            }
        }

        try {
            const response = await api.post('calculate-cost/', {
                source_id: formData.source || null,
                vehicle_id: formData.vehicle || null,
                source_type: sourceTypeMap[entryType],
                quantity_liters: formData.total_quantity_liters,
                entry_date: formData.entry_date,
                loading_location_id: formData.loading_location || null,
                water_type: formData.water_type,
                load_count: formData.load_count || 1,
                is_manual_override: isManualOverride,
                vendor_vehicle_capacity: selectedCapacity
            });
            setCalculatedCost(response.data.total_cost);
            setFormData(prev => ({ ...prev, total_cost: response.data.total_cost }));
        } catch (err) {
            console.error('Calculation Error:', err.response?.data);
            setToast({ message: err.response?.data?.error || 'Failed to calculate cost', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (entryType === 'Pipeline') {
            const current = parseFloat(formData.meter_reading_current) || 0;
            const previous = parseFloat(formData.meter_reading_previous) || 0;
            if (previous > current) {
                setToast({ message: 'Previous meter reading cannot be greater than current reading!', type: 'error' });
                return;
            }
        }

        if (calculatedCost === null) {
            setToast({ message: 'Please calculate cost before saving', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`entries/${id}/`, formData);
                setToast({ message: 'Entry updated successfully!', type: 'success' });
            } else {
                await api.post('entries/', formData);
                setToast({ message: 'Entry saved successfully!', type: 'success' });
            }
            setTimeout(() => onSuccess(), 1500);
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Failed to save entry', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredSources = (sources || []).filter(s => {
        if (entryType === 'Vendor') return s.source_type === 'Vendor';
        if (entryType === 'Pipeline') return s.source_type === 'Pipeline';
        return false;
    });

    const loadingLocations = (locations || []).filter(l => l.location_type === 'Loading' || l.location_type === 'Both');
    const unloadingLocations = (locations || []).filter(l => l.location_type === 'Unloading' || l.location_type === 'Both');

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Entry Type Box Selector */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
                    Entry Type
                </span>
                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300">
                        <input 
                            type="radio" 
                            name="entryType" 
                            value="Vendor" 
                            checked={entryType === 'Vendor'} 
                            onChange={() => {
                                setEntryType('Vendor');
                                setFormData(prev => ({ 
                                    ...prev, 
                                    source: '', 
                                    vehicle: '', 
                                    load_count: 1, 
                                    meter_reading_current: '',
                                    meter_reading_previous: '',
                                    manual_capacity_liters: '',
                                    total_quantity_liters: '', 
                                    total_cost: 0 
                                }));
                                setSelectedVendorVehicle('');
                                setCalculatedCost(null);
                                setIsManualOverride(false);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 focus:ring-blue-500"
                        />
                        Vendor Vehicle
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300">
                        <input 
                            type="radio" 
                            name="entryType" 
                            value="Internal" 
                            checked={entryType === 'Internal'} 
                            onChange={() => {
                                setEntryType('Internal');
                                setFormData(prev => ({ 
                                    ...prev, 
                                    source: '', 
                                    vehicle: '', 
                                    load_count: 1, 
                                    meter_reading_current: '',
                                    meter_reading_previous: '',
                                    manual_capacity_liters: '',
                                    total_quantity_liters: '', 
                                    total_cost: 0 
                                }));
                                setSelectedVendorVehicle('');
                                setCalculatedCost(null);
                                setIsManualOverride(false);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 focus:ring-blue-500"
                        />
                        Rathinam Vehicle
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300">
                        <input 
                            type="radio" 
                            name="entryType" 
                            value="Pipeline" 
                            checked={entryType === 'Pipeline'} 
                            onChange={() => {
                                setEntryType('Pipeline');
                                setFormData(prev => ({ 
                                    ...prev, 
                                    source: '', 
                                    vehicle: '', 
                                    load_count: 1, 
                                    meter_reading_current: '',
                                    meter_reading_previous: '',
                                    manual_capacity_liters: '',
                                    total_quantity_liters: '', 
                                    total_cost: 0 
                                }));
                                setSelectedVendorVehicle('');
                                setCalculatedCost(null);
                                setIsManualOverride(false);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 focus:ring-blue-500"
                        />
                        Corporation
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 1: Date and Source (Source hidden for Internal) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Entry Date *</label>
                        <input
                            type="date"
                            name="entry_date"
                            value={formData.entry_date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    {entryType !== 'Internal' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                {entryType === 'Vendor' ? 'Vendor Source *' : 'Pipeline Source *'}
                            </label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSelectedVendorVehicle('');
                                    setCalculatedCost(null);
                                }}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select {entryType === 'Vendor' ? 'Vendor' : 'Pipeline'} Source</option>
                                {filteredSources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="hidden md:block"></div>
                    )}
                </div>

                {/* Pipeline Meter Readings Section Header */}
                {entryType === 'Pipeline' && (
                    <div className="border-t dark:border-slate-700 pt-4">
                        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            📊 Pipeline Meter Readings
                        </h3>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 2: Loading and Unloading (Hidden for Pipeline) */}
                    {entryType !== 'Pipeline' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Loading Location</label>
                                <select 
                                    name="loading_location" 
                                    value={formData.loading_location} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Select Location</option>
                                    {loadingLocations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Unloading Location *</label>
                                <select 
                                    name="unloading_location" 
                                    value={formData.unloading_location} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Select Location</option>
                                    {unloadingLocations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Row 3: Shift and Water Type (Hidden for Pipeline) */}
                    {entryType !== 'Pipeline' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Shift</label>
                                <select 
                                    name="shift" 
                                    value={formData.shift} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Water Type</label>
                                <select 
                                    name="water_type" 
                                    value={formData.water_type} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="Drinking Water">Drinking Water</option>
                                    <option value="Normal Water (Salt)">Normal Water (Salt)</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Row 4: Vehicle and Load Count / Pipeline Readings */}
                    {entryType === 'Pipeline' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Previous Meter Reading</label>
                                <input 
                                    type="number" 
                                    step="0.0001" 
                                    name="meter_reading_previous" 
                                    value={formData.meter_reading_previous} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Current Meter Reading</label>
                                <input 
                                    type="number" 
                                    step="0.0001" 
                                    name="meter_reading_current" 
                                    value={formData.meter_reading_current} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white" 
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Vehicle</label>
                                {entryType === 'Internal' ? (
                                    <select 
                                        name="vehicle" 
                                        value={formData.vehicle} 
                                        onChange={handleChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_name} ({v.capacity_liters}L)</option>)}
                                    </select>
                                ) : (
                                    <select
                                        value={selectedVendorVehicle}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedVendorVehicle(val);
                                            setCalculatedCost(null);
                                            
                                            if (val.startsWith('int-')) {
                                                const intId = parseInt(val.replace('int-', ''));
                                                setFormData(prev => ({ ...prev, vehicle: intId }));
                                            } else {
                                                setFormData(prev => ({ ...prev, vehicle: '' }));
                                            }
                                        }}
                                        disabled={!formData.source}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="">Select Vehicle</option>
                                        
                                        <optgroup label="Available Vehicles">
                                            {vehicles.map(v => (
                                                <option key={`int-${v.id}`} value={`int-${v.id}`}>
                                                    {v.vehicle_name} — {v.capacity_liters?.toLocaleString()}L
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Load Count</label>
                                <input 
                                    type="number" 
                                    name="load_count" 
                                    value={formData.load_count} 
                                    onChange={handleChange} 
                                    min="1" 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white" 
                                />
                            </div>
                        </>
                    )}

                    {/* Row 5: Total Quantity and Manual Override */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            {entryType === 'Pipeline' ? 'Total Quantity (KL) *' : 'Total Quantity (Liters) *'}
                        </label>
                        <input 
                            type="number" 
                            step="0.01" 
                            name="total_quantity_liters" 
                            value={formData.total_quantity_liters} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white" 
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                                {entryType === 'Pipeline' ? 'Manual Capacity Override (KL)' : 'Manual Capacity Override (Liters)'}
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Enable</span>
                                <input 
                                    type="checkbox" 
                                    checked={isManualOverride} 
                                    onChange={(e) => {
                                        setIsManualOverride(e.target.checked);
                                        if (!e.target.checked) {
                                            setFormData(prev => ({ ...prev, manual_capacity_liters: '' }));
                                        }
                                    }} 
                                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 focus:ring-blue-500" 
                                />
                            </div>
                        </div>
                        <input 
                            type="number" 
                            name="manual_capacity_liters" 
                            value={formData.manual_capacity_liters} 
                            onChange={handleChange} 
                            disabled={!isManualOverride} 
                            placeholder={!isManualOverride ? "Standard capacity used" : "Enter manual override"}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md ${!isManualOverride ? 'bg-gray-100 dark:bg-slate-900/30 opacity-50' : 'bg-white dark:bg-slate-700 dark:text-white'}`} 
                        />
                    </div>
                </div>

                {/* Calculate Cost Section */}
                <div className="border-t dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-4">
                        <button 
                            type="button" 
                            onClick={handleCalculateCost} 
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-all"
                        >
                            Calculate Cost
                        </button>
                        {calculatedCost !== null && (
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                Total: ₹{calculatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </div>
                    {entryType === 'Vendor' && selectedVendorVehicle && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            ✓ Using vehicle-specific rate for {vehicles.find(v => `int-${v.id}` === selectedVendorVehicle)?.vehicle_name}
                        </p>
                    )}
                </div>

                {/* Comments Section */}
                <div className="border-t dark:border-slate-700 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="checkbox" 
                            id="showPurchaseComments" 
                            checked={showComments} 
                            onChange={(e) => setShowComments(e.target.checked)} 
                            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500" 
                        />
                        <label htmlFor="showPurchaseComments" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer">
                            Add Comments/Special Note <span className="text-xs font-normal text-gray-400">(Max 300 characters)</span>
                        </label>
                    </div>
                    {showComments && (
                        <textarea 
                            name="comments" 
                            value={formData.comments} 
                            onChange={handleChange} 
                            maxLength="300" 
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400"
                            placeholder="Enter any notes..." 
                        />
                    )}
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex gap-4 pt-4 border-t dark:border-slate-700">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Entry' : 'Save Entry')}
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
        </div>
    );
};

export default PurchaseForm;
