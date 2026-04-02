/**
 * Configuration for LearnDash (premium) courses.
 * Key can be either WP post ID (number) or slug (string).
 * Update prices / thumbnails here without touching WordPress.
 *
 * thumbnailUrl: path relative to /public  (e.g. "/images/courses/my-course.jpg")
 *   — used when the WordPress featured image is not set.
 *   — To add a new thumbnail: drop the image in /public/images/courses/ and add the path here.
 */

interface PriceConfig {
  price: number
  originalPrice?: number
  brochureUrl?: string
  thumbnailUrl?: string
}

export const COURSE_PRICES: Record<string | number, PriceConfig> = {
  // Content, Native & Influencer Marketing
  960: {
    price: 299,
    originalPrice: 5999,
    brochureUrl: "/brochures/content-native-influencer-marketing.pdf",
    thumbnailUrl: "/images/content-native-influencer-marketing.png",
  },
  "content-native-influencer-marketing": {
    price: 299,
    originalPrice: 5999,
    brochureUrl: "/brochures/content-native-influencer-marketing.pdf",
    thumbnailUrl: "/images/content-native-influencer-marketing.png",
  },

  // Online Digital Marketing Course
  423: { price: 9999, originalPrice: 19999 },
  "online-digital-marketing-course": { price: 9999, originalPrice: 19999 },

  // Search Engine Marketing
  938: { price: 4999, originalPrice: 9999 },
  "search-engine-marketing": { price: 4999, originalPrice: 9999 },

  // Search Engine Optimization
  995: { price: 4999, originalPrice: 9999 },
  "search-engine-optimization-premium": { price: 4999, originalPrice: 9999 },

  // Social Media Marketing
  945: { price: 4999, originalPrice: 9999 },
  "social-media-marketing": { price: 4999, originalPrice: 9999 },

  // Google Analytics
  974: { price: 4999, originalPrice: 9999 },
  "google-analytics": { price: 4999, originalPrice: 9999 },

  // Mobile Marketing
  953: { price: 4999, originalPrice: 9999 },
  "mobile-marketing": { price: 4999, originalPrice: 9999 },

  // Display Advertising & Terminology
  930: { price: 4999, originalPrice: 9999 },
  "display-advertising-and-terminology": { price: 4999, originalPrice: 9999 },

  // Media Planning & Buying
  980: { price: 4999, originalPrice: 9999 },
  "media-planning-and-buying-in-digital-marketing": { price: 4999, originalPrice: 9999 },

  // Programmatic Advertising
  3397: { price: 4999, originalPrice: 9999 },
  "programmatic-advertising": { price: 4999, originalPrice: 9999 },
}
