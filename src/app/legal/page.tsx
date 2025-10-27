'use client';

import React, { useState, useEffect } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';
import { FileText, Shield, UserCircle, Users } from 'lucide-react';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['terms', 'privacy', 'health-disclaimer', 'coppa', 'partner-terms'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'health-disclaimer', label: 'Health & Fitness', icon: Shield },
    { id: 'coppa', label: 'Parental Consent', icon: UserCircle },
    { id: 'partner-terms', label: 'Partner Terms', icon: Users },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <GradientTextReveal
          text="Legal & Policies"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-relaxed"
          gradientFrom="#0EA5E9"
          gradientTo="#F97316"
          delay={0.2}
        />
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
          Transparency, trust, and compliance at every level
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.location.hash = tab.id;
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'border border-solar-surge-orange/50 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-solar-surge-orange/30 shadow-liquid-glow-orange text-white'
                    : 'border border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <LiquidGlass variant="blue" rounded="2xl" className="p-8 md:p-12">
          {activeTab === 'terms' && <TermsContent />}
          {activeTab === 'privacy' && <PrivacyContent />}
          {activeTab === 'health-disclaimer' && <HealthDisclaimerContent />}
          {activeTab === 'coppa' && <CoppaContent />}
          {activeTab === 'partner-terms' && <PartnerTermsContent />}
        </LiquidGlass>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-black mb-6">Terms of Service</h2>
      <p className="text-text-secondary mb-6">
        <strong>Effective Date:</strong> January 2025<br />
        <strong>Last Updated:</strong> January 2025
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h3>
      <p className="text-text-secondary mb-4">
        By accessing and using Mind and Muscle ("the Service"), you accept and agree to be bound by these Terms of Service.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">2. Age Requirements & Parental Consent</h3>
      <p className="text-text-secondary mb-4">
        <strong>Users 13 and Over:</strong> You may create an account and use the Service.<br />
        <strong>Users Under 13:</strong> You must have verifiable parental consent before using the Service. We comply with COPPA (Children's Online Privacy Protection Act).
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">3. Team Licenses</h3>
      <p className="text-text-secondary mb-4">
        <strong>Subscription:</strong> Team licenses are 6-month subscriptions that auto-renew.<br />
        <strong>Seat Allocation:</strong> Athletes and coaches consume a license seat. Parents can view without consuming a seat.<br />
        <strong>Cancellation:</strong> You may cancel your subscription at any time through your Stripe customer portal.<br />
        <strong>Refunds:</strong> Refunds are provided on a case-by-case basis within 30 days of purchase.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">4. Acceptable Use</h3>
      <p className="text-text-secondary mb-4">
        You agree not to:<br />
        • Share your account credentials<br />
        • Use the Service for any illegal purpose<br />
        • Harass, bully, or harm other users<br />
        • Upload inappropriate content<br />
        • Attempt to reverse engineer or hack the Service
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">5. Content Ownership</h3>
      <p className="text-text-secondary mb-4">
        You retain ownership of content you upload. By uploading content, you grant us a license to use it to provide the Service.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">6. Termination</h3>
      <p className="text-text-secondary mb-4">
        We reserve the right to suspend or terminate accounts that violate these Terms.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">7. Health & Fitness Disclaimer</h3>
      
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
        <p className="text-sm mb-0 font-semibold text-red-400">
          ⚠️ IMPORTANT: Read our complete <a href="/legal#health-disclaimer" className="underline">Health & Fitness Disclaimer</a> before using workout features.
        </p>
      </div>

      <div className="text-text-secondary mb-4 space-y-4">
        <p>
          <strong>NOT MEDICAL ADVICE:</strong> Mind and Muscle provides general fitness and mental training information. We are NOT medical professionals. Our AI-generated recommendations are NOT a substitute for professional medical advice, diagnosis, or treatment.
        </p>

        <p>
          <strong>CONSULT YOUR DOCTOR:</strong> Always consult a qualified healthcare provider before starting any physical training program, especially if you:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Have any pre-existing medical conditions</li>
          <li>Have a history of injuries</li>
          <li>Are taking medication</li>
          <li>Experience pain or discomfort during exercise</li>
        </ul>

        <p>
          <strong>ASSUMPTION OF RISK:</strong> You acknowledge that physical exercise carries inherent risks including, but not limited to, muscle strain, sprains, fractures, cardiovascular stress, and in rare cases, serious injury or death. You assume full responsibility for all risks associated with using this Service.
        </p>

        <p>
          <strong>STOP IF INJURED:</strong> If you experience pain, dizziness, shortness of breath, or discomfort during any exercise, STOP IMMEDIATELY and consult a medical professional.
        </p>

        <p>
          <strong>PARENTAL SUPERVISION:</strong> Parents/guardians of users under 18 must supervise physical activities and ensure their child has medical clearance for athletic training.
        </p>

        <p>
          <strong>AI LIMITATIONS:</strong> Our AI provides general recommendations based on user inputs. AI cannot assess your medical history, current physical condition, or injury risk. Follow recommendations at your own discretion.
        </p>

        <p>
          <strong>LIABILITY WAIVER:</strong> To the fullest extent permitted by law, Mind and Muscle, its officers, employees, and affiliates SHALL NOT BE LIABLE for any injuries, damages, or losses resulting from your use of workout programs, exercise recommendations, or training content provided through this Service.
        </p>

        <p>
          <strong>INDEMNIFICATION:</strong> You agree to indemnify and hold harmless Mind and Muscle from any claims, damages, or expenses arising from your use of fitness content or training programs.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">8. Limitation of Liability</h3>
      <p className="text-text-secondary mb-4">
        Mind and Muscle is provided "as is" without warranties of any kind, either express or implied. We make no representations about the accuracy, reliability, completeness, or timeliness of the content. Use of the Service is at your sole risk.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">9. Contact</h3>
      <p className="text-text-secondary">
        For questions about these Terms, contact us at <a href="mailto:support@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">support@mindandmuscle.ai</a>
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-black mb-6">Privacy Policy</h2>
      <p className="text-text-secondary mb-6">
        <strong>Effective Date:</strong> January 2025<br />
        <strong>Last Updated:</strong> January 2025
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h3>
      <div className="text-text-secondary mb-4">
        <p className="font-semibold mb-2">Personal Information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Name, email, phone number, date of birth</li>
          <li>Athletic profile (position, sport, jersey number)</li>
          <li>Performance data (workouts, goals, progress)</li>
          <li>Team communications and messages</li>
        </ul>

        <p className="font-semibold mt-4 mb-2">Automatically Collected:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Device information and identifiers</li>
          <li>Usage data and app interactions</li>
          <li>General location (if enabled)</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h3>
      <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-4">
        <li>Provide and maintain the Service</li>
        <li>Create and manage your account</li>
        <li>Deliver personalized training recommendations</li>
        <li>Enable team communication features</li>
        <li>Send notifications about progress and team activities</li>
        <li>Improve the Service through analytics</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4">3. Information Sharing</h3>
      <div className="text-text-secondary mb-4">
        <p className="font-semibold mb-2">With Your Consent:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Team Members:</strong> Basic profile information</li>
          <li><strong>Coaches:</strong> Performance data when you share goals</li>
          <li><strong>Parents:</strong> Progress reports when explicitly shared</li>
        </ul>

        <p className="font-semibold mt-4 mb-2">Service Providers:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Supabase:</strong> Database and authentication</li>
          <li><strong>Resend:</strong> Email delivery</li>
          <li><strong>Stripe:</strong> Payment processing</li>
          <li><strong>OpenAI:</strong> AI coaching (anonymized data only)</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">4. Children's Privacy (COPPA)</h3>
      <p className="text-text-secondary mb-4">
        For users under 13, we:<br />
        • Require verifiable parental consent<br />
        • Collect only necessary information<br />
        • Do not use data for behavioral advertising<br />
        • Allow parents to review, delete, or refuse further collection
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h3>
      <p className="text-text-secondary mb-4">
        We implement industry-standard security measures including encryption in transit and at rest, access controls, and regular security audits.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">6. Your Rights</h3>
      <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-4">
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Delete your account and data (see our <a href="/delete-account" className="text-solar-surge-orange hover:underline">Account Deletion page</a>)</li>
        <li>Export your data</li>
        <li>Opt-out of communications</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4">7. Contact</h3>
      <p className="text-text-secondary">
        For privacy questions: <a href="mailto:privacy@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">privacy@mindandmuscle.ai</a><br />
        For COPPA requests: <a href="mailto:privacy@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">privacy@mindandmuscle.ai</a> (subject: "COPPA Request")
      </p>
    </div>
  );
}

function CoppaContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-black mb-6">Parental Consent & COPPA Compliance</h2>

      <div className="p-6 rounded-xl bg-neon-cortex-blue/10 border border-neon-cortex-blue/20 mb-8">
        <p className="text-sm mb-0">
          <strong>For Parents:</strong> Mind and Muscle complies with COPPA (Children's Online Privacy Protection Act) to protect children under 13.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">What is COPPA?</h3>
      <p className="text-text-secondary mb-4">
        COPPA is a federal law that requires websites and apps to obtain verifiable parental consent before collecting personal information from children under 13.
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">How We Protect Children</h3>
      <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
        <li><strong>Age Verification:</strong> We verify age during registration</li>
        <li><strong>Parental Consent Required:</strong> Children under 13 cannot use the Service without verified parental consent</li>
        <li><strong>Limited Data Collection:</strong> We collect only information necessary for the Service</li>
        <li><strong>No Behavioral Advertising:</strong> We do not use children's data for targeted advertising</li>
        <li><strong>Parental Controls:</strong> Parents have full control over their child's account</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4">Parental Rights</h3>
      <p className="text-text-secondary mb-2">Parents of children under 13 have the right to:</p>
      <ul className="list-disc pl-6 text-text-secondary space-y-1 mb-4">
        <li>Review their child's personal information</li>
        <li>Request deletion of their child's information</li>
        <li>Refuse further collection or use of their child's information</li>
        <li>Access their child's account settings</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4">What Data We Collect from Children</h3>
      <div className="text-text-secondary mb-4">
        <p className="font-semibold mb-2">We Collect:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Name and age</li>
          <li>Parent's email (for consent)</li>
          <li>Training goals and progress</li>
          <li>Team membership</li>
        </ul>

        <p className="font-semibold mb-2">We Do NOT Collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Child's email or phone</li>
          <li>Precise location</li>
          <li>Social security numbers</li>
          <li>Photos (without parental permission)</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Parental Consent Process</h3>
      <ol className="list-decimal pl-6 text-text-secondary space-y-2 mb-4">
        <li>Child attempts to register</li>
        <li>Age verification identifies child as under 13</li>
        <li>Parent receives consent request email</li>
        <li>Parent reviews information and approves/denies</li>
        <li>Account is activated only after parent approval</li>
      </ol>

      <h3 className="text-2xl font-bold mt-8 mb-4">Exercise Your Rights</h3>
      <p className="text-text-secondary mb-4">
        To review, modify, or delete your child's information, or to revoke consent:
      </p>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@mindandmuscle.ai?subject=COPPA%20Request" className="text-solar-surge-orange hover:underline">privacy@mindandmuscle.ai</a></p>
        <p className="mb-2"><strong>Subject Line:</strong> "COPPA Request"</p>
        <p className="text-sm text-text-secondary">Include your child's name and your relationship to the child.</p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Questions?</h3>
      <p className="text-text-secondary">
        For questions about COPPA compliance or children's privacy, contact us at <a href="mailto:privacy@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">privacy@mindandmuscle.ai</a>
      </p>
    </div>
  );
}

function HealthDisclaimerContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-black mb-6">Health & Fitness Disclaimer</h2>
      
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 mb-8">
        <p className="text-sm mb-0 font-semibold text-red-400">
          ⚠️ CRITICAL: Please read this entire disclaimer before using any workout or training features in Mind & Muscle.
        </p>
      </div>

      <p className="text-text-secondary mb-6">
        <strong>Effective Date:</strong> January 2025<br />
        <strong>Last Updated:</strong> January 2025
      </p>

      <h3 className="text-2xl font-bold mt-8 mb-4">This Is NOT Medical Advice</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p>
          Mind and Muscle provides <strong>general fitness and mental training information only</strong>. We are NOT licensed medical professionals, physicians, physical therapists, athletic trainers, or healthcare providers.
        </p>
        <p>
          Our AI-generated workout recommendations, exercise programs, and training plans are <strong>NOT</strong> a substitute for:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Professional medical advice, diagnosis, or treatment</li>
          <li>In-person evaluation by a qualified healthcare provider</li>
          <li>Physical therapy or rehabilitation services</li>
          <li>Sports medicine consultations</li>
          <li>Professional coaching or athletic training</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Consult Your Doctor BEFORE Starting</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p className="font-semibold text-yellow-400">
          IMPORTANT: Always consult a qualified healthcare provider before beginning any physical training program, especially if you:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Have any pre-existing medical conditions (heart disease, diabetes, asthma, etc.)</li>
          <li>Have a history of injuries (joint, muscle, bone, or ligament injuries)</li>
          <li>Are currently injured or recovering from an injury</li>
          <li>Are taking any medications</li>
          <li>Have been sedentary or inactive for an extended period</li>
          <li>Are pregnant or postpartum</li>
          <li>Experience chest pain, dizziness, or shortness of breath</li>
          <li>Have a family history of heart disease</li>
          <li>Are over 40 years old and starting a new exercise program</li>
        </ul>
        <p>
          <strong>For Youth Athletes (Under 18):</strong> Parents/guardians must ensure their child has medical clearance from a pediatrician before starting any training program. Young athletes may have different physical capabilities and limitations that require professional evaluation.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Assumption of Risk</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p>
          Physical exercise and athletic training carry <strong>inherent risks</strong>, including but not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Muscle strains, sprains, and tears</li>
          <li>Joint injuries</li>
          <li>Bone fractures</li>
          <li>Tendon and ligament damage</li>
          <li>Cardiovascular stress or complications</li>
          <li>Heat exhaustion or heat stroke</li>
          <li>Dehydration</li>
          <li>Equipment-related injuries</li>
          <li>Falls or collisions</li>
          <li>In rare cases, serious injury, permanent disability, or death</li>
        </ul>
        <p className="font-semibold">
          By using Mind and Muscle's training features, you acknowledge these risks and assume <strong>full responsibility</strong> for all risks associated with physical exercise and training.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Stop Exercise If You Experience:</h3>
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
        <p className="font-semibold text-red-400 mb-2">STOP IMMEDIATELY and seek medical attention if you experience:</p>
        <ul className="list-disc pl-6 space-y-1 text-text-secondary">
          <li>Chest pain or pressure</li>
          <li>Severe shortness of breath</li>
          <li>Dizziness or lightheadedness</li>
          <li>Nausea or vomiting</li>
          <li>Sharp or shooting pain</li>
          <li>Joint instability</li>
          <li>Loss of coordination or balance</li>
          <li>Numbness or tingling</li>
          <li>Unusual fatigue or weakness</li>
          <li>Any other concerning symptoms</li>
        </ul>
        <p className="mt-4 text-sm text-red-400">
          Do NOT continue exercising if you experience any of these symptoms. Consult a medical professional immediately.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Parental Supervision Required</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p>
          <strong>For Users Under 18:</strong> Parents or legal guardians MUST:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Supervise all physical training activities</li>
          <li>Ensure their child has medical clearance for athletic training</li>
          <li>Monitor exercise intensity and volume to prevent overtraining</li>
          <li>Ensure proper equipment, environment, and safety measures</li>
          <li>Stop activities immediately if any concerning symptoms appear</li>
          <li>Modify or discontinue exercises that are inappropriate for their child's age, development, or fitness level</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">AI Limitations</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p>
          Our AI system generates training recommendations based on user inputs and general fitness principles. However:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>AI cannot assess your individual medical condition</strong> - It does not have access to your medical history, current health status, or physical limitations</li>
          <li><strong>AI cannot detect injuries</strong> - It cannot identify existing injuries, movement compensations, or biomechanical issues</li>
          <li><strong>AI cannot evaluate proper form</strong> - It cannot watch you perform exercises or correct technique errors</li>
          <li><strong>AI provides general recommendations only</strong> - Every individual is different, and what works for one person may not be appropriate for another</li>
          <li><strong>AI cannot replace professional coaching</strong> - Human coaches can observe, adjust, and personalize training in ways AI cannot</li>
        </ul>
        <p className="font-semibold">
          You are responsible for evaluating whether AI-generated recommendations are appropriate for your individual circumstances and physical capabilities.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Injury History Data Usage</h3>
      <div className="text-text-secondary mb-6 space-y-4">
        <p>
          We collect injury history information to help personalize training recommendations. However:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>This data is used for <strong>general guidance only</strong></li>
          <li>It does NOT constitute medical evaluation or treatment</li>
          <li>It does NOT replace consultation with a healthcare provider</li>
          <li>You should NOT rely on our AI to manage or rehabilitate injuries</li>
        </ul>
        <p className="font-semibold text-yellow-400">
          If you have a history of injuries, consult a medical professional before following any workout recommendations.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Equipment Safety</h3>
      <div className="text-text-secondary mb-6">
        <ul className="list-disc pl-6 space-y-1">
          <li>Ensure all equipment is properly maintained and in good working condition</li>
          <li>Use equipment only as intended and according to manufacturer instructions</li>
          <li>Ensure adequate space and proper flooring for exercises</li>
          <li>Use spotters when appropriate, especially for heavy lifting</li>
          <li>Never attempt exercises beyond your current fitness level</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Liability Waiver</h3>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-6">
        <p className="text-text-secondary mb-4">
          <strong>TO THE FULLEST EXTENT PERMITTED BY LAW:</strong>
        </p>
        <p className="text-text-secondary mb-4">
          Mind and Muscle, its officers, directors, employees, affiliates, contractors, and service providers <strong>SHALL NOT BE LIABLE</strong> for any injuries, damages, losses, medical expenses, or other consequences (including but not limited to death) resulting from:
        </p>
        <ul className="list-disc pl-6 text-text-secondary space-y-1">
          <li>Your use of workout programs, exercise recommendations, or training content</li>
          <li>Following AI-generated training plans</li>
          <li>Performing exercises described in the Service</li>
          <li>Reliance on information provided through the Service</li>
          <li>Failure to consult with medical professionals before exercising</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Indemnification</h3>
      <div className="text-text-secondary mb-6">
        <p>
          You agree to <strong>indemnify, defend, and hold harmless</strong> Mind and Muscle from any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Your use of fitness or training content provided through the Service</li>
          <li>Your failure to consult with medical professionals before exercising</li>
          <li>Injuries sustained while following workout recommendations</li>
          <li>Your violation of this disclaimer</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Your Responsibility</h3>
      <div className="text-text-secondary mb-6">
        <p className="font-semibold mb-4">
          By using Mind and Muscle's training features, you confirm that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You have read and understood this entire disclaimer</li>
          <li>You have consulted with a healthcare provider (or will do so before starting)</li>
          <li>You are physically capable of performing the recommended exercises</li>
          <li>You will use proper form and technique</li>
          <li>You will stop immediately if you experience any concerning symptoms</li>
          <li>You accept full responsibility for your safety and well-being</li>
          <li>You understand the inherent risks of physical exercise</li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Emergency Contact</h3>
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
        <p className="font-semibold text-red-400 mb-2">
          In case of emergency:
        </p>
        <ul className="list-disc pl-6 text-text-secondary space-y-1">
          <li><strong>United States:</strong> Call 911</li>
          <li><strong>Injury reporting:</strong> <a href="mailto:safety@mindandmuscle.ai" className="text-solar-surge-orange underline">safety@mindandmuscle.ai</a></li>
        </ul>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Questions or Concerns</h3>
      <div className="text-text-secondary">
        <p className="mb-2">
          For questions about this Health & Fitness Disclaimer:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:legal@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">legal@mindandmuscle.ai</a>
        </p>
      </div>
    </div>
  );
}

