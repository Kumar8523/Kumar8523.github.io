let bluetoothDevice;
let characteristic;

document.getElementById('connectBtn').addEventListener('click', async () => {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        });

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb'); 
        characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        characteristic.addEventListener('characteristicvaluechanged', handleIncomingMessage);
        await characteristic.startNotifications();
        alert("Connected to Bluetooth Device!");
    } catch (error) {
        console.log(error);
        alert("Bluetooth connection failed.");
    }
});

document.getElementById('sendBtn').addEventListener('click', async () => {
    const message = document.getElementById('messageInput').value;
    if (!characteristic || !message) return;

    const encoder = new TextEncoder();
    await characteristic.writeValue(encoder.encode(message));

    document.getElementById('chatBox').value += `Me: ${message}\n`;
    document.getElementById('messageInput').value = "";
});

function handleIncomingMessage(event) {
    const decoder = new TextDecoder();
    const message = decoder.decode(event.target.value);
    document.getElementById('chatBox').value += `Friend: ${message}\n`;
}