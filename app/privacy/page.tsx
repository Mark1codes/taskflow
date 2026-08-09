import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="mb-12">
          <BrandLogo className="w-[120px]" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-700">
          <p className="lead text-lg">Last updated: August 9, 2026</p>
          <p>
            At TaskFlow, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
            and handle your personal information when you use our websites, software, and services (collectively, the "Service").
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information to provide better services to our users. This includes:</p>
          <ul>
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</li>
            <li><strong>Workspace Data:</strong> We store the tasks, projects, comments, and files you upload to your TaskFlow workspace.</li>
            <li><strong>Usage Data:</strong> We collect diagnostic and usage information about how you interact with our platform to improve performance and user experience.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our Service.</li>
            <li>Power our AI Assistant to generate summaries, task breakdowns, and insights based strictly on your workspace context.</li>
            <li>Communicate with you regarding updates, security alerts, and support messages.</li>
          </ul>

          <h2>3. Data Processing and AI</h2>
          <p>
            TaskFlow integrates artificial intelligence to enhance productivity. Any data processed by our AI models is 
            done securely and ephemerally where possible. We do <strong>not</strong> use your private workspace data to 
            train public AI models. Your data remains strictly partitioned and accessible only to authorized members of your workspace.
          </p>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We only share information with trusted third-party service providers 
            (like cloud hosting and email delivery) who are bound by strict confidentiality agreements and only to the extent 
            necessary to operate our Service. We may also disclose information if required by law.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption in transit and at rest, to protect your 
            information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission 
            is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal data. 
            You can manage your account information directly within the application settings or by contacting our support team.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact our Data Protection Officer at 
            <a href="mailto:privacy@taskflow.example.com"> privacy@taskflow.example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
