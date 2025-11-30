'use client';

import React from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { Shield, DollarSign, Clock, AlertCircle } from 'lucide-react';

export default function PartnerTermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
              Partner Program Terms
            </span>
          </h1>
          <p className="text-text-secondary">
            Last Updated: January 2025
          </p>
        </div>

        <div className="space-y-6">
          {/* Commission Structure */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <DollarSign className="w-6 h-6 text-mind-primary" />
              </div>
              <h2 className="text-2xl font-black">Commission Structure</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <p>
                <strong className="text-white">Commission Rate:</strong> Partners earn 10% of the 6-month subscription price paid by referred customers.
              </p>
              <p>
                <strong className="text-white">Calculation:</strong> Commission = (Price per seat × Number of seats) × 10%
              </p>
              <p>
                <strong className="text-white">Example:</strong> Team of 12 seats at $71.10/seat = $853.20 per 6-month payment → Partner earns $85.32 per payment (potential $170.64/year if renewed)
              </p>
              <p>
                <strong className="text-white">Recurring Income:</strong> Partners continue earning 10% commission on every 6-month renewal as long as the customer maintains an active subscription.
              </p>
              <p>
                <strong className="text-white">Attribution Window:</strong> 90 days - if a referred customer signs up within 90 days of clicking your unique referral link, you receive credit.
              </p>
            </div>
          </LiquidGlass>

          {/* Payout Terms */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                <Clock className="w-6 h-6 text-muscle-primary" />
              </div>
              <h2 className="text-2xl font-black">Payout Terms</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <p>
                <strong className="text-white">Hold Period:</strong> All commissions are held for 60 days after the customer's payment clears. This is standard industry practice to protect against chargebacks, refunds, and fraudulent transactions.
              </p>
              <p>
                <strong className="text-white">Example Timeline:</strong> Customer pays on January 1st → Commission becomes eligible March 1st → Paid in March payout cycle
              </p>
              <p>
                <strong className="text-white">Payout Frequency:</strong> Monthly, processed on the 1st of each month (or next business day)
              </p>
              <p>
                <strong className="text-white">Payout Method:</strong> PayPal only
              </p>
              <p>
                <strong className="text-white">Minimum Threshold:</strong> $50.00 - if your eligible commission balance is below $50, it will roll over to the following month
              </p>
              <p>
                <strong className="text-white">Payout Fees:</strong> Mind & Muscle covers all PayPal fees - you receive the full commission amount
              </p>
            </div>
          </LiquidGlass>

          {/* Chargebacks & Refunds */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <AlertCircle className="w-6 h-6 text-mind-primary" />
              </div>
              <h2 className="text-2xl font-black">Chargebacks & Refunds</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <p>
                <strong className="text-white">Chargeback Policy:</strong> If a referred customer initiates a chargeback or receives a refund, the associated commission will be deducted from your future earnings.
              </p>
              <p>
                <strong className="text-white">Already Paid Commissions:</strong> If a commission was already paid to you and the customer later chargebacks, the amount will be deducted from your next payout. If your balance is insufficient, you agree to repay the difference.
              </p>
              <p>
                <strong className="text-white">Fraudulent Referrals:</strong> Any suspected fraudulent activity, fake referrals, or self-referrals will result in immediate termination from the partner program and forfeiture of all commissions.
              </p>
            </div>
          </LiquidGlass>

          {/* Partner Responsibilities */}
          <LiquidGlass variant="orange" className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-solar-surge-orange/20">
                <Shield className="w-6 h-6 text-muscle-primary" />
              </div>
              <h2 className="text-2xl font-black">Partner Responsibilities</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <p>
                <strong className="text-white">Accurate Information:</strong> Partners must provide accurate PayPal information for payouts. Mind & Muscle is not responsible for payments sent to incorrect or outdated PayPal accounts.
              </p>
              <p>
                <strong className="text-white">Ethical Promotion:</strong> Partners agree to promote Mind & Muscle honestly and ethically. Misrepresentation of features, pricing, or capabilities is prohibited.
              </p>
              <p>
                <strong className="text-white">Brand Compliance:</strong> Partners may use provided marketing materials but must not alter logos, create misleading content, or imply official partnership beyond the scope of this program.
              </p>
              <p>
                <strong className="text-white">Tax Responsibility:</strong> Partners are responsible for all applicable taxes on earned commissions. Mind & Muscle will issue 1099 forms to US-based partners earning over $600 annually.
              </p>
              <p>
                <strong className="text-white">Prohibited Activities:</strong> Self-referrals, paid advertising using trademarked terms, spam, or any deceptive marketing practices are strictly prohibited.
              </p>
              <p>
                <strong className="text-white">Active Participation Requirement:</strong> Partners are expected to actively promote Mind & Muscle. Mind & Muscle reserves the right to terminate partnerships that remain inactive (no referrals within 6 months) or show no promotional activity. This ensures the program rewards genuine advocates rather than passive participants.
              </p>
            </div>
          </LiquidGlass>

          {/* Program Changes */}
          <LiquidGlass variant="blue" className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-neon-cortex-blue/20">
                <AlertCircle className="w-6 h-6 text-mind-primary" />
              </div>
              <h2 className="text-2xl font-black">Program Changes & Termination</h2>
            </div>
            <div className="space-y-3 text-text-secondary">
              <p>
                <strong className="text-white">Commission Protection:</strong> Early access partners are locked in at 10% lifetime commission. However, Mind & Muscle reserves the right to modify commission rates for new partners joining after the early access period.
              </p>
              <p>
                <strong className="text-white">Program Modifications:</strong> Mind & Muscle reserves the right to modify these terms with 30 days written notice to active partners.
              </p>
              <p>
                <strong className="text-white">Voluntary Termination:</strong> Partners may leave the program at any time. Earned commissions through the termination date will be paid according to the normal payout schedule.
              </p>
              <p>
                <strong className="text-white">Involuntary Termination:</strong> Mind & Muscle may terminate partnership for violation of these terms, fraudulent activity, or at its sole discretion with or without cause. Unpaid earned commissions may be forfeited in cases of term violations.
              </p>
            </div>
          </LiquidGlass>

          {/* Contact */}
          <LiquidGlass variant="orange" className="p-8">
            <h2 className="text-2xl font-black mb-4">Questions?</h2>
            <p className="text-text-secondary">
              For questions about partner terms, payouts, or commission calculations, email us at{' '}
              <a href="mailto:partners@mindandmuscle.ai" className="text-solar-surge-orange hover:underline">
                partners@mindandmuscle.ai
              </a>
            </p>
          </LiquidGlass>

          <div className="text-center pt-8">
            <p className="text-sm text-text-secondary">
              By participating in the Mind & Muscle Partner Program, you agree to these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
