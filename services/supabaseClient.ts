import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfphloumxwwbqaosxtta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcGhsb3VteHd3YnFhb3N4dHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzE2NTYsImV4cCI6MjA4MDg0NzY1Nn0.T2ZI691xum6D4_Jg7FWL3pYrUEsJTd07ITS4_QMAKAc';

export const supabase = createClient(supabaseUrl, supabaseKey);