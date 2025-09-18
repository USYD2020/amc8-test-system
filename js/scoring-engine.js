/**
 * AMC8 评分引擎类
 * 功能：自动批改、分科统计、班型推荐、报告生成
 */

// 内嵌标准答案数据 - 解决CORS问题
const ANSWERS_DATA = {
  "1": "E",
  "2": "C", 
  "3": "D",
  "4": "B",
  "5": "C",
  "6": "A",
  "7": "C",
  "8": "C",
  "9": "D",
  "10": "C",
  "11": "E",
  "12": "A",
  "13": "B",
  "14": "D",
  "15": "C",
  "16": "E",
  "17": "B",
  "18": "A",
  "19": "B",
  "20": "B",
  "21": "A",
  "22": "E",
  "23": "B",
  "24": "A",
  "25": "A"
};

// 内嵌班型推荐配置数据 - 解决CORS问题
const CLASS_RECOMMENDATIONS_DATA = {
  "基础班": {
    "range": "0-4",
    "minScore": 0,
    "maxScore": 4,
    "title": "基础班 准备 1 年",
    "description": "建立基础，稳步提升",
    "color": "#ef4444",
    "evaluation": "亲爱的同学，你勇敢尝试，说明你已经有了一定的数学基础。\n\n在班课的前半部分，我们会重点复习代数中的基本运算和方程解法，以及几何中的基础图形和性质, 后半部分的内容需要你提前预习, 提升自己的专注力, 勇于挑战自我。\n\n班课完成后, 在训练课中，你可以每周完成一些初级题型的习题，包括代数、几何、组合和数论的基础题目。坚持完成这些练习，有助于你巩固知识，打下坚实的基础。"
  },
  "潜力班": {
    "range": "5-7",
    "minScore": 5,
    "maxScore": 7,
    "title": "潜力班 准备 1 年", 
    "description": "挖掘潜力，突破瓶颈",
    "color": "#f59e0b",
    "evaluation": "亲爱的同学，你目前答对 5-7 题，说明你已经有了一定的数学基础。\n\n在班课的前半部分，我们会重点复习代数中的基本运算和方程解法，以及几何中的基础图形和性质, 后半部分的内容需要你提前预习, 提升自己的专注力, 勇于挑战自我。\n\n班课完成后, 在训练课中，你可以每周完成一些初级题型的习题，包括代数、几何、组合和数论的基础题目。坚持完成这些练习，有助于你巩固知识，打下坚实的基础。"
  },
  "强化班": {
    "range": "8-10",
    "minScore": 8,
    "maxScore": 10,
    "title": "强化班",
    "description": "强化训练，快速提分",
    "color": "#3b82f6",
    "evaluation": "亲爱的同学，你目前答对 8-10 题，你已经有了不错的基础。在班课的前半部分，我们会重点复习代数中的基本运算和方程解法，以及几何中的基础图形和性质, 在班课的每个章节的后半部分, 你需要提前预习, 提升自己的专注力, 勇于挑战自我。\n\n我们会继续巩固基础知识，并开始挑战中等难度的代数和几何题型。课下练习时，你可以每天做一些中级题型的习题，包括二次方程、函数、分数比例，以及中等难度的几何题目。通过这些练习，你将提升解题速度和准确性，为更高难度的题目打下基础。"
  },
  "强化班+": {
    "range": "11-13",
    "minScore": 11,
    "maxScore": 13,
    "title": "强化班+",
    "description": "高强度训练，冲击高分",
    "color": "#8b5cf6",
    "evaluation": "亲爱的同学，你目前答对 11-13 题，你已经具备了较强的数学基础。在班课的每个章节的后半部分, 你需要提前预习, 提升自己的专注力, 勇于挑战自我。在冲刺阶段，我们会集中训练高难度的代数和几何题型。\n\n课下练习时，你可以每天做一些高级题型的习题，包括复杂的多项式运算、深入理解函数，以及高级几何定理和证明。通过这些高难度练习，你将进一步锻炼你的综合解题能力，并培养出色的逻辑思维和推理能力"
  },
  "建议AMC10": {
    "range": "14+",
    "minScore": 14,
    "maxScore": 25,
    "title": "建议引导 AMC10 + 强化班(专注冲刺)",
    "description": "挑战更高水平竞赛",
    "color": "#10b981",
    "evaluation": "亲爱的同学，你目前答对 14 题以上，已经展现了非常优秀的数学能力和扎实的基础功底。我们建议你挑战更高水平的 AMC10，同时辅助 AMC8 强化班的冲刺内容学习，实现双重突破。在班课的每个章节后半部分，你需要提前预习并保持高度专注，勇于挑战更复杂的题型。冲刺阶段，我们将集中训练中高难度的综合题型，这是你充分展现数学才华、深度开发潜力的绝佳机会。\n\n课下练习时，建议你每天安排一定时间专攻 AMC8 中高难度题型，系统训练代数运算、几何证明、组合分析和数论推理等核心板块。通过有针对性的强化练习和模拟测试，你将全面提升数学分析能力和复杂问题解决技巧，为冲击 AMC8 高分和顺利过渡到 AMC10 打下坚实基础。"
  },
  "finalMessage": "我们会根据你的具体情况，制定最合适的学习计划，帮助你不断进步。相信通过我们的共同努力，你一定能在 AMC 比赛中取得优异的成绩！"
};

