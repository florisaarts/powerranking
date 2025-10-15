-- Check of invite_code kolom bestaat en wat de waardes zijn
SELECT 
  id,
  name,
  invite_code,
  created_at
FROM groups
ORDER BY created_at DESC;
