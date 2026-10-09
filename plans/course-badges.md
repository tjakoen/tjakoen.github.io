---
id: course-badges
title: Course credentials and badges
status: doing
track: credentials
depends: []
owner: human
---

# Course credentials and badges

The portfolio already hosts legacy certificates. Their original participation rule did not demonstrate achievement of the designated badging activities, so the existing batch needs instructor reconciliation before it can be treated as reviewed.

The replacement issuer accepts an approved private manifest from the course platform. That platform owns student identity, reviewed scores, badge activity mappings, and the approval record. The portfolio validates the entire batch before writing public content. New awards use opaque certificate identifiers and hosted Open Badges 2 assertions. Original URLs and dates survive an explicit reconciliation, and legacy records remain available rather than being silently revoked.

Each designated badge has its own criteria. Finals have their own award. The instructor confirmed one combined APSI midterm award requiring both designated activities; the generator has no fixed two-badges-per-course assumption. Public class pages show criteria, the 75% threshold, activity descriptions, and counts, while each recipient receives a direct certificate link.

Before release, the instructor reviews the private eligibility and identity list, resolves legacy records, and approves the specific batch. The resulting public pages and baked PNGs then need publication and live verification. The private roster stores each verified certificate link. Workspace delivery and email to verified personal and school addresses follow publication, with delivery recorded once per award and destination.

Implementation work does not itself issue awards. Outstanding operational work includes legacy reconciliation, approval of the new batch, publication, an importer compatibility check, and delivery through the configured email provider. [The issuer reference](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/badges.md) contains the commands and manifest contract.
