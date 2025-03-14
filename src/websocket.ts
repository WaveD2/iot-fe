import Pusher from 'pusher-js';

//https://iot-waved.vercel.app/
const pusher = new Pusher('d1641eea53e864ddefb2', {
    cluster: 'ap1'
});

export const listenToUserChannel = (
    onMessageReceived: (data: any) => void
) => {
    const channel = pusher.subscribe('user');
    
    channel.bind("web", (data: { message: string }) => {
        const parsedData = JSON.parse(data.message);
        console.log(`du lieu:`, parsedData);
        onMessageReceived(parsedData);
    });

    return () => {
        channel.unbind_all();
        pusher.unsubscribe('user');
    };
};