class ScoringEngine {
    constructor() {
        this.answerKey = {};
        this.questions = [];
        this.classRecommendations = {};
        this.subjectMapping = {
            '代数': 'algebra',
            '几何': 'geometry', 
            '数论': 'number_theory',
            '组合计数': 'combinatorics',
            '组合': 'combinatorics',
            '逻辑推理': 'logic',
            '图表分析': 'data_analysis',
            '统计': 'statistics',
            '概率': 'probability',
            '数列与组合': 'sequences'
        };
    }

    /**
     * 初始化评分引擎
     */
    async initialize() {
        try {
            console.log('正在初始化评分引擎...');
            
            // 加载标准答案
            await this.loadAnswerKey();
            
            // 加载题目信息
            await this.loadQuestions();
            
            // 加载班型推荐配置
            await this.loadClassRecommendations();
            
            console.log('评分引擎初始化完成');
            
        } catch (error) {
            console.error('评分引擎初始化失败:', error);
            throw error;
        }
    }

    /**
     * 加载标准答案（使用内嵌数据）
     */
    async loadAnswerKey() {
        try {
            // 使用内嵌的答案数据，解决CORS问题
            this.answerKey = ANSWERS_DATA;
            console.log('成功加载标准答案（内嵌数据）');
            
        } catch (error) {
            console.error('加载标准答案失败:', error);
            throw error;
        }
    }

