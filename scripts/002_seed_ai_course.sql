-- Seed AI Fundamentals Course

-- Insert the course
INSERT INTO public.courses (id, title, slug, description, short_description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, level, is_published)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'AI Fundamentals: Complete Guide to Artificial Intelligence',
  'ai-fundamentals',
  'Master the fundamentals of Artificial Intelligence in this comprehensive course. Learn about machine learning, neural networks, natural language processing, computer vision, and more. This course is designed for beginners who want to understand AI concepts and their real-world applications. By the end of this course, you will have a solid foundation in AI and be ready to explore more advanced topics.',
  'Learn AI from scratch - machine learning, neural networks, NLP, and real-world applications.',
  '/images/ai-course-thumbnail.jpg',
  'Dr. Sarah Chen',
  '/images/instructor-avatar.jpg',
  12.5,
  24,
  'Beginner',
  TRUE
);

-- Insert sections
INSERT INTO public.sections (id, course_id, title, description, position) VALUES
('s1000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Introduction to Artificial Intelligence', 'Get started with the basics of AI and understand its history and applications.', 1),
('s1000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Machine Learning Basics', 'Learn the fundamentals of machine learning algorithms and techniques.', 2),
('s1000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Neural Networks & Deep Learning', 'Dive deep into neural networks and understand how deep learning works.', 3),
('s1000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Natural Language Processing', 'Explore how AI understands and generates human language.', 4),
('s1000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Computer Vision', 'Learn how machines see and interpret visual information.', 5),
('s1000000-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AI Ethics & Future', 'Understand the ethical considerations and future of AI.', 6);

-- Insert lessons for Section 1: Introduction to AI
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'What is Artificial Intelligence?', 'An overview of AI, its definition, and why it matters today.', '76979871', 15, 1, TRUE),
('l1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'History of AI', 'From Turing to modern AI - a journey through time.', '76979871', 12, 2, TRUE),
('l1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'Types of AI Systems', 'Understanding narrow AI, general AI, and super AI.', '76979871', 18, 3, FALSE),
('l1000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'AI Applications in Industry', 'Real-world examples of AI transforming businesses.', '76979871', 20, 4, FALSE);

-- Insert lessons for Section 2: Machine Learning Basics
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000002', 'Introduction to Machine Learning', 'What is ML and how does it relate to AI?', '76979871', 16, 1, FALSE),
('l1000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000002', 'Supervised Learning', 'Learn about classification and regression.', '76979871', 22, 2, FALSE),
('l1000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000002', 'Unsupervised Learning', 'Clustering, dimensionality reduction, and more.', '76979871', 20, 3, FALSE),
('l1000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000002', 'Reinforcement Learning', 'How agents learn through trial and error.', '76979871', 18, 4, FALSE);

-- Insert lessons for Section 3: Neural Networks
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000009', 's1000000-0000-0000-0000-000000000003', 'How Neural Networks Work', 'Understanding neurons, layers, and activation functions.', '76979871', 25, 1, FALSE),
('l1000000-0000-0000-0000-000000000010', 's1000000-0000-0000-0000-000000000003', 'Training Neural Networks', 'Backpropagation and gradient descent explained.', '76979871', 28, 2, FALSE),
('l1000000-0000-0000-0000-000000000011', 's1000000-0000-0000-0000-000000000003', 'Convolutional Neural Networks', 'CNNs for image recognition.', '76979871', 24, 3, FALSE),
('l1000000-0000-0000-0000-000000000012', 's1000000-0000-0000-0000-000000000003', 'Recurrent Neural Networks', 'RNNs for sequential data.', '76979871', 22, 4, FALSE);

-- Insert lessons for Section 4: NLP
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000013', 's1000000-0000-0000-0000-000000000004', 'Introduction to NLP', 'How computers understand human language.', '76979871', 18, 1, FALSE),
('l1000000-0000-0000-0000-000000000014', 's1000000-0000-0000-0000-000000000004', 'Text Processing Techniques', 'Tokenization, stemming, and embeddings.', '76979871', 20, 2, FALSE),
('l1000000-0000-0000-0000-000000000015', 's1000000-0000-0000-0000-000000000004', 'Sentiment Analysis', 'Building systems that understand emotions.', '76979871', 16, 3, FALSE),
('l1000000-0000-0000-0000-000000000016', 's1000000-0000-0000-0000-000000000004', 'Large Language Models', 'Understanding GPT, BERT, and transformers.', '76979871', 25, 4, FALSE);

-- Insert lessons for Section 5: Computer Vision
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000017', 's1000000-0000-0000-0000-000000000005', 'Introduction to Computer Vision', 'How machines see the world.', '76979871', 15, 1, FALSE),
('l1000000-0000-0000-0000-000000000018', 's1000000-0000-0000-0000-000000000005', 'Image Classification', 'Teaching computers to recognize objects.', '76979871', 22, 2, FALSE),
('l1000000-0000-0000-0000-000000000019', 's1000000-0000-0000-0000-000000000005', 'Object Detection', 'Finding and locating objects in images.', '76979871', 24, 3, FALSE),
('l1000000-0000-0000-0000-000000000020', 's1000000-0000-0000-0000-000000000005', 'Generative AI for Images', 'Creating images with AI.', '76979871', 20, 4, FALSE);

-- Insert lessons for Section 6: Ethics & Future
INSERT INTO public.lessons (id, section_id, title, description, vimeo_video_id, duration_minutes, position, is_free) VALUES
('l1000000-0000-0000-0000-000000000021', 's1000000-0000-0000-0000-000000000006', 'AI Ethics Overview', 'Understanding bias, fairness, and transparency.', '76979871', 18, 1, FALSE),
('l1000000-0000-0000-0000-000000000022', 's1000000-0000-0000-0000-000000000006', 'AI Safety & Alignment', 'Ensuring AI systems are safe and beneficial.', '76979871', 20, 2, FALSE),
('l1000000-0000-0000-0000-000000000023', 's1000000-0000-0000-0000-000000000006', 'AI in Society', 'Impact on jobs, privacy, and governance.', '76979871', 16, 3, FALSE),
('l1000000-0000-0000-0000-000000000024', 's1000000-0000-0000-0000-000000000006', 'The Future of AI', 'What is next for artificial intelligence?', '76979871', 15, 4, FALSE);
