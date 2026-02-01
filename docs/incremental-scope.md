# Ticketly - Incremental Development Plan

## Philosophy
Build feature by feature, growing the database incrementally. Each increment is a complete, working feature that adds value.

---

## 🎯 Current Status
- [x] Next.js project with App Router
- [x] Clerk authentication (users + organizations)
- [x] Basic UI components (Header, Button, etc.)
- [x] Dark theme foundation

---

## 📦 Increment 1: Supabase Setup + Basic Event Creation

**Goal**: Create and display a simple event

### Database (First Tables)
- [ ] Set up Supabase project
- [ ] Install Supabase client (`@supabase/supabase-js`)
- [ ] Configure environment variables
- [ ] Create `/lib/supabase/client.ts` utility

**Tables to Create:**
```sql
-- organizations (synced from Clerk)
- id (uuid, primary key)
- clerk_id (text, unique)
- name (text)
- created_at (timestamp)

-- events
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- title (text)
- description (text)
- start_date (timestamp)
- end_date (timestamp)
- location (text, nullable)
- status (text: 'draft', 'published', 'cancelled')
- created_at (timestamp)
- updated_at (timestamp)
```

### Features to Build
- [ ] Create Supabase client utility
- [ ] Set up Row Level Security (RLS) for organizations table
- [ ] Set up RLS for events table (org members only)
- [ ] Create `/app/events/new/page.tsx` - Event creation form
- [ ] Build basic form with: title, description, date, location
- [ ] Create `/app/events/page.tsx` - List user's events
- [ ] Create `/app/events/[id]/page.tsx` - View event details
- [ ] Add form validation with Zod
- [ ] Implement create event API/action
- [ ] Test creating and viewing events

**Deliverable**: Create and view basic events in your organization

---

## 📦 Increment 2: Clerk-Supabase Sync

**Goal**: Automatically sync Clerk organizations to Supabase

### Database Changes
```sql
-- users (synced from Clerk)
- id (uuid, primary key)
- clerk_id (text, unique)
- email (text)
- first_name (text)
- last_name (text)
- image_url (text)
- created_at (timestamp)
- updated_at (timestamp)

-- organization_members
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- user_id (uuid, foreign key)
- role (text: 'owner', 'admin', 'member')
- created_at (timestamp)
```

### Features to Build
- [ ] Create webhook endpoint `/api/webhooks/clerk`
- [ ] Handle `organization.created` webhook
- [ ] Handle `organization.updated` webhook
- [ ] Handle `organizationMembership.created` webhook
- [ ] Handle `user.created` webhook
- [ ] Handle `user.updated` webhook
- [ ] Test webhook sync locally with Clerk
- [ ] Update events list to show creator info

**Deliverable**: Organizations and users automatically sync from Clerk to Supabase

---

## 📦 Increment 3: Event Cover Images

**Goal**: Add visual appeal to events with cover images

### Database Changes
```sql
-- Add to events table:
- cover_image_url (text, nullable)
```

### Features to Build
- [ ] Set up Supabase Storage bucket for event images
- [ ] Configure public access for images
- [ ] Add image upload to event creation form
- [ ] Implement image preview before upload
- [ ] Create image upload utility function
- [ ] Update event display to show cover image
- [ ] Add image optimization
- [ ] Handle image deletion when event is deleted

**Deliverable**: Events display beautiful cover images

---

## 📦 Increment 4: Public Event Pages

**Goal**: Shareable public event pages

### Database Changes
```sql
-- Add to events table:
- slug (text, unique, nullable)
- visibility (text: 'public', 'private', 'unlisted')
```

### Features to Build
- [ ] Generate unique slugs for events
- [ ] Create public event page `/e/[slug]/page.tsx`
- [ ] Design beautiful event detail page:
  - [ ] Cover image hero section
  - [ ] Event title and description
  - [ ] Date, time, location info
  - [ ] Host/organization info
