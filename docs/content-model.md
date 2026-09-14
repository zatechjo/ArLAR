# Suggested Content Model

## Core Tables

### `pages`

- `id`
- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `status`
- `seo_title`
- `seo_description`
- `published_at`
- `created_at`
- `updated_at`

### `people`

- `id`
- `name`
- `credentials`
- `title`
- `bio`
- `country`
- `country_code`
- `headshot_file_id`
- `sort_order`

### `committees`

- `id`
- `name`
- `slug`
- `description`

### `committee_members`

- `committee_id`
- `person_id`
- `role`
- `sort_order`

### `member_societies`

- `id`
- `country`
- `country_code`
- `name`
- `abbreviation`
- `website_url`
- `email`
- `social_links`
- `logo_file_id`
- `flag_file_id`
- `sort_order`

### `special_interest_groups`

- `id`
- `slug`
- `name`
- `description`
- `logo_file_id`
- `social_links`
- `sort_order`

### `events`

- `id`
- `slug`
- `title`
- `event_type`
- `group_id`
- `starts_at`
- `ends_at`
- `timezone`
- `location`
- `registration_url`
- `replay_url`
- `thumbnail_file_id`
- `description`
- `status`

### `congresses`

- `id`
- `slug`
- `name`
- `year`
- `country`
- `city`
- `venue`
- `starts_on`
- `ends_on`
- `description`
- `registration_url`
- `organizer_contact`

### `congress_abstracts`

- `id`
- `congress_id`
- `abstract_number`
- `title`
- `authors`
- `category`
- `presentation_type`
- `body`
- `file_id`

### `posts`

- `id`
- `slug`
- `locale`
- `title`
- `excerpt`
- `body`
- `cover_file_id`
- `status`
- `published_at`
- `created_at`
- `updated_at`

### `post_categories`

- `id`
- `slug`
- `name`

### `post_category_assignments`

- `post_id`
- `category_id`

## Submission Tables

- `newsletter_subscriptions`
- `contact_submissions`
- `public_questions`
- `membership_applications`

## Migration Note

Avoid hardcoding people, societies, events, and abstracts into React components. These are repeated records and should be managed through Supabase so the next six years do not become another frozen-site problem.

