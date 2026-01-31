-- =====================================================
-- GIẢI PHÁP TRIỆT ĐỂ: DÙNG STORED PROCEDURE (Bypass RLS)
-- Chạy file này trong Supabase SQL Editor
-- =====================================================

-- 1. Tạo hàm gửi thông báo với quyền SECURITY DEFINER (Quyền Admin)
CREATE OR REPLACE FUNCTION public.create_notification_secure(
    p_user_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_action_type TEXT DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Quan trọng: Chạy với quyền của người tạo hàm (Admin)
AS $$
DECLARE
    v_notification_id UUID;
    v_result JSONB;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        content,
        action_type,
        action_url,
        metadata,
        is_read
    ) VALUES (
        p_user_id,
        p_title,
        p_content,
        p_action_type,
        p_action_url,
        p_metadata,
        FALSE
    )
    RETURNING id INTO v_notification_id;

    -- Trả về kết quả
    SELECT row_to_json(n) INTO v_result
    FROM public.notifications n
    WHERE id = v_notification_id;

    RETURN v_result;
END;
$$;

-- 2. Cấp quyền cho mọi user đã đăng nhập được gọi hàm này
GRANT EXECUTE ON FUNCTION public.create_notification_secure TO authenticated;
