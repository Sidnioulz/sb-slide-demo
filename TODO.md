* [x] NavFooter
  * [x] NavFooter component UI/API
  * [x] Index change listener
  * [x] Decorator/manager addon to ensure index change listening is done globally
  * [x] Data passing to Slide wrapper
  * [x] Slide wrapper index analysis to identify prev/next slides
* [x] Slide editing
  * [x] Edit button
  * [~] Load editor UI in place
  * [x] Add cancel button to return to content
  * [x] Use csf-tools to load story content into editor
  * [x] Use csf-tools to identify story file and save edited content
  * [x] Recompose and rewrite file
* [ ] Slide counter
* [ ] Create new slide before/after slide
  * [ ] use renderLabel to create insert before/after options
  * [ ] use renderLabel to add "+ slide" line at the end of a slide deck
  * [ ] connect that to slide editor with new slide ID
  * [ ] make sure indexer doesn't mess up new story sort order, else use indexer wrapper