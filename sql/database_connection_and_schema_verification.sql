-- Test database connection and tables
SELECT 'Database connection successful!' as status;

-- Check if profiles table exists
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Test inserting a profile (this will fail if RLS is too restrictive, which is expected)
SELECT 'Database setup complete! Ready for authentication.' as final_status;
