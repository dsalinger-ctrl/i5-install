# I-5 Install — build spec

This is the spec for the I-5 Install iPhone app. Claude Code reads this file at the start of every session. The clickable prototype is `prototype/i5-install-app-prototype.html`. Open it in a browser and treat it as the source of truth for layout, copy and flow. When this file and the prototype disagree, ask Dan.

## What the app is

I-5 Install is an internal app for I-5 Design Build's custom decor installers working on casino, bar, retail and restaurant job sites. It keeps installers focused on the work. Home always shows the one thing to do now, and the app handles the paperwork: Trello, Zoom posts, Procore safety forms, Paychex punches, travel and the EOD email.

Design goals, in order:
1. **Simple.** Home is a greeting, a clock line, one "now" card and four buttons. Don't add anything to Home without Dan's OK.
2. **Clean, sharp, premium.** It should look like the quality of I-5's work. Use I-5 colors, not stock iOS defaults.
3. **Heads down.** Installers don't tap through tasks all day. They update at Vibe Board check-ins every 2–3 hours.
4. **Radio stays radio.** In-the-moment calls ("15 minutes before lunch," "I'm almost done with this task") happen on the radio. The app only handles things that need a record or an approval.

## Users and roles

- **Lead.** Only Mike, Matt, Shaun and Ian can be leads. On any job, the lead is the first approved name on that week's I-5 Decor Teams calendar event. Leads post 2-hr updates, plan tomorrow, book travel for the crew, authorize lift plans and sign as supervisor.
- **Crew.** Everyone else on the calendar event. Crew see their own task, check in, fill out forms and send their EOD email.
- **Office.** Dan (production and logistics) and Todd Robison (install manager). They receive Zoom posts and EOD emails. They don't use the app in phase 1.

Every installer signs in with their @i5design.com Google Workspace account.

## Tech stack

- **App:** Expo (React Native) with TypeScript and expo-router. It targets iPhone first, with Android possible later.
- **Builds and submission:** EAS Build and EAS Submit, which build and send to TestFlight from the cloud.
- **Back end:** Supabase, which provides Postgres, auth, edge functions, storage and scheduled jobs.
  - All third-party API keys and OAuth tokens live in Supabase edge functions. They never go in the app bundle.
  - The app only talks to our back end, and the back end talks to Trello, Zoom, Procore, Paychex, Google and the AI.
- **Push notifications:** Expo Notifications, used for check-in nudges, "you're booked on Mike's flight," the plan for tomorrow and 10-hour prompts.
- **Offline:** cache today's job, tasks and forms. Queue punches, check-ins and forms with their original timestamps and send them when the phone has signal again. Casino floors often have no signal.

Bundle ID for the beta, on Dan's personal Apple account: `com.dsalinger.i5install.beta`. Keep `com.i5design.install` free for the I-5 company account later.

## Brand and design tokens

| Token | Light | Dark |
|---|---|---|
| bg | #F3F3F3 | #000000 |
| surface | #FFFFFF | #1C1C1E |
| field | #EEEEEE | #2C2C2E |
| ink | #0B0B0B | #FFFFFF |
| sub | #5F5F5F | #A1A1A6 |
| accent (I-5 blue) | #224778 | #7FA3D8 |
| button | #224778 | #3E6CB3 |
| tint | #E4EAF3 | #1E2C42 |
| amber bg / ink | #FFF0DB / #9A4A00 | dark equivalents |
| red bg / ink | #FCEBEB / #A32D2D | dark equivalents |
| ok bg / ink | #E2F2E6 / #1E6B37 | #16301F / #7DD69A |
| icon navy | #1B3A63 | |
| I-5 gold | #C5A15A (placeholder until Dan confirms the brand gold) | |

- **Type:** Montserrat for headings and small uppercase letter-spaced labels, and the system font (SF Pro) for body text.
- **Mode:** the app follows the phone's light or dark setting.
- **Shared parts:** every screen uses the same floating bottom tab bar (Home, Tasks, Travel, Ask AI, More).
- **Alert colors:**
  - Red: act now, for example a required lift plan.
  - Amber: due soon, for example a Mobilize step or flight day.
  - Blue: info.
  - Green: done.
- **App icon:** "the panel." A navy square with a gold outer frame, a thin white inner frame and "I-5" in Montserrat. Splash screen: the icon on navy, "I-5 Install," and the gold tagline "Custom decor · installed right."

## Screens

Build to match the prototype.

### Home

The greeting includes a small clock line ("On the clock · since 9:58 AM"). Tapping it opens a Paychex sheet with Lunch, End lunch and Clock out.

The **now card** shows one stage at a time:
1. **Start your day:** a Clock in button.
2. **Mobilize:** the next unchecked Mobilization item, "x of 7 done," and Open my list.
3. **Working on:** the drawing and task, the next check-in time, Check in, and Change task (lead) or All tasks (crew). Crew also get a small Change link.
4. **Wrap up:** the next EOD item and Wrap up my day.

