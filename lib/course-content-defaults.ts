export interface CourseContent {
  // curriculum
  whatYouWillLearn: string[]
  courseIncludes: string[]
  whoThisCourseIsFor: string[]
  requirements: string[]
  descriptionExtra: string
  breadcrumbItems: string[]
  breadcrumbHighlight: string
  // hero
  thumbnailUrl: string | null
  rating: string
  reviewsCount: string
  studentsCount: string
  lastUpdated: string
  language: string
  subtitleLanguages: string
  // instructor
  instructorName: string
  instructorTitle: string
  instructorRating: string
  instructorStudents: string
  instructorBio: string
  instructorAvatar: string | null
}

const whatYouWillLearnMap: Record<string, string[]> = {
  default: [
    "Understand how AI and large language models work and prompt them effectively for real work tasks",
    "Use AI to conduct research, analyze audiences, and generate content ideas at scale",
    "Write short-form content in your brand voice and repurpose it across multiple platforms",
    "Produce long-form articles and AI-generated visuals that are ready to publish",
    "Map your workflows and build no-code automations that save you hours every week",
    "Build and deploy specialized AI assistants tailored to your specific work needs",
    "Create knowledge bases and document assistants that retrieve answers from your own materials",
    "Design a complete, integrated AI system and measure its real business impact",
  ],
  "content-native-influencer-marketing": [
    "Understand the fundamentals of content marketing and how to structure an effective content strategy",
    "Identify the critical elements of successful content marketing through real brand examples",
    "Learn the global structure and workflow used in professional content marketing campaigns",
    "Understand key content marketing elements using practical case studies",
    "Learn what native advertising is and how it has evolved in modern digital marketing",
    "Understand how brands integrate native ads naturally into content platforms",
    "Explore the influencer marketing ecosystem and how brands collaborate with creators",
    "Analyze successful influencer campaigns and how they drive brand awareness and conversions",
  ],
}

const courseIncludesMap: Record<string, string[]> = {
  default: [
    "3 hours on-demand video",
    "5 articles",
    "15 downloadable resources",
    "Access on mobile and TV",
    "Full lifetime access",
    "Certificate of completion",
  ],
  "content-native-influencer-marketing": [
    "2 hours on-demand video",
    "3 articles",
    "6 downloadable resources",
    "Access on mobile and TV",
    "Full lifetime access",
    "Certificate of completion",
  ],
}

const whoThisCourseIsForMap: Record<string, string[]> = {
  default: [
    "Beginners curious about artificial intelligence",
    "Professionals looking to understand AI for business applications",
    "Students interested in pursuing AI/ML careers",
    "Entrepreneurs wanting to leverage AI in their ventures",
  ],
  "content-native-influencer-marketing": [
    "Marketing students and beginners who want to understand how modern digital marketing works",
    "Business owners and entrepreneurs looking to grow their brand using content, native ads, and influencer partnerships",
    "Working professionals who want to upskill in digital marketing strategies",
    "Freelancers and agency professionals who want to offer content and influencer marketing services",
    "Anyone curious about how brands use content creation, native advertising, and creator collaborations to drive growth",
  ],
}

const requirementsMap: Record<string, string[]> = {
  default: [
    "No prior programming experience required",
    "Basic understanding of computer operations",
    "Curiosity and willingness to learn about AI",
  ],
  "content-native-influencer-marketing": [
    "No prior marketing experience required",
    "Basic familiarity with social media platforms",
    "A willingness to learn about modern digital marketing strategies",
  ],
}

const descriptionExtraMap: Record<string, string> = {
  default:
    "This comprehensive course will take you from AI beginner to confident practitioner. You'll learn the fundamental concepts that power modern AI systems, understand how machine learning algorithms work, and explore the fascinating world of neural networks.",
  "content-native-influencer-marketing":
    "This course covers three pillars of modern digital marketing. You will start with content marketing — learning how to plan, structure, and execute a content strategy that builds trust and drives engagement. Through real brand examples and detailed case studies, you will see exactly what makes content marketing successful at a global level. Next, you will explore native advertising — understanding how brands create ads that blend seamlessly into the platforms where audiences consume content, and why this format has seen explosive growth. Finally, you will dive into influencer marketing — learning how the creator ecosystem works, how brands identify and collaborate with the right influencers, and what makes an influencer campaign truly successful.",
}

const breadcrumbMap: Record<string, { items: string[]; highlight: string }> = {
  default: { items: ["Development", "Data Science"], highlight: "Artificial Intelligence" },
  "content-native-influencer-marketing": {
    items: ["Marketing", "Digital Marketing"],
    highlight: "Content & Influencer Marketing",
  },
}

export function getCourseContentDefaults(slug: string): CourseContent {
  return {
    whatYouWillLearn: whatYouWillLearnMap[slug] ?? whatYouWillLearnMap.default,
    courseIncludes: courseIncludesMap[slug] ?? courseIncludesMap.default,
    whoThisCourseIsFor: whoThisCourseIsForMap[slug] ?? whoThisCourseIsForMap.default,
    requirements: requirementsMap[slug] ?? requirementsMap.default,
    descriptionExtra: descriptionExtraMap[slug] ?? descriptionExtraMap.default,
    breadcrumbItems: breadcrumbMap[slug]?.items ?? breadcrumbMap.default.items,
    breadcrumbHighlight: breadcrumbMap[slug]?.highlight ?? breadcrumbMap.default.highlight,
    thumbnailUrl: null,
    rating: "4.9",
    reviewsCount: "2,847",
    studentsCount: "8,234",
    lastUpdated: "03/2026",
    language: "English",
    subtitleLanguages: "English [Auto], Hindi [Auto]",
    instructorName: "Pritesh Patel",
    instructorTitle: "Founder & Coach — BaseCamp Digital | Ex-Meta · Ex-Yahoo · ISB Alumni",
    instructorRating: "4.9",
    instructorStudents: "8,000+",
    instructorBio:
      "With 18+ years of experience in digital marketing and AI, Pritesh Patel has trained professionals from top companies like Times of India, OLX, Network18, and more. His practical approach combines industry insights with hands-on learning.",
    instructorAvatar: null,
  }
}
