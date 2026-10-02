/* 班級英雄 SaaS 設定。SUPABASE_URL／ANON_KEY 留空 → 自動用本機 (local) adapter，完全離線可用。
   ANON_KEY 係公開 key（靠 RLS 保護），可以放前端；STRIPE_SECRET_KEY 千祈唔好放呢度。 */
window.CH_CONFIG = {
  SUPABASE_URL: 'https://rkqtivbzdxgbcnzekkci.supabase.co',                       // 例：https://abcdefgh.supabase.co
  SUPABASE_ANON_KEY: 'sb_publishable_xkegoxxNAqF8WTdAimTLLw_V2LN-ssq',                  // Supabase → Project Settings → API → anon public
  STRIPE_PRICE_TEACHER_MONTHLY: '',       // 例：price_1Q...（已唔使：create-checkout 由代碼定價＋lookup_key 自動喺 Stripe 建立；月費 HK$30、年費 HK$248）
  STRIPE_PRICE_SCHOOL_SEAT_YEARLY: '',    // 例：price_1Q...（HK$3,880／年，40 位老師）
  TRIAL_DAYS: 14,
  LIFETIME_PRICE_HKD: 988,                // 終身會員顯示價（Stripe price 讀到就以 Stripe 為準）
  DEV_FAKE_AUTH: false                    // true = 本機假帳戶（測試登入／試用／唯讀／學校頁，唔使 Supabase）
};
