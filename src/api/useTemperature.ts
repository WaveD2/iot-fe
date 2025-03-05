// import { useState } from "react";
// import { Temperature } from "../types";

// export function useTemperature() {
//     const [temperatures, setTemperatures] = useState<Temperature[]>([]);

//     const fetchTemperatureData = async () => {
//         const res = await api.getTemperatures();
//         setTemperatures(res.data);
//     };

//     useEffect(() => {
//         fetchTemperatureData();
//     }, []);

//     return { temperatures, fetchTemperatureData };
// }
