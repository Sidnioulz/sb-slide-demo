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
  * [x] create server action
  * [x] create request
  * [ ] use renderLabel to create insert before/after options
  * [ ] use renderLabel to add "+ slide" line at the end of a slide deck
  * [x] add + button to last slide in footer to call appendSlide
  * [x] make sure indexer doesn't mess up new story sort order
  * [ ] navigate to slide editor with new slide ID

* [ ] Delete slide
  * [x] create server action
  * [x] create request
  * [x] create UI
  * [x] fix deletion index inconsistencies
  * [x] on deletion, navigate to prev if last slide

* [ ] Move slides around
  * [ ] Add D&D logic
  * [ ] Add server logic
  * [ ] Tidy up CSS to make it look good
  
* [ ] Add status management
  * [ ] Add status select in editor
  * [ ] Transform statuses into MDX tags
  * [ ] Add tag-badges addon config to show statuses in sidebar and footer
  * [ ] Add "prod" flag to remove edit/status UI from prod deck

* [ ] On press Esc, nav to /


# slides

## Benefits of slides as code?
* Version-controlled slides
* Can use UI components, high interactivity
* Can easily feed design tokens into slides

## Benefits of Storybook?

* Support for React/Vue code in slides
* Can publish slides easily to Chromatic
* Can use Chromatic for review and feedback workflows
