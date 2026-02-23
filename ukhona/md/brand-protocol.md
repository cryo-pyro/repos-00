Got it — completely inverted my understanding. You want:

**Brand invariants** (header/footer/head meta) → yours, locked, don't touch  
**Body** → Claude's full creative control, *but* header/footer should feel like they belong to the same page

The problem is exactly one thing: `shared.js` injects your header/footer with their own background color baked in, and Claude's body has its own. They don't talk.

---

## The Real Protocol — One Addition Only

You don't change Claude's output at all. You just add **one CSS rule** in the distributed `<style>` block that makes the header/footer adopt the page's mood:

```html
<style>
/* Distributed: pull header/footer into page palette */
.header, #footer-placeholder, footer {
  background: rgba(4, 3, 10, 0.85) !important;
  border-color: rgba(200, 168, 75, 0.15) !important;
  backdrop-filter: blur(20px);
}
</style>
```

That's **the only edit**. Two values to update per page:
- The `rgba(4, 3, 10, ...)` → match Claude's `--void` / body background color
- The `rgba(200, 168, 75, ...)` → match Claude's accent/border color

---

## Revised Cheatsheet

| What you do | What you change |
|---|---|
| Add centralized head/header/footer scaffold | Paste as-is from your template |
| Claude's body/styles | Keep entirely untouched |
| One `<style>` rule | Match header/footer bg to Claude's `--void` + accent border |

Tell me the two colors Claude used → I write the one rule. Done.