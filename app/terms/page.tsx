import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';

export default function TermsOfService() {
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
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-700">
          <p className="lead text-lg">Last updated: August 9, 2026</p>
          <p>
            Welcome to TaskFlow. These Terms of Service ("Terms") govern your access to and use of the TaskFlow website, 
            application, and services (collectively, the "Service"), so please read them carefully before using the Service.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. 
            If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            TaskFlow is a cloud-based task management and collaboration platform powered by artificial intelligence. 
            We provide tools for teams and individuals to organize work, manage projects, and optimize their workflow schedules. 
            The Service may be modified, updated, interrupted, suspended, or discontinued at any time without notice or liability.
          </p>

          <h2>3. User Accounts and Security</h2>
          <p>
            To use certain features of the Service, you must register for an account. You are responsible for maintaining 
            the confidentiality of your account credentials and for all activities that occur under your account. You must 
            immediately notify TaskFlow of any unauthorized use of your account or any other breach of security.
          </p>

          <h2>4. AI Assistant and Data Usage</h2>
          <p>
            Our AI features process the context of your tasks and projects to provide summaries, breakdowns, and optimizations. 
            You retain all rights to your data. However, by using the Service, you grant us a license to host, copy, transmit, 
            and display your data strictly as necessary for us to provide the Service. We do not use your proprietary data to 
            train our foundational models for other customers.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service or help anyone else to do so. This includes, but is not limited to:
            probing, scanning, or testing the vulnerability of any system; breaching or otherwise circumventing any security 
            or authentication measures; accessing or searching the Service by any means other than our publicly supported interfaces.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall TaskFlow, its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
            any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:support@taskflow.example.com">support@taskflow.example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
