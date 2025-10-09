# Team Code Types in Mind and Muscle

There are **two types** of team codes in the Mind and Muscle app:

## 1. Free Team Codes (Created in App)

**How they're created:**
- Users create these directly in the app
- No payment required
- Anyone can create a free team

**Features:**
- Basic team functionality
- Team members can join
- Free tier features only

**How to join:**
- Go to More > Settings in the app
- Enter the team code
- Join the team with free features

---

## 2. Paid Team License Codes (Purchased on Website)

**How they're created:**
- Purchased through the website at mindandmuscle.com/team-licensing
- Payment via Stripe (annual subscription)
- Generates an 8-character code (e.g., `ABC123XY`)
- Emailed to the purchaser

**Features:**
- **Unlocks Premium for all team members** 🎉
- Athletes/coaches consume a license seat (counted against max_seats)
- Parents can view without consuming a seat
- All 7 AI-powered apps unlocked
- Advanced analytics and training
- Auto-renews annually

**How to join:**
- Team admin receives code via email after purchase
- Team members go to More > Settings > **Redeem Team Code**
- Enter the paid license code
- Premium features unlock immediately

---

## Key Differences

| Feature | Free Team Code | Paid License Code |
|---------|---------------|-------------------|
| **Created Where** | In the app | Website purchase |
| **Cost** | Free | Starts at $107.20/seat/year |
| **Premium Access** | ❌ No | ✅ Yes |
| **Seat Limits** | Unlimited | Based on purchase (12+) |
| **Seat Consumption** | N/A | Athletes/coaches only |
| **Auto-Renews** | N/A | Yes, annually |
| **Code Format** | Varies | 8-character alphanumeric |

---

## Implementation Details

### Database Structure

The `teams` table handles **both** free and paid teams with these key fields:

```sql
-- Distinguishes free vs paid teams
license_type: 'free' | 'team'

-- Only matters for paid teams
license_status: 'active' | 'inactive' | 'cancelled'

-- Max seats (only enforced for paid)
max_seats: integer

-- Current seat usage (only tracked for paid)
seats_used: integer

-- Stripe subscription info (only for paid)
stripe_subscription_id: text (nullable)
stripe_customer_id: text (nullable)
```

### Code Redemption Flow

**Free Team Code:**
```dart
// In the app, users join with basic team code
team_service.joinTeam(teamCode)
// No premium unlocked, no seat tracking
```

**Paid License Code:**
```dart
// In the app, users redeem paid license
team_service.redeemTeamJoinCode(teamCode, userRole)
// Premium unlocked if seats available
// Seat consumed if athlete/coach
// No seat consumed if parent
```

### Where to Redeem

**In the App:**
1. Open Mind and Muscle app
2. Navigate to **More** tab (bottom navigation)
3. Tap **Settings**
4. Scroll to **Team** section
5. Tap **"Redeem Team Code"** or **"Join Team"**
6. Enter the code
7. For paid codes: Premium unlocks immediately (if seats available)

---

## For Users to Understand

**Simple explanation for your users:**

> **Free Team Code:** Created in the app for free. Lets you organize a team but doesn't unlock Premium.
>
> **Paid License Code:** Purchased on our website. Unlocks Premium access for your entire team. You'll receive this code via email after purchase.

**Where to enter codes:**
- Both types of codes are entered in the same place: **More > Settings > Team**
- The app automatically detects if it's a paid license code and unlocks Premium accordingly

---

## Admin View

As a team admin, you'll want to:

1. **Purchase license** on website (mindandmuscle.com/team-licensing)
2. **Receive code** via email
3. **Share code** with your athletes/coaches
4. **Monitor usage** - keep track of how many seats are used
5. **Manage renewals** - subscription auto-renews annually through Stripe

Parents should also get the code so they can view their athlete's progress without consuming a seat.
