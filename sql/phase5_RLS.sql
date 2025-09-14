-- PHASE 5: RLS POLICIES FOR OPPORTUNITIES & CAREER FEATURES
-- Comprehensive Row Level Security policies for all Phase 5 tables

-- Domain Categories Policies
CREATE POLICY "Domain categories are viewable by everyone" ON public.domain_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Domain categories can be managed by admins" ON public.domain_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Recruiter Profiles Policies
CREATE POLICY "Recruiters can view their own profile" ON public.recruiter_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Recruiters can update their own profile" ON public.recruiter_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Recruiters can insert their own profile" ON public.recruiter_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Verified recruiters are viewable by everyone" ON public.recruiter_profiles
    FOR SELECT USING (is_verified = true AND is_active = true);

CREATE POLICY "Admins can manage all recruiter profiles" ON public.recruiter_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Recruiter Verification Requests Policies
CREATE POLICY "Recruiters can manage their own verification requests" ON public.recruiter_verification_requests
    FOR ALL USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all verification requests" ON public.recruiter_verification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Recruiter Subscriptions Policies
CREATE POLICY "Recruiters can view their own subscriptions" ON public.recruiter_subscriptions
    FOR SELECT USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all subscriptions" ON public.recruiter_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Jobs Policies
CREATE POLICY "Published jobs are viewable by everyone" ON public.jobs
    FOR SELECT USING (status = 'published' AND is_active = true);

CREATE POLICY "Recruiters can manage their own jobs" ON public.jobs
    FOR ALL USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all jobs" ON public.jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Job Requirements Policies
CREATE POLICY "Job requirements are viewable with their jobs" ON public.job_requirements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_requirements.job_id 
            AND (
                public.jobs.status = 'published' 
                OR public.jobs.recruiter_id IN (
                    SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

CREATE POLICY "Recruiters can manage requirements for their jobs" ON public.job_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_requirements.job_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Job Benefits Policies
CREATE POLICY "Job benefits are viewable with their jobs" ON public.job_benefits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_benefits.job_id 
            AND (
                public.jobs.status = 'published' 
                OR public.jobs.recruiter_id IN (
                    SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

CREATE POLICY "Recruiters can manage benefits for their jobs" ON public.job_benefits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_benefits.job_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Job Skills Policies
CREATE POLICY "Job skills are viewable with their jobs" ON public.job_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_skills.job_id 
            AND (
                public.jobs.status = 'published' 
                OR public.jobs.recruiter_id IN (
                    SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

CREATE POLICY "Recruiters can manage skills for their jobs" ON public.job_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_skills.job_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Job Views Policies
CREATE POLICY "Job views are viewable by job owners and admins" ON public.job_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_views.job_id 
            AND (
                public.jobs.recruiter_id IN (
                    SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

CREATE POLICY "Anyone can insert job views" ON public.job_views
    FOR INSERT WITH CHECK (true);

-- Job Bookmarks Policies
CREATE POLICY "Users can view their own bookmarks" ON public.job_bookmarks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own bookmarks" ON public.job_bookmarks
    FOR ALL USING (user_id = auth.uid());

-- Job Applications Policies
CREATE POLICY "Users can view their own applications" ON public.job_applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create applications for published jobs" ON public.job_applications
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_applications.job_id 
            AND public.jobs.status = 'published'
        )
    );

CREATE POLICY "Users can update their own applications" ON public.job_applications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their jobs" ON public.job_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_applications.job_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Recruiters can update applications for their jobs" ON public.job_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE public.jobs.id = public.job_applications.job_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Talent Pools Policies
CREATE POLICY "Public talent pools are viewable by everyone" ON public.talent_pools
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Recruiters can view their own talent pools" ON public.talent_pools
    FOR SELECT USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Recruiters can manage their own talent pools" ON public.talent_pools
    FOR ALL USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

-- Talent Pool Members Policies
CREATE POLICY "Users can view talent pools they're members of" ON public.talent_pool_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.talent_pools 
            WHERE public.talent_pools.id = public.talent_pool_members.talent_pool_id 
            AND public.talent_pools.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Recruiters can manage members of their talent pools" ON public.talent_pool_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.talent_pools 
            WHERE public.talent_pools.id = public.talent_pool_members.talent_pool_id 
            AND public.talent_pools.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Opportunity Recommendations Policies
CREATE POLICY "Users can view their own recommendations" ON public.opportunity_recommendations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own recommendations" ON public.opportunity_recommendations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations" ON public.opportunity_recommendations
    FOR INSERT WITH CHECK (true);

-- Interview Preparations Policies
CREATE POLICY "Users can manage their own interview preparations" ON public.interview_preparations
    FOR ALL USING (user_id = auth.uid());

-- Interview Sessions Policies
CREATE POLICY "Users can view sessions they're involved in" ON public.interview_sessions
    FOR SELECT USING (
        interviewer_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.job_applications 
            WHERE public.job_applications.id = public.interview_sessions.job_application_id 
            AND public.job_applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can manage sessions for their jobs" ON public.interview_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.job_applications 
            JOIN public.jobs ON public.jobs.id = public.job_applications.job_id
            WHERE public.job_applications.id = public.interview_sessions.job_application_id 
            AND public.jobs.recruiter_id IN (
                SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Interview Feedback Policies
CREATE POLICY "Users can view feedback about them" ON public.interview_feedback
    FOR SELECT USING (feedback_for = auth.uid());

CREATE POLICY "Users can create feedback for sessions they're involved in" ON public.interview_feedback
    FOR INSERT WITH CHECK (
        feedback_from = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE public.interview_sessions.id = public.interview_feedback.interview_session_id 
            AND (
                public.interview_sessions.interviewer_id = auth.uid() 
                OR EXISTS (
                    SELECT 1 FROM public.job_applications 
                    WHERE public.job_applications.id = public.interview_sessions.job_application_id 
                    AND public.job_applications.user_id = auth.uid()
                )
            )
        )
    );

-- Referral Requests Policies
CREATE POLICY "Users can view referrals involving them" ON public.referral_requests
    FOR SELECT USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Users can create referral requests" ON public.referral_requests
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users can update referrals they're involved in" ON public.referral_requests
    FOR UPDATE USING (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Referral Rewards Policies
CREATE POLICY "Users can view their own rewards" ON public.referral_rewards
    FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY "System can manage referral rewards" ON public.referral_rewards
    FOR ALL USING (true);

-- Recruiter Analytics Policies
CREATE POLICY "Recruiters can view their own analytics" ON public.recruiter_analytics
    FOR SELECT USING (recruiter_id IN (
        SELECT id FROM public.recruiter_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "System can insert analytics data" ON public.recruiter_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.recruiter_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Success message
SELECT 'Phase 5 RLS policies created successfully!' as message;
