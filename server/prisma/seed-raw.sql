-- Clean existing data
DELETE FROM "ChatMessage";
DELETE FROM "Notification";
DELETE FROM "ProgressEntry";
DELETE FROM "ScheduledSession";
DELETE FROM "SessionRequest";
DELETE FROM "Profile";
DELETE FROM "User";

-- Create mentors
INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES
('mentor.alex@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Alex Mentor', 'MENTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mentor.priya@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Priya Mentor', 'MENTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mentor.sam@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Sam Mentor', 'MENTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mentor.liu@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Liu Mentor', 'MENTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mentor.rahul@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Rahul Mentor', 'MENTOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create students
INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES
('alice@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Alice', 'STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('brian@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Brian', 'STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chloe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Chloe', 'STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('derek@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Derek', 'STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('eva@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Eva', 'STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create admin
INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt") VALUES
('admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', 'Admin User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create mentor profiles
INSERT INTO "Profile" ("userId", bio, subjects, rating, "hourlyRate", availability, "successRate", "aiScore") VALUES
(1, 'Experienced mathematics tutor with 5+ years of teaching experience', 'Mathematics, Physics, Calculus', 4.8, 25, '{"active": true, "slots": [{"day": "Mon", "start": "18:00", "end": "20:00"}]}', 0.95, 0.88),
(2, 'Chemistry expert specializing in organic chemistry and biochemistry', 'Chemistry, Biology, Organic Chem', 4.9, 30, '{"active": true, "slots": [{"day": "Tue", "start": "19:00", "end": "21:00"}]}', 0.92, 0.85),
(3, 'Computer science mentor with industry experience', 'Computer Science, Data Structures, Algorithms', 4.7, 28, '{"active": true, "slots": [{"day": "Wed", "start": "17:00", "end": "19:00"}]}', 0.89, 0.82),
(4, 'Statistics and linear algebra specialist', 'Statistics, Linear Algebra', 4.6, 22, '{"active": true, "slots": [{"day": "Thu", "start": "16:00", "end": "18:00"}]}', 0.87, 0.79),
(5, 'Physics and engineering tutor', 'Mechanics, Thermodynamics', 4.5, 26, '{"active": true, "slots": [{"day": "Fri", "start": "18:00", "end": "20:00"}]}', 0.84, 0.76);

-- Create session requests (mix of statuses - IMPORTANT: Many ACCEPTED for chat)
INSERT INTO "SessionRequest" ("studentId", "mentorId", subject, message, status, "urgencyScore", "matchScore", "aiAnalysis", "createdAt") VALUES
-- ACCEPTED sessions (these will show in chat)
(6, 1, 'Calculus', 'Need help with derivatives and integrals', 'ACCEPTED', 8, 95, '{"difficulty": 3}', CURRENT_TIMESTAMP),
(7, 2, 'Organic Chemistry', 'Struggling with reaction mechanisms', 'ACCEPTED', 9, 92, '{"difficulty": 4}', CURRENT_TIMESTAMP),
(8, 3, 'Data Structures', 'Need help with binary trees and graphs', 'ACCEPTED', 7, 88, '{"difficulty": 3}', CURRENT_TIMESTAMP),
(9, 4, 'Statistics', 'Help with probability distributions', 'ACCEPTED', 6, 85, '{"difficulty": 2}', CURRENT_TIMESTAMP),
(10, 5, 'Mechanics', 'Problems with Newton laws', 'ACCEPTED', 8, 90, '{"difficulty": 3}', CURRENT_TIMESTAMP),
(6, 2, 'Biology', 'Cell division and mitosis', 'ACCEPTED', 7, 87, '{"difficulty": 2}', CURRENT_TIMESTAMP),
(7, 3, 'Algorithms', 'Sorting algorithms complexity', 'ACCEPTED', 9, 93, '{"difficulty": 4}', CURRENT_TIMESTAMP),
(8, 1, 'Physics', 'Kinematics problems', 'ACCEPTED', 6, 86, '{"difficulty": 2}', CURRENT_TIMESTAMP),

-- FINISHED sessions (these will also show in chat)
(9, 5, 'Thermodynamics', 'Entropy and heat engines', 'FINISHED', 8, 89, '{"difficulty": 4}', CURRENT_TIMESTAMP),
(10, 4, 'Linear Algebra', 'Matrix operations and eigenvalues', 'FINISHED', 7, 91, '{"difficulty": 3}', CURRENT_TIMESTAMP),

-- PENDING sessions (these won't show in chat)
(6, 3, 'Computer Science', 'Help with programming concepts', 'PENDING', 5, 82, '{"difficulty": 2}', CURRENT_TIMESTAMP),
(7, 1, 'Mathematics', 'Algebra problems', 'PENDING', 6, 84, '{"difficulty": 2}', CURRENT_TIMESTAMP),

-- CANCELLED sessions (these won't show in chat)
(8, 2, 'Chemistry', 'Chemical bonding', 'CANCELLED', 4, 78, '{"difficulty": 2}', CURRENT_TIMESTAMP),
(9, 3, 'Programming', 'Object-oriented programming', 'CANCELLED', 5, 80, '{"difficulty": 2}', CURRENT_TIMESTAMP);

-- Create scheduled sessions
INSERT INTO "ScheduledSession" ("studentId", "mentorId", title, description, subject, "startTime", "endTime", status, "meetingType", location, "meetingLink", "createdAt", "updatedAt") VALUES
(6, 1, 'Calculus Review Session', 'Comprehensive review of derivatives and integrals', 'Calculus', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SCHEDULED', 'VIDEO', 'Zoom', 'https://zoom.us/j/123456789', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, 'Organic Chemistry Help', 'Reaction mechanisms and synthesis', 'Organic Chemistry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SCHEDULED', 'VIDEO', 'Google Meet', 'https://meet.google.com/abc-defg-hij', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 3, 'Data Structures Workshop', 'Binary trees and graph algorithms', 'Data Structures', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SCHEDULED', 'IN_PERSON', 'Campus Library', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 4, 'Statistics Tutoring', 'Probability and distributions', 'Statistics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SCHEDULED', 'AUDIO', 'Phone Call', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 5, 'Physics Problem Solving', 'Newton laws and kinematics', 'Mechanics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SCHEDULED', 'VIDEO', 'Zoom', 'https://zoom.us/j/987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create chat messages for ACCEPTED and FINISHED sessions
INSERT INTO "ChatMessage" ("sessionId", "fromUserId", message, "isAiMessage", "aiTopics", "createdAt") VALUES
-- Session 1 (Alice + Alex - ACCEPTED)
(1, 6, 'Hi Alex! I have some questions about derivatives', false, '{}', CURRENT_TIMESTAMP),
(1, 1, 'Hello Alice! I''d be happy to help with derivatives. What specific problems are you working on?', false, '{}', CURRENT_TIMESTAMP),
(1, 6, 'I''m struggling with the chain rule and implicit differentiation', false, '{}', CURRENT_TIMESTAMP),
(1, 1, 'Great! The chain rule can be tricky. Let me explain it step by step...', false, '{}', CURRENT_TIMESTAMP),

-- Session 2 (Brian + Priya - ACCEPTED)
(2, 7, 'Hi Priya! I need help with organic chemistry reaction mechanisms', false, '{}', CURRENT_TIMESTAMP),
(2, 2, 'Hello Brian! Reaction mechanisms are my specialty. Which reactions are you studying?', false, '{}', CURRENT_TIMESTAMP),
(2, 7, 'SN1 and SN2 reactions are confusing me', false, '{}', CURRENT_TIMESTAMP),
(2, 2, 'Perfect! Let me break down the differences between SN1 and SN2...', false, '{}', CURRENT_TIMESTAMP),

-- Session 3 (Chloe + Sam - ACCEPTED)
(3, 8, 'Hi Sam! I''m having trouble with binary trees', false, '{}', CURRENT_TIMESTAMP),
(3, 3, 'Hello Chloe! Binary trees are fundamental. What specific concepts are challenging?', false, '{}', CURRENT_TIMESTAMP),
(3, 8, 'Tree traversal algorithms and balancing', false, '{}', CURRENT_TIMESTAMP),
(3, 3, 'Excellent questions! Let''s start with the three main traversal methods...', false, '{}', CURRENT_TIMESTAMP),

-- Session 4 (Derek + Liu - ACCEPTED)
(4, 9, 'Hi Liu! I need help with probability distributions', false, '{}', CURRENT_TIMESTAMP),
(4, 4, 'Hello Derek! Probability is fascinating. Which distributions are you studying?', false, '{}', CURRENT_TIMESTAMP),
(4, 9, 'Normal distribution and z-scores', false, '{}', CURRENT_TIMESTAMP),
(4, 4, 'Perfect! The normal distribution is crucial. Let me explain z-scores...', false, '{}', CURRENT_TIMESTAMP),

-- Session 5 (Eva + Rahul - ACCEPTED)
(5, 10, 'Hi Rahul! I''m struggling with Newton laws', false, '{}', CURRENT_TIMESTAMP),
(5, 5, 'Hello Eva! Newton laws are the foundation of classical mechanics. Which law is giving you trouble?', false, '{}', CURRENT_TIMESTAMP),
(5, 10, 'The third law - action and reaction', false, '{}', CURRENT_TIMESTAMP),
(5, 5, 'Ah, the third law can be tricky! Let me explain with some examples...', false, '{}', CURRENT_TIMESTAMP);

-- Create progress entries for students
INSERT INTO "ProgressEntry" ("userId", subject, score, "maxScore", type, description, date) VALUES
-- Alice's progress
(6, 'Calculus', 85, 100, 'QUIZ', 'Derivatives quiz', CURRENT_TIMESTAMP),
(6, 'Calculus', 92, 100, 'ASSIGNMENT', 'Integration homework', CURRENT_TIMESTAMP),
(6, 'Physics', 78, 100, 'PROJECT', 'Mechanics lab report', CURRENT_TIMESTAMP),

-- Brian's progress
(7, 'Chemistry', 88, 100, 'QUIZ', 'Organic chemistry quiz', CURRENT_TIMESTAMP),
(7, 'Biology', 95, 100, 'ASSIGNMENT', 'Cell biology assignment', CURRENT_TIMESTAMP),
(7, 'Chemistry', 82, 100, 'PROJECT', 'Synthesis project', CURRENT_TIMESTAMP),

-- Chloe's progress
(8, 'Computer Science', 90, 100, 'QUIZ', 'Data structures quiz', CURRENT_TIMESTAMP),
(8, 'Algorithms', 87, 100, 'ASSIGNMENT', 'Sorting algorithms', CURRENT_TIMESTAMP),
(8, 'Programming', 93, 100, 'PROJECT', 'Binary tree implementation', CURRENT_TIMESTAMP),

-- Derek's progress
(9, 'Statistics', 85, 100, 'QUIZ', 'Probability quiz', CURRENT_TIMESTAMP),
(9, 'Linear Algebra', 89, 100, 'ASSIGNMENT', 'Matrix operations', CURRENT_TIMESTAMP),
(9, 'Statistics', 91, 100, 'PROJECT', 'Data analysis project', CURRENT_TIMESTAMP),

-- Eva's progress
(10, 'Physics', 86, 100, 'QUIZ', 'Mechanics quiz', CURRENT_TIMESTAMP),
(10, 'Thermodynamics', 84, 100, 'ASSIGNMENT', 'Heat engines', CURRENT_TIMESTAMP),
(10, 'Physics', 88, 100, 'PROJECT', 'Energy conservation lab', CURRENT_TIMESTAMP);

-- Create notifications for users
INSERT INTO "Notification" ("userId", type, title, message, "isRead", "relatedId", "relatedType", "createdAt") VALUES
-- Alice's notifications
(6, 'MESSAGE', 'New message from Alex Mentor', 'You have a new message about calculus derivatives', false, 1, 'session', CURRENT_TIMESTAMP),
(6, 'SESSION', 'Session reminder', 'Your calculus session starts in 1 hour', false, 1, 'session', CURRENT_TIMESTAMP),
(6, 'RATING', 'New rating received', 'You received a 5-star rating from Alex!', false, 1, 'rating', CURRENT_TIMESTAMP),

-- Brian's notifications
(7, 'MESSAGE', 'New message from Priya Mentor', 'You have a new message about organic chemistry', false, 2, 'session', CURRENT_TIMESTAMP),
(7, 'REMINDER', 'Homework reminder', 'Don''t forget to complete your chemistry assignment', false, NULL, 'homework', CURRENT_TIMESTAMP),
(7, 'SYSTEM', 'System update', 'New features are available in your dashboard', false, NULL, 'system', CURRENT_TIMESTAMP),

-- Chloe's notifications
(8, 'MESSAGE', 'New message from Sam Mentor', 'You have a new message about data structures', false, 3, 'session', CURRENT_TIMESTAMP),
(8, 'SESSION', 'Session scheduled', 'Your data structures session has been scheduled', false, 3, 'session', CURRENT_TIMESTAMP),
(8, 'RATING', 'New rating received', 'You received a 4-star rating from Sam!', false, 3, 'rating', CURRENT_TIMESTAMP),

-- Derek's notifications
(9, 'MESSAGE', 'New message from Liu Mentor', 'You have a new message about statistics', false, 4, 'session', CURRENT_TIMESTAMP),
(9, 'REMINDER', 'Quiz reminder', 'Your statistics quiz is tomorrow', false, NULL, 'quiz', CURRENT_TIMESTAMP),
(9, 'SYSTEM', 'Feature update', 'New progress tracking features available', false, NULL, 'system', CURRENT_TIMESTAMP),

-- Eva's notifications
(10, 'MESSAGE', 'New message from Rahul Mentor', 'You have a new message about physics', false, 5, 'session', CURRENT_TIMESTAMP),
(10, 'SESSION', 'Session reminder', 'Your physics session starts in 30 minutes', false, 5, 'session', CURRENT_TIMESTAMP),
(10, 'RATING', 'New rating received', 'You received a 5-star rating from Rahul!', false, 5, 'rating', CURRENT_TIMESTAMP);

-- Mentor notifications
INSERT INTO "Notification" ("userId", type, title, message, "isRead", "relatedId", "relatedType", "createdAt") VALUES
(1, 'MESSAGE', 'New message from Alice', 'You have a new message about calculus', false, 1, 'session', CURRENT_TIMESTAMP),
(2, 'MESSAGE', 'New message from Brian', 'You have a new message about organic chemistry', false, 2, 'session', CURRENT_TIMESTAMP),
(3, 'MESSAGE', 'New message from Chloe', 'You have a new message about data structures', false, 3, 'session', CURRENT_TIMESTAMP),
(4, 'MESSAGE', 'New message from Derek', 'You have a new message about statistics', false, 4, 'session', CURRENT_TIMESTAMP),
(5, 'MESSAGE', 'New message from Eva', 'You have a new message about physics', false, 5, 'session', CURRENT_TIMESTAMP);
