# walkthrough-card (portfolio)

A Welcome page **Walkthroughs** card — a bordered link card with an icon head, an optional
mono badge, and a muted body. The PoC's progress meters were dropped on purpose: a meter that
measures nothing is decoration pretending to be data (honest-status doctrine); they return
if/when they can mean something real.

```html
<div class="walks">
  <a class="walk" href="/grain">
    <span class="walk__head"><b-icon sym="/assets/sprite.svg#spark" size="sm"></b-icon>Watch the AI act
      <span class="walk__badge">live</span></span>
    <p class="walk__body">One vocabulary, two operators — the AI's hand stays visible as grain.</p>
  </a>
</div>
```