Below the card:
- **Red alert:** only when something blocks work right now, like a lift plan needed before the D4 lift.
- **Four tiles:**
  - Lead: 2-hr update (or Easy plan tomorrow after 10 hours on the clock), Zoom call, Schedule, Safety.
  - Crew: My schedule, Zoom call, Flag issue, Safety.

### Task picker
A sheet listing "Yours" first, then "Helping the crew." Tasks on hold are grayed out.

The picked task becomes the default everywhere: safety assessment and lift plan AI drafts, hot work and forklift location, Flag issue, Zoom call, and Ask AI's drawing chip and suggested questions.

### My day (Daily SOP)
Checklists from the Daily SOP plus the job's Mobilize card in Trello:
- **Mobilization:** punch in (auto from Paychex), Vibe Board and Trello review, drawing review (10 min), clarify tasks with the lead, safety assessment (opens the form and checks off when submitted), stage the Mobilize card items, set up carts and lift bins.
- **Lunch break:** safe stopping point, debris cleanup (5 min), leave together, walk back in together to the Vibe Board.
- **End of day:** each person's own EOD task from the Mobilize card, then everyone's list:
  - safe stopping point and supplies needed
  - one detail photo
  - personal tools away, company tools to the job box
  - lifts to the charging area
  - ladders and carts to staging
  - trash
  - Vibe Board Trello status
  - obvious walk
  - read and like tomorrow's Zoom message
- **Demobilize:** shown only on the last onsite day.

There are no radio items in these lists.

### Vibe Board check-in (every 2–3 hours, everyone)
- What got done: Done or Still going for each of their open tasks.
- Next: pick what's next. Their own tasks come first, then help others.
- Anything in the way: Missing parts, Damage, Drawing question, Need a Zoom, plus a note.
- **Update Trello:** moves cards to Done and Doing and posts any blockers to Todd and Dan.
- For the lead, it then opens the 2-hr update, built from everyone's check-ins.

### Tasks
Read-only statuses: Done, Doing, To do, Ceiling hold. Tasks are grouped by drawing number. No checkboxes; cards change only at check-ins.

### 2-hr update (lead)
- Written in Mike's existing format: "@Todd Robison TM 2 hour update:" followed by what got done, plus an extra line, a photo, or Flag issue.
- Posts to Zoom Production Engineers.
- A nudge 15 minutes before it's due.
- Open question: is this still needed now that check-ins update Trello? See open questions.

### Plan tomorrow (lead)
- Start time, meet-at spot, order of work and assignees, and a note.
- Posts to Zoom Installers.
- Crew see it on Home after they wrap up and tap Got it, which counts as the SOP's "read and like."
- After 10 hours on the Paychex clock, the lead's 2-hr update tile becomes "Easy plan tomorrow" and sends a push.

### Safety (Procore forms)
All 10 of I-5's company form templates, rebuilt field for field as phone screens:

| Form | Template ID |
|---|---|
| Site Orientation Sign In Sheet | 506436 |
| Onsite Daily Sign In Sheet | 512188 |
| Decor Lift Plan Checklist | 543481 |
| Equipment Borrower's Agreement | 559064 |
| Safety Assessment Form | 603821 |
| Trailer Driving Checklist | 629749 |
| Hot Work Permit Form | 638559 |
| Class VII Forklift (Rough Terrain) Daily Inspection Checklist | 656232 |
| Scissor Lift Inspection Checklist | 658400 |
| Weekly Safety Meeting | 697206 |

The exact questions are in the prototype's `FORMS` object.
- **Groups:** Today, Equipment, Travel, Team (leads only), Other.
- **Filling them out:** big Yes/No buttons, and a No opens a comment. Long checklists get All yes per section. People fields are checkbox rows. Signatures are drawn with a finger. On sign-in sheets, each person signs on their own phone.
- **AI drafts:**
  - Safety assessment: everything except the photo and the review box.
  - Lift plan: weight, equipment, accessories, hazards, checkpoints, roles, exit plan and exit signal.
  - AI never answers the inspection Yes/No checks.
  - Every AI-filled field shows "✦ AI draft," which changes to "Edited" once the person changes it.
  - Each AI form needs a review checkbox and a signature before it can be submitted.
- **Submit:**
  - Render the filled-in PDF in our back end, because the templates are flat PDFs with no fillable fields.
  - Then `POST /rest/v1.0/projects/{projectId}/forms` with `form_template_id`, the PDF and the photos.
  - Procore company ID: 9328. Table Mountain project ID: 3425837.

### Travel
- **Next trip card:**
  - Lead: Find flights, with "Match the crew to my flights" on by default.
  - Crew: "When Mike books, you're put on the same flights automatically," plus Find my own flight.
- **Find flights:** From, To and dates filled in from the calendar. Results for flying out and flying home, each showing flight number, stops, price, "In policy," and tags like "Cheapest" or "Gets you to site by 10."
  - **Lead booking:** Book me and match the crew.
  - **Crew booking:** Book the same flights.
  - **Lead's crew list:** Matched ✓ or Not yet next to each name.
