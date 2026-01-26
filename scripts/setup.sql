// ==============================
// REDHOPE - SIMPLIFIED DATABASE (DBML)
// - Financial donation stored in users (aggregate)
// - No checkins table (demo scope)
// ==============================

// ---------- USERS ----------
Table users {
  id uuid [pk, note: "Primary ID"]
  full_name varchar [not null]
  email varchar [unique, not null]
  phone varchar

  citizen_id varchar [not null, unique, note: "CCCD bắt buộc"]
  password_hash varchar

  role varchar [not null, note: "user/admin/hospital"]

  // Donor info
  blood_group varchar [note: "A, B, AB, O"]
  organization varchar
  city varchar
  district varchar

  // Hospital info (role=hospital)
  hospital_code varchar [unique]
  hospital_name varchar
  license_number varchar
  address varchar
  is_verified boolean [default: false]

  // Rewards
  current_points int [default: 0]

  // Financial donation (aggregate for demo)
  total_donation_amount decimal [default: 0, note: "Tổng tiền đã ủng hộ"]
  last_donation_at timestamp
  last_donation_message text

  created_at timestamp
}

// ---------- CAMPAIGNS ----------
Table campaigns {
  id uuid [pk]
  hospital_id uuid [ref: > users.id, note: "Organizer (role=hospital)"]

  name varchar [not null]
  organizer_name varchar
  location_name varchar

  city varchar
  district varchar

  start_time timestamp
  end_time timestamp

  target_units int [default: 0]
  is_allowed boolean [default: false]
  status varchar [not null, default: "draft", note: "draft/active/ended/cancelled"]

  created_at timestamp
}

// ---------- BLOOD REQUESTS ----------
Table blood_requests {
  id uuid [pk]
  hospital_id uuid [ref: > users.id]

  required_blood_group varchar
  required_units int [default: 0]

  target_organization varchar
  city varchar
  district varchar

  urgency_level varchar
  status varchar [not null, default: "Open", note: "Open/Closed"]
  created_at timestamp
}

// ---------- NOTIFICATIONS ----------
Table notifications {
  id uuid [pk]
  request_id uuid [ref: > blood_requests.id]
  user_id uuid [ref: > users.id]

  content text
  is_read boolean [default: false]
  sent_at timestamp
  read_at timestamp
}

// ---------- AI SCREENING ----------
Table screening_logs {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  campaign_id uuid [ref: > campaigns.id]

  ai_result boolean
  health_details jsonb
  created_at timestamp
}

// ---------- APPOINTMENTS ----------
Table appointments {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  campaign_id uuid [ref: > campaigns.id]

  scheduled_time timestamp
  qr_code varchar [unique, note: "QR token (dùng cho đối soát onsite - demo)"]
  status varchar [not null, default: "Booked", note: "Booked/Cancelled/Completed"]
  created_at timestamp

  Indexes {
    (user_id, campaign_id) [unique, name: "uniq_user_campaign_one_booking"]
  }
}

// ---------- DONATION RECORDS ----------
Table donation_records {
  id uuid [pk]
  appointment_id uuid [ref: - appointments.id, note: "1 appointment -> 1 donation record"]

  volume_ml int
  verified_by uuid [ref: > users.id, note: "role=hospital"]
  verified_at timestamp
  note text

  Indexes {
    (appointment_id) [unique, name: "uniq_donation_per_appointment"]
  }
}

// ---------- VOUCHERS ----------
Table vouchers {
  id uuid [pk]
  title varchar
  partner_name varchar
  point_cost int [not null]
  stock_quantity int [default: 0]

  imported_by uuid [ref: > users.id, note: "role=admin"]

  code varchar [unique]
  status varchar [not null, default: "Available", note: "Available/Used"]
  expires_at timestamp
  created_at timestamp
}

// ---------- USER REDEMPTIONS ----------
Table user_redemptions {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  voucher_id uuid [ref: > vouchers.id]

  redeemed_at timestamp
  status varchar [not null, default: "Redeemed"]

  Indexes {
    (user_id, voucher_id) [unique, name: "uniq_user_voucher_once"]
  }
}

