import { supabase } from '@/lib/supabase';
import { notificationService } from './notification.service';

// Helper function để gửi email thông báo chiến dịch mới
// Exported để có thể mock trong tests
export async function triggerCampaignEmail(campaignId: string): Promise<void> {
    try {
        const defaultMessage = `Chúng tôi vừa tổ chức chiến dịch hiến máu mới tại khu vực của bạn. Hãy tham gia để cùng chúng tôi cứu sống nhiều mảnh đời!`;

        // Kiểm tra fetch tồn tại (để tránh lỗi trong môi trường Node.js/test)
        if (typeof fetch !== 'undefined') {
            await fetch('/api/campaign/send-announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    message: defaultMessage,
                    notificationType: 'new_campaign_invite'
                }),
            });
        }
    } catch (emailError) {
        console.error('Error triggering campaign email:', emailError);
        // Không throw error để không ảnh hưởng đến việc tạo chiến dịch
    }
}


export const campaignService = {
    async getAll(hospitalId?: string) {
        try {
            let query = supabase
                .from('campaigns')
                .select('*, hospital:users(full_name, hospital_name), appointments(*)')
                .order('start_time', { ascending: false });

            if (hospitalId) {
                query = query.eq('hospital_id', hospitalId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('[CampaignService] Error in getAll:', error.message || error.details || error);
            throw error;
        }
    },

    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*, hospital:users(full_name, hospital_name, city, district), appointments(*)')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in getById:', error.message || error.details || error);
            throw error;
        }
    },

    async getActive(hospitalId?: string) {
        let query = supabase
            .from('campaigns')
            .select('*, hospital:users(full_name, hospital_name, city, district, address), appointments(*)')
            .eq('status', 'active')
            .order('start_time', { ascending: true });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },
    async getRequests(hospitalId?: string) {
        let query = supabase
            .from('blood_requests')
            .select('*, hospital:users(full_name, hospital_name, city, district, address)')
            .eq('status', 'Open')
            .order('created_at', { ascending: false });

        if (hospitalId) {
            query = query.eq('hospital_id', hospitalId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createCampaign(campaignData: any) {
        const { data, error } = await supabase
            .from('campaigns')
            .insert(campaignData)
            .select()
            .single();

        if (error) throw error;

        // Gửi thông báo in-app đến donors phù hợp (cùng tỉnh/thành)
        try {
            await notificationService.sendCampaignNotification(data.id);
        } catch (notifError) {
            console.error('Failed to send campaign notifications:', notifError);
            // Không throw error để không ảnh hưởng đến việc tạo chiến dịch
        }

        // Tự động gửi email thông báo chiến dịch mới (chạy trong background)
        triggerCampaignEmail(data.id).catch(err => {
            console.error('Background email trigger failed:', err);
        });

        return data;
    },

    async getCampaignRegistrations(campaignId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                user:users(
                    id,
                    full_name,
                    email,
                    phone,
                    blood_group,
                    city,
                    district,
                    address
                )
            `)
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateCampaign(id: string, campaignData: any) {
        const { data, error } = await supabase
            .from('campaigns')
            .update(campaignData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createBloodRequest(requestData: any) {
        const { data, error } = await supabase
            .from('blood_requests')
            .insert(requestData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async registerToBloodRequest(userId: string, requestId: string) {
        // 1. Check for any existing record for this user and blood request
        const { data: existing } = await supabase
            .from('appointments')
            .select('id, status')
            .eq('user_id', userId)
            .eq('blood_request_id', requestId)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'Booked') {
                throw new Error("Bạn đã đăng ký hỗ trợ yêu cầu này rồi.");
            }
            if (existing.status === 'Completed') {
                throw new Error("Bạn đã hoàn thành việc hiến máu cho yêu cầu này.");
            }
            if (existing.status === 'Rejected') {
                throw new Error("Đăng ký của bạn cho yêu cầu này không được chấp nhận.");
            }

            // If it's Cancelled, reactivate it
            if (existing.status === 'Cancelled') {
                const { data, error } = await supabase
                    .from('appointments')
                    .update({
                        status: 'Booked',
                        scheduled_time: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) {
                    console.error('[CampaignService] registerToBloodRequest update error:', {
                        message: error.message,
                        details: error.details,
                        code: error.code
                    });
                    throw new Error(error.message || 'Không thể cập nhật đăng ký.');
                }
                return data;
            }
        }

        // 2. Create new record if none exists
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                user_id: userId,
                blood_request_id: requestId,
                status: 'Booked',
                scheduled_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[CampaignService] registerToBloodRequest insert error:', {
                message: error.message,
                details: error.details,
                code: error.code
            });
            throw new Error(error.message || 'Không thể tạo đăng ký mới.');
        }

        // 3. Lấy thông tin yêu cầu để gửi thông báo cho bệnh viện
        const { data: request } = await supabase
            .from('blood_requests')
            .select('hospital_id, required_blood_group')
            .eq('id', requestId)
            .single();

        if (request) {
            const { data: donor } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', userId)
                .single();

            try {
                await notificationService.createNotification({
                    user_id: request.hospital_id,
                    title: '👤 Đăng ký hiến máu mới',
                    content: `Người hiến máu ${donor?.full_name || 'ẩn danh'} đã đăng ký tham gia hỗ trợ yêu cầu khẩn cấp (Nhóm ${request.required_blood_group}).`,
                    action_type: 'view_request',
                    action_url: `/hospital-requests`
                });
            } catch (notifError: any) {
                console.error('Failed to send notification to hospital:', notifError);
            }
        }

        return data;
    },

    async registerToCampaign(userId: string, campaignId: string) {
        // 1. Check for any existing record for this user and campaign
        const { data: existing } = await supabase
            .from('appointments')
            .select('id, status')
            .eq('user_id', userId)
            .eq('campaign_id', campaignId)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'Booked') {
                throw new Error("Bạn đã đăng ký tham gia chiến dịch này rồi.");
            }
            if (existing.status === 'Completed') {
                throw new Error("Bạn đã hoàn thành việc hiến máu cho chiến dịch này.");
            }
            if (existing.status === 'Rejected') {
                throw new Error("Đăng ký của bạn cho chiến dịch này không được chấp nhận.");
            }

            // If it's Cancelled, reactivate it
            if (existing.status === 'Cancelled') {
                const { data, error } = await supabase
                    .from('appointments')
                    .update({
                        status: 'Booked',
                        scheduled_time: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) {
                    console.error('[CampaignService] registerToCampaign update error:', {
                        message: error.message,
                        details: error.details,
                        code: error.code
                    });
                    throw new Error(error.message || 'Không thể cập nhật đăng ký.');
                }
                return data;
            }
        }

        // 2. Create new record if none exists
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                user_id: userId,
                campaign_id: campaignId,
                status: 'Booked',
                scheduled_time: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[CampaignService] registerToCampaign insert error:', {
                message: error.message,
                details: error.details,
                code: error.code
            });
            throw new Error(error.message || 'Không thể tạo đăng ký mới.');
        }

        // 3. Thông báo cho bệnh viện
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('hospital_id, name')
            .eq('id', campaignId)
            .single();

        if (campaign) {
            try {
                const { data: donor } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', userId)
                    .single();

                await notificationService.createNotification({
                    user_id: campaign.hospital_id,
                    title: '📅 Đăng ký chiến dịch mới',
                    content: `Người hiến máu ${donor?.full_name || 'ẩn danh'} đã đăng ký tham gia chiến dịch "${campaign.name}".`,
                    action_type: 'view_registrations',
                    action_url: `/hospital-campaign/${campaignId}`
                });
            } catch (notifError: any) {
                console.error('Failed to send notification to hospital:', notifError);
            }
        }

        // 4. Tự động gửi email xác nhận đăng ký cho người hiến máu
        const defaultRegMsg = `Cảm ơn bạn đã đăng ký tham gia chiến dịch hiến máu. Chúng tôi rất mong được gặp bạn!`;
        if (typeof fetch !== 'undefined') {
            fetch('/api/campaign/send-announcement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    message: defaultRegMsg,
                    notificationType: 'registration_success'
                }),
            }).catch(err => console.error('Background email trigger for registration failed:', err));
        }

        return data;
    },

    async getRequestRegistrations(requestId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                user:users(
                    id,
                    full_name,
                    email,
                    phone,
                    blood_group,
                    city,
                    district,
                    address
                )
            `)
            .eq('blood_request_id', requestId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getHospitalRequests(hospitalId: string) {
        const { data, error } = await supabase
            .from('blood_requests')
            .select('*, appointments(*)')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getUserAppointments(userId: string) {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                campaign:campaigns(
                    id,
                    name,
                    start_time,
                    end_time,
                    location_name,
                    hospital:users(hospital_name, address)
                ),
                blood_request:blood_requests(
                    id,
                    created_at,
                    required_blood_group,
                    hospital:users(hospital_name, address, district, city)
                )
            `)
            .eq('user_id', userId)
            .order('scheduled_time', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async sendAnnouncement(campaignId: string, message: string, notificationType: string = 'announcement') {
        try {
            const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
            const response = await fetch(`${baseUrl}/api/campaign/send-announcement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, message, notificationType }),
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to send announcement');
                return result;
            } else {
                const text = await response.text();
                console.error('[CampaignService] Non-JSON response:', text);
                throw new Error(`Server error: Received HTML instead of JSON. Status: ${response.status}`);
            }
        } catch (error: any) {
            console.error('[CampaignService] sendAnnouncement error:', error);
            throw error;
        }
    },

    // Update registration status (Booked -> Completed, Deferred, Cancelled)
    async updateRegistrationStatus(registrationId: string, status: string) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', registrationId)
                .select()
                .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error("Không tìm thấy bản ghi hoặc bạn không có quyền cập nhật.");
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in updateRegistrationStatus:', error.message || error);
            throw error;
        }
    },

    // Update registration details (blood_type, blood_volume, etc.)
    async updateRegistration(registrationId: string, updateData: { blood_type?: string; blood_volume?: number }) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update(updateData)
                .eq('id', registrationId)
                .select()
                .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error("Không tìm thấy bản ghi hoặc bạn không có quyền cập nhật.");
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in updateRegistration:', error.message || error);
            throw error;
        }
    },

    async cancelRegistration(appointmentId: string) {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status: 'Cancelled' })
                .eq('id', appointmentId)
                .select()
                .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error("Không tìm thấy bản ghi để hủy hoặc bạn không có quyền thực hiện.");
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in cancelRegistration:', error.message || error);
            throw error;
        }
    },

    async deleteCampaign(id: string) {
        try {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error: any) {
            console.error('[CampaignService] Error in deleteCampaign:', error.message || error);
            throw error;
        }
    },

    async checkInRegistration(registrationId: string, campaignId: string) {
        try {
            // 1. Get current max queue number for this campaign
            const { data: maxQueue, error: countError } = await supabase
                .from('appointments')
                .select('queue_number')
                .eq('campaign_id', campaignId)
                .not('queue_number', 'is', null)
                .order('queue_number', { ascending: false })
                .limit(1)
                .maybeSingle();

            let nextSTT = 1;
            if (maxQueue && maxQueue.queue_number) {
                nextSTT = maxQueue.queue_number + 1;
            }

            // 2. Update status and queue_number
            const { data, error } = await supabase
                .from('appointments')
                .update({
                    status: 'Checked-in',
                    queue_number: nextSTT,
                    check_in_time: new Date().toISOString()
                })
                .eq('id', registrationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('[CampaignService] Error in checkInRegistration:', error.message || error);
            throw error;
        }
    }
};