function PartnerTermsContent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-3xl font-black mb-6">Partner Program Terms</h2>

      <div className="p-6 rounded-xl bg-solar-surge-orange/10 border border-solar-surge-orange/20 mb-8">
        <p className="text-sm mb-0">
          <strong>For Partners:</strong> Complete partner program terms and conditions are available on our dedicated partner terms page.
        </p>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Quick Overview</h3>
      <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
        <li><strong>Commission:</strong> 10% of 6-month subscription price paid by referred customers</li>
        <li><strong>Payment Schedule:</strong> Monthly via PayPal after 60-day hold period</li>
        <li><strong>Attribution Window:</strong> 90 days from click to signup</li>
        <li><strong>Recurring Income:</strong> Earn commission every year the customer renews</li>
        <li><strong>Minimum Payout:</strong> $50 threshold</li>
      </ul>

      <h3 className="text-2xl font-bold mt-8 mb-4">What's Covered in Partner Terms</h3>
      <div className="text-text-secondary mb-4">
        <ul className="list-disc pl-6 space-y-2">
          <li>Complete commission structure and calculations</li>
          <li>Payout schedule and hold periods</li>
          <li>Chargeback and refund policies</li>
          <li>Partner responsibilities and prohibited activities</li>
          <li>Tax obligations (1099 forms for US partners)</li>
          <li>Program changes and termination policies</li>
        </ul>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-xl font-bold mb-3">View Complete Partner Terms</h3>
        <p className="text-text-secondary mb-4">
          For full details on commission structure, payout terms, and partner responsibilities:
        </p>
        <a
          href="/partner-terms"
          target="_blank"
          className="inline-block px-6 py-3 bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Read Full Partner Terms →
        </a>
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4">Partner Support</h3>
      <p className="text-text-secondary mb-4">
        For questions about the partner program, commissions, or payouts:
      </p>
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <p className="mb-2"><strong>Email:</strong> <a href="mailto:partners@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">partners@mindandmuscle.ai</a></p>
        <p className="text-sm text-text-secondary">We typically respond within 24 hours.</p>
      </div>
    </div>
  );
}
