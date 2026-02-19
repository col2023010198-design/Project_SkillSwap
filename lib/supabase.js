import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zapkszmkuwcalkjnlzfa.supabase.co'
const supabaseKey = 'sb_publishable_2Gl05oNCdR2UdTJmArd9gQ_yAXftj4k'

export const supabase = createClient(supabaseUrl, supabaseKey)