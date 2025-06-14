-- Tabla para guardar la meta diaria personalizada por usuario
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_goals')
BEGIN
  CREATE TABLE user_goals (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    daily_goal INT NOT NULL DEFAULT 2000,
    weight INT,
    activity NVARCHAR(MAX),
    climate NVARCHAR(MAX),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
  );
END
