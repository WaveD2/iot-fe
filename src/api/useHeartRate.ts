import { useState } from "react";
import { HeartRate } from "../types";

export function useHeartRate() {
    const [heartRates, setHeartRates] = useState<HeartRate[]>([]);

    const fetchHeartRateData = async () => {
        const res = await api.getHeartRates();
        setHeartRates(res.data);
    };

    useEffect(() => {
        fetchHeartRateData();
    }, []);

    return { heartRates, fetchHeartRateData };
}
