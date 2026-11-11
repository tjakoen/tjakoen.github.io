---
id: review-desk-browse
mode: dev
title: "Review: the Desk's Browse mode"
route: /grain
---
The Desk can show recent notes and calendar posts without loading a model. Phones open in Browse, and desktop visitors can switch to it from Chat.

## grain-hero
- at: /grain
- status: needs-verification
- review: The GRAIN page keeps a gutter when the navigation rail and Desk are both open.
- verify: Open both side panels and resize the window to about 900 pixels wide. The title and body should stay clear of both panel borders.
The same gutter carries through the rest of the page.

## desk-tabs
- at: /grain
- status: needs-verification
- review: The X at the end of the Desk tabs closes the panel. The sidebar icon beside Close all tabs brings it back.
- verify: At about 900 pixels wide, select Browse and press Enter on the Desk's X. Focus should move to the sidebar icon. Press Enter again and check that Browse is still selected and the tabs and X share one row.
Resize to phone width and open the Desk from its bottom handle. Both desktop controls disappear when the Desk becomes a drawer. The title bar shows the current layout, and the space around the manual mobile preview follows the theme.

## desk-browse
- at: /grain
- status: needs-verification
- review: Browse fills almost the whole phone screen. Each recent item shows its published type.
- verify: On a phone or with phone emulation, open Browse. Check that the sheet nearly fills the screen. Choose All updates and confirm that the calendar opens with the All tab selected.
While Browse is open, it checks for new posts every minute.

## desk-choice
- at: /grain
- status: needs-verification
- review: On a desktop browser with WebGPU, the Desk shows the model size just above the composer and remembers the choice for the tab.
- verify: Choose Browse, open Notes from its shortcuts, and confirm Browse stays selected. Select Chat to return to the composer.
You can look around the site before deciding whether to use the local model.

## desk-consent
- at: /grain
- status: needs-verification
- review: The Desk asks whether to save the conversation on this device after the first exchange.
- verify: In a fresh desktop tab, open Chat and select What can I do here? Choose Not now, then open the portfolio in a fresh tab and confirm the conversation stayed in the first tab.
The choice applies to the conversation and its terminal history.

## welcome-start
- at: /
- status: needs-verification
- review: The home page opens whichever mode the Desk is using.
- verify: On a phone or with phone emulation, choose Open the desk and confirm that the Browse shortcuts are visible.
The home page and the sheet lead to the same Desk.

## welcome-walks
- at: /
- status: needs-verification
- review: The live walkthrough needs the local model, so its card appears with Chat.
- verify: On a desktop with WebGPU, switch between Chat and Browse and watch the live walkthrough card appear and disappear.
The other walkthroughs are available in either mode.

## builder-said
- at: /grain/builder
- status: needs-verification
- review: In Browse, the Builder composes from words in the brief and explains which path it used.
- verify: On a phone or with phone emulation, enter an opening paragraph and a stat, then press Build it. Look for the draft and the message that it used no AI model.
The block controls still let you edit the draft.

## builder-help
- at: /grain/builder
- status: needs-verification
- review: The help drawer explains the model size and the path available on mobile.
- verify: Open the help drawer and compare its first paragraph with the outcome from Build it on your phone.
The desktop download sizes are listed next to the conditions where they apply.

## builder-example-guidance
- at: /grain/builder
- status: needs-verification
- review: The examples explain what happens when you press Build it in either mode.
- verify: Open any example in Browse and compare the example guidance with the draft status after Build it.
The example links open a preview from the same matcher.