- [ ] Add SEO meta tags
- [ ] Add Open Graph tags for social sharing
- [ ] Add "Share" button with copy link
- [ ] Implement visibility controls
- [ ] Update event creation to set visibility

**Deliverable**: Beautiful, shareable public event pages

---

## 📦 Increment 5: Free Ticket Registration

**Goal**: Allow people to register for free events

### Database Changes
```sql
-- tickets (ticket types for an event)
- id (uuid, primary key)
- event_id (uuid, foreign key)
- name (text, e.g., "General Admission")
- description (text, nullable)
- price (integer, in cents, 0 for free)
- quantity (integer, nullable for unlimited)
- quantity_sold (integer, default 0)
- status (text: 'available', 'sold_out', 'hidden')
- created_at (timestamp)

-- registrations (attendee registrations)
- id (uuid, primary key)
- event_id (uuid, foreign key)
- ticket_id (uuid, foreign key)
- user_id (uuid, foreign key, nullable for guests)
- first_name (text)
- last_name (text)
- email (text)
- status (text: 'confirmed', 'cancelled', 'waitlisted')
- confirmation_code (text, unique)
- registered_at (timestamp)
```

### Features to Build
- [ ] Create ticket management UI for event organizers
- [ ] Add "Create Ticket Type" form
- [ ] Implement free ticket type creation
- [ ] Add registration button to public event page
- [ ] Create registration flow `/e/[slug]/register/page.tsx`:
  - [ ] Show available tickets
  - [ ] Collect attendee info (name, email)
  - [ ] Show registration summary
- [ ] Generate unique confirmation codes
- [ ] Create confirmation page
- [ ] Send confirmation email (basic)
- [ ] Build attendee list for organizers `/events/[id]/attendees`
- [ ] Add attendee search and filter

**Deliverable**: Users can register for free events and receive confirmation

---

## 📦 Increment 6: Email System (Confirmations & Reminders)

**Goal**: Automated email confirmations and reminders

### Database Changes
```sql
-- email_logs
- id (uuid, primary key)
- registration_id (uuid, foreign key, nullable)
- event_id (uuid, foreign key)
- recipient_email (text)
- email_type (text: 'confirmation', 'reminder', 'update')
- sent_at (timestamp)
- status (text: 'sent', 'failed', 'bounced')
```

### Features to Build
- [ ] Choose and set up email service (Resend recommended)
- [ ] Install email service SDK
- [ ] Create email templates folder
- [ ] Design registration confirmation email template
- [ ] Design event reminder email template (1 day before)
- [ ] Create email sending utility
- [ ] Send confirmation email on registration
- [ ] Implement scheduled reminder emails (cron job or edge function)
- [ ] Add unsubscribe functionality
- [ ] Create email preferences page for users
- [ ] Log all email sends

**Deliverable**: Automatic confirmation emails and event reminders

---

## 📦 Increment 7: Paid Tickets + Stripe Integration

**Goal**: Monetize events with paid tickets

### Database Changes
```sql
-- payments
- id (uuid, primary key)
- registration_id (uuid, foreign key)
- stripe_payment_intent_id (text, unique)
- amount (integer, in cents)
- currency (text, default 'usd')
- status (text: 'pending', 'succeeded', 'failed', 'refunded')
- paid_at (timestamp, nullable)
- created_at (timestamp)

-- Add to tickets table:
- sales_start (timestamp, nullable)
- sales_end (timestamp, nullable)
```

### Features to Build
- [ ] Set up Stripe account
- [ ] Install Stripe SDK (`stripe`, `@stripe/stripe-js`)
- [ ] Configure Stripe API keys (env variables)
- [ ] Add "paid ticket" option when creating tickets
- [ ] Update registration flow for paid tickets:
  - [ ] Calculate total amount
  - [ ] Integrate Stripe Checkout
  - [ ] Handle payment success
  - [ ] Handle payment failure
