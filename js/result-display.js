/**
 * 结果显示类
 * 功能：结果可视化、图表生成、报告展示
 */
class ResultDisplay {
    constructor() {
        this.radarChart = null;
        this.animationDuration = 800;
    }

    /**
     * 显示测试结果
     */
    displayResults(report) {
        console.log('开始显示测试结果...');
        
        // 显示总体成绩
        this.displayOverallScore(report);
        
        // 显示班型推荐
        this.displayClassRecommendation(report);
        
        // 显示统计信息
        this.displayStatistics(report);
        
        // 显示能力雷达图
        this.displayRadarChart(report);
        
        // 显示科目分析
        this.displaySubjectAnalysis(report);
        
        // 显示学习建议
        this.displayStudyRecommendations(report);
        
        // 显示详细题目分析
        this.displayDetailedResults(report);
        
        console.log('测试结果显示完成');
    }

    /**
     * 显示总体成绩
     */
    displayOverallScore(report) {
        const scoreDisplay = document.getElementById('score-display');
        const percentageDisplay = document.getElementById('percentage-display');
        const scoreCircle = document.getElementById('score-circle');
        
        // 动画显示分数
        this.animateNumber(scoreDisplay, 0, report.score, this.animationDuration);
        this.animateNumber(percentageDisplay, 0, report.percentage, this.animationDuration, '%');
        
        // 设置进度圆环
        const scoreDegree = (report.score / 25) * 360;
        scoreCircle.style.setProperty('--score-deg', `${scoreDegree}deg`);
        
        // 根据分数设置颜色
        const color = this.getScoreColor(report.percentage);
        scoreCircle.style.setProperty('--primary-color', color);
        
        // 测试总结
        const testSummary = document.getElementById('test-summary');
        testSummary.textContent = `你在25道题中答对了${report.score}题，超过了${this.getPerformanceComparison(report.percentage)}的同龄人`;
    }

    /**
     * 显示班型推荐
     */
    displayClassRecommendation(report) {
        const classRecommendation = document.getElementById('class-recommendation');
        const recommendation = report.classRecommendation;
        
        classRecommendation.textContent = recommendation.title;
        classRecommendation.style.setProperty('--class-color', recommendation.color);
        classRecommendation.style.setProperty('--class-color-dark', this.darkenColor(recommendation.color, 20));
        
        // 添加描述
        const description = document.createElement('div');
        description.className = 'text-sm mt-2 opacity-90';
        description.textContent = recommendation.description;
        classRecommendation.appendChild(description);
    }

    /**
     * 显示统计信息
     */
    displayStatistics(report) {
        // 已答题数
        const answeredCount = document.getElementById('answered-count');
        this.animateNumber(answeredCount, 0, report.answeredQuestions, this.animationDuration);
        
        // 正确题数
        const correctCount = document.getElementById('correct-count');
        this.animateNumber(correctCount, 0, report.correctAnswers, this.animationDuration);
        
        // 准确率
        const accuracyRate = document.getElementById('accuracy-rate');
        const accuracy = report.answeredQuestions > 0 
            ? Math.round((report.correctAnswers / report.answeredQuestions) * 100)
            : 0;
        this.animateNumber(accuracyRate, 0, accuracy, this.animationDuration, '%');
    }

