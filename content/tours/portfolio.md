---
id: portfolio
mode: demo
title: "A tour of the desk"
route: /
---
Welcome. This site is built like a small operating system, and every part of it is an addressable
surface that both a person and an AI can drive. This quick tour lights up the pieces one at a time.
You can click a highlighted surface to try it while the tour runs. Switch the tour to Review mode in
the top bar to see what changed under each surface, the way an AI hands back its work.

## screen
- verify: Resize the window; the rail, tabs, and panel stay live and keep their addresses.
This whole window is the desk. It is a real app shell, not a marketing page. The rail on the left,
the tabs across the top, and the panel on the right are all live, and each region has an address
the assistant can point at.

## nav:/notes
- status: changed
- review: The dock gained a Plans row and split into an apps group and a meta group, so navigation reads like a set of small apps rather than one list.
- verify: Hover each row; every one is a real link with its own destination.
This is the app dock. Notes, Calendar, Mail, About, and now Plans are separate little apps inside
the one shell. Each row is an addressable navigation surface, so the AI can open any of them for you.

## chat-input
- verify: Type an intent and watch the lamp travel to whatever the assistant touches.
This is the door. You type an intent here and the assistant acts through the same vocabulary the
tour just used to light these surfaces. When it works, a lamp travels to whatever it is touching,
so you always see where its hands are.

## note:ten-times-zero
- at: /notes
- status: new
- review: The tour routed here with a real navigation, the same code path as clicking the dock, so progress survives the page load.
- verify: Use Back in the sidebar; the tour navigates home and keeps its place.
Now we have moved for real. The tour did not fake a transition, it navigated to the Notes app the
same way clicking the dock would. This is the flagship post, on how the whole stack got built with
AI doing most of the typing.

## nav:/plans
- at: /notes
- status: changed
- review: Plans moved out of a buried link and into the dock as a first-class app, so the board is reachable in one click.
- verify: Open Plans; the board renders straight from the markdown files, which the tour never writes to.
Last stop. Plans is the project board, rendered straight from markdown files that never get written
back to. It used to be reachable only from a buried link. It now lives in the dock, where you would
expect to find it.
