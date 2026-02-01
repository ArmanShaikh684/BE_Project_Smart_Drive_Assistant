// ============================================
// SMART DRIVER ASSISTANT - JAVASCRIPT
// ============================================

// State Management
let currentScreen = 'identification';
let monitoringActive = false;
let alertActive = false;
let countdownInterval = null;

// Simulated monitoring data
let monitoringState = {
    drowsiness: {
        ear: 0.28,
        status: 'safe',
        threshold: 0.25
    },
    distraction: {
        headPose: 'Forward',
        yaw: 2,
        pitch: -5,
        status: 'safe'
    },
    phone: {
        confidence: 0,
        status: 'safe'
    },
    audio: {
        level: 45,
        status: 'safe'
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeMonitoring();
    startSimulation();
    animateSoundVisualizer();
    
    console.log('🚗 Smart Driver Assistant initialized');
});

// ============================================
// NAVIGATION
// ============================================

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const screenId = button.getAttribute('data-screen');
            switchScreen(screenId);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function switchScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        console.log(`📱 Switched to screen: ${screenId}`);
    }
}

// ============================================
// MONITORING SIMULATION
// ============================================

function initializeMonitoring() {
    monitoringActive = true;
    console.log('👁️ Monitoring systems activated');
}

function startSimulation() {
    // Simulate face recognition
    setTimeout(() => {
        const recognitionStatus = document.getElementById('recognition-status');
        if (recognitionStatus) {
            recognitionStatus.className = 'status-indicator status-safe';
            recognitionStatus.innerHTML = '<span class="status-dot"></span> Recognized';
        }
    }, 2000);
    
    // Start monitoring updates
    setInterval(updateMonitoringData, 3000);
    
    // Randomly trigger alerts (for demo)
    setInterval(randomAlertTrigger, 15000);
}

function updateMonitoringData() {
    if (!monitoringActive) return;
    
    // Update drowsiness (EAR value)
    const earVariation = (Math.random() - 0.5) * 0.1;
    monitoringState.drowsiness.ear = Math.max(0.15, Math.min(0.35, monitoringState.drowsiness.ear + earVariation));
    
    const earValue = document.getElementById('ear-value');
    const earProgress = document.getElementById('ear-progress');
    const drowsinessStatus = document.getElementById('drowsiness-status');
    
    if (earValue) {
        earValue.textContent = monitoringState.drowsiness.ear.toFixed(2);
        const percentage = (monitoringState.drowsiness.ear / 0.4) * 100;
        if (earProgress) earProgress.style.width = `${percentage}%`;
        
        // Update status
        if (monitoringState.drowsiness.ear < 0.22) {
            monitoringState.drowsiness.status = 'critical';
            if (drowsinessStatus) {
                drowsinessStatus.className = 'status-indicator status-critical';
                drowsinessStatus.innerHTML = '<span class="status-dot"></span> Drowsy!';
            }
            addAlertMessage('Drowsiness detected! EAR value critically low.', 'critical');
        } else if (monitoringState.drowsiness.ear < 0.25) {
            monitoringState.drowsiness.status = 'warning';
            if (drowsinessStatus) {
                drowsinessStatus.className = 'status-indicator status-warning';
                drowsinessStatus.innerHTML = '<span class="status-dot"></span> Tired';
            }
            addAlertMessage('Driver appears tired. Consider taking a break.', 'warning');
        } else {
            monitoringState.drowsiness.status = 'safe';
            if (drowsinessStatus) {
                drowsinessStatus.className = 'status-indicator status-safe';
                drowsinessStatus.innerHTML = '<span class="status-dot"></span> Alert';
            }
        }
    }
    
    // Update head pose
    const headPoses = ['Forward', 'Left', 'Right', 'Down'];
    const randomPose = headPoses[Math.floor(Math.random() * headPoses.length)];
    
    if (Math.random() > 0.7) {
        monitoringState.distraction.headPose = randomPose;
        monitoringState.distraction.yaw = Math.floor(Math.random() * 30) - 15;
        monitoringState.distraction.pitch = Math.floor(Math.random() * 20) - 10;
        
        const headPoseEl = document.getElementById('head-pose');
        const yawAngle = document.getElementById('yaw-angle');
        const pitchAngle = document.getElementById('pitch-angle');
        const distractionStatus = document.getElementById('distraction-status');
        
        if (headPoseEl) headPoseEl.textContent = monitoringState.distraction.headPose;
        if (yawAngle) yawAngle.textContent = `${monitoringState.distraction.yaw}°`;
        if (pitchAngle) pitchAngle.textContent = `${monitoringState.distraction.pitch}°`;
        
        if (randomPose !== 'Forward') {
            monitoringState.distraction.status = 'warning';
            if (distractionStatus) {
                distractionStatus.className = 'status-indicator status-warning';
                distractionStatus.innerHTML = '<span class="status-dot"></span> Distracted';
            }
            addAlertMessage(`Driver looking ${randomPose.toLowerCase()}. Please focus on road.`, 'warning');
        } else {
            monitoringState.distraction.status = 'safe';
            if (distractionStatus) {
                distractionStatus.className = 'status-indicator status-safe';
                distractionStatus.innerHTML = '<span class="status-dot"></span> Focused';
            }
        }
    }
    
    // Update phone detection
    if (Math.random() > 0.85) {
        monitoringState.phone.confidence = Math.floor(Math.random() * 100);
        
        const phoneConfidence = document.getElementById('phone-confidence');
        const phoneProgress = document.getElementById('phone-progress');
        const phoneStatus = document.getElementById('phone-status');
        
        if (phoneConfidence) phoneConfidence.textContent = `${monitoringState.phone.confidence}%`;
        if (phoneProgress) phoneProgress.style.width = `${monitoringState.phone.confidence}%`;
        
        if (monitoringState.phone.confidence > 70) {
            monitoringState.phone.status = 'critical';
            if (phoneStatus) {
                phoneStatus.className = 'status-indicator status-critical';
                phoneStatus.innerHTML = '<span class="status-dot"></span> Phone Detected!';
            }
            addAlertMessage('Phone usage detected! Please keep hands on wheel.', 'critical');
        } else if (monitoringState.phone.confidence > 40) {
            monitoringState.phone.status = 'warning';
            if (phoneStatus) {
                phoneStatus.className = 'status-indicator status-warning';
                phoneStatus.innerHTML = '<span class="status-dot"></span> Possible Phone';
            }
        } else {
            monitoringState.phone.status = 'safe';
            if (phoneStatus) {
                phoneStatus.className = 'status-indicator status-safe';
                phoneStatus.innerHTML = '<span class="status-dot"></span> Clear';
            }
        }
    }
    
    // Update overall status
    updateOverallStatus();
}

