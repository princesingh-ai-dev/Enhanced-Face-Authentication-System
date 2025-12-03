const cameraSelect = document.getElementById('camera-select');
const startCameraBtn = document.getElementById('start-camera-btn');
const debugLog = document.getElementById('debug-log');
const video = document.getElementById('video');
const canvasWrapper = document.getElementById('canvas-wrapper');
const statusDiv = document.getElementById('status-message');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const protectedContent = document.getElementById('protected-content');
const spinner = document.getElementById('loading-spinner');
const videoContainer = document.querySelector('.video-container');

// State
let isModelLoaded = false;
let currentDetections = [];

// Debug Logger
function log(msg) {
    console.log(msg);
    if (debugLog) {
        debugLog.style.display = 'block';
        debugLog.innerHTML += `<div>${new Date().toLocaleTimeString()} - ${msg}</div>`;
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

// Load Models
async function loadModels() {
    setStatus('Loading models...', 'info');
    spinner.style.display = 'block';

    try {
        const MODEL_URL = '/models';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        ]);

        isModelLoaded = true;
        spinner.style.display = 'none';
        setStatus('System Ready. Click "Start Camera" to begin.', 'info');
    } catch (err) {
        console.error(err);
        setStatus('Error loading models. Check console.', 'error');
        spinner.style.display = 'none';
    }
}

// Start Camera Button Listener
if (startCameraBtn) {
    startCameraBtn.addEventListener('click', () => {
        startCameraBtn.style.display = 'none';
        initCamera();
    });
}

// Camera Select Listener
if (cameraSelect) {
    cameraSelect.addEventListener('change', () => {
        if (cameraSelect.value) {
            startVideo(cameraSelect.value);
        }
    });
}

// Initialize Camera (Enumerate & Start)
// Initialize Camera (Enumerate & Start)
async function initCamera() {
    log('Initializing camera system...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        const errorMsg = 'Browser API Error: enumerateDevices not supported.';
        log(errorMsg);
        setStatus(errorMsg, 'error');
        return;
    }

    try {
        // 1. Request permission first to get labels
        log('Requesting initial camera permission...');
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });

        // 2. Enumerate Devices
        log('Enumerating devices...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        log(`Found ${videoDevices.length} video devices.`);

        if (videoDevices.length === 0) {
            throw new Error('No video input devices found.');
        }

        // 3. Sort devices: "USB2.0 HD UVC WebCam" comes first
        videoDevices.sort((a, b) => {
            const labelA = (a.label || '').toLowerCase();
            const labelB = (b.label || '').toLowerCase();
            const target = 'usb2.0 hd uvc webcam';

            if (labelA.includes(target) && !labelB.includes(target)) return -1;
            if (!labelA.includes(target) && labelB.includes(target)) return 1;
            return 0;
        });

        // 4. Populate Dropdown
        if (cameraSelect) {
            cameraSelect.innerHTML = '<option value="" disabled>Select Camera...</option>';
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
                log(`Device ${index}: ${device.label} (${device.deviceId})`);
            });
        }

        // 5. Select the first device (prioritized one)
        const selectedId = videoDevices[0].deviceId;
        if (cameraSelect) cameraSelect.value = selectedId;
        log(`Auto-selecting device: ${videoDevices[0].label}`);

        // Stop initial stream before starting the specific one
        initialStream.getTracks().forEach(track => track.stop());

        // 6. Start Video
        startVideo(selectedId);

    } catch (err) {
        log(`Camera Init Failed: ${err.message}`);
        setStatus('Camera Error: ' + err.message, 'error');
        if (startCameraBtn) startCameraBtn.style.display = 'block';
    }
}

// Start Video Stream with specific Device ID
async function startVideo(deviceId) {
    log(`Starting video with Device ID: ${deviceId}`);

    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        handleStream(stream);

    } catch (err) {
        log(`Stream Request Failed: ${err.name} - ${err.message}`);
        setStatus(`Camera Error: ${err.message}`, 'error');
    }
}

function handleStream(stream) {
    log('Stream received. Setting video srcObject...');
    video.srcObject = stream;

    video.onloadedmetadata = () => {
        log(`Video metadata loaded. Size: ${video.videoWidth}x${video.videoHeight}`);
        video.play()
            .then(() => log('Video playing successfully.'))
            .catch(e => {
                log(`Error playing video: ${e.message}`);
                setStatus('Video play error: ' + e.message, 'error');
            });
    };

    video.onerror = (e) => {
        log(`Video Element Error: ${video.error ? video.error.message : 'Unknown'}`);
    };
}

// Status Helper
function setStatus(msg, type = 'normal') {
    if (statusDiv) {
        statusDiv.textContent = msg;
        statusDiv.className = 'status ' + type;
    }
}

