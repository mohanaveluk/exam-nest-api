/*
  # Create Initial Permissions

  1. New Tables
    - Creates initial permissions for the exam system
  
  2. Data
    - Inserts basic permission records for exams and questions
*/

-- Create permissions for exams
INSERT INTO permissions_tbl (id, resource, action, description) 
VALUES 
  (gen_random_uuid(), 'exams', 'view', 'View exams'),
  (gen_random_uuid(), 'exams', 'create', 'Create new exams'),
  (gen_random_uuid(), 'exams', 'edit', 'Edit existing exams'),
  (gen_random_uuid(), 'exams', 'delete', 'Delete exams');

-- Create permissions for questions
INSERT INTO permissions_tbl (id, resource, action, description) 
VALUES 
  (gen_random_uuid(), 'questions', 'view', 'View questions'),
  (gen_random_uuid(), 'questions', 'create', 'Create new questions'),
  (gen_random_uuid(), 'questions', 'edit', 'Edit existing questions'),
  (gen_random_uuid(), 'questions', 'delete', 'Delete questions');