INSERT INTO "User" (id, email, "fullName", "passwordHash", role, "termsAccepted", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@aurora.com',
  'Administrador Aurora',
  '$2a$12$5G2gJQVlKzu0aUwRjrpZzO4xblIXfBh8Z9X4j4nrsF/etloQWh06.',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', "passwordHash" = EXCLUDED."passwordHash";
