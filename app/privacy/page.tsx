import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy – Basecamp Digital",
  description: "Privacy Policy for Basecamp Digital Media LLP",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="mb-10 inline-block text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
          ← Back to home
        </Link>

        <h1 className="mb-2 text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-10 text-sm text-neutral-500">BaseCamp Digital Media LLP</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <p>
            This website is operated by BaseCamp Digital Media LLP. Throughout the site, the terms "we", "us" and "our" refer to BaseCamp Digital Media LLP.
          </p>

          {[
            {
              title: "Section 1 – What Do We Do With Your Information?",
              body: `When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us, such as your name, address, email address and company name (optional). We also collect your basic information when you register for our free courses, such as your name & email address, company name (optional) to help you with your account in case of need, and to inform you about our latest courses and updates related to the learning material.\n\nWhen you browse our store/courses, we may also automatically receive your computer's internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.\n\nWe may also track your anonymous behavior on our site to simplify and make our services and learning material better for our visitors.\n\nEmail marketing (if applicable): With your permission, we may send you emails about our store, new products, and other updates.`,
            },
            {
              title: "Section 2 – Consent",
              body: `How do you get my consent?\n\nWhen you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery, or register for any free/paid course, we imply that you consent to our collecting it.\n\nHow do I withdraw my consent?\n\nIf after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use, or disclosure of your information, at any time, by contacting us at contact@basecampdigital.co`,
            },
            {
              title: "Section 3 – Disclosure",
              body: `We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.`,
            },
            {
              title: "Section 4 – Payment",
              body: `We use Razorpay for processing payments. We/Razorpay do not store your card data on their or our servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.\n\nOur payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express, and Discover.\n\nFor more insight, you may also want to read the terms and conditions of Razorpay at razorpay.com`,
            },
            {
              title: "Section 5 – Third-Party Services",
              body: `In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.\n\nHowever, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.\n\nOnce you leave our store's website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website's Terms of Service.`,
            },
            {
              title: "Section 6 – Security",
              body: `To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.`,
            },
            {
              title: "Section 7 – Cookies",
              body: `We use cookies to maintain sessions. It is not used to personally identify you on other websites. We use sessions to facilitate smooth experiences across our site.`,
            },
            {
              title: "Section 8 – Age of Consent",
              body: `By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.`,
            },
            {
              title: "Section 9 – Changes to This Privacy Policy",
              body: `We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.\n\nIf our store/website is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.`,
            },
            {
              title: "Questions and Contact Information",
              body: `If you would like to access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information, contact us at contact@basecampdigital.co`,
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-white">{section.title}</h2>
              {section.body.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-3" : "mt-2"}>{para}</p>
              ))}
            </section>
          ))}

        </div>
      </div>
    </div>
  )
}
