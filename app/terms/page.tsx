import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service – Basecamp Digital",
  description: "Terms of Service for Basecamp Digital Media LLP",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="mb-10 inline-block text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
          ← Back to home
        </Link>

        <h1 className="mb-2 text-4xl font-bold text-white">Terms of Service</h1>
        <p className="mb-10 text-sm text-neutral-500">BaseCamp Digital Media LLP</p>

        <div className="prose prose-invert prose-neutral max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <p>
              This website is operated by BaseCamp Digital Media LLP. Throughout the site, the terms "we", "us" and "our" refer to BaseCamp Digital Media LLP. BaseCamp Digital Media LLP offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
            </p>
            <p className="mt-3">
              By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"). These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
            </p>
            <p className="mt-3">
              Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
            </p>
          </section>

          {[
            {
              title: "Section 1 – Online Store Terms",
              body: `By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you have given us your consent to allow any of your minor dependents to use this site.\n\nYou may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).\n\nYou must not transmit any worms or viruses or any code of a destructive nature.\n\nA breach or violation of any of the Terms will result in an immediate termination of your Services, including deletion of your account and all of the data contained within it.`,
            },
            {
              title: "Section 2 – General Conditions",
              body: `We reserve the right to refuse service to anyone for any reason at any time.\n\nYou understand that your content (not including credit card information) may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to the technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.\n\nYou agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.`,
            },
            {
              title: "Section 3 – Accuracy, Completeness, and Timeliness of Information",
              body: `We are not responsible if information made available on this site is not accurate, complete, or current. The material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions without consulting primary, more accurate, more complete, or more timely sources of information. Any reliance on the material on this site is at your own risk.\n\nWe reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site.`,
            },
            {
              title: "Section 4 – Modifications to the Service and Prices",
              body: `Prices for our products are subject to change without notice.\n\nWe reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.\n\nWe shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.`,
            },
            {
              title: "Section 5 – Products or Services",
              body: `We reserve the right but are not obligated to limit the sales of our products or Services to any person, geographic region, or jurisdiction. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice. We reserve the right to discontinue any product, course, or learning pathway at any time.\n\nWe do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations.`,
            },
            {
              title: "Section 6 – Accuracy of Billing and Account Information",
              body: `We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order.\n\nYou agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.`,
            },
            {
              title: "Section 7 – Optional Tools",
              body: `We may provide you with access to third-party tools over which we neither monitor nor have any control nor input.\n\nYou acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations, or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.`,
            },
            {
              title: "Section 8 – Third-Party Links",
              body: `Certain content, learning materials, products, and services available via our Service may include materials from third-parties.\n\nThird-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites.\n\nWe are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites.`,
            },
            {
              title: "Section 9 – User Comments, Feedback and Other Submissions",
              body: `If you send us creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, or otherwise (collectively, 'comments'), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.\n\nYou agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right.`,
            },
            {
              title: "Section 10 – Personal Information",
              body: `Your submission of personal information through the store is governed by our Privacy Policy.`,
            },
            {
              title: "Section 11 – Errors, Inaccuracies and Omissions",
              body: `Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies, or omissions that may relate to product descriptions, pricing, promotions, offers, and availability. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice.`,
            },
            {
              title: "Section 12 – Prohibited Uses",
              body: `You are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate; (e) to submit false or misleading information; (f) to upload or transmit viruses or any other type of malicious code; (g) to collect or track the personal information of others; (h) to spam, phish, pharm, pretext, spider, crawl, or scrape; (i) to download, record, screen-record and share the training material provided on the website. We reserve the right to terminate your use of the Service for violating any of the prohibited uses.`,
            },
            {
              title: "Section 13 – Disclaimer of Warranties; Limitation of Liability",
              body: `We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure, or error-free.\n\nYou expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind.\n\nIn no case shall BaseCamp Digital Media LLP, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind.`,
            },
            {
              title: "Section 14 – Indemnification",
              body: `You agree to indemnify, defend and hold harmless BaseCamp Digital Media LLP and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or your violation of any law or the rights of a third-party.`,
            },
            {
              title: "Section 15 – Severability",
              body: `In the event that any provision of these Terms of Service is determined to be unlawful, void, or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service.`,
            },
            {
              title: "Section 16 – Termination",
              body: `These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our site.\n\nIf in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination.`,
            },
            {
              title: "Section 17 – Entire Agreement",
              body: `These Terms of Service and any policies or operating rules posted by us on this site or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us.`,
            },
            {
              title: "Section 18 – Governing Law",
              body: `These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India and jurisdiction of Mumbai, Maharashtra.`,
            },
            {
              title: "Section 19 – Changes to Terms of Service",
              body: `We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes constitutes acceptance of those changes.`,
            },
            {
              title: "Section 20 – Contact Information",
              body: `Questions about the Terms of Service should be sent to us at contact@basecampdigital.co`,
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