function updateOverallStatus() {
    const overallStatus = document.getElementById('overall-status');
    if (!overallStatus) return;
    
    const statuses = [
        monitoringState.drowsiness.status,
        monitoringState.distraction.status,
        monitoringState.phone.status
    ];
    
    if (statuses.includes('critical')) {
        overallStatus.className = 'status-indicator status-critical';
        overallStatus.innerHTML = '<span class="status-dot"></span> Critical Alert!';
    } else if (statuses.includes('warning')) {
        overallStatus.className = 'status-indicator status-warning';
        overallStatus.innerHTML = '<span class="status-dot"></span> Warning';
    } else {
        overallStatus.className = 'status-indicator status-safe';
        overallStatus.innerHTML = '<span class="status-dot"></span> All Systems Normal';
    }
}

// ============================================
// ALERT SYSTEM
// ============================================

function addAlertMessage(message, type = 'info') {
    const alertPanel = document.getElementById('alert-panel');
    if (!alertPanel) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-message ${type}`;
    
    const icon = type === 'critical' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    
    alertDiv.innerHTML = `
        <span>${icon}</span>
        <span>${message} <small class="text-muted">(${timestamp})</small></span>
    `;
    
    alertPanel.insertBefore(alertDiv, alertPanel.firstChild);
    
    // Keep only last 5 alerts
    while (alertPanel.children.length > 5) {
        alertPanel.removeChild(alertPanel.lastChild);
    }
}

function randomAlertTrigger() {
    const random = Math.random();
    
    // 20% chance to trigger drowsiness alert
    if (random < 0.2 && !alertActive) {
        triggerDrowsinessAlert();
    }
}

function triggerDrowsinessAlert() {
    const modal = document.getElementById('drowsiness-modal');
    if (!modal || alertActive) return;
    
    alertActive = true;
    modal.classList.add('active');
    
    // Start countdown
    let countdown = 30;
    const countdownEl = document.getElementById('countdown-timer');
    
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            // Auto-trigger emergency call
            callEmergency();
        }
    }, 1000);
    
    console.log('🚨 Drowsiness alert triggered!');
    addAlertMessage('CRITICAL: Drowsiness alert triggered!', 'critical');
}

// ============================================
// MODAL ACTIONS
// ============================================

function dismissAlert() {
    const modal = document.getElementById('drowsiness-modal');
    if (modal) {
        modal.classList.remove('active');
        alertActive = false;
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        // Reset countdown
        const countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) countdownEl.textContent = '30';
        
        addAlertMessage('Alert dismissed by driver.', 'info');
        console.log('✅ Alert dismissed');
    }
}

function callEmergency() {
    dismissAlert();
    switchScreen('emergency');
    
    // Update nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-screen') === 'emergency') {
            btn.classList.add('active');
        }
    });
    
    addAlertMessage('Emergency protocol activated. Calling emergency contact...', 'critical');
    console.log('📞 Emergency call initiated');
}

function muteAlert() {
    addAlertMessage('Alert muted. Monitoring continues...', 'warning');
    console.log('🔇 Alert muted');
    
    // Still dismiss the modal but log that it was muted
    dismissAlert();
}

// ============================================
// SOUND VISUALIZER ANIMATION
// ============================================

function animateSoundVisualizer() {
    const soundBars = document.querySelectorAll('.sound-bar');
    const soundLevelEl = document.getElementById('sound-level');
    const audioStatusEl = document.getElementById('audio-status');
    
    setInterval(() => {
        soundBars.forEach(bar => {
            const randomHeight = Math.random() * 80 + 20;
            bar.style.height = `${randomHeight}%`;
        });
        
        // Update sound level
        const level = Math.floor(Math.random() * 40) + 40; // 40-80 dB
        monitoringState.audio.level = level;
        
        if (soundLevelEl) {
            soundLevelEl.textContent = `${level} dB`;
        }
        
        // Check for anomaly
        if (level > 85) {
            monitoringState.audio.status = 'critical';
            if (audioStatusEl) {
                audioStatusEl.className = 'status-indicator status-critical';
                audioStatusEl.innerHTML = '<span class="status-dot"></span> Loud Noise!';
            }
            addAlertMessage(`Loud noise detected: ${level} dB`, 'warning');
        } else {
            monitoringState.audio.status = 'safe';
            if (audioStatusEl) {
                audioStatusEl.className = 'status-indicator status-safe';
                audioStatusEl.innerHTML = '<span class="status-dot"></span> Listening';
            }
        }
    }, 200);
}

// ============================================
// ADDITIONAL ANIMATIONS
// ============================================

// Add CSS animation for progress bar pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes progressPulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ============================================
// DEMO MODE MESSAGES
// ============================================

const demoMessages = [
    { message: 'System performing optimally', type: 'info' },
    { message: 'Road conditions: Good', type: 'info' },
    { message: 'Fuel level: 65%', type: 'info' },
    { message: 'Next rest stop in 15 km', type: 'info' },
    { message: 'Weather update: Clear skies ahead', type: 'info' },
    { message: 'Traffic light ahead', type: 'warning' },
    { message: 'Speed limit: 80 km/h', type: 'info' }
];

// Add random demo messages
setInterval(() => {
    if (Math.random() > 0.7) {
        const randomMsg = getRandomElement(demoMessages);
        addAlertMessage(randomMsg.message, randomMsg.type);
    }
}, 8000);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Press 'D' to trigger demo drowsiness alert
    if (e.key === 'd' || e.key === 'D') {
        if (!alertActive) {
            triggerDrowsinessAlert();
        }
    }
    
    // Press 'Escape' to dismiss alert
    if (e.key === 'Escape') {
        dismissAlert();
    }
    
    // Number keys 1-7 for quick navigation
    const screenMap = {
        '1': 'identification',
        '2': 'dashboard',
        '3': 'voice',
        '4': 'rest-stops',
        '5': 'traffic',
        '6': 'emergency',
        '7': 'audio'
    };
    
    if (screenMap[e.key]) {
        switchScreen(screenMap[e.key]);
        
        // Update nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-screen') === screenMap[e.key]) {
                btn.classList.add('active');
            }
        });
    }
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================

console.log(`
%c🚗 Smart Driver Assistant Dashboard
%cVersion 1.0 | BE Final Year Project
%c
Keyboard Shortcuts:
- Press 1-7: Navigate between screens
- Press 'D': Trigger demo drowsiness alert
- Press 'Esc': Dismiss alert

Monitoring Status: Active ✅
`, 
'color: #3b82f6; font-size: 20px; font-weight: bold;',
'color: #6b7280; font-size: 12px;',
'color: #00ff88; font-size: 14px;'
);
