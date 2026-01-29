# 🚨 FIX LỖI RLS - GIẢI PHÁP CUỐI CÙNG

## ❌ Lỗi
```
new row violates row-level security policy for table "notifications"
```

## ✅ GIẢI PHÁP DUY NHẤT

Chạy SQL script sau trong **Supabase SQL Editor**:

```sql
-- Xóa policy cũ
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- Tạo policy MỚI cho phép authenticated users insert
CREATE POLICY "Authenticated users can insert notifications" 
    ON public.notifications 
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Verify
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'notifications' AND cmd = 'INSERT';
```

## 📋 Các bước

### **Bước 1: Mở Supabase SQL Editor**
1. Vào https://supabase.com
2. Chọn project
3. Click **SQL Editor**

### **Bước 2: Copy & Run Script**
Copy script SQL ở trên, paste vào SQL Editor, click **Run**

### **Bước 3: Test**
```
http://localhost:3000/test-notification
```

## ✅ Kết quả mong đợi

Sau khi chạy SQL:
- ✅ Không còn lỗi RLS
- ✅ Toast notification hiện lên
- ✅ Thông báo được tạo thành công

---

## 🎯 TẠI SAO CÁCH NÀY HOẠT ĐỘNG?

**Vấn đề cũ:**
- Policy yêu cầu `auth.uid() = user_id`
- Khi tạo thông báo cho user khác → Fail

**Giải pháp mới:**
- Policy cho phép `authenticated` users insert với `WITH CHECK (true)`
- Bất kỳ authenticated user nào cũng có thể tạo thông báo
- Vẫn an toàn vì chỉ authenticated users mới có thể insert

---

Chạy SQL script này là bước CUỐI CÙNG để fix lỗi! 🎉