// Face Detection Loop
video.addEventListener('play', () => {
    canvasWrapper.innerHTML = '';
    const canvas = faceapi.createCanvasFromMedia(video);
    canvasWrapper.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        if (!isModelLoaded || video.paused || video.ended) return;

        // Detect faces
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptors();

        currentDetections = detections;
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Clear canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections
        faceapi.draw.drawDetections(canvas, resizedDetections);

        // Workflow Feedback
        if (detections.length === 0) {
            // Alert: No Face Detected (Visual only, don't spam status unless active action)
        } else if (detections.length > 1) {
            setStatus('Alert: Multiple Faces Detected. Retry.', 'error');
        }
    }, 100);
});

// Enrollment Workflow
registerBtn.addEventListener('click', async () => {
    const name = usernameInput.value.trim();
    if (!name) {
        setStatus('Please enter a name.', 'error');
        return;
    }

    setStatus('Enrollment Mode: Capturing Frames...', 'info');
    videoContainer.classList.add('scanning');

    // Capture 10 frames
    const descriptors = [];
    let framesCaptured = 0;
    const MAX_FRAMES = 10;

    const captureInterval = setInterval(async () => {
        if (framesCaptured >= MAX_FRAMES) {
            clearInterval(captureInterval);
            finishEnrollment(name, descriptors);
            return;
        }

        if (currentDetections.length === 0) {
            setStatus('No Face Detected. Stay still.', 'error');
            return;
        }
        if (currentDetections.length > 1) {
            setStatus('Multiple Faces Detected. Ensure only one face.', 'error');
            return;
        }

        // Valid frame
        descriptors.push(currentDetections[0].descriptor);
        framesCaptured++;
        setStatus(`Capturing... ${framesCaptured}/${MAX_FRAMES}`, 'info');
    }, 200); // Capture every 200ms
});

async function finishEnrollment(name, descriptors) {
    videoContainer.classList.remove('scanning');
    if (descriptors.length === 0) {
        setStatus('Enrollment Failed. No valid frames.', 'error');
        return;
    }

    // Average the descriptors
    const avgDescriptor = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
        let sum = 0;
        for (const d of descriptors) {
            sum += d[i];
        }
        avgDescriptor[i] = sum / descriptors.length;
    }

    // Send to server
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                descriptor: Array.from(avgDescriptor)
            })
        });

        const data = await response.json();
        if (data.success) {
            setStatus(`Enrollment Complete for ${name}.`, 'success');
            usernameInput.value = '';
            fetchUsers(); // Refresh list
        } else {
            setStatus(`Error: ${data.message}`, 'error');
        }
    } catch (err) {
        setStatus('Network error during registration.', 'error');
    }
}

// User Management
const userList = document.getElementById('user-list');

// Auth Workflow
loginBtn.addEventListener('click', async () => {
    if (currentDetections.length === 0) {
        setStatus('Alert: No Face Detected.', 'error');
        return;
    }
    if (currentDetections.length > 1) {
        setStatus('Alert: Multiple Faces Detected.', 'error');
        return;
    }

    setStatus('Auth Mode: Verifying...', 'info');
    videoContainer.classList.add('scanning');

    const descriptor = currentDetections[0].descriptor;

    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                descriptor: Array.from(descriptor)
            })
        });

        const data = await response.json();
        if (data.success) {
            setStatus(`Auth Success: Access Granted. Welcome ${data.user.name}`, 'success');
            protectedContent.classList.remove('hidden');
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            usernameInput.style.display = 'none';
            fetchUsers(); // Fetch users only after authentication
        } else {
            setStatus('Alert: Face Mismatch. Access Denied.', 'error');
        }
    } catch (err) {
        setStatus('Network error during verification.', 'error');
    } finally {
        videoContainer.classList.remove('scanning');
    }
});

// Initialize
loadModels();

async function fetchUsers() {
    if (!userList) return;

    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        userList.innerHTML = '';
        if (users.length === 0) {
            userList.innerHTML = '<li style="color: var(--text-muted); padding: 0.5rem;">No registered users.</li>';
            return;
        }

        users.forEach(user => {
            const li = document.createElement('li');
            li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1);';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = user.name;
            nameSpan.style.fontWeight = '500';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.cssText = 'background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.5); padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;';
            deleteBtn.onmouseover = () => deleteBtn.style.background = 'rgba(239, 68, 68, 0.4)';
            deleteBtn.onmouseout = () => deleteBtn.style.background = 'rgba(239, 68, 68, 0.2)';

            deleteBtn.onclick = () => deleteUser(user.name);

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            userList.appendChild(li);
        });
    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

async function deleteUser(name) {
    // if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    log(`Attempting to delete user: ${name}`);

    try {
        const url = `/api/delete/${encodeURIComponent(name)}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Server returned non-JSON: ${text.substring(0, 50)}`);
        }

        if (data.success) {
            setStatus(`User ${name} deleted.`, 'success');
            fetchUsers(); // Refresh list
        } else {
            setStatus(`Error: ${data.message}`, 'error');
        }
    } catch (err) {
        log(`Delete failed: ${err.message}`);
        setStatus(`Delete failed: ${err.message}`, 'error');
    }
}
