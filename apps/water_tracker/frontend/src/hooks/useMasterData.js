import { useState, useEffect } from 'react';
import api from '../services/api';

const useMasterData = () => {
    const [locations, setLocations] = useState([]);
    const [sources, setSources] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [yieldLocations, setYieldLocations] = useState([]);
    const [consumptionLocations, setConsumptionLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [dropdownRes, yieldRes, consumptionRes, categoriesRes] = await Promise.all([
                    api.get('dropdown-data/'),
                    api.get('yield-locations/'),
                    api.get('consumption-locations/'),
                    api.get('consumption-categories/')
                ]);
                setLocations(dropdownRes.data.locations || []);
                setSources(dropdownRes.data.sources || []);
                setVehicles(dropdownRes.data.vehicles || []);
                setYieldLocations(yieldRes.data.results || yieldRes.data || []);
                setConsumptionLocations(consumptionRes.data.results || consumptionRes.data || []);
                setCategories(categoriesRes.data.results || categoriesRes.data || []);
                setDataLoading(false);
            } catch (err) {
                console.error('Failed to fetch dropdown data', err);
                setDataLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    return {
        locations,
        sources,
        vehicles,
        yieldLocations,
        consumptionLocations,
        categories,
        dataLoading
    };
};

export default useMasterData;
