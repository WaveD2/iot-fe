import React, { useEffect } from 'react';
import { listenToUserChannel } from '../websocket';
import { User } from '../types';

interface Props {
    userId: string;
}

const UserNotification: React.FC<Props> = ({ userId }) => {
    const [user, setUser] = React.useState<User>();
    useEffect(() => {
        const cleanup = listenToUserChannel(userId, (data) => {
            console.log(`📩 Có thông báo mới từ BE: ${data}`);
            setUser(data);
        });

        return cleanup;  
    }, [userId]);

    return (
        <div className="notification">
            <h4>Recent Logins</h4>
            {user && (
                <div>
                    <p>{user.email}</p>
                    <p>{new Date(user.createAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default UserNotification;
