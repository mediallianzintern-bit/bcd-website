-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- ─────────────────────────────────────────────
-- Add original_price column (if it doesn't exist yet)
-- ─────────────────────────────────────────────
ALTER TABLE courses ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT NULL;

-- ─────────────────────────────────────────────
-- Update the course price: Content, Native & Influencer Marketing
-- price = ₹299 (selling price), original_price = ₹5000 (MRP)
-- ─────────────────────────────────────────────

UPDATE courses
SET price = 299, original_price = 5000
WHERE slug = 'content-native-influencer-marketing';

-- ─────────────────────────────────────────────
-- Insert sections
-- ─────────────────────────────────────────────

-- Get the course ID we just inserted
DO $$
DECLARE
  v_course_id UUID;
  v_section1_id UUID;
  v_section2_id UUID;
  v_section3_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = 'content-native-influencer-marketing';

  -- Section 1: Content Marketing
  INSERT INTO sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Content Marketing', 'Master the fundamentals, structure, and key elements of content marketing with real-world brand examples and case studies.', 0)
  RETURNING id INTO v_section1_id;

  -- Section 2: Native Advertising
  INSERT INTO sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Native Advertising', 'Understand what native advertising is, how it works, and how it has grown into one of the most effective ad formats in modern digital marketing.', 1)
  RETURNING id INTO v_section2_id;

  -- Section 3: Influencer Marketing
  INSERT INTO sections (course_id, title, description, order_index)
  VALUES (v_course_id, 'Influencer Marketing', 'Explore the influencer marketing ecosystem and learn how brands collaborate with creators to drive awareness and conversions.', 2)
  RETURNING id INTO v_section3_id;

  -- ─────────────────────────────────────────────
  -- Insert lessons
  -- ─────────────────────────────────────────────

  -- Section 1 Lessons: Content Marketing (4 lessons)
  INSERT INTO lessons (section_id, title, description, vimeo_video_id, duration_minutes, order_index, is_preview) VALUES
  (v_section1_id, 'Introduction to Content Marketing and Its Structure', 'Learn what content marketing is, why it matters, and how a well-structured content strategy drives brand growth.', NULL, 20, 0, true),
  (v_section1_id, 'Critical Aspects of Content Marketing and Best Examples', 'Discover the most critical aspects that make content marketing work, illustrated with some of the best brand examples.', NULL, 20, 1, false),
  (v_section1_id, 'Global Structure of Content Marketing', 'Understand the global framework and workflow used by professional content marketing teams worldwide.', NULL, 20, 2, false),
  (v_section1_id, 'Key Elements of Content Marketing Explained with Case Studies', 'Deep dive into the key elements of content marketing through detailed, real-world case studies.', NULL, 20, 3, false);

  -- Section 2 Lessons: Native Advertising (1 lesson)
  INSERT INTO lessons (section_id, title, description, vimeo_video_id, duration_minutes, order_index, is_preview) VALUES
  (v_section2_id, 'What is Native Advertising and Its Growth Over the Years', 'Learn what native advertising is, how brands integrate ads naturally into content platforms, and how this format has evolved in modern digital marketing.', NULL, 20, 0, false);

  -- Section 3 Lessons: Influencer Marketing (1 lesson)
  INSERT INTO lessons (section_id, title, description, vimeo_video_id, duration_minutes, order_index, is_preview) VALUES
  (v_section3_id, 'Influencer Marketing Ecosystem Explained with the Best Campaign', 'Explore the complete influencer marketing ecosystem, learn how brands collaborate with creators, and analyze successful campaigns that drove massive brand awareness and conversions.', NULL, 20, 0, false);

END $$;
