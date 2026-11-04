---
id: review-contact-flow-and-xray
mode: dev
title: "Review: the desk drafts a message, and shows what it can do"
route: /
---
Two pieces of the AI agency plan, walked together because the second explains the first. The desk
can take a request to message TJ, carry it to Mail, open Compose and fill in the body, and the
visitor still presses Send. The new AI view panel lists what the desk can see, where it can go and
what it can operate on each page, read from the same catalog the desk reasons with.

## chat-log
- at: /
- status: needs-verification
- review: The request is recognized by a fixed pattern, not chosen by the model, so wording outside that pattern falls through to ordinary chat. That boundary is the riskiest part.
- verify: Type "tell TJ I want to talk about grain" into the desk and press Enter. The desk should say it is drafting, then travel to Mail on its own.
Start here and ask the desk to send a message.

## field:contact-message
- at: /mail
- status: needs-verification
- review: The body is the visitor's own words plus a greeting, filled through field.set, and marked as AI-written until the visitor edits it. Nothing is ever sent for them.
- verify: After the previous step, Compose should be open with "About grain" as the subject and "Hi TJ, I want to talk about grain." in the body, both set in the desk's ink. Type one character at the end; the text should switch to ordinary ink, and nothing should send until you press Send.
The draft lands here. Sending it stays yours.

## screen
- at: /mail?xray
- status: needs-verification
- review: The panel groups the desk's abilities as See, Navigate and Operate. On this page, Operate should include drafting a message, which ties it to the flow you just walked.
- verify: The AI view panel should open beside the chat, leaving the desk input uncovered, with all three groups and list field.set under Operate. Press the AI view button in the status bar; the panel and the outlines should both disappear. At phone width the status bar is hidden, so close the panel with its × instead.
What the desk can do here, in words.

## prompt
Three calls the walk cannot make for me, because they decide what the plan builds next.
- ask: model-choice | The flow starts from a fixed pattern. Should the model be trusted to start it from the catalog, or does the pattern stay the trigger?
- ask: next-slice | Which earns the next small piece: asking for missing details, drafting a subject line, or a review card in chat?
- ask: planner | Is a general multi-step planner wanted, or do the task-specific handovers stay?
- template: Continue the AI agency work in the portfolio (tour {tour}).\nModel choice: {model-choice}\nNext slice: {next-slice}\nPlanner: {planner}\nThe plan is plans/ai-agency-navigation.md.
- handoff: https://claude.ai/new?q={payload}
