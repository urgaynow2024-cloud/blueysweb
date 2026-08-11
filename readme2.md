# FBX Mashup Photo Upload Fix - Investigation Notes

## Current State
Project restored to commit `641b2c1`. Investigating why FBX mashup photos cannot be added freely in the admin panel.

## Relevant Files

### Admin UI
- `src/components/admin/sections/FbxMashupSection.tsx` - Main admin section for managing FBX mashup projects
- `src/components/admin/UploadArea.tsx` - Reusable drag-and-drop upload component
- `src/components/admin/SaveProvider.tsx` - Dirty-state and save orchestration
- `src/components/admin/DashboardLayout.tsx` - Admin shell layout
- `src/components/admin/AdminTopbar.tsx` - Top bar with Save Changes button
- `src/components/admin/AdminSidebar.tsx` - Sidebar navigation including FBX Mashups tab

### API Routes
- `src/app/api/fbx-mashups/route.ts` - GET (list visible), DELETE (clear all), POST (create project)
- `src/app/api/fbx-mashups/[id]/route.ts` - GET (single), PUT (update), DELETE (delete project)
- `src/app/api/fbx-mashups/[id]/gallery/route.ts` - POST (upload gallery image), DELETE (remove gallery image)
- `src/app/api/fbx-mashups/[id]/before-after/route.ts` - POST (upload before/after), DELETE (remove comparison)

### Data Layer
- `src/lib/db.ts` - Client-side data fetching with Supabase fallback to mock data
- `src/data/site.ts` - Mock FBX mashup data (`mockFbxMashups`, `mockFbxGallery`)

### Schema
- `supabase/schema.sql` - Defines `fbx_mashups`, `fbx_gallery`, `fbx_before_after` tables + RLS + storage policies

## Current Behavior / Issue

In `FbxMashupSection.tsx`:

1. `handleGalleryUpload(projectIndex, files)` checks:
   ```ts
   const mashupId = project.id;
   if (!mashupId) {
     toast.error("Save the project first before uploading images");
     return;
   }
   ```

2. `handleBeforeAfterUpload(projectIndex, type, files)` has the same guard.

This means a newly added project (no `id` yet because it hasn't been saved) **cannot** have gallery or before/after images uploaded until after the project is persisted.

## Likely Fix Needed

- Allow image uploads for unsaved local projects by either:
  - Creating the project server-side immediately when "Add Project" is clicked, or
  - Uploading images to a temporary path and associating them after the project gets an ID, or
  - Generating a temporary client-side ID and allowing uploads, then reconciling on save.

## Next Steps
1. Confirm the exact failure mode by checking how `addProject` initializes new entries.
2. Decide on the least invasive approach to decouple image uploads from project save.
3. Implement the fix in `FbxMashupSection.tsx` and verify API routes handle edge cases.
