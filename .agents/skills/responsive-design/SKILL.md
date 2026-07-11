---
name: responsive-design
description: Skill for ensuring mobile-first responsive design best practices, media queries, and fluid typography. Use when the user requests help with responsive layouts or mobile adaptation.
---

# Responsive Design Skill

When working on the frontend to ensure responsiveness, follow these guidelines:

1. **Mobile-First Approach**: Start with the mobile layout as the default. Add media queries to adapt the design for larger screens (e.g., tablet, desktop).
2. **Breakpoints**: 
   - Mobile: Default (up to 768px)
   - Tablet/Desktop: `@media (min-width: 768px)`
   - Large Desktop: `@media (min-width: 1024px)` or `1200px` as needed.
   *(Note: Since this project currently uses `max-width: 768px` in many places for mobile overrides, respect the project's existing conventions, but recommend mobile-first for new components).*
3. **Flexible Units**: Use percentages, `vw`, `vh`, `rem`, and `em` for widths, heights, and font sizes instead of rigid pixel values.
4. **Fluid Typography**: Use `clamp()` for responsive font sizes to scale smoothly across different screen widths.
5. **Flexbox & Grid**: Leverage CSS Flexbox and Grid to build adaptable, multi-column layouts that collapse elegantly into single columns on small screens.
6. **Touch Targets**: Ensure buttons and interactable elements have a minimum size of `44x44px` for touch devices.
7. **Performance**: Avoid large background images on mobile devices and prioritize lightweight, efficient styles.
8. **Testing**: Always verify how changes look on a narrow screen context.

## Workflow

When asked to apply responsive design:
1. Identify the container or component that is breaking or inflexible.
2. Apply flexible CSS properties (e.g., `flex-wrap`, `grid-template-columns`).
3. Add appropriate media queries for breakpoints.
4. Document the changes if necessary.
