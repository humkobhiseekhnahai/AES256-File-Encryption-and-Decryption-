
let c;
let k;
let vi;

async function encryptSymmetric(plaintext, key) {

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedPlaintext = new TextEncoder().encode(plaintext);
    const secretKey = await window.crypto.subtle.importKey('raw',
        base64ToArrayBuffer(key), { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);


    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        secretKey,
        encodedPlaintext
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv)
    };
}

function base64ToArrayBuffer(base64String) {
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToBase64(arrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function encryptme() {
    const plaintext = document.getElementById('inputbox').value;
    const key = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(32)));
    encryptSymmetric(plaintext, key)
        .then(({ ciphertext, iv }) => {
            console.log('Ciphertext:', ciphertext);
            console.log('IV:', iv);
            console.log("key:", key);
            c = ciphertext;
            vi = iv;
            k = key;
            document.getElementById('inputbox').value = c;
        })
        .catch(error => console.error('Encryption error:', error));
}

async function decryptSymmetric(ciphertext, iv, key) {

    const secretKey = await window.crypto.subtle.importKey(
        'raw',
        base64ToArrayBuffer(key),
        {
            name: 'AES-GCM',
            length: 256
        }, true, ['encrypt', 'decrypt']);


    const cleartext = await window.crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: base64ToArrayBuffer(iv),
    }, secretKey, base64ToArrayBuffer(ciphertext));


    return new TextDecoder().decode(cleartext);
}

async function decryptme() {
    const decryptedText = await decryptSymmetric(c, vi, k);
    console.log('Decrypted Text:', decryptedText);
    document.getElementById('inputbox').value = decryptedText;

}

