-- Tabla para guardar la meta diaria personalizada por usuario
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_goals')
BEGIN
  CREATE TABLE user_goals (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    daily_goal INT NOT NULL DEFAULT 2000,
    weight INT,
    age INT,
    gender NVARCHAR(20),
    activity NVARCHAR(MAX),
    climate NVARCHAR(MAX),
    sleep_time NVARCHAR(10),
    wake_time NVARCHAR(10),
    unit NVARCHAR(10),
    reminder_type NVARCHAR(20),
    updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
  );
END
