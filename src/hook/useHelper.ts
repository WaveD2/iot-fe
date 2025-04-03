export const useHelper =  { 
     groupByMinute : (data : any): any => {
        const grouped = new Map();

        data.forEach((entry: any) => {
            const timeKey = new Date(entry.createdAt).toISOString().slice(0, 16);
            if (!grouped.has(timeKey)) {
                grouped.set(timeKey, { sum: {}, count: 0 });
            }

            const group = grouped.get(timeKey);
            group.count += 1;

            Object.keys(entry).forEach((key) => {
                if (typeof entry[key] === "number") {
                    group.sum[key] = (group.sum[key] || 0) + entry[key];
                }
            });
        });

        return Array.from(grouped.entries()).map(([key, { sum, count }]) => {
            const averagedData = Object.keys(sum).reduce(
                (acc, key) => ({ ...acc, [key]: sum[key] / count }),
                {}
            );
            return { createdAt: new Date(key), ...averagedData };
        });
    }
}