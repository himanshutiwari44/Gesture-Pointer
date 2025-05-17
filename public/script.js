document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const startBtn = document.getElementById('startBtn');
    const screenshotBtn = document.getElementById('screenshotBtn');
    const screenshotsContainer = document.getElementById('screenshots-container');
    
    // Check server status on page load
    checkStatus();
    
    // Event Listeners
    startBtn.addEventListener('click', startGestureControl);
    screenshotBtn.addEventListener('click', takeScreenshot);
    
    // Functions
    async function checkStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.status === 'online') {
                statusDot.classList.add('online');
                statusDot.classList.remove('offline');
                statusText.textContent = 'System Online';
                screenshotBtn.disabled = false;
            } else {
                setOfflineStatus();
            }
        } catch (error) {
            console.error('Error checking status:', error);
            setOfflineStatus();
        }
    }
    
    function setOfflineStatus() {
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        statusText.textContent = 'System Offline';
        screenshotBtn.disabled = true;
    }
    
    async function startGestureControl() {
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
        
        try {
            const response = await fetch('/api/start-gesture-control');
            const data = await response.json();
            
            if (data.success) {
                statusDot.classList.add('online');
                statusDot.classList.remove('offline');
                statusText.textContent = 'Gesture Control Active';
                startBtn.innerHTML = '<i class="fas fa-check"></i> Running';
                
                // Create notification
                createNotification('Gesture control started successfully!', 'success');
                
                // 
                screenshotBtn.disabled = false;
            } else {
                handleError('Failed to start gesture control.');
            }
        } catch (error) {
            console.error('Error starting gesture control:', error);
            handleError('Server error. Could not start gesture control.');
        }
    }
    
    async function takeScreenshot() {
        screenshotBtn.disabled = true;
        screenshotBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            const response = await fetch('/api/screenshot');
            const data = await response.json();
            
            if (data.success) {
                // Add screenshot to the gallery
                addScreenshotToGallery(data.filename);
                createNotification('Screenshot taken successfully!', 'success');
            } else {
                createNotification('Failed to take screenshot.', 'error');
            }
        } catch (error) {
            console.error('Error taking screenshot:', error);
            createNotification('Server error. Could not take screenshot.', 'error');
        } finally {
            screenshotBtn.disabled = false;
            screenshotBtn.innerHTML = '<i class="fas fa-camera"></i> Take Screenshot';
        }
    }
    
    function addScreenshotToGallery(filename) {
        const screenshotItem = document.createElement('div');
        screenshotItem.className = 'screenshot-item';
        
        // Format timestamp from filename
        const timestampStr = filename.replace('screenshot_', '').replace('.png', '');
        const formattedDate = formatTimestamp(timestampStr);
        
        screenshotItem.innerHTML = `
            <img src="screenshots/${filename}" alt="Screenshot">
            <div class="screenshot-overlay">
                <p>${formattedDate}</p>
            </div>
        `;
        
        screenshotsContainer.insertBefore(screenshotItem, screenshotsContainer.firstChild);
    }
    
    function formatTimestamp(timestamp) {
        // Format: YYYYMMDD-HHMMSS to readable date
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6);
        const day = timestamp.substring(6, 8);
        const hour = timestamp.substring(9, 11);
        const minute = timestamp.substring(11, 13);
        const second = timestamp.substring(13, 15);
        
        return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
    }
    
    function handleError(message) {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Gesture Control';
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        statusText.textContent = 'System Error';
        createNotification(message, 'error');
    }
    
    function createNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getIconByType(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
    
    function getIconByType(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-exclamation-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            default:
                return 'fa-info-circle';
        }
    }
    
    // Add CSS for notifications
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s forwards;
        }
        
        .notification.hide {
            animation: slideOut 0.3s forwards;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification.success {
            background-color: #34d399;
            color: white;
        }
        
        .notification.error {
            background-color: #f87171;
            color: white;
        }
        
        .notification.warning {
            background-color: #fbbf24;
            color: white;
        }
        
        .notification.info {
            background-color: #4a6cfa;
            color: white;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(notificationStyle);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Press 'S' to take screenshot
        if (event.key === 's' && !screenshotBtn.disabled) {
            takeScreenshot();
        }
        
        // Press 'R' to start/restart gesture control
        if (event.key === 'r' && !startBtn.disabled) {
            startGestureControl();
        }
    });
});