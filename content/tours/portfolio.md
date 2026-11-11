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
This is the app dock. Projects, Notes, Calendar, Mail, Plans and About are separate little apps
inside the one shell. Each row is an addressable navigation surface, so the AI can open any of them for you.

## dark-mode
- verify: Click the highlighted button; the page should switch between light and dark, and a reload should keep the choice.
The site opens in brioche, the light flavor. This button switches it to dark and back, and the
flavor name beside it cycles the palette. Both choices are saved in this browser.

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

## projects
- at: /projects
- status: changed
- review: The tour ends by navigating to Projects and lighting the page itself, rather than the dock link, because the dock is collapsed on narrow screens and a link it cannot see is no stop at all.
- verify: Walk the tour at a phone width and at a desktop width; both should land on the Projects page with this card showing.
Last stop, and the one worth your time. This is Projects, the work itself: what got built, for whom,
and what it cost to get right. Stay and read once the tour ends. If something here is close to what
you need, the Mail app reaches me directly.
