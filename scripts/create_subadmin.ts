
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ykroptmleklzpnntxozt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lFhpi1ACzNvqHYKVcYhngQ_NYacTCSM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createSubAdmin() {
    const email = 'subadmin@doctranslation.co';
    const password = '2424g4'; // User requested this specific password

    console.log(`Creating user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Sub Admin',
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    if (data.user) {
        console.log('User created successfully:', data.user.id);
        console.log('Please run the SQL migration to upgrade this user to ADMIN.');
    } else {
        console.log('User creation returned no data (possibly already exists).');
    }
}

createSubAdmin();
