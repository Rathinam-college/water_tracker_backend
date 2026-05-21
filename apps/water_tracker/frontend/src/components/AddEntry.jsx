import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useMasterData from '../hooks/useMasterData';
import Toast from './Toast';

// Split Form Components
import PurchaseForm from './forms/PurchaseForm';
import YieldForm from './forms/YieldForm';
import ConsumptionForm from './forms/ConsumptionForm';
import GeneralRatesForm from './forms/GeneralRatesForm';

const AddEntry = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const isYieldEdit = window.location.pathname.includes('yield');
    const isConsumptionEdit = window.location.pathname.includes('consumption');

    const [toast, setToast] = useState(null);
    const [mainTab, setMainTab] = useState('Purchase');

    // Use centralized hook for master data
    const {
        locations,
        sources,
        vehicles,
        yieldLocations,
        consumptionLocations,
        categories,
        dataLoading
    } = useMasterData();

    // Set correct tab based on edit mode on mount
    useEffect(() => {
        if (isEditMode) {
            if (isYieldEdit) setMainTab('Yield');
            else if (isConsumptionEdit) setMainTab('Consumption');
            else setMainTab('Purchase');
        }
    }, [isEditMode, isYieldEdit, isConsumptionEdit]);

    const handleSuccess = () => {
        if (mainTab === 'Yield') navigate('/yield-entries');
        else if (mainTab === 'Consumption') navigate('/consumption-entries');
        else navigate('/entries');
    };

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEditMode ? 'Edit' : 'Add New'} {mainTab} Entry
                </h2>
                
                {/* Tab Switcher - Only visible in Add mode */}
                {!isEditMode && (
                    <div className="flex bg-gray-200 dark:bg-slate-700 p-1 rounded-xl shadow-inner">
                        {['Purchase', 'Yield', 'Consumption', 'GeneralRates'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setMainTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    mainTab === tab 
                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-md transform scale-105' 
                                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Render appropriate form based on active tab */}
            <div className="mt-4">
                {mainTab === 'Purchase' && (
                    <PurchaseForm 
                        isEditMode={isEditMode}
                        id={id}
                        locations={locations}
                        sources={sources}
                        vehicles={vehicles}
                        onSuccess={handleSuccess}
                        onCancel={() => navigate('/entries')}
                        setToast={setToast}
                    />
                )}

                {mainTab === 'Yield' && (
                    <YieldForm 
                        isEditMode={isEditMode}
                        id={id}
                        yieldLocations={yieldLocations}
                        onSuccess={handleSuccess}
                        onCancel={() => navigate('/yield-entries')}
                        setToast={setToast}
                    />
                )}

                {mainTab === 'Consumption' && (
                    <ConsumptionForm 
                        isEditMode={isEditMode}
                        id={id}
                        consumptionLocations={consumptionLocations}
                        categories={categories}
                        onSuccess={handleSuccess}
                        onCancel={() => navigate('/consumption-entries')}
                        setToast={setToast}
                    />
                )}

                {mainTab === 'GeneralRates' && (
                    <GeneralRatesForm 
                        onCancel={() => navigate('/entries')}
                        setToast={setToast}
                    />
                )}
            </div>
        </div>
    );
};

export default AddEntry;
