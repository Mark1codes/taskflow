import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Scale } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "description", title: "2. Description of Service" },
    { id: "accounts", title: "3. User Accounts and Security" },
    { id: "ai-usage", title: "4. AI Assistant and Data Usage" },
    { id: "acceptable-use", title: "5. Acceptable Use" },
    { id: "liability", title: "6. Limitation of Liability" },
    { id: "contact", title: "7. Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <BrandLogo className="w-[110px]" />
            </Link>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
              <Link href="/terms" className="text-slate-900">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            </nav>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex h-9 border-slate-200 text-slate-600 hover:bg-slate-50">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to App</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-32 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Legal Hub</p>
              <nav className="flex flex-col space-y-1">
                <Link href="/terms" className="px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">Terms of Service</Link>
                <Link href="/privacy" className="px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Privacy Policy</Link>
              </nav>
            </div>
            
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">On this page</p>
              <nav className="flex flex-col space-y-2.5">
                {sections.map(section => (
                  <a key={section.id} href={`#${section.id}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors leading-tight">
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 max-w-3xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200/50 text-blue-700 text-sm font-medium mb-6">
              <Scale className="h-4 w-4" />
              Terms of Service
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-950 mb-6">Rules of the road</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: August 9, 2026</span>
            </div>
          </div>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-hr:border-slate-200">
            <p className="lead text-xl text-slate-700 mb-10">
              Welcome to TaskFlow. These Terms of Service ("Terms") govern your access to and use of the TaskFlow website, 
              application, and services (collectively, the "Service"), so please read them carefully before using the Service.
            </p>
            
            <hr className="my-10" />

            <section id="acceptance" className="scroll-mt-32">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. 
                If you disagree with any part of the terms, then you may not access the Service.
              </p>
            </section>

            <section id="description" className="scroll-mt-32 mt-12">
              <h2>2. Description of Service</h2>
              <p>
                TaskFlow is a cloud-based task management and collaboration platform powered by artificial intelligence. 
                We provide tools for teams and individuals to organize work, manage projects, and optimize their workflow schedules. 
                The Service may be modified, updated, interrupted, suspended, or discontinued at any time without notice or liability.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-32 mt-12">
              <h2>3. User Accounts and Security</h2>
              <p>
                To use certain features of the Service, you must register for an account. You are responsible for maintaining 
                the confidentiality of your account credentials and for all activities that occur under your account. You must 
                immediately notify TaskFlow of any unauthorized use of your account or any other breach of security.
              </p>
            </section>

            <section id="ai-usage" className="scroll-mt-32 mt-12">
              <h2>4. AI Assistant and Data Usage</h2>
              <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-6 my-6 text-base">
                <p className="m-0">
                  Our AI features process the context of your tasks and projects to provide summaries, breakdowns, and optimizations. 
                  You retain all rights to your data. However, by using the Service, you grant us a license to host, copy, transmit, 
                  and display your data strictly as necessary for us to provide the Service. We do <strong className="text-slate-900 font-medium">not</strong> use your proprietary data to 
                  train our foundational models for other customers.
                </p>
              </div>
            </section>

            <section id="acceptable-use" className="scroll-mt-32 mt-12">
              <h2>5. Acceptable Use</h2>
              <p>
                You agree not to misuse the Service or help anyone else to do so. This includes, but is not limited to:
                probing, scanning, or testing the vulnerability of any system; breaching or otherwise circumventing any security 
                or authentication measures; accessing or searching the Service by any means other than our publicly supported interfaces.
              </p>
            </section>

            <section id="liability" className="scroll-mt-32 mt-12">
              <h2>6. Limitation of Liability</h2>
              <p>
                In no event shall TaskFlow, its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
                any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section id="contact" className="scroll-mt-32 mt-12 mb-20">
              <h2>7. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at 
                <a href="mailto:support@taskflow.example.com" className="font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4 ml-1">support@taskflow.example.com</a>.
              </p>
            </section>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-auto">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <BrandLogo className="w-[100px]" />
          <p className="text-sm text-slate-500">© 2026 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