    /**
     * 加载题目信息（使用内嵌数据）
     */
    async loadQuestions() {
        try {
            // 使用test-engine.js中的题目数据，解决CORS问题
            if (typeof QUESTIONS_DATA !== 'undefined') {
                this.questions = QUESTIONS_DATA;
                console.log('成功加载题目信息（内嵌数据）');
            } else {
                // 如果QUESTIONS_DATA未定义，创建基本结构以避免错误
                this.questions = [];
                console.warn('QUESTIONS_DATA未定义，使用空数组');
            }
            
        } catch (error) {
            console.error('加载题目信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载班型推荐配置（使用内嵌数据）
     */
    async loadClassRecommendations() {
        try {
            // 使用内嵌的班型推荐配置，解决CORS问题
            this.classRecommendations = CLASS_RECOMMENDATIONS_DATA;
            console.log('成功加载班型推荐配置（内嵌数据）');
            
        } catch (error) {
            console.error('加载班型推荐配置失败:', error);
            throw error;
        }
    }

    /**
     * 评分用户答案
     */
    scoreTest(userAnswers) {
        console.log('开始评分测试...');
        
        const result = {
            totalQuestions: this.questions.length,
            answeredQuestions: 0,
            correctAnswers: 0,
            score: 0,
            percentage: 0,
            subjectScores: {},
            difficultyScores: {},
            detailedResults: [],
            classRecommendation: null,
            evaluation: '',
            timestamp: new Date().toISOString()
        };

        // 逐题评分
        this.questions.forEach((question, index) => {
            const questionId = (index + 1).toString();
            const userAnswer = userAnswers[questionId];
            const correctAnswer = this.answerKey[questionId];
            const isCorrect = userAnswer === correctAnswer;

            // 详细结果
            const questionResult = {
                questionId: parseInt(questionId),
                question: question.content_zh.substring(0, 100) + '...',
                subject: question.subject,
                difficulty: question.difficulty,
                userAnswer: userAnswer || '未作答',
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                isAnswered: !!userAnswer
            };

            result.detailedResults.push(questionResult);

            // 统计回答题数
            if (userAnswer) {
                result.answeredQuestions++;
            }

            // 统计正确题数
            if (isCorrect) {
                result.correctAnswers++;
            }

            // 按科目统计
            const subject = this.normalizeSubject(question.subject);
            if (!result.subjectScores[subject]) {
                result.subjectScores[subject] = {
                    name: question.subject,
                    total: 0,
                    correct: 0,
                    answered: 0,
                    percentage: 0
                };
            }

            result.subjectScores[subject].total++;
            if (userAnswer) {
                result.subjectScores[subject].answered++;
            }
            if (isCorrect) {
                result.subjectScores[subject].correct++;
            }

            // 按难度统计
            if (!result.difficultyScores[question.difficulty]) {
                result.difficultyScores[question.difficulty] = {
                    total: 0,
                    correct: 0,
                    answered: 0,
                    percentage: 0
                };
            }

            result.difficultyScores[question.difficulty].total++;
            if (userAnswer) {
                result.difficultyScores[question.difficulty].answered++;
            }
            if (isCorrect) {
                result.difficultyScores[question.difficulty].correct++;
            }
        });

        // 计算得分和百分比
        result.score = result.correctAnswers;
        result.percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);

        // 计算各科目百分比
        Object.keys(result.subjectScores).forEach(subject => {
            const subjectScore = result.subjectScores[subject];
            subjectScore.percentage = subjectScore.total > 0 
                ? Math.round((subjectScore.correct / subjectScore.total) * 100) 
                : 0;
        });

        // 计算各难度百分比
        Object.keys(result.difficultyScores).forEach(difficulty => {
            const difficultyScore = result.difficultyScores[difficulty];
            difficultyScore.percentage = difficultyScore.total > 0 
                ? Math.round((difficultyScore.correct / difficultyScore.total) * 100) 
                : 0;
        });

        // 班型推荐
        result.classRecommendation = this.getClassRecommendation(result.correctAnswers);
        result.evaluation = this.generateEvaluation(result);

        console.log('评分完成:', result);
        return result;
    }

    /**
     * 规范化科目名称
     */
    normalizeSubject(subject) {
        return this.subjectMapping[subject] || subject.toLowerCase().replace(/\s+/g, '_');
    }

    /**
     * 获取班型推荐
     */
    getClassRecommendation(correctAnswers) {
        // 根据正确题数推荐班型
        for (const [className, config] of Object.entries(this.classRecommendations)) {
            if (className === 'finalMessage') continue;
            
            if (correctAnswers >= config.minScore && correctAnswers <= config.maxScore) {
                return {
                    class: className,
                    title: config.title,
                    description: config.description,
                    color: config.color,
                    range: config.range,
                    score: correctAnswers
                };
            }
        }

        // 默认推荐基础班
        return {
            class: '基础班',
            title: '基础班 准备 1 年',
            description: '建立基础，稳步提升',
            color: '#ef4444',
            range: '1-4',
            score: correctAnswers
        };
    }

    /**
     * 生成评价文本
     */
    generateEvaluation(result) {
        const recommendation = result.classRecommendation;
        const config = this.classRecommendations[recommendation.class];
        
        let evaluation = '';
        
        if (config && config.evaluation) {
            evaluation = config.evaluation;
        } else {
            // 默认评价
            evaluation = `根据您的测试表现，答对了${result.correctAnswers}道题，建议您选择${recommendation.title}。`;
        }

        // 添加最终评价
        if (this.classRecommendations.finalMessage) {
            evaluation += '\n\n' + this.classRecommendations.finalMessage;
        }

        return evaluation;
    }

    /**
     * 生成能力雷达图数据
     */
    generateRadarChartData(result) {
        const subjects = Object.keys(result.subjectScores);
        const radarData = {
            labels: [],
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)'
        };

        subjects.forEach(subject => {
            const subjectData = result.subjectScores[subject];
            radarData.labels.push(subjectData.name);
            radarData.data.push(subjectData.percentage);
        });

        return radarData;
    }

    /**
     * 生成学习建议
     */
    generateStudyRecommendations(result) {
        const recommendations = [];
        
        // 基于科目表现给出建议
        Object.values(result.subjectScores).forEach(subject => {
            if (subject.percentage < 50) {
                recommendations.push({
                    type: 'weakness',
                    subject: subject.name,
                    message: `${subject.name}需要重点加强，正确率仅为${subject.percentage}%`,
                    priority: 'high'
                });
            } else if (subject.percentage < 70) {
                recommendations.push({
                    type: 'improvement',
                    subject: subject.name,
                    message: `${subject.name}有提升空间，继续练习可以获得更好成绩`,
                    priority: 'medium'
                });
            } else {
                recommendations.push({
                    type: 'strength',
                    subject: subject.name,
                    message: `${subject.name}表现优秀，继续保持`,
                    priority: 'low'
                });
            }
        });

        // 基于难度表现给出建议
        if (result.difficultyScores.easy && result.difficultyScores.easy.percentage < 80) {
            recommendations.push({
                type: 'foundation',
                subject: '基础知识',
                message: '简单题目正确率偏低，需要巩固基础知识',
                priority: 'high'
            });
        }

        if (result.difficultyScores.hard && result.difficultyScores.hard.percentage > 60) {
            recommendations.push({
                type: 'advanced',
                subject: '挑战能力',
                message: '困难题目表现出色，具备挑战更高难度的能力',
                priority: 'low'
            });
        }

        // 根据答题完成度给出建议
        if (result.answeredQuestions < result.totalQuestions) {
            const unanswered = result.totalQuestions - result.answeredQuestions;
            recommendations.push({
                type: 'completion',
                subject: '时间管理',
                message: `有${unanswered}道题未作答，需要提高答题速度`,
                priority: 'medium'
            });
        }

        // 按优先级排序
        recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        return recommendations;
    }

    /**
     * 生成完整测试报告
     */
    generateFullReport(userAnswers, userInfo = {}) {
        // 基础评分
        const basicResult = this.scoreTest(userAnswers);
        
        // 增强报告
        const report = {
            ...basicResult,
            userInfo: userInfo,
            userAnswers: userAnswers, // 保存原始用户答题数据用于PDF生成
            radarChartData: this.generateRadarChartData(basicResult),
            studyRecommendations: this.generateStudyRecommendations(basicResult),
            testAnalysis: this.generateTestAnalysis(basicResult),
            nextSteps: this.generateNextSteps(basicResult)
        };

        return report;
    }

    /**
     * 生成测试分析
     */
    generateTestAnalysis(result) {
        const analysis = {
            strengths: [],
            weaknesses: [],
            observations: []
        };

        // 分析优势
        Object.values(result.subjectScores).forEach(subject => {
            if (subject.percentage >= 70) {
                analysis.strengths.push(`${subject.name}表现优秀 (${subject.percentage}%)`);
            }
        });

        // 分析弱点
        Object.values(result.subjectScores).forEach(subject => {
            if (subject.percentage < 50) {
                analysis.weaknesses.push(`${subject.name}需要加强 (${subject.percentage}%)`);
            }
        });

        // 总体观察
        if (result.percentage >= 80) {
            analysis.observations.push('整体表现优秀，具备扎实的数学基础');
        } else if (result.percentage >= 60) {
            analysis.observations.push('具备一定的数学基础，通过针对性练习可以进一步提升');
        } else {
            analysis.observations.push('需要系统性地巩固数学基础知识');
        }

        // 难度分析
        if (result.difficultyScores.easy) {
            const easyPerc = result.difficultyScores.easy.percentage;
            if (easyPerc < 70) {
                analysis.observations.push('基础题目有失分，建议重点巩固基础知识');
            }
        }

        if (result.difficultyScores.hard) {
            const hardPerc = result.difficultyScores.hard.percentage;
            if (hardPerc > 50) {
                analysis.observations.push('在困难题目上表现出色，具备良好的数学思维能力');
            }
        }

        return analysis;
    }

    /**
     * 生成下一步建议
     */
    generateNextSteps(result) {
        const steps = [];
        const score = result.correctAnswers;

        if (score >= 14) {
            steps.push('考虑挑战AMC10，提升竞赛水平');
            steps.push('参与高级数学竞赛培训');
            steps.push('深入学习数学理论和证明方法');
        } else if (score >= 11) {
            steps.push('继续强化训练，冲击高分');
            steps.push('重点练习高难度综合题');
            steps.push('培养数学建模能力');
        } else if (score >= 7) {
            steps.push('巩固基础知识，提升解题速度');
            steps.push('练习中等难度题目');
            steps.push('加强几何和代数的综合应用');
        } else {
            steps.push('系统复习基础数学概念');
            steps.push('从简单题型开始，逐步建立信心');
            steps.push('重点加强运算能力和逻辑思维');
        }

        return steps;
    }

    /**
     * 导出报告为JSON
     */
    exportReportAsJson(report) {
        const exportData = {
            ...report,
            exportTime: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 比较多次测试结果（如果有的话）
     */
    compareResults(currentResult, previousResults = []) {
        if (previousResults.length === 0) {
            return null;
        }

        const latest = previousResults[previousResults.length - 1];
        const comparison = {
            scoreDifference: currentResult.score - latest.score,
            percentageDifference: currentResult.percentage - latest.percentage,
            improvementAreas: [],
            regressionAreas: []
        };

        // 比较各科目表现
        Object.keys(currentResult.subjectScores).forEach(subject => {
            const currentSubject = currentResult.subjectScores[subject];
            const previousSubject = latest.subjectScores[subject];

            if (previousSubject) {
                const diff = currentSubject.percentage - previousSubject.percentage;
                if (diff > 10) {
                    comparison.improvementAreas.push({
                        subject: currentSubject.name,
                        improvement: diff
                    });
                } else if (diff < -10) {
                    comparison.regressionAreas.push({
                        subject: currentSubject.name,
                        regression: Math.abs(diff)
                    });
                }
            }
        });

        return comparison;
    }
}

// 导出类
window.ScoringEngine = ScoringEngine;