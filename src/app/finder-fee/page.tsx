import PasswordGate from '@/components/PasswordGate';

export default function FinderFeePage() {
  const password = process.env.FINDER_FEE_PASSWORD || '';

  return (
    <PasswordGate 
      password={password}
      title="Finder Fee Program"
      description="Enter password to view program details"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mind & Muscle Finder Fee Program
            </h1>
            <p className="text-xl text-gray-600">
              Earn Money for Introductions
            </p>
          </div>

          {/* What Is This */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is this?</h2>
            <p className="text-gray-700 mb-4">
              The <strong>Finder Fee Program</strong> rewards people who introduce organizations (travel ball associations, facilities, leagues) to Mind & Muscle.
            </p>
            <p className="text-gray-700">
              If you connect us with an organization and they purchase, <strong className="text-blue-600">you earn 10% of their first purchase</strong>.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. You get a custom link</h3>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                  https://mindandmuscle.ai/team-licensing?finder=yourcode
                </code>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. You share it with organizations</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Travel ball associations</li>
                  <li>Baseball/softball facilities</li>
                  <li>Youth sports leagues</li>
                  <li>Tournament organizers</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. They purchase</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Organization clicks your link</li>
                  <li>They buy team licensing ($3,000-$50,000+)</li>
                  <li>We track the intro to you</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. You get paid</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>First purchase: <strong className="text-green-600">10% finder fee</strong></li>
                  <li>Example: $10,000 purchase = $1,000 for you</li>
                  <li>Payment via your choice (Venmo, Zelle, check, etc.)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Real Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Real examples</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Small travel ball team</h3>
                <p className="text-sm text-gray-600 mb-2">50 players + coaches, 6 months</p>
                <p className="text-gray-700 mb-2">Purchase: <strong>$3,357.50</strong></p>
                <p className="text-green-600 font-bold text-lg">Your Fee: $335.75</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Large facility</h3>
                <p className="text-sm text-gray-600 mb-2">200 athletes, annual</p>
                <p className="text-gray-700 mb-2">Purchase: <strong>$15,000</strong></p>
                <p className="text-green-600 font-bold text-lg">Your Fee: $1,500</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Regional association</h3>
                <p className="text-sm text-gray-600 mb-2">500+ players</p>
                <p className="text-gray-700 mb-2">Purchase: <strong>$35,000</strong></p>
                <p className="text-green-600 font-bold text-lg">Your Fee: $3,500</p>
              </div>
            </div>
          </section>

          {/* Payment Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment process</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Introduction tracked</h3>
                  <p className="text-gray-700">Organization uses your finder link, system records you as connector</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">They purchase</h3>
                  <p className="text-gray-700">Organization completes checkout, we receive instant notification</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">You get email notification</h3>
                  <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
                    <p className="font-mono">Subject: Finder Fee Opportunity: $1,500</p>
                    <p className="text-gray-600 mt-1">Organization purchased $15,000</p>
                    <p className="text-gray-600">Your Finder Fee (10%): $1,500</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">We approve & pay</h3>
                  <p className="text-gray-700">We verify, contact you for payment method, send payment (usually 5-7 business days)</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a limit to how many organizations I can introduce?</h3>
                <p className="text-gray-700">No limit! Introduce as many as you'd like.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What counts as an "organization"?</h3>
                <p className="text-gray-700">Travel ball teams, leagues, facilities, associations, tournaments - any multi-athlete group purchase.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do you track that they came from my link?</h3>
                <p className="text-gray-700">When they click your link, we store a tracking code. When they purchase (even weeks later), we know it was your introduction.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How long does the tracking last?</h3>
                <p className="text-gray-700">90 days from when they click your link. If they purchase within 90 days, you get credit.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if I'm already a Tolt Partner?</h3>
                <p className="text-gray-700">Absolutely! These are separate programs. Use Partner link for individuals, Finder link for organizations.</p>
              </div>
            </div>
          </section>

          {/* Who to Introduce */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Who should you introduce?</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Perfect candidates:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Travel ball teams (10+ players)</li>
                  <li>Baseball/softball training facilities</li>
                  <li>Youth sports leagues and associations</li>
                  <li>Tournament organizers</li>
                  <li>High school teams</li>
                  <li>College club programs</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pricing transparency:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>6-month license: $6,715 (unlimited users)</li>
                  <li>Annual license: $13,430 (save $6,715)</li>
                  <li>Enterprise: Custom pricing for 200+ athletes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* The Difference */}
          <section className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">The difference you make</h2>
            <p className="text-gray-700 mb-4">When you introduce an organization to Mind & Muscle:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>You earn money</strong> for the introduction</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Coaches get better tools</strong> to develop athletes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Athletes get personalized training</strong> that actually works</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span><strong>Parents stay informed</strong> about their child's development</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-6 font-semibold">
              You're not just earning a fee - you're helping transform youth baseball and softball.
            </p>
          </section>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">Questions? Contact us for details.</p>
            <p className="font-semibold">This is an invitation-only program. If you received access, you've been selected to participate!</p>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
