const file = document.querySelector('#file');
file.addEventListener('change', (e) => {
  // Get the selected file
  const [file] = e.target.files;
  // Get the file name and size
  const { name: fileName, size } = file;
  // Convert size in bytes to kilo bytes
  const fileSize = (size / 1000).toFixed(2);
  // Set the text content
  const fileNameAndSize = `${fileName} - ${fileSize}KB`;
  document.querySelector('.file-name').textContent = fileNameAndSize;
});




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

async function readFile() {
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = function (event) {
            resolve(event.target.result);
        };

        reader.onerror = function (event) {
            reject(event.target.error);
        };

        reader.readAsText(file);
    });
}

async function writeFile(contents) {
    const blob = new Blob([contents], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');

    downloadLink.href = url;
    downloadLink.download = 'modified_file.txt';
    downloadLink.click();

    window.URL.revokeObjectURL(url);
}

async function encryptme() {
    const plaintext = await readFile();
    const key = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(32)));

    try {
        const { ciphertext, iv } = await encryptSymmetric(plaintext, key);
        console.log('Ciphertext:', ciphertext);
        console.log('IV:', iv);
        console.log('key:', key);

        c = ciphertext;
        vi = iv;
        k = key;

        const modifiedContents = [c, vi, k].join(' ');
        await writeFile(modifiedContents);
    } catch (error) {
        console.error('Encryption error:', error);
    }
}

async function decryptSymmetric(ciphertext, iv, key) {
    const secretKey = await window.crypto.subtle.importKey(
        'raw',
        base64ToArrayBuffer(key),
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const cleartext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
        secretKey,
        base64ToArrayBuffer(ciphertext)
    );

    return new TextDecoder().decode(cleartext);
}

async function decryptme() {
    try {
        const fileContents = await readFile();
        const [c, vi, k] = fileContents.split(' ');

        const decryptedText = await decryptSymmetric(c, vi, k);
        console.log('Decrypted Text:', decryptedText);
        const modifiedContents = decryptedText + '\nModified content added.';
        await writeFile(modifiedContents);
    } catch (error) {
        console.error('Decryption error:', error);
    }
}
