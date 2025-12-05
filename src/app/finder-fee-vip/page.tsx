import PasswordGate from '@/components/PasswordGate';

export default function FinderFeeVIPPage() {
  const password = process.env.FINDER_FEE_VIP_PASSWORD || '';

  return (
    <PasswordGate 
      password={password}
      title="VIP Finder Fee Program"
      description="Enter password to view VIP program details"
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
          
          {/* VIP Badge Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
              ⭐ VIP RECURRING PROGRAM
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              VIP Finder Fee Program
            </h1>
            <p className="text-xl text-gray-600">
              10% First Purchase + 5% Every Renewal
            </p>
          </div>

          {/* What Makes This Different */}
          <section className="mb-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What makes VIP different?</h2>
            <p className="text-gray-700 mb-4">
              As a <strong>VIP Finder Partner</strong>, you don't just earn a one-time fee - you earn ongoing credit for the relationships you build.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-purple-600 mb-2">First Purchase</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">10%</p>
                <p className="text-gray-600">Reward for the introduction</p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-indigo-600 mb-2">Every Renewal</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">5%</p>
                <p className="text-gray-600">Ongoing appreciation forever</p>
              </div>
            </div>
          </section>

          {/* VIP Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">VIP earnings example</h2>
            
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">You introduce: California Youth Baseball League</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">First Purchase</p>
                    <p className="text-sm text-gray-600">January 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">$25,000 × 10%</p>
                    <p className="text-2xl font-bold text-green-600">$2,500</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Renewal #1</p>
                    <p className="text-sm text-gray-600">July 2025 (6 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">$25,000 × 5%</p>
                    <p className="text-2xl font-bold text-green-600">$1,250</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Renewal #2</p>
                    <p className="text-sm text-gray-600">January 2026 (12 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">$25,000 × 5%</p>
                    <p className="text-2xl font-bold text-green-600">$1,250</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Renewal #3</p>
                    <p className="text-sm text-gray-600">July 2026 (18 months)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">$25,000 × 5%</p>
                    <p className="text-2xl font-bold text-green-600">$1,250</p>
                  </div>
                </div>

                <div className="border-t-2 border-purple-200 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-gray-900">Total over 2 years:</p>
                    <p className="text-3xl font-bold text-purple-600">$6,250</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">And 5% on every future renewal...</p>
                </div>
              </div>
            </div>
          </section>

          {/* Standard vs VIP Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Standard vs VIP comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">Aspect</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Standard Finder</th>
                    <th className="border border-gray-300 px-4 py-3 text-left bg-purple-50">VIP Recurring</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">First Purchase</td>
                    <td className="border border-gray-300 px-4 py-3">10% one-time</td>
                    <td className="border border-gray-300 px-4 py-3 bg-purple-50"><strong>10%</strong> (tracked as first)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Renewals</td>
                    <td className="border border-gray-300 px-4 py-3">Nothing</td>
                    <td className="border border-gray-300 px-4 py-3 bg-purple-50"><strong>5% ongoing</strong></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Use Case</td>
                    <td className="border border-gray-300 px-4 py-3">99% of finders</td>
                    <td className="border border-gray-300 px-4 py-3 bg-purple-50"><strong>Ultra-high-value VIPs</strong></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Duration</td>
                    <td className="border border-gray-300 px-4 py-3">One payment</td>
                    <td className="border border-gray-300 px-4 py-3 bg-purple-50"><strong>As long as they subscribe</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How VIP finder fees work</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. You get a custom VIP link</h3>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm block mt-2">
                  https://mindandmuscle.ai/team-licensing?finder=yourcode
                </code>
                <p className="text-sm text-gray-600 mt-2">(Same format, but your account is marked as VIP Recurring)</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Organization makes first purchase</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You earn <strong className="text-purple-600">10% of first purchase</strong></li>
                  <li>Example: $25,000 purchase = $2,500 for you</li>
                  <li>They're tracked as your introduction</li>
                </ul>
              </div>

              <div className="border-l-4 border-indigo-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. They renew (6 months, 12 months, etc.)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You earn <strong className="text-indigo-600">5% on every renewal</strong></li>
                  <li>Example: $25,000 renewal = $1,250 for you</li>
                  <li>Continues as long as they subscribe</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. You get paid every time</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Email notification for each payment</li>
                  <li>We approve & send payment within 5-7 days</li>
                  <li>Your choice: Venmo, Zelle, check, wire</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Real World Example */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Real VIP scenario</h2>
            
           <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Same-sized org, different results</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Standard Finder (Sarah)</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Introduces Texas Thunder ($3,357.50)</li>
                    <li>First purchase: <strong>$335.75</strong> (10%)</li>
                    <li>Renewal: <strong>$0</strong></li>
                    <li className="pt-2 border-t border-gray-300 font-bold">Total: $335.75</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">VIP Recurring (John)</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>Introduces same org ($3,357.50)</li>
                    <li>First purchase: <strong>$335.75</strong> (10%)</li>
                    <li>Renewal #1: <strong>$167.88</strong> (5%)</li>
                    <li>Renewal #2: <strong>$167.88</strong> (5%)</li>
                    <li>Renewal #3: <strong>$167.88</strong> (5%)</li>
                    <li className="pt-2 border-t border-purple-300 font-bold text-purple-900">Total over 2 years: $839.39</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 text-center">
                VIP earns <strong>2.5x more</strong> over time
              </p>
            </div>
          </section>

          {/* Why VIP */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why VIP recurring?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-purple-500 mr-3 text-2xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Big reward upfront</h3>
                  <p className="text-gray-700">10% on first purchase recognizes the value of the introduction</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-purple-500 mr-3 text-2xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Ongoing appreciation</h3>
                  <p className="text-gray-700">5% renewals show we value long-term relationships</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-purple-500 mr-3 text-2xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Sustainable model</h3>
                  <p className="text-gray-700">More reasonable than 10% forever, fair for both sides</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-purple-500 mr-3 text-2xl">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Recognition of partnership</h3>
                  <p className="text-gray-700">VIP status acknowledges your exceptional value as a connector</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">VIP frequently asked questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Why 10% first, 5% renewals instead of 10% forever?</h3>
                <p className="text-gray-700">More sustainable. Rewards the introduction heavily (10%), then ongoing support at a reasonable rate (5%). Prevents excessive liability on large accounts.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How long do the renew fees continue?</h3>
                <p className="text-gray-700">As long as the organization continues to subscribe to Mind & Muscle. If they renew for 10 years, you earn 5% for 10 years.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if they cancel and re-subscribe later?</h3>
                <p className="text-gray-700">If they cancel and come back within 90 days with your link, it's treated as a renewal (5%). After 90 days, it would be a new first purchase (10%).</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I have both standard AND VIP introductions?</h3>
                <p className="text-gray-700">Yes! Past standard introductions stay one-time. Future introductions use VIP recurring (10% first, 5% renewals).</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is this different from the Tolt Partner Program?</h3>
                <p className="text-gray-700">Yes, completely separate. Tolt is for public promotion (10-15% recurring). VIP Finder is invitation-only for organization introductions (10% first, 5% renewals). You can do both!</p>
              </div>
            </div>
          </section>

          {/* VIP Benefits */}
          <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your VIP benefits</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">⭐</span>
                <span><strong>10% first purchase reward</strong> - Big appreciation for the introduction</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">⭐</span>
                <span><strong>5% ongoing renewals</strong> - As long as they subscribe</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">⭐</span>
                <span><strong>Recognition as strategic partner</strong> - VIP status acknowledgment</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">⭐</span>
                <span><strong>Unlimited introductions</strong> - No cap on how many orgs you can introduce</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">⭐</span>
                <span><strong>Priority support</strong> - Direct access for your finder fee questions</span>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm border-t pt-8">
            <p className="mb-2 font-semibold text-purple-600">You've been selected for VIP Finder Fee status!</p>
            <p>This recognition is reserved for our most valuable connectors who bring exceptional organizations to Mind & Muscle.</p>
            <p className="mt-4">Questions? Contact us for details.</p>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
