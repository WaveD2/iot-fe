import Pusher from 'pusher-js';

 
const pusher = new Pusher('d1641eea53e864ddefb2', {
    cluster: 'ap1'
});

export const listenToUserChannel = (
    userId: string,
    onMessageReceived: (data: any) => void
) => {
    const channel = pusher.subscribe('user');

    channel.bind(userId, (data: { message: string }) => {
        const parsedData = JSON.parse(data.message);
        console.log(`📩 Notification received:`, parsedData);
        onMessageReceived(parsedData);
    });

    return () => {
        channel.unbind_all();
        pusher.unsubscribe('user');
    };
};
