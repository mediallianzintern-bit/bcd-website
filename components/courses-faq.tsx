"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "What kind of courses does Basecamp Digital offer?",
    answer:
      "Basecamp Digital offers a comprehensive range of digital marketing courses including AI for Marketers, SEO Mastery, SEM & PPC, Social Media Marketing, Content Marketing, Google Analytics, Programmatic Advertising, Mobile Marketing, and more. We also offer free crash courses for beginners looking to get started quickly.",
  },
  {
    id: 2,
    question: "Are the courses suitable for beginners?",
    answer:
      "Yes! We have courses designed for all skill levels. Our free crash courses are perfect for beginners who want a quick introduction to digital marketing concepts. Our premium courses go deeper and are suitable for both beginners and experienced marketers looking to upskill.",
  },
  {
    id: 3,
    question: "How do I enroll in a course?",
    answer:
      "Simply create a free account on Basecamp Digital, browse our course catalog, and click 'Enroll' on any course you'd like to take. Free courses are instantly accessible after enrollment. For paid courses, you'll be guided through a secure payment process via Razorpay.",
  },
  {
    id: 4,
    question: "Can I access courses on mobile devices?",
    answer:
      "Absolutely. Basecamp Digital is fully responsive and works seamlessly on smartphones, tablets, and desktops. You can learn at your own pace from any device, anywhere.",
  },
  {
    id: 5,
    question: "Who teaches the courses on Basecamp Digital?",
    answer:
      "All courses are led by Pritesh Patel, founder of Basecamp Digital and a seasoned digital marketing expert with over a decade of industry experience. Pritesh has trained professionals from leading organisations including Economic Times, Zirca Digital Solutions, and many more.",
  },
  {
    id: 6,
    question: "Do I get a certificate after completing a course?",
    answer:
      "Yes. Upon successfully completing a course and passing the final assessment, you will receive a certificate of completion from Basecamp Digital that you can share on LinkedIn or add to your resume.",
  },
  {
    id: 7,
    question: "What is the difference between free crash courses and paid courses?",
    answer:
      "Crash courses are short, free, and focused on giving you a fast overview of a topic — ideal for getting up to speed quickly. Paid courses are more in-depth, include real-world case studies, hands-on exercises, quizzes, and a certificate upon completion.",
  },
  {
    id: 8,
    question: "Is there a refund policy for paid courses?",
    answer:
      "Please refer to our Terms of Service for full details on our refund policy. If you have questions about a specific purchase, you can reach out to us at contact@basecampdigital.co and our team will be happy to help.",
  },
  {
    id: 9,
    question: "How long do I have access to a course after purchasing it?",
    answer:
      "Once enrolled, you have lifetime access to the course content. You can revisit lessons, re-watch videos, and review materials as many times as you like at no additional cost.",
  },
  {
    id: 10,
    question: "How can I contact support if I have an issue?",
    answer:
      "You can reach our support team by emailing contact@basecampdigital.co. We aim to respond to all queries within 24 hours on business days.",
  },
]

export function CoursesFaq() {
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section className="w-full bg-white dark:bg-neutral-950 py-20">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            We are here to help you with any questions you may have. If you
            don&apos;t find what you need, please contact us at{" "}
            <a
              href="mailto:contact@basecampdigital.co"
              className="text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              contact@basecampdigital.co
            </a>
          </p>
        </div>

        {/* FAQ items */}
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id
            return (
              <div key={faq.id} className="py-5">
                <button
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-start gap-4 text-left"
                >
                  {/* Rotating chevron */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>

                  <span
                    className={`text-base font-medium transition-colors duration-200 ${
                      isOpen ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {faq.question}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
                      exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 pl-9 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {faq.answer.split(" ").map((word, i, arr) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, filter: "blur(8px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.1 + i * 0.022 } }}
                            style={{ display: "inline" }}
                          >
                            {word}{i < arr.length - 1 ? " " : ""}
                          </motion.span>
                        ))}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
