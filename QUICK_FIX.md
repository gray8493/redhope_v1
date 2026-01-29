# 🚨 FIX NHANH - Lỗi "Could not find the 'action_type' column"

## ⚡ Giải pháp nhanh (2 phút)

### **Bước 1: Mở Supabase SQL Editor**
1. Vào https://supabase.com
2. Chọn project của bạn
3. Click **SQL Editor** (menu bên trái)

### **Bước 2: Copy & Run Script**

**Copy toàn bộ nội dung file này:**
```
scripts/quick-fix-notifications.sql
```

**Hoặc copy trực tiếp từ đây:**

```sql
-- Kiểm tra và tạo bảng notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        -- Tạo bảng mới
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            action_type TEXT,
            action_url TEXT,
            is_read BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Tạo indexes
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

        -- Bật RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

        -- Tạo policies
        CREATE POLICY "Users can read own notifications" 
            ON public.notifications FOR SELECT 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update own notifications" 
            ON public.notifications FOR UPDATE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own notifications" 
            ON public.notifications FOR DELETE 
            USING (auth.uid() = user_id);

        CREATE POLICY "Service can insert notifications" 
            ON public.notifications FOR INSERT 
            WITH CHECK (true);

        RAISE NOTICE '✅ Bảng notifications đã được tạo!';
    ELSE
        -- Nếu bảng đã có, thêm cột thiếu
        ALTER TABLE public.notifications 
            ADD COLUMN IF NOT EXISTS action_type TEXT,
            ADD COLUMN IF NOT EXISTS action_url TEXT,
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

        RAISE NOTICE '✅ Đã thêm các cột thiếu!';
    END IF;
END $$;

-- Bật Realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Realtime đã được bật';
END $$;

SELECT '✅ HOÀN THÀNH!' as status;
```

**Paste vào SQL Editor và click Run (Ctrl+Enter)**

### **Bước 3: Bật Realtime (Quan trọng!)**
1. Vào **Database** → **Replication**
2. Tìm bảng `notifications`
3. Click toggle để **Enable**
4. Click **Save**

### **Bước 4: Refresh ứng dụng**
```bash
# Trong terminal, stop server (Ctrl+C) và chạy lại:
npm run dev
```

---

## ✅ Kiểm tra đã fix chưa

### Test 1: Kiểm tra bảng
1. Vào **Table Editor** → `notifications`
2. Xem có 10 cột:
   - id, user_id, title, content
   - **action_type** ✅
   - **action_url** ✅
   - is_read, **metadata** ✅
   - created_at, updated_at

### Test 2: Test API
1. Vào: http://localhost:3000/test-notification
2. Click "Sử dụng ID của tôi"
3. Click "Gửi Test Notification"
4. **Không còn lỗi** ✅

---

## 🐛 Nếu vẫn lỗi

### Lỗi: "function is_admin() does not exist"

**Fix:** Chạy thêm script này:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Lỗi: "relation 'users' does not exist"

**Fix:** Chạy `scripts/setup.sql` trước

### Lỗi vẫn còn sau khi chạy script

**Fix:**
1. Refresh schema cache:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Restart Next.js server (Ctrl+C → npm run dev)
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📊 Tóm tắt

**Đã làm:**
- ✅ Tạo file `scripts/quick-fix-notifications.sql`
- ✅ Cập nhật `lib/database.types.ts` với Notification types

**Bạn cần làm:**
1. ⏳ Chạy SQL script trong Supabase
2. ⏳ Bật Realtime cho bảng notifications
3. ⏳ Restart server

**Thời gian:** ~2 phút

---

## 🎯 Sau khi fix

Hệ thống thông báo real-time sẽ hoạt động hoàn hảo:
- ✅ Toast notification
- ✅ Badge counter
- ✅ Real-time updates
- ✅ Click to navigate

**Test ngay tại:** http://localhost:3000/test-notification
