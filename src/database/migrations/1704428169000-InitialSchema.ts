//docker-compose up --build
import { MigrationInterface, QueryRunner, Table  } from 'typeorm';

export class initSchema1704428169000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    //password_archive_tbl
    await queryRunner.query(`CREATE TABLE \`password_archive_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`user_id\` int NOT NULL,
        \`userId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    //inquiry_follow_up_tbl
    await queryRunner.query(`CREATE TABLE \`inquiry_follow_up_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`content\` text NOT NULL,
        \`status\` enum('pending', 'answered') NOT NULL DEFAULT 'pending',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`responseId\` varchar(36) NULL,
        \`userId\` int NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`inquiry_response_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`content\` text NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`inquiryId\` varchar(36) NULL,
        \`userId\` int NULL,
        \`followUpId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`inquiry_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`content\` text NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`status\` enum('pending', 'answered') NOT NULL DEFAULT 'pending',
        \`userId\` int NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`refresh_token_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`token\` varchar(255) NOT NULL,
        \`expiresAt\` datetime NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`isRevoked\` tinyint NOT NULL DEFAULT 0,
        \`userId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`permissions_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`resource\` varchar(255) NOT NULL,
        \`action\` varchar(255) NOT NULL,
        \`description\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`groups_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`user\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`first_name\` varchar(255) NOT NULL,
        \`last_name\` varchar(255) NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`mobile\` varchar(255) NULL,
        \`major\` varchar(255) NULL,
        \`isEmailVerified\` tinyint NOT NULL DEFAULT 0,
        \`verificationCode\` varchar(255) NULL,
        \`verificationCodeExpiry\` datetime NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NULL,
        \`is_active\` int NOT NULL DEFAULT 1,
        \`uguid\` varchar(255) NOT NULL,
        \`role_id\` int NULL,
        \`profileImage\` varchar(255) NULL,
        \`is_deleted\` tinyint NOT NULL DEFAULT 0,
        \`lastLogin\` datetime DEFAULT NULL,
        UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
        PRIMARY KEY (\`id\`)
    )`);	
    

    await queryRunner.query(`CREATE TABLE \`otc_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`uguid\` varchar(255) NULL,
        \`mobile\` varchar(255) NOT NULL,
        \`code\` varchar(255) NOT NULL,
        \`is_active\` int NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`expiry_datetime\` datetime NOT NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`contact_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`full_name\` text NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`mobile\` varchar(255) NULL,
        \`message\` text NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`log_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`level\` varchar(255) NOT NULL,
        \`message\` text NOT NULL,
        \`context\` text NULL,
        \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`option_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`text\` varchar(255) NOT NULL,
        \`question_id\` int NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`question_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`question\` text NOT NULL,
        \`type\` varchar(255) NOT NULL,
        \`correct_answers\` text NOT NULL,
        \`is_deleted\` tinyint NOT NULL DEFAULT 0,
        \`order\` text NULL,
        \`qguid\` varchar(100) NOT NULL,
        \`exam_id\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`category_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`is_active\` int NOT NULL DEFAULT 1,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`exam_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`sid\` int NOT NULL,
        \`title\` text NOT NULL,
        \`description\` text NOT NULL,
        \`notes\` text NOT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NULL,
        \`duration\` int NOT NULL,
        \`passing_score\` int NOT NULL,
        \`total_questions\` int NOT NULL DEFAULT 0,
        \`status\` int NOT NULL,
        \`category_id\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`exam_session_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`currentIndex\` int NOT NULL,
        \`status\` enum('active', 'paused', 'completed') NOT NULL DEFAULT 'active',
        \`startTime\` datetime NOT NULL,
        \`endTime\` datetime NOT NULL,
        \`pausedAt\` datetime NULL,
        \`totalPausedTime\` int NOT NULL DEFAULT 0,
        \`questionOrder\` text NOT NULL,
        \`answeredQuestions\` json NULL,
        \`reviewList\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`examId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`user_answer_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`questionIndex\` int NOT NULL,
        \`selectedOptions\` text NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`examId\` varchar(36) NULL,
        \`questionId\` int NULL,
        \`sessionId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`exam_result_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`totalQuestions\` int NOT NULL,
        \`correctAnswers\` int NOT NULL,
        \`scorePercentage\` decimal(5,2) NOT NULL,
        \`passed\` tinyint NOT NULL,
        \`questionResults\` json NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`examId\` varchar(36) NULL,
        \`sessionId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`review_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`rating\` int NOT NULL,
        \`comment\` varchar(255) NOT NULL,
        \`sentiment\` enum('positive', 'negative', 'neutral') NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`examId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`review_reply_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`comment\` varchar(255) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`reviewId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`te_option_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`text\` varchar(255) NOT NULL,
        \`isCorrect\` tinyint NOT NULL,
        \`questionId\` int NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`te_question_tbl\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`text\` varchar(255) NOT NULL,
        \`type\` varchar(255) NOT NULL,
        \`maxSelections\` int NULL DEFAULT '1',
        \`subject\` varchar(255) NOT NULL,
        \`explanation\` varchar(255) NOT NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`examId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`te_exam_tbl\` (
        \`id\` varchar(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`subject\` varchar(255) NOT NULL,
        \`totalQuestions\` int NOT NULL,
        \`passingScore\` int NOT NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NULL,
        PRIMARY KEY (\`id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`group_permissions_tbl\` (
        \`permission_id\` varchar(36) NOT NULL,
        \`group_id\` varchar(36) NOT NULL,
        INDEX \`IDX_8f3a870955e0303f032f36517c\` (\`permission_id\`),
        INDEX \`IDX_c2af6e400adeffe2692b20a72a\` (\`group_id\`),
        PRIMARY KEY (\`permission_id\`, \`group_id\`)
    )`);	
    
    await queryRunner.query(`CREATE TABLE \`user_groups_tbl\` (
        \`group_id\` varchar(36) NOT NULL,
        \`user_id\` int NOT NULL,
        INDEX \`IDX_786263df5dc7a6bab789dc20a6\` (\`group_id\`),
        INDEX \`IDX_890c5ec94422f30a661b6e058e\` (\`user_id\`),
        PRIMARY KEY (\`group_id\`, \`user_id\`)
    )`);	

    await queryRunner.query(`CREATE TABLE \`user_login_history\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userGuid\` varchar(255) NOT NULL,
        \`loginTime\` timestamp NOT NULL,
        \`logoutTime\` timestamp NULL DEFAULT NULL,
        \`ipAddress\` varchar(50) NOT NULL,
        \`userAgent\` varchar(255) DEFAULT NULL,
        \`deviceType\` enum('desktop','mobile','tablet') NOT NULL DEFAULT 'desktop',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`FK_8cd045e34dacf6e82ac34e783b5\` (\`userId\`)
    )`);	

    await queryRunner.query(`ALTER TABLE \`password_archive_tbl\` 
        ADD CONSTRAINT \`FK_1f647e94f0ec9a96514824387ef\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_follow_up_tbl\` 
        ADD CONSTRAINT \`FK_0bcc388e17435c93bde3165cd5a\` 
        FOREIGN KEY (\`responseId\`) REFERENCES \`inquiry_response_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_follow_up_tbl\` 
        ADD CONSTRAINT \`FK_d1f6793805e3daa2bc8b6fe5659\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_response_tbl\` 
        ADD CONSTRAINT \`FK_7b66f0f1e618f9c8d7fbfc5c537\` 
        FOREIGN KEY (\`inquiryId\`) REFERENCES \`inquiry_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_response_tbl\` 
        ADD CONSTRAINT \`FK_83e015557e4fab523f2ba20b2b0\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_response_tbl\` 
        ADD CONSTRAINT \`FK_f0112997e12d6a3b5d6aaf1f311\` 
        FOREIGN KEY (\`followUpId\`) REFERENCES \`inquiry_follow_up_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`inquiry_tbl\` 
        ADD CONSTRAINT \`FK_b17691fa53f331b778d864fee1d\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`refresh_token_tbl\` 
        ADD CONSTRAINT \`FK_84f9aa7fc0af0f2b77c3b5aa8ba\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`user\` 
        ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` 
        FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`option_tbl\` 
        ADD CONSTRAINT \`FK_11713d7c98fafadc6b8bfe5bfba\` 
        FOREIGN KEY (\`question_id\`) REFERENCES \`question_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`question_tbl\` 
        ADD CONSTRAINT \`FK_6a17b30ef443425df12bc0d8a44\` 
        FOREIGN KEY (\`exam_id\`) REFERENCES \`exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`exam_tbl\` 
        ADD CONSTRAINT \`FK_f9525c2958554489e25087cea15\` 
        FOREIGN KEY (\`category_id\`) REFERENCES \`category_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`exam_session_tbl\` 
        ADD CONSTRAINT \`FK_7e327ee6a9ccea819bde63e4e06\` 
        FOREIGN KEY (\`examId\`) REFERENCES \`exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`user_answer_tbl\` 
        ADD CONSTRAINT \`FK_2b5968b780ab4296a1b70171bc6\` 
        FOREIGN KEY (\`examId\`) REFERENCES \`exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`user_answer_tbl\` 
        ADD CONSTRAINT \`FK_10ee16417b670992af18b83f305\` 
        FOREIGN KEY (\`questionId\`) REFERENCES \`question_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`user_answer_tbl\` 
        ADD CONSTRAINT \`FK_bf9d99aa89dac3f22fb975cf47e\` 
        FOREIGN KEY (\`sessionId\`) REFERENCES \`exam_session_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`exam_result_tbl\` 
        ADD CONSTRAINT \`FK_3f5a9468936c3b4ec9c80845642\` 
        FOREIGN KEY (\`examId\`) REFERENCES \`exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`exam_result_tbl\` 
        ADD CONSTRAINT \`FK_15445ef3002f0fd36b01880b380\` 
        FOREIGN KEY (\`sessionId\`) REFERENCES \`exam_session_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`review_tbl\` 
        ADD CONSTRAINT \`FK_ee3eb4a28195c38d5f75002e43a\` 
        FOREIGN KEY (\`examId\`) REFERENCES \`exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`review_reply_tbl\` 
        ADD CONSTRAINT \`FK_990a7432b071e939f6d7ddc372e\` 
        FOREIGN KEY (\`reviewId\`) REFERENCES \`review_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`te_option_tbl\` 
        ADD CONSTRAINT \`FK_5f30e01b586672ebdec535dce60\` 
        FOREIGN KEY (\`questionId\`) REFERENCES \`te_question_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`te_question_tbl\` 
        ADD CONSTRAINT \`FK_d095c2862623b42c06bda7f802b\` 
        FOREIGN KEY (\`examId\`) REFERENCES \`te_exam_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`group_permissions_tbl\` 
        ADD CONSTRAINT \`FK_8f3a870955e0303f032f36517c7\` 
        FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions_tbl\`(\`id\`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE`);
        
        await queryRunner.query(`ALTER TABLE \`group_permissions_tbl\` 
        ADD CONSTRAINT \`FK_c2af6e400adeffe2692b20a72af\` 
        FOREIGN KEY (\`group_id\`) REFERENCES \`groups_tbl\`(\`id\`) 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION`);
        
        await queryRunner.query(`ALTER TABLE \`user_groups_tbl\` 
        ADD CONSTRAINT \`FK_786263df5dc7a6bab789dc20a6e\` 
        FOREIGN KEY (\`group_id\`) REFERENCES \`groups_tbl\`(\`id\`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE`);
        
        await queryRunner.query(`ALTER TABLE \`user_groups_tbl\` 
        ADD CONSTRAINT \`FK_890c5ec94422f30a661b6e058eb\` 
        FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE`);

        await queryRunner.query(`ALTER TABLE \`user_login_history\` 
        ADD CONSTRAINT \`FK_8cd045e34dacf6e82ac34e783b5\` 
        FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`)
        ON DELETE CASCADE 
        ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

  }
}