- **This trip:** flight countdown with the leave-by time, then one next Zoom post: At my gate, Landed (lead), Onsite (lead), then House is good + photos to Procore.
- **House:** reserved for that person. Door code and Wi-Fi show only to people booked in that house.
- **Vehicle:** an I-5 truck or Rental switch, set by April.
  - Truck: unit #, driver, riders, trailer ID, ramp card reminder, and a link to the Trailer Driving Checklist.
  - Rental: confirmation number and pick-up.
- **Booking:** the travel platform isn't decided yet (see Integrations). Until it is, Find flights sends the chosen flights to April or the agency as a booking request.

### Schedule
- Each person's next 4 weeks as a grid colored by job, travel, shop and off. Tap a day for details, with a Coming up list below.
- Source: the I-5 Decor Teams calendar plus the Install Shop and Time Off calendar.
- SOP notes: Thursdays show "1 hr online safety training," Fridays show "Walkthrough for next week," and the last onsite day shows "Demobilize."
- Request time off sends a request to the Time Off calendar for approval.

### Wrap up (EOD)
- The person's EOD list.
- What they finished.
- Hours from Paychex.
- An AI-drafted EOD email in the SOP's example format, built from their check-ins, plus "Anything that would help the team work better or safer?"
- **Send EOD email and clock out:** emails the install manager and Mr. O'Connor, then punches out in Paychex.

### Ask AI
- Routes to the I-5 Decor Grok bot, with chips for the job and the current drawing.
- Answers come from project Sheets (packing lists, logistics), the Shipping calendar and drawing data.
- "Send to Todd + Dan" passes the question on when the bot isn't sure.

### More
Packing list, Shipments, End of day, Crew board (lead), Plan tomorrow (lead), My day, My schedule, Request time off, and Appearance.

## Integrations

All of these run in the back end.

| System | Use | Notes |
|---|---|---|
| Google Workspace | Sign-in (@i5design.com only), Calendar (I-5 Decor Teams; Install Shop and Time Off; Shipping), Sheets (packing lists, logistics), Gmail for EOD email | Internal OAuth app in I-5's Workspace. Installers must not see the Admin, Tax Detail or takeoff sheets |
| Trello | Tasks by drawing number, moving cards at check-ins, Mobilize card lists | Installers Scrum Board |
| Zoom Team Chat | Post to Production Engineers and Installers. "Can we Zoom call?" always tags Todd and Dan | Zoom Marketplace app with chat:write scopes |
| Procore | 10 safety form templates, house photos to a photo album | Company Admin installs our app in App Management |
| Paychex Flex | Punch in, lunch, back and out without leaving the app | Time & Attendance API, separate from the main Flex API. Request access through the Paychex rep. Map each Google account to a Paychex employee ID |
| AI | Safety assessment and lift plan drafts, EOD email drafts, screenshot reading for flights | Grok bot for Ask AI, plus an LLM for drafts. Drafts are always reviewed by a person |
| Travel | Flight search and booking, matching the crew to the lead | Egencia has no confirmed public booking API. Options are a Spotnana-type platform, or a flight-data API plus a booking request to April or the agency |
| Revizto | Not integrated | No reliable deep link to a sheet. Show drawing numbers only |

## Rules to keep

- Only Mike, Matt, Shaun and Ian are leads. The lead is the first approved name on the calendar event.
- Crew never get lead-only nudges or screens.
- Nothing posts to Zoom or Procore without a person tapping send.
- AI never checks a safety inspection item.
- Door codes go only to people booked in that house.
- Punches keep the time they were tapped, even when they're sent later.

## Build phases

1. **Foundation:** Expo app, Google sign-in, Supabase, the design tokens, the tab bar, Home with its now card, Schedule from Calendar, and Tasks from Trello. Ship to Dan's phone.
2. **Daily loop:** My day, Vibe Board check-ins that update Trello, the 2-hr update, Plan tomorrow and Zoom posts. First TestFlight to Mike's crew.
3. **Safety:** the 10 Procore forms, PDF rendering, submission and the AI drafts.
4. **Clock:** Paychex punches and the EOD email.
5. **Travel:** trips, house, vehicle, flight search and matching the crew to the lead.
6. **Ask AI and polish:** offline queue, push notifications, App Store assets.

Each phase starts with working code against sample data, then connects the real API once access is approved.

## Open questions for Dan and the admin team

- I-5 brand gold hex.
- Are 2-hr updates to Production Engineers still needed alongside the Vibe Board check-ins?
- Where house and truck assignments live today: Trello, email or a sheet. Who books rentals and flights?
- Does every installer have an @i5design.com Google account?
- How packing list sheets are named.
- Travel platform: stay with Egencia, or move to one with a booking API?
- The SOP's 8751 shop-day schedule: fixed break times and check-ins at 10:11, 12:31 and 2:41. Build it into the app?
