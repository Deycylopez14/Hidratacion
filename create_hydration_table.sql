CREATE TABLE hydration (
	id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
	user_id uniqueidentifier,
	amount int NOT NULL,
	created_at datetimeoffset NOT NULL DEFAULT SYSDATETIMEOFFSET(),
	FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
