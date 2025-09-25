/**
 * AMC8 测试计时器类
 * 功能：75分钟倒计时，自动保存，时间到自动提交
 */
class Timer {
    constructor(totalSeconds = 4500) { // 默认75分钟
        this.totalSeconds = totalSeconds;
        this.remainingSeconds = totalSeconds;
        this.isRunning = false;
        this.intervalId = null;
        this.startTime = null;
        
        // DOM元素
        this.timerDisplay = document.getElementById('timer-display');
        
        // 加载保存的时间状态
        this.loadSavedTime();
        
        // 绑定页面可见性变化事件
        this.bindVisibilityEvents();
    }

    /**
     * 开始计时
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - (this.totalSeconds - this.remainingSeconds) * 1000;
        
        // 保存开始时间
        this.saveTimeState();
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateDisplay();
        console.log('计时器已启动，剩余时间:', this.formatTime(this.remainingSeconds));
    }

    /**
     * 暂停计时
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.saveTimeState();
        console.log('计时器已暂停');
    }

    /**
     * 恢复计时
     */
    resume() {
        if (this.isRunning) return;
        this.start();
    }

    /**
     * 停止计时
     */
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        localStorage.removeItem('amc8_timer_state');
        console.log('计时器已停止');
    }

    /**
     * 计时器滴答
     */
    tick() {
        if (!this.isRunning) return;
        
        // 基于实际时间计算剩余时间，避免累积误差
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - this.startTime) / 1000);
        this.remainingSeconds = Math.max(0, this.totalSeconds - elapsedSeconds);
        
        this.updateDisplay();
        
        // 每10秒自动保存一次
        if (elapsedSeconds % 10 === 0) {
            this.saveTimeState();
            if (window.testEngine) {
                window.testEngine.autoSave();
            }
        }
        
        // 时间警告
        if (this.remainingSeconds <= 300 && this.remainingSeconds > 0) { // 最后5分钟
            this.showTimeWarning();
        }
        
        // 时间到，自动提交
        if (this.remainingSeconds <= 0) {
            this.timeUp();
        }
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        if (this.timerDisplay) {
            const timeText = this.formatTime(this.remainingSeconds);
            this.timerDisplay.textContent = timeText;
            
            // 时间警告样式
            if (this.remainingSeconds <= 300) { // 最后5分钟
                this.timerDisplay.classList.add('timer-warning');
                this.timerDisplay.parentElement.classList.remove('bg-blue-50', 'border-blue-200');
                this.timerDisplay.parentElement.classList.add('bg-red-50', 'border-red-200');
                this.timerDisplay.classList.remove('text-blue-700');
                this.timerDisplay.classList.add('text-red-700');
            }
        }
    }

    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * 显示时间警告
     */
    showTimeWarning() {
        // 只在第一次警告时显示
        if (!this.warningShown && this.remainingSeconds === 300) {
            this.warningShown = true;
            
            // 显示通知
            this.showNotification('时间警告', '还剩5分钟，请尽快完成答题！', 'warning');
            
            // 浏览器通知（如果用户允许）
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('AMC8测试时间警告', {
                    body: '还剩5分钟，请尽快完成答题！',
                    icon: '/assets/images/warning-icon.png'
                });
            }
        }
    }

    /**
     * 时间到处理
     */
    timeUp() {
        this.stop();
        
        console.log('时间到，自动提交测试');
        
        // 显示时间到通知
        this.showNotification('时间到', '测试时间已结束，系统将自动提交答案', 'error');
        
        // 自动提交测试
        setTimeout(() => {
            if (window.testEngine) {
                window.testEngine.forceSubmit();
            } else {
                // 备用提交方式
                this.submitTest();
            }
        }, 2000);
    }

    /**
     * 保存时间状态
     */
    saveTimeState() {
        const state = {
            totalSeconds: this.totalSeconds,
            remainingSeconds: this.remainingSeconds,
            startTime: this.startTime,
            isRunning: this.isRunning,
            timestamp: Date.now()
        };
        
        localStorage.setItem('amc8_timer_state', JSON.stringify(state));
    }

    /**
     * 加载保存的时间状态
     */
    loadSavedTime() {
        try {
            const savedState = localStorage.getItem('amc8_timer_state');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            const now = Date.now();
            
            // 检查保存的状态是否有效（不超过2小时）
            if (now - state.timestamp > 2 * 60 * 60 * 1000) {
                console.log('保存的计时器状态已过期');
                localStorage.removeItem('amc8_timer_state');
                return;
            }
            
            // 如果之前正在运行，计算实际剩余时间
            if (state.isRunning && state.startTime) {
                const elapsedSeconds = Math.floor((now - state.startTime) / 1000);
                this.remainingSeconds = Math.max(0, state.totalSeconds - elapsedSeconds);
                this.startTime = state.startTime;
                
                console.log('恢复计时器状态，剩余时间:', this.formatTime(this.remainingSeconds));
                
                // 如果时间还没到，继续计时
                if (this.remainingSeconds > 0) {
                    this.start();
                } else {
                    this.timeUp();
                }
            } else {
                // 使用保存的剩余时间
                this.remainingSeconds = state.remainingSeconds;
                this.updateDisplay();
            }
            
        } catch (error) {
            console.error('加载计时器状态失败:', error);
            localStorage.removeItem('amc8_timer_state');
        }
    }

    /**
     * 绑定页面可见性事件
     */
    bindVisibilityEvents() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveTimeState();
            } else {
                this.loadSavedTime();
            }
        });
        
        // 页面失焦/获焦
        window.addEventListener('blur', () => {
            this.saveTimeState();
        });
        
        window.addEventListener('focus', () => {
            this.loadSavedTime();
        });
    }

    /**
     * 显示通知
     */
    showNotification(title, message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        
        // 根据类型设置样式
        const styles = {
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white',
            success: 'bg-green-500 text-white'
        };
        
        notification.classList.add(...styles[type].split(' '));
        
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : 
                                   type === 'warning' ? 'fa-exclamation-circle' : 
                                   type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold">${title}</h4>
                    <p class="text-sm mt-1 opacity-90">${message}</p>
                </div>
                <button class="flex-shrink-0 ml-2" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times opacity-70 hover:opacity-100"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自动消失
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * 备用提交方式
     */
    submitTest() {
        // 保存当前答案
        const answers = JSON.parse(localStorage.getItem('amc8_test_answers') || '{}');
        
        // 标记为时间到自动提交
        answers._autoSubmitted = true;
        answers._submitTime = new Date().toISOString();
        
        localStorage.setItem('amc8_test_answers', JSON.stringify(answers));
        
        // 跳转到结果页面
        window.location.href = 'result.html';
    }

    /**
     * 获取剩余时间（秒）
     */
    getRemainingSeconds() {
        return this.remainingSeconds;
    }

    /**
     * 获取已用时间（秒）
     */
    getElapsedSeconds() {
        return this.totalSeconds - this.remainingSeconds;
    }

    /**
     * 获取进度百分比
     */
    getProgress() {
        return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
    }
}

// 请求通知权限
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        console.log('通知权限:', permission);
    });
}