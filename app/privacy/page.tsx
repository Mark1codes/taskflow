import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock } from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const sections = [
    { id: "information-we-collect", title: "1. Information We Collect" },
    { id: "how-we-use", title: "2. How We Use Your Information" },
    { id: "data-processing", title: "3. Data Processing and AI" },
    { id: "sharing", title: "4. Information Sharing" },
    { id: "security", title: "5. Data Security" },
    { id: "rights", title: "6. Your Rights" },
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
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-slate-900">Privacy Policy</Link>
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
                <Link href="/terms" className="px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">Privacy Policy</Link>
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
              <Shield className="h-4 w-4" />
              Privacy Policy
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-950 mb-6">How we protect your data</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: August 9, 2026</span>
            </div>
          </div>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-hr:border-slate-200">
            <p className="lead text-xl text-slate-700 mb-10">
              At TaskFlow, we take your privacy seriously. This Privacy Policy describes how we collect, use, 
              and handle your personal information when you use our websites, software, and services (collectively, the "Service").
            </p>
            
            <hr className="my-10" />

            <section id="information-we-collect" className="scroll-mt-32">
              <h2>1. Information We Collect</h2>
              <p>We collect information to provide better services to our users. This includes:</p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500" /><div><strong className="text-slate-900 font-medium">Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</div></li>
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500" /><div><strong className="text-slate-900 font-medium">Workspace Data:</strong> We store the tasks, projects, comments, and files you upload to your TaskFlow workspace.</div></li>
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500" /><div><strong className="text-slate-900 font-medium">Usage Data:</strong> We collect diagnostic and usage information about how you interact with our platform to improve performance and user experience.</div></li>
              </ul>
            </section>

            <section id="how-we-use" className="scroll-mt-32 mt-12">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="space-y-3 mt-4">
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-slate-400" /><div>Provide, maintain, and improve our Service.</div></li>
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-slate-400" /><div>Power our AI Assistant to generate summaries, task breakdowns, and insights based strictly on your workspace context.</div></li>
                <li className="flex gap-3"><div className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-slate-400" /><div>Communicate with you regarding updates, security alerts, and support messages.</div></li>
              </ul>
            </section>

            <section id="data-processing" className="scroll-mt-32 mt-12">
              <h2>3. Data Processing and AI</h2>
              <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-6 my-6 text-base">
                <p className="m-0">
                  TaskFlow integrates artificial intelligence to enhance productivity. Any data processed by our AI models is 
                  done securely and ephemerally where possible. We do <strong className="text-slate-900 font-medium">not</strong> use your private workspace data to 
                  train public AI models. Your data remains strictly partitioned and accessible only to authorized members of your workspace.
                </p>
              </div>
            </section>

            <section id="sharing" className="scroll-mt-32 mt-12">
              <h2>4. Information Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We only share information with trusted third-party service providers 
                (like cloud hosting and email delivery) who are bound by strict confidentiality agreements and only to the extent 
                necessary to operate our Service. We may also disclose information if required by law.
              </p>
            </section>

            <section id="security" className="scroll-mt-32 mt-12">
              <h2>5. Data Security</h2>
              <p>
                We implement industry-standard security measures, including encryption in transit and at rest, to protect your 
                information from unauthorized access, alteration, disclosure, or destruction. However, no internet transmission 
                is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section id="rights" className="scroll-mt-32 mt-12">
              <h2>6. Your Rights</h2>
              <p>
                Depending on your location, you may have the right to access, correct, or delete your personal data. 
                You can manage your account information directly within the application settings or by contacting our support team.
              </p>
            </section>

            <section id="contact" className="scroll-mt-32 mt-12 mb-20">
              <h2>7. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact our Data Protection Officer at 
                <a href="mailto:privacy@taskflowai.pro" className="font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4 ml-1">privacy@taskflowai.pro</a>.
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