- [ ] Create Stripe webhook endpoint `/api/webhooks/stripe`
- [ ] Handle payment success webhook
- [ ] Update registration status after payment
- [ ] Generate and send receipt
- [ ] Create revenue dashboard for organizers
- [ ] Show ticket sales in event dashboard

**Deliverable**: Sell paid tickets and process payments

---

## 📦 Increment 8: QR Code Check-in System

**Goal**: Easy check-in at events

### Database Changes
```sql
-- check_ins
- id (uuid, primary key)
- registration_id (uuid, foreign key)
- event_id (uuid, foreign key)
- checked_in_by (uuid, foreign key to users)
- checked_in_at (timestamp)

-- Add to registrations table:
- qr_code_data (text, unique)
```

### Features to Build
- [ ] Generate QR codes for each registration
- [ ] Add QR code to confirmation email
- [ ] Create check-in page for organizers `/events/[id]/check-in`
- [ ] Build QR code scanner (use `react-qr-scanner` or similar)
- [ ] Implement QR code validation
- [ ] Add manual check-in (search by name/email)
- [ ] Show check-in status in attendee list
- [ ] Create real-time check-in counter
- [ ] Add check-in analytics
- [ ] Build mobile-optimized check-in interface

**Deliverable**: Smooth event check-in with QR codes

---

## 📦 Increment 9: Event Analytics Dashboard

**Goal**: Track event performance

### Database Changes
```sql
-- event_views (track page views)
- id (uuid, primary key)
- event_id (uuid, foreign key)
- viewed_at (timestamp)
- user_agent (text, nullable)
- referrer (text, nullable)
```

### Features to Build
- [ ] Track event page views
- [ ] Create analytics dashboard `/events/[id]/analytics`
- [ ] Show key metrics:
  - [ ] Total registrations
  - [ ] Total revenue
  - [ ] Tickets sold by type
  - [ ] Check-in rate
  - [ ] Page views
  - [ ] Conversion rate (views → registrations)
- [ ] Add date range filtering
- [ ] Create charts (use recharts or similar):
  - [ ] Registrations over time
  - [ ] Revenue over time
  - [ ] Ticket sales breakdown
- [ ] Export analytics data (CSV)

**Deliverable**: Comprehensive event analytics for organizers

---

## 📦 Increment 10: Promo Codes & Discounts

**Goal**: Marketing tools for organizers

### Database Changes
```sql
-- promo_codes
- id (uuid, primary key)
- event_id (uuid, foreign key)
- code (text, unique per event)
- discount_type (text: 'percentage', 'fixed_amount')
- discount_value (integer)
- max_uses (integer, nullable)
- uses_count (integer, default 0)
- valid_from (timestamp)
- valid_until (timestamp)
- created_at (timestamp)

-- Add to registrations table:
- promo_code_id (uuid, foreign key, nullable)
- discount_amount (integer, default 0)
```

### Features to Build
- [ ] Create promo code management UI
- [ ] Build "Create Promo Code" form
- [ ] Implement promo code validation logic
- [ ] Add promo code input to registration flow
- [ ] Calculate discounted price
- [ ] Show discount in registration summary
- [ ] Track promo code usage
- [ ] Create promo code analytics
- [ ] Add promo code to receipt/confirmation

**Deliverable**: Flexible discount codes for marketing

---

## 📦 Increment 11: Waitlist Feature

**Goal**: Manage event capacity effectively

### Database Changes
```sql
-- waitlist
- id (uuid, primary key)
- event_id (uuid, foreign key)
- email (text)
- first_name (text)
- last_name (text)
- position (integer)
- status (text: 'waiting', 'invited', 'converted', 'expired')
- added_at (timestamp)
- invited_at (timestamp, nullable)

-- Add to tickets table:
- enable_waitlist (boolean, default false)
```