    /**
     * 显示能力雷达图
     */
    displayRadarChart(report) {
        const canvas = document.getElementById('radar-chart');
        const ctx = canvas.getContext('2d');
        
        // 设置高分辨率Canvas - 关键改进
        const dpr = window.devicePixelRatio || 1;
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // 确保Canvas不超过容器尺寸，留出一些边距
        const maxWidth = containerRect.width * 0.9; // 90%宽度
        const maxHeight = containerRect.height * 0.9; // 90%高度
        
        // 使用较小尺寸确保图表完整显示
        const size = Math.min(maxWidth, maxHeight);
        
        // 设置实际尺寸
        canvas.width = size * dpr * 2; // 2倍设备像素比
        canvas.height = size * dpr * 2;
        
        // 设置显示尺寸 - 确保在容器内居中
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        
        // 缩放绘图上下文
        ctx.scale(dpr * 2, dpr * 2);
        
        // 准备雷达图数据
        const subjects = Object.values(report.subjectScores);
        const labels = subjects.map(s => s.name);
        const data = subjects.map(s => s.percentage);
        
        // 销毁现有图表
        if (this.radarChart) {
            this.radarChart.destroy();
        }
        
        // 创建雷达图
        this.radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '正确率 (%)',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgb(59, 130, 246)',
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            showLabelBackdrop: false,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                animation: {
                    duration: this.animationDuration,
                    onComplete: () => {
                        // 动画完成后为打印生成静态图片
                        this.generatePrintImage(canvas);
                    }
                }

            }
        });
    }

    /**
     * 为打印生成静态图片
     */
    generatePrintImage(canvas) {
        try {
            // 直接使用已经高分辨率的Canvas生成图片
            // 无需再次放大，因为Canvas创建时已设置高分辨率
            const imageDataURL = canvas.toDataURL('image/png', 1.0);
            
            // 创建图片元素
            const printImg = document.createElement('img');
            printImg.src = imageDataURL;
            printImg.className = 'print-chart-image';
            printImg.style.display = 'none'; // 默认隐藏，仅在打印时显示
            printImg.style.width = '100%';
            printImg.style.height = 'auto';
            printImg.style.maxHeight = '300px';
            // 设置高质量图像渲染
            printImg.style.imageRendering = 'crisp-edges';
            printImg.style.imageRendering = '-webkit-optimize-contrast';
            printImg.style.imageRendering = 'pixelated'; // 备用选项
            
            // 移除之前生成的打印图片（如果存在）
            const container = canvas.parentNode;
            const existingPrintImg = container.querySelector('.print-chart-image');
            if (existingPrintImg) {
                existingPrintImg.remove();
            }
            
            // 将图片插入到图表容器中
            container.appendChild(printImg);
            
            console.log('高清雷达图打印图片已生成 (原始分辨率:', canvas.width, 'x', canvas.height, ')');
        } catch (error) {
            console.error('生成打印图片失败:', error);
            // 备用方案：使用原始分辨率
            try {
                const imageDataURL = canvas.toDataURL('image/png', 1.0);
                const printImg = document.createElement('img');
                printImg.src = imageDataURL;
                printImg.className = 'print-chart-image';
                printImg.style.display = 'none';
                printImg.style.width = '100%';
                printImg.style.height = 'auto';
                printImg.style.maxHeight = '300px';
                
                const container = canvas.parentNode;
                container.appendChild(printImg);
                
                console.log('备用雷达图打印图片已生成');
            } catch (fallbackError) {
                console.error('备用方案也失败:', fallbackError);
            }
        }
    }

    /**
     * 显示科目分析
     */
    displaySubjectAnalysis(report) {
        const container = document.getElementById('subject-analysis');
        container.innerHTML = '';
        
        Object.values(report.subjectScores).forEach((subject, index) => {
            const subjectDiv = document.createElement('div');
            subjectDiv.className = 'mb-4';
            
            subjectDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-900">${subject.name}</span>
                    <span class="text-sm text-gray-600">${subject.correct}/${subject.total} (${subject.percentage}%)</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="subject-bar bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                         style="width: 0%;" 
                         data-width="${subject.percentage}%"></div>
                </div>
            `;
            
            container.appendChild(subjectDiv);
            
            // 动画显示进度条
            setTimeout(() => {
                const bar = subjectDiv.querySelector('.subject-bar');
                bar.style.width = bar.dataset.width;
            }, 200 + index * 100);
        });
    }

    /**
     * 显示学习建议
     */
    displayStudyRecommendations(report) {
        // 显示评价文本
        const evaluationText = document.getElementById('evaluation-text');
        evaluationText.textContent = report.evaluation;
        
        // 显示优势领域
        const strengthsList = document.getElementById('strengths-list');
        strengthsList.innerHTML = '';
        
        report.testAnalysis.strengths.forEach(strength => {
            const item = document.createElement('div');
            item.className = 'flex items-start space-x-2 text-green-700';
            item.innerHTML = `
                <i class="fas fa-check-circle mt-1 text-sm"></i>
                <span class="text-sm">${strength}</span>
            `;
            strengthsList.appendChild(item);
        });
        
        // 显示提升建议
        const improvementsList = document.getElementById('improvements-list');
        improvementsList.innerHTML = '';
        
        report.studyRecommendations
            .filter(rec => rec.type === 'weakness' || rec.type === 'improvement')
            .slice(0, 5)
            .forEach(recommendation => {
                const item = document.createElement('div');
                item.className = 'flex items-start space-x-2 text-red-700';
                item.innerHTML = `
                    <i class="fas fa-arrow-up mt-1 text-sm"></i>
                    <span class="text-sm">${recommendation.message}</span>
                `;
                improvementsList.appendChild(item);
            });
    }

    /**
     * 显示详细题目分析
     */
    displayDetailedResults(report) {
        const tbody = document.getElementById('detailed-results');
        tbody.innerHTML = '';
        
        report.detailedResults.forEach(result => {
            const row = document.createElement('tr');
            row.className = result.isCorrect ? 'bg-green-50' : 'bg-red-50';
            
            // 难度显示
            const difficultyMap = {
                'easy': { text: '简单', color: 'text-green-600' },
                'medium': { text: '中等', color: 'text-yellow-600' },
                'hard': { text: '困难', color: 'text-red-600' }
            };
            
            const difficultyInfo = difficultyMap[result.difficulty] || { text: '中等', color: 'text-yellow-600' };
            
            row.innerHTML = `
                <td class="py-3 px-4 font-medium">${result.questionId}</td>
                <td class="py-3 px-4">${result.subject}</td>
                <td class="py-3 px-4">
                    <span class="${difficultyInfo.color} font-medium">${difficultyInfo.text}</span>
                </td>
                <td class="py-3 px-4 font-mono text-lg">
                    ${result.isAnswered ? result.userAnswer : '-'}
                </td>
                <td class="py-3 px-4 font-mono text-lg font-semibold text-green-600">
                    ${result.correctAnswer}
                </td>
                <td class="py-3 px-4">
                    ${result.isCorrect 
                        ? '<i class="fas fa-check text-green-600"></i>' 
                        : result.isAnswered 
                            ? '<i class="fas fa-times text-red-600"></i>' 
                            : '<i class="fas fa-minus text-gray-400"></i>'
                    }
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    /**
     * 数字动画
     */
    animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用easeOutCubic缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeProgress);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    /**
     * 根据分数获取颜色
     */
    getScoreColor(percentage) {
        if (percentage >= 80) return '#10b981'; // green-500
        if (percentage >= 60) return '#3b82f6'; // blue-500
        if (percentage >= 40) return '#f59e0b'; // yellow-500
        return '#ef4444'; // red-500
    }

    /**
     * 颜色加深
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * 获取表现对比
     */
    getPerformanceComparison(percentage) {
        // 基于25题总分的合理百分位分布
        if (percentage >= 100) return '100%';  // 25题全对
        if (percentage >= 88) return '95%';    // 22-24题正确
        if (percentage >= 76) return '85%';    // 19-21题正确
        if (percentage >= 64) return '75%';    // 16-18题正确
        if (percentage >= 52) return '65%';    // 13-15题正确
        if (percentage >= 40) return '50%';    // 10-12题正确
        if (percentage >= 28) return '35%';    // 7-9题正确
        if (percentage >= 16) return '20%';    // 4-6题正确
        if (percentage >= 4) return '10%';     // 1-3题正确
        return '5%';                           // 0题正确
    }

    /**
     * 生成饼图（可选）
     */
    createPieChart(canvasId, data, title) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#10b981', // green
                        '#ef4444', // red
                        '#f59e0b', // yellow
                        '#3b82f6', // blue
                        '#8b5cf6'  // purple
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                animation: {
                    duration: this.animationDuration
                }
            }
        });
    }

    /**
     * 生成完整题目内容 (PDF打印专用)
     */
    generateFullQuestionsContent(report) {
        console.log('开始生成完整题目内容...');
        console.log('报告数据:', report);
        
        // 获取题目容器
        const container = document.getElementById('questions-content-container');
        if (!container) {
            console.error('无法找到题目内容容器');
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 获取题目数据
        const questions = window.QUESTIONS_DATA || [];
        if (!questions.length) {
            console.error('无法获取题目数据');
            container.innerHTML = '<p class="text-red-600">错误: 无法获取题目数据</p>';
            return;
        }
        console.log('获取到题目数据:', questions.length, '道题');
        
        // 获取用户答案数据 - 增加多种数据源支持
        let userAnswersData = null;
        
        // 首先尝试从 localStorage 获取最新的答案数据
        const localAnswers = JSON.parse(localStorage.getItem('amc8_test_answers') || '{}');
        if (Object.keys(localAnswers).length > 0 && !localAnswers._timestamp) {
            // 过滤掉非题目答案的键
            userAnswersData = {};
            for (let key in localAnswers) {
                if (!key.startsWith('_') && !isNaN(parseInt(key))) {
                    userAnswersData[key] = localAnswers[key];
                }
            }
            console.log('使用localStorage中的用户答案数据');
        } else if (report.userAnswers) {
            userAnswersData = report.userAnswers;
            console.log('使用报告中的用户答案数据');
        } else if (window.globalUserAnswers) {
            userAnswersData = window.globalUserAnswers;
            console.log('使用全局用户答案数据');
        } else {
            console.warn('无法获取用户答案数据，将显示为未作答');
            userAnswersData = {};
        }
        
        console.log('用户答案数据:', userAnswersData);
        
        // 生成每道题目
        questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            // 获取用户答案和正确性 - 支持多种格式
            const questionIndex = index + 1;
            const userAnswer = userAnswersData[questionIndex] || userAnswersData[questionIndex.toString()] || '';
            const correctAnswer = question.correct_answer || '';
            const isAnswered = userAnswer !== '';
            const isCorrect = isAnswered && userAnswer.toLowerCase() === correctAnswer.toLowerCase();
            
            // 构建题目HTML
            questionItem.innerHTML = `
                <div class="question-header">
                    <div class="question-number">第${index + 1}题</div>
                    <div class="question-subject">${question.subject || '数学'}</div>
                </div>
                
                <div class="question-content">
                    <div class="question-text chinese">
                        <strong>中文： </strong>${question.content_zh || ''}
                    </div>
                    <div class="question-text english">
                        <strong>English: </strong>${question.content_en || ''}
                    </div>
                    
                    <div class="question-options">
                        ${question.options ? question.options.map(option => `
                            <div class="option-item">
                                <span class="option-label">${option.label}</span>
                                <span>${option.text}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
                
                <div class="question-answers">
                    <div class="answer-info">
                        <div class="student-answer">
                            <span class="answer-label">你的答案:</span>
                            <span class="answer-value ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : 'unanswered'}">
                                ${isAnswered ? userAnswer : '未作答'}
                            </span>
                        </div>
                        <div class="correct-answer">
                            <span class="answer-label">正确答案:</span>
                            <span class="answer-value correct">${correctAnswer}</span>
                        </div>
                    </div>
                    <div class="result-status ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : 'unanswered'}">
                        ${isCorrect ? '✓ 正确' : isAnswered ? '✗ 错误' : '- 未作答'}
                    </div>
                </div>
            `;
            
            container.appendChild(questionItem);
        });
        
        console.log(`生成了${questions.length}道题目的完整内容`);
        
        // 重新渲染MathJax数学公式
        if (window.MathJax && window.MathJax.typesetPromise) {
            console.log('重新渲染MathJax公式...');
            window.MathJax.typesetPromise([container]).then(() => {
                console.log('MathJax渲染完成');
            }).catch(err => {
                console.error('MathJax渲染失败:', err);
            });
        }
    }

    /**
     * 导出报告为JSON
     */
    exportReport(report) {
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `AMC8测试报告_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// 导出类
window.ResultDisplay = ResultDisplay;