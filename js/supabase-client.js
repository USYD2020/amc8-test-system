/**
 * Supabase Client Configuration
 * For AMC8 Test System
 */

// IMPORTANT: Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://rmdtfcrzuyigumyhefvs.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZHRmY3J6dXlpZ3VteWhlZnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ5MDUsImV4cCI6MjA3MzQ4MDkwNX0.UtL-aEF0RZKoK_KBtgCcMXTMrA1XPrDPeVqGYDCyX3Q'; // Your public anon key

// Initialize Supabase client
let supabase = null;

// Check if Supabase library is loaded
if (typeof window !== 'undefined' && window.supabase) {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Database Operations Module
 */
const DatabaseOperations = {
    /**
     * Check if a phone number has already completed a test
     */
    async checkPhoneHasCompletedTest(phone) {
        try {
            const { data, error } = await supabase
                .rpc('check_phone_has_completed_test', { phone_number: phone });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error checking phone status:', error);
            return false;
        }
    },

    /**
     * Get user's test status
     */
    async getUserTestStatus(phone) {
        try {
            const { data, error } = await supabase
                .rpc('get_user_test_status', { phone_number: phone });
            
            if (error) throw error;
            return data[0] || {
                user_exists: false,
                has_completed_test: false,
                has_in_progress_test: false,
                session_id: null,
                remaining_time_seconds: null
            };
        } catch (error) {
            console.error('Error getting user status:', error);
            return null;
        }
    },

    /**
     * Create or get user
     */
    async createOrGetUser(name, phone, grade) {
        try {
            // First check if user exists
            let { data: existingUser, error: selectError } = await supabase
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();
            
            if (existingUser) {
                return { success: true, user: existingUser };
            }
            
            // Create new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ name, phone, grade }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Error creating/getting user:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Create a new test session
     */
    async createTestSession(userId) {
        try {
            const { data, error } = await supabase
                .from('test_sessions')
                .insert([{ user_id: userId }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, session: data };
        } catch (error) {
            console.error('Error creating test session:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get or resume test session
     */
    async getOrResumeSession(userId) {
        try {
            // Check for existing in-progress session
            const { data: existingSession, error: selectError } = await supabase
                .from('test_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'in_progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (existingSession) {
                // Calculate remaining time
                const startTime = new Date(existingSession.start_time);
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                const remainingSeconds = Math.max(0, 4500 - elapsedSeconds); // 75 minutes = 4500 seconds
                
                if (remainingSeconds > 0) {
                    return { 
                        success: true, 
                        session: existingSession, 
                        remainingSeconds,
                        isResume: true 
                    };
                } else {
                    // Session expired, mark as abandoned
                    await supabase
                        .from('test_sessions')
                        .update({ status: 'abandoned' })
                        .eq('id', existingSession.id);
                }
            }
            
            // Create new session
            return await this.createTestSession(userId);
        } catch (error) {
            console.error('Error getting/resuming session:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Save or update answer
     */
    async saveAnswer(sessionId, questionNumber, selectedAnswer, isCorrect) {
        try {
            const { data, error } = await supabase
                .from('test_answers')
                .upsert([{
                    session_id: sessionId,
                    question_number: questionNumber,
                    selected_answer: selectedAnswer,
                    is_correct: isCorrect
                }], {
                    onConflict: 'session_id,question_number'
                })
                .select();
            
            if (error) throw error;
            return { success: true, answer: data[0] };
        } catch (error) {
            console.error('Error saving answer:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get saved answers for a session
     */
    async getSavedAnswers(sessionId) {
        try {
            const { data, error } = await supabase
                .from('test_answers')
                .select('*')
                .eq('session_id', sessionId)
                .order('question_number');
            
            if (error) throw error;
            return { success: true, answers: data };
        } catch (error) {
            console.error('Error getting saved answers:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Submit test and calculate results
     */
    async submitTest(sessionId, answers, correctAnswersMap) {
        try {
            // Calculate score
            let correctCount = 0;
            const answerRecords = [];
            
            for (let i = 1; i <= 25; i++) {
                const userAnswer = answers[`q${i}`];
                const correctAnswer = correctAnswersMap[i];
                const isCorrect = userAnswer === correctAnswer;
                
                if (isCorrect) correctCount++;
                
                if (userAnswer) {
                    answerRecords.push({
                        session_id: sessionId,
                        question_number: i,
                        selected_answer: userAnswer,
                        is_correct: isCorrect
                    });
                }
            }
            
            // Save all answers
            if (answerRecords.length > 0) {
                const { error: answersError } = await supabase
                    .from('test_answers')
                    .upsert(answerRecords, {
                        onConflict: 'session_id,question_number'
                    });
                
                if (answersError) throw answersError;
            }
            
            // Determine class recommendation
            let classRecommendation = '';
            if (correctCount <= 4) {
                classRecommendation = '基础班 (准备1年)';
            } else if (correctCount <= 7) {
                classRecommendation = '潜力班 (准备1年)';
            } else if (correctCount <= 10) {
                classRecommendation = '强化班';
            } else if (correctCount <= 13) {
                classRecommendation = '强化班+';
            } else {
                classRecommendation = '建议引导AMC10 + 强化班(专注冲刺)';
            }
            
            // Update session status
            const { error: sessionError } = await supabase
                .from('test_sessions')
                .update({ 
                    status: 'completed',
                    end_time: new Date().toISOString()
                })
                .eq('id', sessionId);
            
            if (sessionError) throw sessionError;
            
            // Create test result
            const { data: result, error: resultError } = await supabase
                .from('test_results')
                .insert([{
                    session_id: sessionId,
                    total_score: correctCount,
                    correct_answers: correctCount,
                    class_recommendation: classRecommendation
                }])
                .select()
                .single();
            
            if (resultError) throw resultError;
            
            return { 
                success: true, 
                result: {
                    ...result,
                    score: correctCount,
                    recommendation: classRecommendation
                }
            };
        } catch (error) {
            console.error('Error submitting test:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get test result
     */
    async getTestResult(sessionId) {
        try {
            const { data, error } = await supabase
                .from('test_results')
                .select(`
                    *,
                    test_sessions!inner(
                        *,
                        users!inner(*)
                    )
                `)
                .eq('session_id', sessionId)
                .single();
            
            if (error) throw error;
            
            // Mark result as viewed
            if (data && !data.result_viewed_at) {
                await supabase
                    .from('test_results')
                    .update({ result_viewed_at: new Date().toISOString() })
                    .eq('id', data.id);
            }
            
            return { success: true, result: data };
        } catch (error) {
            console.error('Error getting test result:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check database connection
     */
    async checkConnection() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('count')
                .limit(1);
            
            return !error;
        } catch (error) {
            console.error('Database connection error:', error);
            return false;
        }
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.DatabaseOperations = DatabaseOperations;
    window.supabaseClient = supabase;
}