### Features to Build
- [ ] Add waitlist toggle to ticket settings
- [ ] Create waitlist signup form
- [ ] Build waitlist management UI for organizers
- [ ] Implement automatic invitation when spots open
- [ ] Send waitlist invitation emails
- [ ] Add expiration timer for waitlist invitations
- [ ] Convert waitlist to registration
- [ ] Show waitlist position to users

**Deliverable**: Smart waitlist management when events fill up

---

## 📦 Increment 12: Event Updates & Announcements

**Goal**: Communicate with attendees

### Database Changes
```sql
-- event_updates
- id (uuid, primary key)
- event_id (uuid, foreign key)
- author_id (uuid, foreign key to users)
- subject (text)
- message (text)
- sent_at (timestamp)
- created_at (timestamp)
```

### Features to Build
- [ ] Create announcement composer UI
- [ ] Add rich text editor for announcements
- [ ] Implement "send to all attendees" functionality
- [ ] Send announcement emails
- [ ] Show announcement history
- [ ] Display updates on event page
- [ ] Add notification for new updates

**Deliverable**: Easy communication with all attendees

---

## 📦 Increment 13: Recurring Events

**Goal**: Support event series

### Database Changes
```sql
-- event_series
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- title (text)
- description (text)
- recurrence_rule (text, RRULE format)
- created_at (timestamp)

-- Add to events table:
- series_id (uuid, foreign key, nullable)
- is_recurring (boolean, default false)
```

### Features to Build
- [ ] Add "Create Series" option
- [ ] Build recurrence rule UI (weekly, monthly, etc.)
- [ ] Generate multiple events from series
- [ ] Link events in a series
- [ ] Show "Part of series" on event pages
- [ ] Update all events in series option
- [ ] Create series landing page

**Deliverable**: Easy creation of recurring events

---

## 📦 Increment 14: Calendar Integration

**Goal**: Add events to personal calendars

### Features to Build
- [ ] Generate ICS (iCalendar) files
- [ ] Add "Add to Calendar" dropdown:
  - [ ] Google Calendar link
  - [ ] Apple Calendar (ICS download)
  - [ ] Outlook Calendar link
  - [ ] ICS file download
- [ ] Implement timezone conversion
- [ ] Add calendar feed for all user events
- [ ] Create calendar subscription URL

**Deliverable**: Users can add events to their calendars

---

## 📦 Increment 15: Social Features

**Goal**: Increase event visibility

### Features to Build
- [ ] Add social sharing buttons:
  - [ ] Twitter/X
  - [ ] Facebook
  - [ ] LinkedIn
  - [ ] WhatsApp
  - [ ] Copy link
- [ ] Implement Open Graph tags
- [ ] Create Twitter Card tags
- [ ] Generate shareable event images
- [ ] Add referral tracking (UTM parameters)
- [ ] Show share analytics

**Deliverable**: Easy social sharing to promote events

---

## 📦 Increment 16: Video Event Integration

**Goal**: Support virtual events

### Database Changes
```sql
-- Add to events table:
- event_type (text: 'in_person', 'virtual', 'hybrid')
- meeting_url (text, nullable)
- meeting_password (text, nullable)
- meeting_platform (text, nullable: 'zoom', 'google_meet', 'custom')
```

### Features to Build
- [ ] Add event type selection (in-person, virtual, hybrid)
- [ ] Add meeting link input
- [ ] Integrate Zoom API (optional):
  - [ ] Auto-create Zoom meetings
  - [ ] Generate meeting links
- [ ] Add Google Meet integration
- [ ] Send meeting links in confirmation email
- [ ] Show meeting link on event page (only to registered users)
- [ ] Add "Join Meeting" button
- [ ] Track meeting attendance (if API allows)

**Deliverable**: Support for virtual and hybrid events

---

## 📦 Increment 17: Mobile PWA

**Goal**: App-like mobile experience

### Features to Build
- [ ] Add PWA manifest
- [ ] Configure service worker
- [ ] Add app icons
- [ ] Implement offline functionality
- [ ] Add install prompt
- [ ] Optimize mobile navigation
- [ ] Create mobile-first check-in interface
- [ ] Test on iOS and Android

