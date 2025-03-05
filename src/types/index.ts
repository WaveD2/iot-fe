export interface User {
    id: string;
    name: string;
    email: string;
    createAt: Date;
    token: string;
}

export interface SensorData {
    _id: string;
    userId: string;
    heartRate: number;
    temperature: number;
    timestamp: Date;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'HIGH_HEART_RATE' | 'LOW_HEART_RATE' | 'HIGH_TEMPERATURE' | 'LOW_TEMPERATURE';
    message: string;
    read: boolean;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

export interface TrendData {
    trend: 'increasing' | 'decreasing' | 'stable';
    data: number[];
}

export interface HealthReport {
    period: {
        start: string;
        end: string;
        days: number;
    };
    averages: {
        averageHeartRate: number;
        averageTemperature: number;
    };
    trends: {
        heartRate: TrendData;
        temperature: TrendData;
    };
    alerts: {
        highHeartRate: number;
        lowHeartRate: number;
        highTemperature: number;
        lowTemperature: number;
        total: number;
    };
    dataPoints: number;
}

export interface WebSocketMessage {
    type: string;
    payload: any;
}

export interface BaseMessage<T = unknown> {
    event: string;
    payload: T;
}

export interface HeartRate {
    timestamp: number;  // UNIX timestamp
    value: number;      // BPM
}

export interface Temperature {
    timestamp: number;
    value: number;      // °C
}


export type WelcomeMessage = BaseMessage<{ message: string }>;
export type UserLoginMessage = BaseMessage<{ user: User }>;