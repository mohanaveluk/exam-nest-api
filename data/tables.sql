/*drop table users;
drop table password_history;
drop table user_role;
drop table user_profile;
drop table roles;
*/
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL UNIQUE,
    last_name VARCHAR(100) NOT NULL UNIQUE,
    major_subject VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,

    createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon DATETIME NULL,
    is_active INT DEFAULT '1',
    uguid  VARCHAR(100) NOT NULL
);

CREATE TABLE password_history  (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    password_hash VARCHAR(255) NOT NULL,
    createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_role  (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    roleid VARCHAR(100) NOT NULL,
    createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon DATETIME NULL
);

CREATE TABLE user_profile  (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    first_name VARCHAR(100) NOT NULL UNIQUE,
    last_name VARCHAR(100) NOT NULL UNIQUE,
    major_subject VARCHAR(100) NULL,
    profile_picture VARCHAR(300) NULL,
    address_line1 VARCHAR(100) NULL,
    address_line2 VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    zipcode VARCHAR(100) NULL,
    createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon DATETIME NULL
);

CREATE TABLE roles  (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    roleid VARCHAR(100) NOT NULL,
    createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedon DATETIME NULL,
    rguid  VARCHAR(100) NOT NULL
);