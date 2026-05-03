-- Campus PC Entry and Exit Monitoring System Database

CREATE DATABASE IF NOT EXISTS campus_pc_system;
USE campus_pc_system;

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PC Registration table
CREATE TABLE IF NOT EXISTS pc_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    pc_brand VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('Inside Campus', 'Outside Campus') DEFAULT 'Outside Campus',
    last_entry DATETIME NULL,
    last_exit DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Entry/Exit History table
CREATE TABLE IF NOT EXISTS pc_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    entry_time DATETIME NULL,
    exit_time DATETIME NULL,
    status ENUM('Inside Campus', 'Outside Campus') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES pc_registrations(student_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_student_id ON pc_registrations(student_id);
CREATE INDEX idx_serial_number ON pc_registrations(serial_number);
CREATE INDEX idx_history_student ON pc_history(student_id);
CREATE INDEX idx_history_date ON pc_history(entry_time, exit_time);