**Deliverable**: Installable mobile web app

---

## 📦 Increment 18: Advanced Analytics

**Goal**: Deeper insights

### Database Changes
```sql
-- Add more tracking:
- registration_source (text, nullable) to registrations
- utm_source, utm_medium, utm_campaign to event_views
```

### Features to Build
- [ ] Track registration sources
- [ ] Add UTM parameter tracking
- [ ] Create conversion funnel analysis
- [ ] Build cohort analysis
- [ ] Add demographic insights
- [ ] Create custom reports
- [ ] Implement data export

**Deliverable**: Advanced analytics and reporting

---

## 📦 Increment 19: Refunds & Cancellations

**Goal**: Handle cancellations gracefully

### Database Changes
```sql
-- refunds
- id (uuid, primary key)
- payment_id (uuid, foreign key)
- registration_id (uuid, foreign key)
- amount (integer, in cents)
- reason (text)
- status (text: 'pending', 'completed', 'failed')
- refunded_at (timestamp, nullable)
- created_at (timestamp)
```

### Features to Build
- [ ] Add cancellation policy to events
- [ ] Build refund request interface
- [ ] Implement Stripe refund API
- [ ] Create refund approval workflow for organizers
- [ ] Send refund confirmation emails
- [ ] Update registration status on refund
- [ ] Show refund history
- [ ] Add refund analytics

**Deliverable**: Complete refund management

---

## 📦 Increment 20: API & Webhooks

**Goal**: Allow third-party integrations

### Features to Build
- [ ] Design RESTful API structure
- [ ] Implement API key generation
- [ ] Add API authentication
- [ ] Create API endpoints:
  - [ ] Events CRUD
  - [ ] Registrations read
  - [ ] Tickets CRUD
- [ ] Build webhook system
- [ ] Allow custom webhook URLs
- [ ] Document API with OpenAPI/Swagger
- [ ] Create API usage dashboard
- [ ] Add rate limiting

**Deliverable**: Public API for integrations

---

## 🚀 Future Increments (Backlog)

- **Multi-language support** (i18n)
- **Event recommendations**
- **Attendee networking features**
- **Premium subscription tiers**
- **Advanced access controls**
- **Event co-hosts**
- **Sponsor management**
- **Exhibitor booths (for conferences)**
- **Session scheduling (for multi-track events)**
- **Custom event branding**
- **White-label options**
- **Mobile native apps**

---

## 📊 Development Strategy

### For Each Increment:
1. **Plan** (30 min): Review what you're building
2. **Database** (1-2 hours): Create/update tables, test queries
3. **Backend** (2-4 hours): Build API routes, server actions
4. **Frontend** (3-6 hours): Build UI components and pages
5. **Test** (1 hour): Manual testing, fix bugs
6. **Deploy** (30 min): Push to production, test live

### Estimated Timeline:
- **Increments 1-5** (MVP): 2-3 weeks
- **Increments 6-10**: 2-3 weeks
- **Increments 11-15**: 2-3 weeks
- **Increments 16-20**: 2-3 weeks

Total: ~8-12 weeks to full-featured platform

---

## 💡 Tips

1. **One increment at a time** - Don't move to next until current is complete
2. **Test as you go** - Each increment should work before moving on
3. **Ship early** - Deploy each increment so you can gather feedback
4. **Keep it simple** - Don't over-engineer, add complexity only when needed
5. **User feedback** - Get real users testing as early as possible

---

## 🎯 Priority Order (Recommended)

**Phase 1 - MVP** (Launch-ready):
- Increments 1, 2, 3, 4, 5, 6, 7, 8

**Phase 2 - Growth**:
- Increments 9, 10, 11, 12, 14, 15

**Phase 3 - Scale**:
- Increments 13, 16, 17, 18, 19, 20

Start with Phase 1, ship it, get users, then build Phase 2 based on feedback!
