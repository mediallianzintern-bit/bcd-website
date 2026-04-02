-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Fix: Set the Generative AI course as PAID (₹2000)
UPDATE courses
SET price = 2000
WHERE title = 'Generative AI Course: From Fundamentals to Building Real AI Systems';

-- ─────────────────────────────────────────────

INSERT INTO courses (
  title,
  slug,
  description,
  short_description,
  thumbnail_url,
  instructor_name,
  instructor_title,
  price,
  is_published,
  total_duration_minutes,
  total_lessons
) VALUES (
  'LinkedIn Mastery Crash Course',
  'linkedin-crash-course',
  'Master LinkedIn from scratch in this free crash course by Pritesh Patel (Ex-Meta, Ex-Yahoo). Learn how to optimise your profile for maximum visibility, build an engaged audience, create content that goes viral, and generate real business leads — all in under 2 hours. Whether you are a professional, entrepreneur, or student, this course will teach you exactly how to leverage LinkedIn to grow your career and business in 2026.',
  'Learn how to build your LinkedIn brand, grow your network, and generate leads in this 100% FREE crash course by Pritesh Patel (Ex-Meta · Ex-Yahoo · ISB).',
  '/linkedin-crash-course.png',
  'Pritesh Patel',
  'Founder & Coach — BaseCamp Digital | Ex-Meta · Ex-Yahoo · ISB Alumni',
  0,
  true,
  90,
  6
);

-- If the course was already inserted, just update the thumbnail:
UPDATE courses
SET thumbnail_url = '/linkedin-crash-course.png'
WHERE slug = 'linkedin-crash-course';
