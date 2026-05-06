-- Employee email is the authentication credential, so non-null emails must be unique.
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");
